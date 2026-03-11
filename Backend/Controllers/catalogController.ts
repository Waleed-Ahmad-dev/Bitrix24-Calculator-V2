import type { Request, Response } from "express";
import { b24 } from "../Auth/bitrix24AuthUtil.js";
import { logger } from "../Utils/logger.js";

export const getCatalogProductWithFilters = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const client = b24.instance;
  const filter = req.body.filter || {};


  const preparedFilter: Record<string, any> = {}

     if (filter.propertyType) {
        preparedFilter['PROPERTY_177'] = filter.propertyType;
    }
    if (filter.propertyCategory) {
        preparedFilter['PROPERTY_139'] = filter.propertyCategory;
    }
    if (filter.project) {
        preparedFilter['PROPERTY_173'] = filter.project;
    }
    if(filter.propertyFloor){
        preparedFilter['PROPERTY_135'] = filter.propertyFloor;
    }

  const allProductsResponse = await client.actions.v2.callList.make({
    method: "crm.product.list",
    params: {
      filter: preparedFilter,
      select: [
        "ID",
        "NAME",
        "PRICE",
        "PROPERTY_173",
        "PROPERTY_177",
        "PROPERTY_139",
      ],
    },
    idKey: "ID",
    requestId: `products-${Date.now()}`,
  });

  if(!allProductsResponse.isSuccess){
    logger.error("Failed to fetch products from Bitrix24", { error: allProductsResponse.getErrorMessages() });
    res.status(500).json({ message: "Failed to fetch products" });
    return;
  }

    const productsData = allProductsResponse.getData() || [];

    logger.info("Fetched products from Bitrix24", { productsData });
    logger.info("Total products fetched", { count: productsData.length });

    res.status(200).json({ products: productsData });
};
