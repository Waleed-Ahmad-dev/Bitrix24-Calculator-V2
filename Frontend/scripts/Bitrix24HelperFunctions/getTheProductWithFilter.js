import { callBX24Method } from "./callBX24Method.js";

export const getTheProductWithFilter = async (filter) => {
    try {
        // Prepare filter for backend API
        // PROPERTY_99 is your Status property ID. '155' is the backend enum ID for "Available".
        const filterForProduct = { 'PROPERTY_99': '155' };

        if (filter.propertyType) {
            filterForProduct['PROPERTY_177'] = filter.propertyType.includes(',')
                ? filter.propertyType.split(',')
                : filter.propertyType;
        }
        if (filter.propertyCategory) {
            filterForProduct['PROPERTY_139'] = filter.propertyCategory;
        }
        if (filter.project) {
            filterForProduct['PROPERTY_173'] = filter.project;
        }
        if (filter.propertyFloor) {
            filterForProduct['PROPERTY_135'] = filter.propertyFloor;
        }

        const response = await fetch("https://calcenchancev2.premierchoiceint.online/catalog-products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filter: filterForProduct }),
        });

        if (!response.ok) {
            throw new Error("Error while fetching the products");
        }

        const data = await response.json();
        const rawProducts = data.products || [];

        // 🔹 STEP 1: Global Availability Filter
        // Intercepts the raw inventory array immediately after fetching.
        // Strictly filters out SOLD/HOLD items at the source.
        // Guarantees that ALL downstream dropdowns only ever see valid stock.
        const availableProducts = rawProducts.filter(item => {
            // Check direct property first (as requested), then fallback to Bitrix24's typical nested structures
            const status = item.Status ||
                            item.STATUS ||
                            item.status ||
                            item.PROPERTY_STATUS?.value ||
                            item.PROPERTY_99?.value ||
                            item.PROPERTY_99;

            const statusStr = String(status).toUpperCase().trim();
            // Accepts both the human-readable label and the backend enum ID
            return statusStr === 'AVAILABLE' || statusStr === '155';
        });

        console.log(`[Inventory] Global Filter Applied: ${availableProducts.length} AVAILABLE units cached from ${rawProducts.length} total.`);
        return availableProducts;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};