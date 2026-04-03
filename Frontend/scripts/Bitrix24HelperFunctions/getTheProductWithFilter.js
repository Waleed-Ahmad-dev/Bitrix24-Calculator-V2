import { callBX24Method } from "./callBX24Method.js";

export const getTheProductWithFilter = async (filter) => {
    try {
        // Prepare filter for backend API
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
        let products = data.products || [];

        // 🔹 PROBLEM 1: Filter out Sold/Hold, keep only AVAILABLE
        // Adjust PROPERTY_STATUS ID if your Bitrix setup uses a different custom field
        products = products.filter(p => {
            const status = p.STATUS || p.status || p.PROPERTY_STATUS?.value || p.PROPERTY_99?.value;
            return String(status).toUpperCase() === "AVAILABLE";
        });

        console.log(`[API] Returned ${products.length} AVAILABLE units.`);
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};