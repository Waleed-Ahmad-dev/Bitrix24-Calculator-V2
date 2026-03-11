import { getAllowedProjects } from "./Controllers/allowedProjectController.js";
import { getListProperties} from "./Controllers/listPropertiesController.js";
import { getCatalogProductWithFilters } from "./Controllers/catalogController.js";
import { getProductData } from "./Controllers/productController.js";

export const setupRoutes = (app: any) => {
    app.post('/allowed-projects', getAllowedProjects);

    app.post('/list-properties', getListProperties);

    app.post('/catalog-products', getCatalogProductWithFilters);

    app.post('/product', getProductData);
}