import type { Request, Response } from 'express';
import { b24 } from '../Auth/bitrix24AuthUtil.js';
import { logger } from '../Utils/logger.js';


export const getListProperties = async (req: Request, res: Response): Promise<void> => {
    const client = b24.instance;
    const propertyId = req.body.propertyId;

    if (!propertyId) {
        res.status(400).json({ message: "Property ID is required" });
        return;
    }

    try {
        const propertiesResponse = await client.actions.v2.callList.make({method: 'catalog.productPropertyEnum.list', params: {filter: {PROPERTY_ID: propertyId}}, idKey: 'ID', requestId: `list-${Date.now()}` });
        const propertiesData = propertiesResponse.getData() || [];

        logger.info('Fetched properties from Bitrix24', { propertiesData });
        res.json({ properties: propertiesData });
    } catch (error) {
        logger.error('Error fetching properties from Bitrix24', { error });
        res.status(500).json({ message: "Internal server error" });

    }


}