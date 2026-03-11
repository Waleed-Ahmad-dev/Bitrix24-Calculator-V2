import { callBX24Method } from "./callBX24Method.js";

export const getTheProductWithFilter = async (filter) => {
    // let allProducts = [];
    // let lastId = 0;
    // let finish = false;

    // // 1. Map the user selection to Bitrix Property IDs
    // const filterForProduct = {'PROPERTY_99': '155'};
    
    // if (filter.propertyType) {
    //     filterForProduct['PROPERTY_177'] = filter.propertyType;
    // }
    // if (filter.propertyCategory) {
    //     filterForProduct['PROPERTY_139'] = filter.propertyCategory;
    // }
    // if (filter.project) {
    //     filterForProduct['PROPERTY_173'] = filter.project;
    // }
    // if(filter.propertyFloor){
    //     filterForProduct['PROPERTY_135'] = filter.propertyFloor;
    // }

    

    // // 2. The Crawl Loop
    // while (!finish) {
    //     try {
    //         // Update the filter to look for items AFTER the last one we found
    //         const currentBatchFilter = {
    //             ...filterForProduct,
    //             ">ID": lastId
    //         };

    //         // 3. Call your BX24 helper
    //         // Note: We use start: 0 because >ID handles the "paging" for us much faster
    //         const products = await callBX24Method('crm.product.list', {
    //             order: { "ID": "ASC" },
    //             filter: currentBatchFilter,
    //             select: ["ID", "NAME", "PRICE", "PROPERTY_173", "PROPERTY_177", "PROPERTY_139"],
    //             start: 0 
    //         });

    //         // 4. Process the results
    //         if (products && products.length > 0) {
    //             // Add this batch to our master list
    //             allProducts = [...allProducts, ...products];

    //             // Update lastId to the last item in this batch so the next loop knows where to start
    //             lastId = products[products.length - 1].ID;

    //             console.log(`Collected ${products.length} products (Total: ${allProducts.length}). Moving to ID: ${lastId}`);

    //             // If Bitrix returns fewer than 50, we have reached the end of the list
    //             if (products.length < 50) {
    //                 finish = true;
    //             }
    //         } else {
    //             // No more products found matching the filter
    //             finish = true;
    //         }

    //     } catch (error) {
    //         console.error("Product Crawl Error:", error);
    //         finish = true; // Stop the loop if the API fails
    //     }
    // }

    // console.log(`Crawl Finished. Found ${allProducts.length} total products.`);
    // return allProducts;

    try {
        const response = await fetch("https://calcenchancev2.premierchoiceint.online/catalog-products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(filter),
        });


        if (!response.ok) {
            throw new Error("Error while fetching the products")
        }

        const data = response.json();

        return data.products || [];  
    }
    catch(error){
        console.error(error);

        return []
    }
};