import { getAllowedProjects } from "./Controllers/allowedProjectController.js";
import { getListProperties} from "./Controllers/listPropertiesController.js";

export const setupRoutes = (app: any) => {
    app.post('/allowed-projects', getAllowedProjects);

    app.post('/list-properties', getListProperties);
}