import {type Request, type Response} from 'express';
import { handleOAuthRedirect } from '../Auth/bitrix24AuthUtil.js';
import { logger } from '../Utils/logger.js';


export const handleAuthCallback = async(req: Request, res: Response) : Promise<void | Response> => {

    const code = req.query.code as string | undefined;
    const error = req.query.error as string | undefined;
    const errorDescription = req.query.error_description as string | undefined;

    if(error || errorDescription){
        logger.error('OAuth Error:', { error, errorDescription });
        return res.status(400).send({message: `Authorization failed: ${errorDescription || error}`});
    }

    if(!code){
        logger.warn('Authorization code is missing');
        return res.status(400).send({message: 'Authorization code is missing'});
    }

    try {
        await handleOAuthRedirect(code);

        logger.info('Authorization successful');
        
        res.send({message: 'Authorization successful. You can close this window.'});

        setImmediate(()=> {
            process.exit(0);
        });

    } catch(err: any){
        logger.error('Error during OAuth handling:', { error: err.message, stack: err.stack });
        res.status(500).send({message: 'An error occurred during authorization. Please try again.'});
    }

}