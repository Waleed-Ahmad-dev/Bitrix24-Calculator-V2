import { getProjectList } from "../Bitrix24HelperFunctions/getProjectList.js";
import { getPlacementInfo } from "../Bitrix24HelperFunctions/getPlacementInfo.js";
import { getLeadData } from "../Bitrix24HelperFunctions/getLeadData.js";
import { getListProperties } from "../Bitrix24HelperFunctions/getListProperties.js";
import { getCurrentUserAllowedProjects } from "../Bitrix24HelperFunctions/getCurrentUserAllowedProjects.js";
import { getTheProductWithFilter } from "../Bitrix24HelperFunctions/getTheProductWithFilter.js";
import { populateItemFilter } from "./populateItemFilter.js";

// 🌐 Centralized Filter State
export const filterState = {
  masterInventory: [],
  selectedProject: null,
  selectedType: null,
  selectedCategory: null,
  selectedFloor: null,
  typeMapping: {}, // Maps normalized name -> [original Bitrix IDs]
};

// 🔹 Normalize property type names visually (Sanitizer Function)
export const normalizeTypeName = (typeName) => {
  if (!typeName) return "N/A";
  const lower = typeName.toLowerCase().trim();
  if (lower.includes("2 bed") || lower.includes("2b") || lower.includes("two bed")) return "2 Bed";
  if (lower.includes("3 bed") || lower.includes("3b") || lower.includes("three bed")) return "3 Bed";
  if (lower.includes("1 bed") || lower.includes("1b") || lower.includes("one bed")) return "1 Bed";
  if (lower.includes("studio")) return "Studio";
  if (lower.includes("office") || lower.includes("commercial")) return "Commercial";
  return typeName.split("/")[0].trim();
};

// Helper to safely populate a <select> dropdown
const populateDropdown = (selectId, items, placeholderText) => {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = ""; // Clear existing
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.text = placeholderText;
  defaultOpt.className = "text-black";
  select.appendChild(defaultOpt);
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item.value;
    option.text = item.text;
    option.className = "text-black";
    select.appendChild(option);
  });
};

// 🔹 FIX: Map raw Bitrix enums to guarantee they have matching { value, text } keys
const formatBitrixEnums = (enums) => {
  return enums.map(item => {
     // Securely map Bitrix ID to value
     const enumId = String(item.ID || item.id || item.value || item.VALUE);
     // Securely map Bitrix VALUE to text
     const enumText = String(item.VALUE || item.value || item.TEXT || item.text || enumId);
     return { value: enumId, text: enumText };
  });
};

export const populateFilters = async () => {
  const projectSelect = document.getElementById("project-name");
  if (!projectSelect) return;
  try {
    // 1. Fetch & Setup Projects
    const projectList = await getProjectList();
    const allowedProjects = await getCurrentUserAllowedProjects();
    populateDropdown("project-name",
      projectList.filter(p => allowedProjects?.some(a => a.name === p.value)),
      "Select a Project"
    );

    // 2. Fetch Master Inventory & Cache it globally
    filterState.masterInventory = await getTheProductWithFilter({});
    console.log(`[Inventory] Cached ${filterState.masterInventory.length} available units.`);

    // 3. Fetch Initial Enum Data for Types, Categories, Floors
    const [typeList, categoryList, floorList] = await Promise.all([
      getListProperties(177), // TYPE
      getListProperties(139), // CATEGORY
      getListProperties(135)  // FLOOR
    ]);

    const rawTypes = typeList?.productPropertyEnums || [];
    const rawCategories = categoryList?.productPropertyEnums || [];
    const rawFloors = floorList?.productPropertyEnums || [];

    // Format Categories and Floors BEFORE filtering so `c.value` and `f.value` exist
    const formattedCategories = formatBitrixEnums(rawCategories);
    const formattedFloors = formatBitrixEnums(rawFloors);

    // Build Type Mapping for Grouping (Normalization)
    filterState.typeMapping = {};
    const normalizedTypes = [];
    const seenNormalized = new Set();
    
    rawTypes.forEach(t => {
      const id = String(t.id || t.ID);
      const normName = normalizeTypeName(t.value || t.VALUE);
      if (!filterState.typeMapping[normName]) filterState.typeMapping[normName] = [];
      filterState.typeMapping[normName].push(id); // Ensure IDs are strings
      if (!seenNormalized.has(normName)) {
        seenNormalized.add(normName);
        normalizedTypes.push({ value: normName, text: normName }); 
      }
    });

    // Initially show "Select Project First"
    populateDropdown("property-type", [], "Select a Project first");
    populateDropdown("property-category", [], "Select a Project first");
    populateDropdown("property-floor", [], "Select a Project first");

    // 4. Setup Client Name
    const placementInfo = await getPlacementInfo();
    const leadId = placementInfo?.options?.ID;
    if (leadId) {
      const leadData = await getLeadData(leadId);
      const leadTitleInput = document.getElementById("client-name");
      if (leadTitleInput && leadData?.TITLE) leadTitleInput.value = leadData.TITLE;
    }

    // 5. Attach Cascading Event Listeners
    setupCascadingFilters(normalizedTypes, formattedCategories, formattedFloors);
  } catch (error) {
    console.error("Failed to initialize filters:", error);
  }
};

const setupCascadingFilters = (allTypes, allCategories, allFloors) => {
  const projectSelect = document.getElementById("project-name");
  const typeSelect = document.getElementById("property-type");
  const categorySelect = document.getElementById("property-category");
  const floorSelect = document.getElementById("property-floor");

  // 🔹 PROJECT CHANGE
  projectSelect?.addEventListener("change", () => {
    filterState.selectedProject = projectSelect.value || null;
    // Reset all dependent states
    filterState.selectedType = null;
    filterState.selectedCategory = null;
    filterState.selectedFloor = null;
    if (!filterState.selectedProject) {
      populateDropdown("property-type", [], "Select a Project first");
      populateDropdown("property-category", [], "Select a Project first");
      populateDropdown("property-floor", [], "Select a Project first");
      triggerGlobalFilterUpdate();
      return;
    }

    // Filter inventory strictly for the selected Project
    const projectInventory = filterState.masterInventory.filter(p =>
      String(p.PROPERTY_173?.value) === filterState.selectedProject
    );

    const availableTypeIds = new Set(projectInventory.map(p => String(p.PROPERTY_177?.value)));
    const availableCategoryIds = new Set(projectInventory.map(p => String(p.PROPERTY_139?.value)));
    const availableFloorIds = new Set(projectInventory.map(p => String(p.PROPERTY_135?.value)));

    // Filter normalized types to show only those available for this project
    const availableNormalizedTypes = allTypes.filter(t => {
      const matchedIds = filterState.typeMapping[t.value] || [t.value];
      return matchedIds.some(id => availableTypeIds.has(id));
    });

    populateDropdown("property-type", availableNormalizedTypes, "Select a Property Type");
    populateDropdown("property-category",
      allCategories.filter(c => availableCategoryIds.has(String(c.value))),
      "Select a Property Category"
    );
    populateDropdown("property-floor",
      allFloors.filter(f => availableFloorIds.has(String(f.value))),
      "Select a Property Floor"
    );
    triggerGlobalFilterUpdate();
  });

  // 🔹 TYPE CHANGE (e.g., User selects "2 Bed")
  typeSelect?.addEventListener("change", (e) => {
    filterState.selectedType = e.target.value;
    filterState.selectedFloor = null; // Reset floor on type change
    updateDependentDropdowns(allTypes, allCategories, allFloors);
    triggerGlobalFilterUpdate();
  });

  // 🔹 CATEGORY CHANGE
  categorySelect?.addEventListener("change", (e) => {
    filterState.selectedCategory = e.target.value;
    filterState.selectedFloor = null; // Reset floor on category change
    updateDependentDropdowns(allTypes, allCategories, allFloors);
    triggerGlobalFilterUpdate();
  });

  // 🔹 FLOOR CHANGE
  floorSelect?.addEventListener("change", (e) => {
    filterState.selectedFloor = e.target.value;
    triggerGlobalFilterUpdate();
  });
};

// 🔹 Step 3: Dynamic Floor Filtering
const updateDependentDropdowns = (allTypes, allCategories, allFloors) => {
  if (!filterState.selectedProject) return;
  let filtered = filterState.masterInventory.filter(p =>
    String(p.PROPERTY_173?.value) === filterState.selectedProject
  );
  if (filterState.selectedType) {
    const matchedIds = filterState.typeMapping[filterState.selectedType] || [filterState.selectedType];
    filtered = filtered.filter(p => matchedIds.includes(String(p.PROPERTY_177?.value)));
  }
  if (filterState.selectedCategory) {
    filtered = filtered.filter(p => String(p.PROPERTY_139?.value) === filterState.selectedCategory);
  }
  
  // Extract specific floors matching the selected "2 Bed" or category
  const availableFloorIds = new Set(filtered.map(p => String(p.PROPERTY_135?.value)));
  
  // Re-populate the dropdown precisely
  populateDropdown("property-floor",
    allFloors.filter(f => availableFloorIds.has(String(f.value))),
    "Select a Property Floor"
  );
};

// Helper to sync filtered results with main.js UI
const triggerGlobalFilterUpdate = () => {
  const filters = {
    project: filterState.selectedProject,
    propertyType: filterState.selectedType,
    propertyCategory: filterState.selectedCategory,
    propertyFloor: filterState.selectedFloor,
  };

  const filteredInventory = filterState.masterInventory.filter(p => {
    if (filters.project && String(p.PROPERTY_173?.value) !== filters.project) return false;
    if (filters.propertyType) {
      const matchedIds = filterState.typeMapping[filters.propertyType] || [filters.propertyType];
      if (!matchedIds.includes(String(p.PROPERTY_177?.value))) return false;
    }
    if (filters.propertyCategory && String(p.PROPERTY_139?.value) !== filters.propertyCategory) return false;
    if (filters.propertyFloor && String(p.PROPERTY_135?.value) !== filters.propertyFloor) return false;
    return true;
  });

  populateItemFilter(filteredInventory);
};