import { initB24, getAuthorizationUrl } from "./bitrix24AuthUtil.js";
import { logger } from "../Utils/logger.js";


export const initializeBitrixService = async (): Promise<void> => {
    try {
        const b24 = await initB24();

        if(!b24){
        const authUrl = getAuthorizationUrl();
        logger.info('Please authorize the application by visiting this URL:', { authUrl });
        } else {
            logger.info('Already authorized with Bitrix24. You can start using the service.');
        }
    }
    catch (err: any) {
        logger.error('Error initializing Bitrix service:', { error: err.message, stack: err.stack });
    }
}

