import type { Request, Response } from 'express';
import { b24 } from '../Auth/bitrix24AuthUtil.js';
import { logger } from '../Utils/logger.js';

export const getProductData = async (req: Request, res: Response): Promise<void> => {
    const client = b24.instance;
    const productId = req.body.productId;

    if(!productId){
        res.status(400).json({ message: "Product ID is required" });
        return;
    }

    const productResponse = await client.actions.v2.call.make({
        method: "crm.product.get",
        params: { id: productId },
        idKey: "ID",
        requestId: `product-${Date.now()}`,
    });

    if(!productResponse.isSuccess){
        logger.error("Failed to fetch product data from Bitrix24", { error: productResponse.getErrorMessages() });
        res.status(500).json({ message: "Failed to fetch product data" });
        return;
    }

   const productData = productResponse.getData()?.result || {};

   logger.info("Fetched product data from Bitrix24", { productData });
   res.status(200).json({ product: productData });

}