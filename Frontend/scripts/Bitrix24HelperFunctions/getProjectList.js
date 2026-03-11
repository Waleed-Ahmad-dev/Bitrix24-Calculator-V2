import { callBX24Method } from "./callBX24Method.js"

export const getProjectList = async () => {

    // try {
    //     const projects = await callBX24Method('catalog.productPropertyEnum.list', {filter: {propertyId: 173}});

    //     console.log('Projects:', projects);

    //     return projects;
    // }
    // catch (error){
    //     console.error('Error fetching projects:', error);
    // }


    try {
        const response = await fetch("https://calcenchancev2.premierchoiceint.online/all-projects", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        const projects = data.projectData.productPropertyEnums || [];

        console.log('Projects:', projects);
        return projects;
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }



}