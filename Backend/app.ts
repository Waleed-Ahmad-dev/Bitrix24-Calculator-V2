import express, { type Application } from 'express';
import { handleAuthCallback } from './Controllers/authController.js';
import { initializeBitrixService } from './Auth/initializeBitrixService.js';
import { logger } from './Utils/logger.js';

const app: Application = express();
const PORT: number | string = process.env.PORT || 3000;


// Initialize the Bitrix24 service:
app.get('/', handleAuthCallback);


app.listen(PORT, async () => {
    logger.info(`Server is running on port ${PORT}`);
    await initializeBitrixService();
});


