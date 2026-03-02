import { populateFilters } from "./scripts/PopulateFilters/populateInitialFilters.js";
import { getTheProductWithFilter } from "./scripts/Bitrix24HelperFunctions/getTheProductWithFilter.js";
import { populateItemFilter } from "./scripts/PopulateFilters/populateItemFilter.js";
import { changeTheItemFields } from "./scripts/changeFields.js/changeTheItemFeilds.js";
import { hideFilterFields } from "./scripts/changeVisibiltyOfFeilds/hideFilterFeilds.js";
import { unhideFilterFields } from "./scripts/changeVisibiltyOfFeilds/unhideFilterFeilds.js";
import { changeTheFinanceFields } from "./scripts/changeFields.js/changeTheFinanceFeilds.js";
import { createTableOfInstallments } from "./scripts/CreateTableOfInstallments/createTableOfInstallments.js";
import { generatePDFOfSummary } from "./scripts/generatePDF/generatePDF.js";
import { getPlacementInfo } from "./scripts/Bitrix24HelperFunctions/getPlacementInfo.js";
import { attachFileToLead } from "./scripts/attachFileToLead/attachFileToLead.js";
import { destroyInstallmentTable } from "./scripts/CreateTableOfInstallments/destroyTheTableOfInstallment.js";
import { emptyFinanceFields } from "./scripts/changeFields.js/emptyTheFinanceFields.js";
import { getLeadData } from "./scripts/Bitrix24HelperFunctions/getLeadData.js";
import { addBalloonPaymentRow } from "./scripts/ballonPayment/ballonPayment.js";
// import { disableTheDownloadButton } from "./scripts/changeVisibiltyOfFeilds/disableTheDownloadButton.js";

// A simple console log to verify connection
console.log("Script loaded successfully from the scripts folder!");

await populateFilters();

// Select DOM elements
const button = document.getElementById("myButton");
const outputText = document.getElementById("output-text");
const projectSelect = document.getElementById("project-name");
const propertyTypeSelect = document.getElementById("property-type");
const propertyCategorySelect = document.getElementById("property-category");
const itemFilterSelect = document.getElementById("property-item");
const paymentMethodSelect = document.getElementById("payment-condition");
const downPaymentPercentageSelect = document.getElementById(
  "downpayment-percentage",
);
const onPossessionPercentageSelect = document.getElementById(
  "possession-percentage",
);
const installmentPlanSelect = document.getElementById("installment-duration");
const downloadButtonSelect = document.getElementById("menu-download-pdf");
const attachPDFButtonSelect = document.getElementById("menu-attach-lead");
const propertyFloorSelect = document.getElementById("property-floor");
const addBalloonPaymentBtn = document.getElementById("add-balloon-payment-btn");

const handleFilterChange = async () => {
  const filters = {
    project: projectSelect.value,
    propertyType: propertyTypeSelect.value,
    propertyCategory: propertyCategorySelect.value,
    propertyFloor: propertyFloorSelect.value
  };

  console.log("Current filters:", filters);

  if (filters) {
    const productList = await getTheProductWithFilter(filters);
    populateItemFilter(productList);
  }
};

const handleItemChange = async () => {
  downloadButtonSelect.disabled = false;
  const selectedItemId = itemFilterSelect.value;
  await changeTheItemFields(selectedItemId);
  changeTheFinanceFields();
  createTableOfInstallments();
};

const handlePaymentMethodChange = () => {
  const selectedPaymentMethod = paymentMethodSelect.value;

  console.log("Selected payment method:", selectedPaymentMethod);

  if (selectedPaymentMethod == "full") {
    hideFilterFields(["installment-options-container"]);
    changeTheFinanceFields();
    createTableOfInstallments();
  }
  if (selectedPaymentMethod == "installment") {
    unhideFilterFields(["installment-options-container"]);
    changeTheFinanceFields();
    createTableOfInstallments();
  }
};

// handle the change of the downpayment percentage,on possession percentage, and installment plans
const handlechangeOfFinanceValues = () => {
 if( downPaymentPercentageSelect.value < 30 || downPaymentPercentageSelect.value > 100 ){
    downloadButtonSelect.disabled = true;
    attachPDFButtonSelect.disabled = true;
    downloadButtonSelect.classList.add("opacity-50", "cursor-not-allowed", "pointer-events-none");
    document.getElementById("downpayment-warning").classList.remove("hidden");
    emptyFinanceFields();
    destroyInstallmentTable();
 } 
 else {
    downloadButtonSelect.disabled = false;
    attachPDFButtonSelect.disabled = false;
    downloadButtonSelect.classList.remove("opacity-50", "cursor-not-allowed", "pointer-events-none");
    document.getElementById("downpayment-warning").classList.add("hidden");
    changeTheFinanceFields();
    createTableOfInstallments();
 }

  
};

const downloadPDFSummary = async () => {
  const pdfDoc = await generatePDFOfSummary();
  const projectText = projectSelect.options[projectSelect.selectedIndex].text;
  const leadData = await getLeadData(getPlacementInfo().options.ID);
  const leadTitle = leadData['TITLE'];
  const leadId = leadData['ID'];
  pdfDoc.save(`${projectText}-${leadTitle}-${leadId}_investment_summary.pdf`);
};

// const attachPDFToLead = async () => {

//   console.log("[Attach PDF] Starting process to attach PDF to Lead...");

//   const leadID = getPlacementInfo()["options"]["ID"];

//   const file = await generatePDFOfSummary();

//   const pdfBlob = file.output("blob");

//   // 2. Give the blob a name property so attachFileToLead can find it
//   const fileName = `Payment-Plan-${leadID}.pdf`;
//   const fileFile = new File([pdfBlob], fileName, { type: "application/pdf" });

//   await attachFileToLead(leadID, fileFile);

//   console.log(`[Attach PDF] Retrieved Lead ID from placement info: ${leadID}`);

//   // const pdfDoc = await generatePDFOfSummary();

//   // // convert to base64 String
//   // const fullDataUri = await pdfDoc.output('datauristring');
//   // const base64String = fullDataUri.split(',')[1];

//   // await attachFileToLead(leadId, base64String);
// };

export const attachPDFToLead = async () => {
  const attachBtn = document.getElementById("menu-attach-lead");
  const originalContent = attachBtn.innerHTML;

  // 1. UI: Start Processing
  attachBtn.disabled = true;
  attachBtn.classList.remove('bg-pci-gold', 'hover:bg-white', 'text-pci-blue');
  attachBtn.classList.add('bg-gray-400', 'text-white', 'cursor-wait');
  attachBtn.innerHTML = `
    <svg class="animate-spin h-5 w-5 mr-3 text-white inline" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Attaching...
  `;

  try {
    const placementInfo = BX24.placement.info();
    const leadId = Number(placementInfo?.options?.ID);
    if (!leadId) throw new Error("Missing Lead ID");

    // 2. PDF Generation
    const doc = await generatePDFOfSummary();
    const pdfBlob = doc.output("blob");
    const fileName = `Payment-Plan-${leadId}-${new Date().toISOString().slice(0, 10)}.pdf`;

    // --- INTEGRATED LINE START ---
    // Creating a formal File object to ensure correct MIME type and naming
    const fileFile = new File([pdfBlob], fileName, { type: "application/pdf" });
    // --- INTEGRATED LINE END ---

    // 3. Execution (Passing the formal File object)
    await attachFileToLead(leadId, fileFile);

    // 4. UI: Success State (Green)
    attachBtn.classList.replace('bg-gray-400', 'bg-green-600');
    attachBtn.innerHTML = "✅ Successfully Attached!";

  } catch (error) {
    // 5. UI: Error State (Red)
    console.error("Attachment failed:", error);
    attachBtn.classList.replace('bg-gray-400', 'bg-red-600');
    attachBtn.innerHTML = "❌ Error: Try Again";
  } finally {
    // 6. Reset: Restore button after 3 seconds
    setTimeout(() => {
      attachBtn.disabled = false;
      attachBtn.innerHTML = originalContent;
      attachBtn.classList.remove('bg-green-600', 'bg-red-600', 'bg-gray-400', 'text-white', 'cursor-wait');
      attachBtn.classList.add('bg-pci-gold', 'text-pci-blue', 'hover:bg-white');
    }, 3000);
  }
};

projectSelect.addEventListener("change", handleFilterChange);

propertyTypeSelect.addEventListener("change", handleFilterChange);

propertyCategorySelect.addEventListener("change", handleFilterChange);

itemFilterSelect.addEventListener("change", handleItemChange);

paymentMethodSelect.addEventListener("change", handlePaymentMethodChange);

propertyFloorSelect.addEventListener("change", handleFilterChange);

downPaymentPercentageSelect.addEventListener(
  "input",
  handlechangeOfFinanceValues,
);

onPossessionPercentageSelect.addEventListener(
  "input",
  handlechangeOfFinanceValues,
);

installmentPlanSelect.addEventListener("change", handlechangeOfFinanceValues);

downloadButtonSelect.addEventListener("click", downloadPDFSummary);

attachPDFButtonSelect.addEventListener("click", attachPDFToLead);

addBalloonPaymentBtn.addEventListener("click", addBalloonPaymentRow);
