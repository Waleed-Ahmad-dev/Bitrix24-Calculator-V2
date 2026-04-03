import { populateFilters } from "./scripts/PopulateFilters/populateInitialFilters.js";
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
import { generatePDFOfSummaryForBoxPark3 } from "./scripts/generatePDF/generatePDFForBoxPark3.js";

console.log("Script loaded successfully from the scripts folder!");
await populateFilters();

// Select DOM elements
const projectSelect = document.getElementById("project-name");
const propertyTypeSelect = document.getElementById("property-type");
const propertyCategorySelect = document.getElementById("property-category");
const propertyFloorSelect = document.getElementById("property-floor");
const itemFilterSelect = document.getElementById("property-item");
const paymentMethodSelect = document.getElementById("payment-condition");
const downPaymentPercentageSelect = document.getElementById("downpayment-percentage");
const onPossessionPercentageSelect = document.getElementById("possession-percentage");
const installmentPlanSelect = document.getElementById("installment-duration");
const downloadButtonSelect = document.getElementById("menu-download-pdf");
const attachPDFButtonSelect = document.getElementById("menu-attach-lead");
const addBalloonPaymentBtn = document.getElementById("add-balloon-btn");

const handleItemChange = async () => {
  downloadButtonSelect.disabled = false;
  attachPDFButtonSelect.disabled = false;
  const selectedItemId = itemFilterSelect.value;
  if (!selectedItemId) {
    downloadButtonSelect.disabled = true;
    attachPDFButtonSelect.disabled = true;
    return;
  }
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

// handle the change of the downpayment percentage, on possession percentage, and installment plans
const handlechangeOfFinanceValues = () => {
  if (
    downPaymentPercentageSelect.value < 5 ||
    downPaymentPercentageSelect.value > 100
  ) {
    downloadButtonSelect.disabled = true;
    attachPDFButtonSelect.disabled = true;
    downloadButtonSelect.classList.add(
      "opacity-50",
      "cursor-not-allowed",
      "pointer-events-none",
    );
    document.getElementById("downpayment-warning").classList.remove("hidden");
    emptyFinanceFields();
    destroyInstallmentTable();
  } else {
    downloadButtonSelect.disabled = false;
    attachPDFButtonSelect.disabled = false;
    downloadButtonSelect.classList.remove(
      "opacity-50",
      "cursor-not-allowed",
      "pointer-events-none",
    );
    document.getElementById("downpayment-warning").classList.add("hidden");
    changeTheFinanceFields();
    createTableOfInstallments();
  }
};

const downloadPDFSummary = async () => {
  const projectText = projectSelect.options[projectSelect.selectedIndex].text;
  var pdfDoc;
  if (projectText == "Box Park-3")
    pdfDoc = await generatePDFOfSummaryForBoxPark3();
  else pdfDoc = await generatePDFOfSummary();
  
  try {
    const placementInfo = getPlacementInfo();
    if (placementInfo?.options?.ID) {
      const leadData = await getLeadData(placementInfo.options.ID);
      const leadTitle = leadData?.TITLE || "Client";
      const leadId = leadData?.ID || placementInfo.options.ID;
      pdfDoc.save(`${projectText}-${leadTitle}-${leadId}_investment_summary.pdf`);
    } else {
      pdfDoc.save(`${projectText}-investment_summary.pdf`);
    }
  } catch (err) {
    console.error("Error saving PDF:", err);
    pdfDoc.save(`${projectText}-investment_summary.pdf`);
  }
};

export const attachPDFToLead = async () => {
  const attachBtn = document.getElementById("menu-attach-lead");
  const originalContent = attachBtn.innerHTML;
  
  attachBtn.disabled = true;
  attachBtn.classList.remove("bg-pci-gold", "hover:bg-white", "text-pci-blue");
  attachBtn.classList.add("bg-gray-400", "text-white", "cursor-wait");
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
    
    const doc = await generatePDFOfSummary();
    const pdfBlob = doc.output("blob");
    const fileName = `Payment-Plan-${leadId}-${new Date().toISOString().slice(0, 10)}.pdf`;
    const fileFile = new File([pdfBlob], fileName, { type: "application/pdf" });
    
    await attachFileToLead(leadId, fileFile);
    
    attachBtn.classList.replace("bg-gray-400", "bg-green-600");
    attachBtn.innerHTML = "✅ Successfully Attached!";
  } catch (error) {
    console.error("Attachment failed:", error);
    attachBtn.classList.replace("bg-gray-400", "bg-red-600");
    attachBtn.innerHTML = "❌ Error: Try Again";
  } finally {
    setTimeout(() => {
      attachBtn.disabled = false;
      attachBtn.innerHTML = originalContent;
      attachBtn.classList.remove(
        "bg-green-600",
        "bg-red-600",
        "bg-gray-400",
        "text-white",
        "cursor-wait",
      );
      attachBtn.classList.add("bg-white/10", "border-2", "border-white/20", "text-white", "hover:bg-white/20");
    }, 3000);
  }
};

// Event Listeners
itemFilterSelect.addEventListener("change", handleItemChange);
paymentMethodSelect.addEventListener("change", handlePaymentMethodChange);
downPaymentPercentageSelect.addEventListener("input", handlechangeOfFinanceValues);
onPossessionPercentageSelect.addEventListener("input", handlechangeOfFinanceValues);
installmentPlanSelect.addEventListener("change", handlechangeOfFinanceValues);
downloadButtonSelect.addEventListener("click", downloadPDFSummary);
attachPDFButtonSelect.addEventListener("click", attachPDFToLead);
addBalloonPaymentBtn.addEventListener("click", addBalloonPaymentRow);