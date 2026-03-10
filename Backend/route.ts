import { getAllowedProjects } from "./Controllers/allowedProjectController.js";

export const setupRoutes = (app: any) => {
    app.post('/allowed-projects', getAllowedProjects);
}