import type { Request, Response } from "express";
import { b24 } from "../Auth/bitrix24AuthUtil.js";
import { logger } from "../Utils/logger.js";


export const getAllowedProjects = async (req: Request, res: Response): Promise<void> => {
    const client = b24.instance;

    const { userId } = req.body;
   

    const currentUserDataRawResponse = await client.actions.v2.call.make({method: 'user.get', params: {filter: {ID: userId}} , idKey: 'ID', requestId: `currentUserData-${Date.now()}`});

    const currentUserData: Record<string, any> = currentUserDataRawResponse.getData()?.result || {};

    logger.info('Fetched current user data from Bitrix24', { currentUserData });

    if(!currentUserData){
        res.status(404).json({ message: "User not found in Bitrix24" });
        return;
    }

    const currentUserProjectArray = currentUserData.UF_USR_1768305467962 || [];


    logger.info('Extracted user project array', { currentUserProjectArray });

    if(currentUserProjectArray.length === 0){
        res.status(200).json({message: "No projects assigned to the user", allowedProjects: []});
        return;
    }


    const projectList = await client.actions.v2.call.make({method: 'user.userfield.list', params: {filter: {ID: 489}}, idKey: 'ID', requestId: `projectList-${Date.now()}`});
    const projectListData = projectList.getData()?.result as any[] || [];
    const fullProjectList = projectListData[0]?.LIST || [];

    logger.info('Fetched project list from Bitrix24', { projectListData });


    const allowedProjects = fullProjectList
    .filter((project: { ID: string }) => 
        currentUserProjectArray.includes(Number(project.ID)) || 
        currentUserProjectArray.includes(project.ID) 
    )
    .map((project: { ID: string; VALUE: string }) => ({ 
        id: project.ID, 
        name: project.VALUE 
    }));


    res.status(200).json({ allowedProjects });


}

