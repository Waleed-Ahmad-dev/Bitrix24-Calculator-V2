import type { Request, Response } from 'express';
import { b24 } from '../Auth/bitrix24AuthUtil.js';
import { logger } from '../Utils/logger.js';

export const getReadableTextOfProperties = async (req: Request, res: Response): Promise<void> => {
    const client = b24.instance;
    
    const propertyId = req.body.propertyId || {};

    if(!propertyId) {
        res.status(400).json({ error: 'propertyId is required' });
        return;
    }

    const response = await client.actions.v2.call.make({method: 'catalog.productPropertyEnum.get', params: {id: propertyId}, idKey: 'ID', requestId: `propertyEnum-${Date.now()}`});

    if(!response.isSuccess) {
        logger.error('Failed to fetch property enum data from Bitrix24', { error: response.getErrorMessages() });
        res.status(500).json({ error: 'Failed to fetch property enum data' });
        return;
    }

    const enumData = response.getData()?.result || {};

    logger.info('Fetched property enum data from Bitrix24', { enumData });
    res.status(200).json({ enumData });

}

