import express, { type Application } from 'express';
import { handleAuthCallback } from './Controllers/authController.js';
import { initializeBitrixService } from './Auth/initializeBitrixService.js';
import { logger } from './Utils/logger.js';
import { setupRoutes } from './route.js';
import cors from 'cors';

const app: Application = express();
const PORT: number | string = process.env.PORT || 3000;

app.use(cors({
    origin: "https://bitrix24calculatorv2.premierchoiceint.online"
}));

app.get('/', handleAuthCallback);


app.use(express.json());

setupRoutes(app);


app.listen(PORT, async () => {
    logger.info(`Server is running on port ${PORT}`);
    await initializeBitrixService();
});


