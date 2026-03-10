import type { Request, Response } from "express";
import { b24 } from "../Auth/bitrix24AuthUtil.js";
import { logger } from "../Utils/logger.js";


export const getAllowedProjects = async (req: Request, res: Response): Promise<void> => {
    const client = b24.instance;
    const userId = req.body.userId as string | undefined;

    if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
    }

    const currentUserDataRawResponse = await client.callMethod("user.current", { ID: userId });

    const currentUserData: Record<string, any> = currentUserDataRawResponse.getData()?.result || {};

    logger.info('Fetched current user data from Bitrix24', { currentUserData });

    if(!currentUserData){
        res.status(404).json({ message: "User not found in Bitrix24" });
        return;
    }

    const currentUserProjectArray = currentUserData.UF_USR_1768305467962 || [];

    if(currentUserProjectArray.length === 0){
        res.status(200).json({message: "No projects assigned to the user", allowedProjects: []});
        return;
    }


    const projectList = await client.callMethod("user.userfield.list",{filter: {ID: 489}});
    logger.info('Fetched project list from Bitrix24', { projectListData: projectList.getData() });
    const projectListData = projectList.getData()?.result || [];


    // const allowedProjects = projectListData
    //     .filter(project => currentUserProjectArray.includes(project.ID))
    //     .map(project => ({ id: project.ID, name: project.VALUE }));

    // res.status(200).json({ allowedProjects });






}

