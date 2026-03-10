import { getAllowedProjects } from "./Controllers/allowedProjectController.js";

export const setupRoutes = (app: any) => {
    app.get('/allowed-projects', getAllowedProjects);
}