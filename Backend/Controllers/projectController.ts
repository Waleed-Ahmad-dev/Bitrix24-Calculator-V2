import type { Request, Response } from 'express';
import { b24 } from '../Auth/bitrix24AuthUtil.js';
import { logger } from '../Utils/logger.js';


export const getAllProjects = async (req: Request, res: Response): Promise<void> => {

    const client = b24.instance;

    const projectResponse = await client.actions.v2.call.make({method: 'catalog.productPropertyEnum.list',params: { filter: {propertyId: 173} }, idKey: 'ID', requestId: `allProjects-${Date.now()}`});

    if(!projectResponse.isSuccess) {
        logger.error('Failed to fetch projects from Bitrix24', { error: projectResponse.getErrorMessages() });
        res.status(500).json({ error: 'Failed to fetch projects' });
        return;
    }

    const projectData = projectResponse.getData()?.result as any[] || [];

    logger.info('Fetched projects from Bitrix24', { projectData });

    res.status(200).json({ projectData });

}