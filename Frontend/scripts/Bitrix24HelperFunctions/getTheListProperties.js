import { callBX24Method } from "./callBX24Method.js";


export const getListProperties = async(propertyID) => {

    // try{
    //     const result = await callBX24Method('catalog.productPropertyEnum.list', {filter: {propertyId: propertyID}});

    //     console.log(`List Properties for property ID: ${propertyID}`, result);
    //     return result;
    // }
    // catch(error){
    //     console.error('Error fetching list properties:', error);
    //     throw error;
    // }

    try {
        const response = await fetch("https://calcenchancev2.premierchoiceint.online/list-properties", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                propertyId: propertyID,
            }),
        });


        if(!response.ok){
            throw new Error(`Failed to fetch the properties for ${propertyID}` )
        }


        const data = await response.json();

        return data.properties || null;
    }
    catch (error) {
        console.error('Error fetching list properties:', error);
        return null;
    }

 
}