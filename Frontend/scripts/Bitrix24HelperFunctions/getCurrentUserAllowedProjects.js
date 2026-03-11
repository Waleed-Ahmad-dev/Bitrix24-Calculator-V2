// import { getCurrentUser } from "./getCurrentUser.js";
import { callBX24Method } from "./callBX24Method.js";
export const getCurrentUserAllowedProjects = async () => {
  // const currentUserProjectsRawData = await callBX24Method("user.current", {});

  //   const currentUserProjectsData = currentUserProjectsRawData;

  //   // fetch the "UF_USR_1768305467962" field from the current user data, which contains the allowed projects for the user
  //   const currentUserProjectArray =
  //     currentUserProjectsData["UF_USR_1768305467962"];

  //   // get the readable name of the projects from the "UF_USR_1768305467962" field
  //   if (currentUserProjectArray) {
  //     const projectArrayRawData = await callBX24Method("user.userfield.list", {
  //       filter: { ID: 489 },
  //     });

  //     const projectArrayData = projectArrayRawData;
  //     const projectArrayList = projectArrayData[0]["LIST"];

  //     const allowedProjects = projectArrayList
  //       .filter((project) =>
  //         currentUserProjectArray.map(String).includes(String(project.ID)),
  //       )
  //       .map((project) => project.VALUE);

  //       console.log("Allowed projects for the current user:", allowedProjects);

  //     return allowedProjects.length > 0 ? allowedProjects : null;

  //     }

  try {
    const response = await fetch(
      "https://calcenchancev2.premierchoiceint.online/allowed-projects",
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch allowed projects: ${response.statusText}`,
      );
    }

    const data = await response.json();

    const allowedProject = data.allowedProjects || null;

    console.log("Allowed projects for the current user:", allowedProject);

    return allowedProject;
  } catch (error) {
    
  }
};
