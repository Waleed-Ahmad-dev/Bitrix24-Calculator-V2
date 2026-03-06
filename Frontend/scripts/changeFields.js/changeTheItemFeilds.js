import { callBX24Method } from "../Bitrix24HelperFunctions/callBX24Method.js";

export const changeTheItemFields = async (productID) => {
  const priceField = document.getElementById("total-price");

  const projectFieldValue = document.getElementById("project-name").value;
  const downPaymentPercentageField = document.getElementById("downpayment-percentage");
  

  if (!productID) {
    priceField.value = "";
    return;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    currency: "USD",
  });

  console.log("Changing fields for product ID:", productID);

  const productData = await callBX24Method("catalog.product.get", {
    id: productID,
  });

  console.log("Fetched product data:", productData);

  const baseRate = productData.product.property115.value || 0;

  const grossarea = productData.product.property113.value || 0;
  const netArea = productData.product.property149.value || 0;

  const floor = productData.product.property135.value || "";


  console.log("floor:", floor);
  console.log("baseRate:", baseRate);
  console.log("grossarea:", grossarea);
  console.log("netArea:", netArea);
  console.log("projectFieldValue:", projectFieldValue);

  var priceToUse;

  if (projectFieldValue == "673") {
    if (floor == "299" || floor == "301" || floor == "249") {
       priceToUse = Number(baseRate.replace(/,/g, "")) * Number(netArea.replace(/,/g, ""));
    }
  } else {
    priceToUse = Number(baseRate.replace(/,/g, "")) * Number(grossarea.replace(/,/g, ""));
  }

  var priceCalculatorNominator;
   if(priceToUse.replace(/,/g, "")  > 10000000    ) {
    priceCalculatorNominator = 1200000
  }
  else {
    priceCalculatorNominator = 800000
  }


  const dpPercentage = (priceCalculatorNominator / priceToUse.replace(/,/g, "") * 100).toFixed(2);

  console.log("Calculated down payment percentage:", dpPercentage);


  const valuesToSet = {
    totalPrice: Number(
      (
        priceToUse
      ).toFixed(2),
    ),
    grossArea: grossarea,
    baseRate: baseRate,
    downPaymentPercentage: dpPercentage,
  };

  console.log("Calculated values to set:", valuesToSet);

  priceField.innerHTML = "";

  const grossAreaField = document.getElementById("gross-area");
  const baseRateField = document.getElementById("base-rate");

  grossAreaField.value = valuesToSet.grossArea;
  baseRateField.value = valuesToSet.baseRate;
  projectFieldValue == "673" ? downPaymentPercentageField.value = valuesToSet.downPaymentPercentage : 50;
  priceField.value = valuesToSet.totalPrice
    ? formatter.format(valuesToSet.totalPrice)
    : "";
};
