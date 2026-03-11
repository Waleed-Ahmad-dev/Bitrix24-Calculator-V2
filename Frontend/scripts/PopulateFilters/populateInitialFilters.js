import { getProjectList } from "../Bitrix24HelperFunctions/getProjectList.js";
import { getPlacementInfo } from "../Bitrix24HelperFunctions/getPlacementInfo.js";
import { getLeadData } from "../Bitrix24HelperFunctions/getLeadData.js";
import { getListProperties } from "../Bitrix24HelperFunctions/getTheListProperties.js";
import { getCurrentUserAllowedProjects } from "../Bitrix24HelperFunctions/getCurrentUserAllowedProjects.js";

export const populateFilters = async () => {
  const TYPE_PROPERTY_ID = 177;
  const CATEGORY_PROPERTY_ID = 139;
  const FLOOR_PROPERTY_ID = 135;

  // first fetch the project list and then populate the filters with the project names:
  const projectSelect = document.getElementById("project-name");
  if (!projectSelect) return;

  try {
    const projectList = await getProjectList();

    const allowedProjects = await getCurrentUserAllowedProjects();

    projectSelect.innerHTML = "";

    // 2. Add a default blank option
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.text = "Select a Project";
    defaultOpt.className = "text-black";
    projectSelect.appendChild(defaultOpt);

    const filteredEnums = projectList.filter((project) => {
      return allowedProjects.some((allowed) => allowed.name === project.value);
    });

    filteredEnums.forEach((project) => {
      const option = document.createElement("option");
      option.value = project.id;
      option.text = project.value;
      option.className = "text-black";
      projectSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load projects:", error);
    projectSelect.innerHTML =
      '<option class="text-black">Error loading projects</option>';
  }

  // get the lead title and populate the lead title filter:
  const placementInfo = await getPlacementInfo();
  const leadId = placementInfo["options"]["ID"];

  const leadData = await getLeadData(leadId);
  const leadTitle = leadData["TITLE"];

  const leadTitleInput = document.getElementById("client-name");
  if (leadTitleInput) {
    leadTitleInput.value = leadTitle;
  }

  // get the property of the type:
  const typeList = await getListProperties(TYPE_PROPERTY_ID); // replace with actual property ID

  const typeSelect = document.getElementById("property-type");
  if (!typeSelect) return;

  // Clear existing options
  typeSelect.innerHTML = "";

  // Add a default blank option
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.text = "Select a Property Type";
  defaultOpt.className = "text-black";
  typeSelect.appendChild(defaultOpt);

  // Populate with the list of property types
  typeList.productPropertyEnums.forEach((type) => {
    const option = document.createElement("option");
    option.value = type.id;
    option.text = type.value;
    option.className = "text-black";
    typeSelect.appendChild(option);
  });

  // get the property of the category:
  const categoryList = await getListProperties(CATEGORY_PROPERTY_ID);

  const categorySelect = document.getElementById("property-category");
  if (!categorySelect) return;

  // Clear existing options
  categorySelect.innerHTML = "";

  // Add a default blank option
  const defaultOpt2 = document.createElement("option");
  defaultOpt2.value = "";
  defaultOpt2.text = "Select a Property Category";
  defaultOpt2.className = "text-black";
  categorySelect.appendChild(defaultOpt2);

  // Populate with the list of property categories
  categoryList.productPropertyEnums.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.text = category.value;
    option.className = "text-black";
    categorySelect.appendChild(option);
  });

  const floorList = await getListProperties(FLOOR_PROPERTY_ID);

  const floorSelect = document.getElementById("property-floor");
  if (!floorSelect) return;

  // Clear existing options
  floorSelect.innerHTML = "";

  // Add a default blank option
  const defaultOpt3 = document.createElement("option");
  defaultOpt3.value = "";
  defaultOpt3.text = "Select a Property Floor";
  defaultOpt3.className = "text-black";
  floorSelect.appendChild(defaultOpt3);

  // Populate with the list of property floors
  floorList.productPropertyEnums.forEach((floor) => {
    const option = document.createElement("option");
    option.value = floor.id;
    option.text = floor.value;
    option.className = "text-black";
    floorSelect.appendChild(option);
  });
};
