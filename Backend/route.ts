import { getAllowedProjects } from "./Controllers/allowedProjectController.js";
import { getListProperties} from "./Controllers/listPropertiesController.js";
import { getCatalogProductWithFilters } from "./Controllers/catalogController.js";
import { getProductData } from "./Controllers/productController.js";
import { getReadableTextOfProperties } from "./Controllers/readableTextOfPropertiesController.js";
import { getAllProjects } from "./Controllers/projectController.js";


export const setupRoutes = (app: any) => {
    app.get('/allowed-projects', getAllowedProjects);

    app.post('/list-properties', getListProperties);

    app.post('/catalog-products', getCatalogProductWithFilters);

    app.post('/product', getProductData);

    app.post('/readable-text-of-properties', getReadableTextOfProperties);

    app.get('/all-projects', getAllProjects);
}