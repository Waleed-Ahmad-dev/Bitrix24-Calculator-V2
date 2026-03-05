import { getTheProductData } from "../Bitrix24HelperFunctions/getTheProductData.js";
import { fetchReadableText } from "../Bitrix24HelperFunctions/fetchReadableText.js";

// Helper: Converts image URL to Base64 for PDF embedding
async function imageToBase64(url) {
  console.log(`[ImageHelper] Converting to Base64: ${url}`);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (e) => {
      console.error(`[ImageHelper] Failed to load image: ${url}`, e);
      reject(e);
    };
    img.src = url;
  });
}

function parseCurrency(value) {
  if (!value) return 0;
  return parseFloat(value.toString().replace(/,/g, ""));
}

function formatCurrency(value) {
  return value.toLocaleString("en-US");
}

export const generatePDFOfSummaryForBoxPark3 = async () => {
  console.log("[PDF Gen] Starting PDF generation process...");

  // 1. Gather Data from DOM
  try {
    // const projectSelect = document.getElementById("project-name");
    // const clientNameInput = document.getElementById("client-name");
    // const propertyTypeSelect = document.getElementById("property-type");
    // const itemFilterSelect = document.getElementById("property-item");
    // const paymentMethodSelect = document.getElementById("payment-condition");
    // const grossAreaInput = document.getElementById("gross-area");
    // const totalPriceInput = document.getElementById("summary-total-price");
    // const installmentsInput = document.getElementById(
    //   "summary-installments-no",
    // );
    // const downPaymentPercInput = document.getElementById("summary-downpayment");
    // const possessionPercInput = document.getElementById(
    //   "possession-percentage",
    // );
    // const possessionAmtInput = document.getElementById(
    //   "summary-possession-amount",
    // );
    // const installmentAmtInput = document.getElementById("summary-remaining");

    // // DEBUG: Check if any element is missing
    // if (!totalPriceInput || !paymentMethodSelect) {
    //   console.error(
    //     "[PDF Gen] CRITICAL ERROR: Missing DOM elements! Check your IDs ('summary-total-price', etc.)",
    //   );
    // }

    // const projectName = projectSelect.options[projectSelect.selectedIndex].text;
    // const clientName = clientNameInput.value;
    // const propertyType =
    //   propertyTypeSelect.options[propertyTypeSelect.selectedIndex].text;
    // const unitNumber =
    //   itemFilterSelect.options[itemFilterSelect.selectedIndex].text;
    // const condition =
    //   paymentMethodSelect.options[paymentMethodSelect.selectedIndex].text;
    // const grossArea = grossAreaInput.value;
    // const totalPriceRaw = parseCurrency(totalPriceInput.value);

    // const dpPercent = parseCurrency(downPaymentPercInput.value);
    // const dpAmount = (totalPriceRaw * dpPercent) / 100;
    // const possAmountRaw = parseCurrency(possessionAmtInput.value);
    // const remainingBalance = totalPriceRaw - dpAmount - possAmountRaw;

    // const currentCalculations = {
    //   projectName,
    //   clientName,
    //   propertyType,
    //   unitNumber,
    //   condition,
    //   netArea: grossArea,
    //   totalPrice: formatCurrency(totalPriceRaw),
    //   numberOfInstallments: parseInt(installmentsInput.value) || 0,
    //   monthlyInstallment: installmentAmtInput.value,
    //   downPaymentPercent: dpPercent,
    //   downPayment: formatCurrency(dpAmount),
    //   possessionPercent: parseCurrency(possessionPercInput.value),
    //   possessionAmount: possessionAmtInput.value,
    //   remainingAmount: formatCurrency(remainingBalance),
    // };

    // 1. Gather Data from DOM
    const projectSelect = document.getElementById("project-name");
    const clientNameInput = document.getElementById("client-name");
    const propertyTypeSelect = document.getElementById("property-type");
    const itemFilterSelect = document.getElementById("property-item");
    const paymentMethodSelect = document.getElementById("payment-condition");
    const grossAreaInput = document.getElementById("gross-area");

    // These are DIVs in your HTML, use .innerText or .textContent
    const totalPriceDiv = document.getElementById("summary-total-price");
    const installmentsDiv = document.getElementById("summary-installments-no");
    const downPaymentDiv = document.getElementById("summary-downpayment");
    const possessionAmtDiv = document.getElementById(
      "summary-possession-amount",
    );
    const installmentAmtDiv = document.getElementById("summary-remaining");
    const monthlyInstallmentDiv = document.getElementById(
      "summary-installment",
    ); // For the recurring amount

    // Input percentages for calculation
    const downPaymentPercInput = document.getElementById(
      "downpayment-percentage",
    );
    const possessionPercSelect = document.getElementById(
      "possession-percentage",
    );

    // Get raw text/values
    const projectName = projectSelect.options[projectSelect.selectedIndex].text;
    const clientName = clientNameInput.value;
    const propertyType =
      propertyTypeSelect.options[propertyTypeSelect.selectedIndex].text;
    const unitNumber =
      itemFilterSelect.options[itemFilterSelect.selectedIndex].text;
    const condition =
      paymentMethodSelect.options[paymentMethodSelect.selectedIndex].text;
    const grossArea = grossAreaInput.value;

    // FIX: Use .innerText for DIV elements
    const numberOfInstallments = parseInt(installmentsDiv.innerText) || 0;
    const totalPriceRaw = parseCurrency(totalPriceDiv.innerText);
    const dpAmount = parseCurrency(downPaymentDiv.innerText);
    const possAmountRaw = parseCurrency(possessionAmtDiv.innerText);
    const remainingBalance = parseCurrency(installmentAmtDiv.innerText);
    const monthlyAmt = monthlyInstallmentDiv.innerText;

    const productData = await getTheProductData(itemFilterSelect.value);

    console.log("[PDF Gen] Fetched Product Data:", productData);

    // get the property type:
    const {
      PROPERTY_177: propertyTypeValue,
      PROPERTY_139: categoryTypeValue,
      PROPERTY_135: floorTypeValue,
    } = productData || {};

    // get the value of the properties:
    const propertyTypeID = propertyTypeValue ? propertyTypeValue.value : null;
    const categoryID = categoryTypeValue ? categoryTypeValue.value : null;
    const floorValue = floorTypeValue ? floorTypeValue.value : null;

    const balloonAmtDiv = document.getElementById("summary-balloon-total");
    const balloonAmtRaw = parseCurrency(balloonAmtDiv.innerText) || 0;

    console.log(
      `[PDF Gen] Property Type ID: ${propertyTypeID} | Category ID: ${categoryID}`,
    );

    const propertyTypeText = propertyTypeID
      ? await fetchReadableText(propertyTypeID)
      : "N/A";

    const categoryTypeText = categoryID
      ? await fetchReadableText(categoryID)
      : "N/A";

    const floorTypeText = floorValue
      ? await fetchReadableText(floorValue)
      : "N/A";

    console.log(
      `[PDF Gen] Resolved Property Type: ${propertyTypeText} | Resolved Category: ${categoryTypeText} | Resolved Floor: ${floorTypeText}`,
    );

    console.log(
      `[PDF Gen] Fixed! Installments detected: ${numberOfInstallments}`,
    );

    // Prepare the Main Data Object
    const currentCalculations = {
      projectName: projectName,
      clientName: clientName,
      propertyType: propertyTypeText,
      categoryType: categoryTypeText,
      floorType: floorTypeText,
      unitNumber: unitNumber,
      condition: condition,
      mode: "custom-area",
      netArea: grossArea,
      totalPrice: formatCurrency(totalPriceRaw),
      numberOfInstallments: numberOfInstallments,
      monthlyInstallment: monthlyAmt,
      downPaymentPercent: parseCurrency(downPaymentPercInput.value),
      downPayment: formatCurrency(dpAmount),
      possessionPercent: parseCurrency(possessionPercSelect.value),
      possessionAmount: formatCurrency(possAmountRaw),
      remainingAmount: formatCurrency(remainingBalance),
      totalPriceRaw: totalPriceRaw,
      totalBalloonAmount: formatCurrency(balloonAmtRaw),
    };

    console.log(
      "[PDF Gen] Current Calculations Data Object:",
      currentCalculations,
    );

    // 2. Define Assets
    const projectAssets = {
      "River Courtyard": {
        logoUrl: "https://i.postimg.cc/FHNNkXGY/River-Courtyard.png",
        imageUrl: "https://i.postimg.cc/nz0Qg1zw/river-Small.png",
      },
      "Grand Gallery": {
        logoUrl: "https://i.postimg.cc/QdhhKZS7/Grand-Gallery.png",
        imageUrl: "https://i.postimg.cc/4dBhq1dq/grand-gallery-Small.png",
      },
      "Box Park II": {
        logoUrl: "https://i.postimg.cc/7ZwwJrXG/Box-Park.png",
        imageUrl: "https://i.postimg.cc/262BMx60/box-park-II-Small.jpg",
      },
      "Roman Grove": {
        logoUrl: "https://i.postimg.cc/jSttnYvW/Roman-Grove.png",
        imageUrl: "https://i.postimg.cc/NMprSxM4/roman-grove-1-Small.jpg",
      },
      "Buraq Heights": {
        logoUrl: "https://i.postimg.cc/vZbbxwXW/Buraq-Heights.png",
        imageUrl: "https://i.postimg.cc/C1mfX41P/buraq-height-Small.png",
      },
      "Grand Orchard": {
        logoUrl: "https://i.postimg.cc/SxkkYbV8/Grand-Orchard.png",
        imageUrl:
          "https://i.postimg.cc/50nFTm0P/DHA-Orchard-Night-Shot-01-Small.jpg",
      },
      "Box Park-3": {
        logoUrl: "https://i.postimg.cc/pVjJJCth/sales-offer-Box-Park-3-04.png",
        imageUrl: "https://i.postimg.cc/L4z2FdpS/Front-View.jpg",
      },
      default: {
        logoUrl: "https://i.postimg.cc/SxkkYbV8/Grand-Orchard.png",
        imageUrl:
          "https://i.postimg.cc/50nFTm0P/DHA-Orchard-Night-Shot-01-Small.jpg",
      },
    };

    const assets =
      projectAssets[currentCalculations.projectName] || projectAssets.default;
    const companyLogoUrl = "https://i.postimg.cc/50n359N3/pci-logo-01-01.png";
    const companyLogoUrlSecond = "https://i.postimg.cc/Y2mc6bX0/Logo-White.png";

    // 3. Initialize PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const pciBlue = "#003366";
    const pciGold = "#D4AF37";
    const textDark = "#343A40";
    const textLight = "#6C757D";
    const bgLight = "#F8F9FA";

    console.log("[PDF Gen] Drawing Page 1...");

    if (projectName == "Box Park-3") {
      const firstPageImageURL =
        "https://i.postimg.cc/bYn99gjn/Sales-Offer-Box-Park-III-jpg.jpg";
      try {
        const base64OfFirstImage = await imageToBase64(firstPageImageURL);
        doc.addImage(base64OfFirstImage, "JPEG", 0, 0, pageW, pageH);
        doc.addPage();
      } catch (e) {
        console.warn(
          "[PDF Gen] Skipping Box Park-3 image due to CORS/Load error",
        );
      }
    }

    // --- PAGE 1: TITLE PAGE ---
    let currentY = 15;
    try {
      const premierLogoBase64 = await imageToBase64(companyLogoUrl);
      doc.addImage(premierLogoBase64, "PNG", 15, currentY, 80, 20);
    } catch (e) {
      console.warn("[PDF Gen] Skipping Company Logo due to error");
    }

    try {
      const projectLogoBase64 = await imageToBase64(assets.logoUrl);
      doc.addImage(projectLogoBase64, "PNG", pageW - 70, currentY, 55, 25);
    } catch (e) {
      console.warn("[PDF Gen] Skipping Project Logo due to error");
    }

    currentY += 40;
    doc.setFontSize(12).setTextColor(textDark);
    doc.text("Prepared for", 15, currentY);
    doc.text(
      currentCalculations.clientName || "Valued Client",
      15,
      currentY + 7,
    );
    doc.text(`Project: ${currentCalculations.projectName}`, 15, currentY + 17);
    doc.text(
      `Property Type: ${currentCalculations.propertyType}`,
      15,
      currentY + 24,
    );

    const rightColX = pageW - 65;
    const quoteNum = Math.floor(1000 + Math.random() * 9000);
    doc.text("Summary #", rightColX, currentY);
    doc.text(String(quoteNum), rightColX, currentY + 7);
    doc.text("Date Issued:", rightColX, currentY + 17);
    doc.text(new Date().toLocaleDateString("en-GB"), rightColX, currentY + 24);

    currentY += 40;
    try {
      const projectImageBase64 = await imageToBase64(assets.imageUrl);
      doc.addImage(projectImageBase64, "JPEG", 15, currentY, pageW - 30, 80);
    } catch (e) {
      console.warn("[PDF Gen] Skipping Project Image due to error");
    }

    currentY += 80 + 25;

    //     const detailsY = currentY;
    // const colWidth = (pageW - 40) / 2;
    // doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(pciBlue);
    // doc.text('Project Details', 15, detailsY);
    // doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor(textDark);

    // // --- UPDATED PROJECT DETAILS (Removed Location & Handover) ---
    // const projectDetails = [
    //     `Project: ${currentCalculations.projectName}`,
    //     `Unit Type: ${currentCalculations.propertyType}`,
    //     `Payment Plan: ${currentCalculations.condition}`
    // ];

    // projectDetails.forEach((line, index) => doc.text(line, 15, detailsY + 12 + (index * 6)));

    // const dividerX = 15 + colWidth + 10;
    // doc.setDrawColor(pciBlue).setLineWidth(0.5).line(dividerX, detailsY - 5, dividerX, detailsY + 40);
    // doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(pciBlue);
    // doc.text('Unit Details', dividerX + 10, detailsY);
    // doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor(textDark);

    // // --- UPDATED UNIT DETAILS (Removed Bed/Bath/Loc/Handover, Updated Floor/Type, Added Base Rate) ---
    // const unitDetails = [
    //     `Unit Number: ${currentCalculations.unitNumber}`,
    //     `Type: ${currentCalculations.propertyType}`,
    //     `Category: ${currentCalculations.categoryType}`,
    //     `Floor: ${currentCalculations.floorType}`,
    //     `Total Area: ${currentCalculations.mode === 'custom-area' ? currentCalculations.netArea : currentCalculations.plotSize}`,
    //     // `Base Rate (SQ/FT): ${currentCalculations.perSqFtPrice}` // Added Base Rate field
    // ];
    // // --------------------------------------------------------------------------------------------------

    // unitDetails.forEach((line, index) => doc.text(line, dividerX + 10, detailsY + 12 + (index * 6)));
    // --- PAGE 1: PROPERTY DETAILS TABLE ---
    const detailsY = currentY;

    // 1. Add the Table Heading
    doc.setFontSize(16).setFont("helvetica", "bold").setTextColor(pciBlue);
    doc.text("Property Details", 15, detailsY);

    // Resolve the total area variable safely
    const totalAreaValue =
      currentCalculations.mode === "custom-area"
        ? currentCalculations.netArea
        : currentCalculations.plotSize;

    // 2. Prepare 4-column data to keep the layout compact but structured
    const propertyDetailsBody = [
      [
        "Project:",
        currentCalculations.projectName,
        "Unit Number:",
        currentCalculations.unitNumber,
      ],
      [
        "Type:",
        currentCalculations.propertyType,
        "Category:",
        currentCalculations.categoryType,
      ],
      ["Floor:", currentCalculations.floorType, "Total Area:", totalAreaValue],
    ];

    // 3. Render the table using autoTable
    doc.autoTable({
      startY: detailsY + 5,
      body: propertyDetailsBody,
      theme: "grid",
      styles: {
        fontSize: 10,
        textColor: textDark,
        cellPadding: 4,
        lineColor: [220, 220, 220], // Light gray borders for a clean look
        lineWidth: 0.1,
      },
      // Apply your existing 'bgLight' background color to the label columns to make them pop
      columnStyles: {
        0: { fontStyle: "bold", fillColor: bgLight },
        1: {},
        2: { fontStyle: "bold", fillColor: bgLight },
        3: {},
      },
      margin: { left: 15, right: 15 },
    });

    // update currentY so they don't overlap the new table.
    currentY = doc.autoTable.previous.finalY + 15;

    // --- PAGE 2: SUMMARY & SCHEDULE ---
    console.log("[PDF Gen] Drawing Page 2...");
    doc.addPage();
    const pageW2 = doc.internal.pageSize.getWidth();

    doc.setFillColor(pciBlue).rect(0, 0, pageW2, 40, "F");

    try {
      const logoBase64 = await imageToBase64(companyLogoUrlSecond);
      doc.addImage(logoBase64, "PNG", 15, 12, 60, 18);
    } catch (e) {
      console.warn("[PDF Gen] Skipping Company Logo on Page 2 due to error");
    }

    doc
      .setFontSize(28)
      .setFont("helvetica", "bold")
      .setTextColor("#FFFFFF")
      .text("Investment Summary", pageW2 - 15, 23, { align: "right" });

    // --- FINANCIAL BREAKDOWN TABLE ---
    console.log("[PDF Gen] Rendering Financial Breakdown...");

    // Define the table rows based on your requirements
    const financialBody = [
      ["Total Unit Price", `PKR ${currentCalculations.totalPrice}`],
      [
        `Down Payment (${currentCalculations.downPaymentPercent}%)`,
        `PKR ${currentCalculations.downPayment}`,
      ],
      [
        `Possession (${currentCalculations.possessionPercent}%)`,
        `PKR ${currentCalculations.possessionAmount}`,
      ],
      ["Total Balloon Amount", `PKR ${currentCalculations.totalBalloonAmount}`],
      [
        "Standard Monthly Installment",
        `PKR ${currentCalculations.monthlyInstallment}`,
      ],
    ];

    doc.autoTable({
      startY: 55,
      head: [["Financial Breakdown", "Value"]],
      body: financialBody,
      theme: "striped",
      headStyles: {
        fillColor: pciBlue,
        textColor: "#FFFFFF",
        fontSize: 12,
        fontStyle: "bold",
        halign: "left",
        // Sync padding with body to ensure vertical alignment
        cellPadding: { top: 5, right: 10, bottom: 5, left: 10 },
      },
      bodyStyles: {
        fontSize: 10,
        textColor: textDark,
        cellPadding: { top: 5, right: 10, bottom: 5, left: 10 },
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "right", fontStyle: "bold" },
      },
      // didParseCell is the correct way to override the header specifically
      didParseCell: function (data) {
        if (data.section === "head" && data.column.index === 1) {
          data.cell.styles.halign = "right";
        }
      },
      margin: { left: 15, right: 15 },
      styles: {
        lineWidth: 0,
        font: "helvetica",
      },
    });

    // --- INSTALLMENT SCHEDULE TABLE ---
    console.log("[PDF Gen] Building Installment Schedule...");

    const installmentPlan =
      parseInt(document.getElementById("installment-duration").value) || 0;
    const scheduleBody = [];

    // Reuse your Balloon Payment gathering logic
    const balloonRows = document.querySelectorAll(".balloon-row");
    const balloonPayments = [];
    balloonRows.forEach((row) => {
      const month = parseInt(row.querySelector(".balloon-month").value);
      const amount = parseFloat(row.querySelector(".balloon-amount").value);
      if (!isNaN(month) && month > 0 && !isNaN(amount) && amount > 0) {
        balloonPayments.push({ month, amount });
      }
    });

    // Logic to build the rows
    for (let i = 1; i <= installmentPlan; i++) {
      // Add Standard Monthly Installment
      scheduleBody.push([
        i.toString(),
        "Monthly Installment",
        `PKR ${currentCalculations.monthlyInstallment}`,
      ]);

      // Check if a Balloon Payment exists for this month
      const balloonsForThisMonth = balloonPayments.filter(
        (bp) => bp.month === i,
      );
      balloonsForThisMonth.forEach((balloon) => {
        scheduleBody.push([
          "", // Empty month to match your screenshot image_2f7586.png
          "BALLOON PAYMENT",
          `PKR ${formatCurrency(balloon.amount)}`,
        ]);
      });
    }

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      head: [["Month", "Description", "Amount"]],
      body: scheduleBody,
      theme: "grid",
      headStyles: {
        fillColor: pciGold,
        textColor: "#333333",
        fontStyle: "bold",
        halign: "left", // Default alignment for header
      },
      // --- THIS SECTION ALIGNS THE COLUMN ---
      columnStyles: {
        0: { halign: "center", cellWidth: 25 }, // Center the Month numbers
        1: { halign: "left" }, // Left align Description
        2: { halign: "right" }, // RIGHT ALIGN THE AMOUNT
      },
      didParseCell: function (data) {
        // Force the Header of the Amount column to be right-aligned too
        if (data.section === "head" && data.column.index === 2) {
          data.cell.styles.halign = "right";
        }

        // Apply orange highlighting for Balloon Payments
        if (data.column.index === 1 && data.cell.raw === "BALLOON PAYMENT") {
          const orangeBG = [255, 248, 225];
          data.row.cells[0].styles.fillColor = orangeBG;
          data.row.cells[1].styles.fillColor = orangeBG;
          data.row.cells[2].styles.fillColor = orangeBG;
          data.row.cells[1].styles.fontStyle = "bold";
          data.row.cells[2].styles.fontStyle = "bold";
        }
      },
      margin: { left: 15, right: 15 },
      styles: { font: "helvetica", fontSize: 9 },
    });

    // // Summary Table
    // doc.autoTable({
    //   startY: 65,
    //   theme: "plain",
    //   body: [
    //     [
    //       {
    //         content: "PREPARED FOR",
    //         styles: { textColor: textLight, fontSize: 10 },
    //       },
    //       {
    //         content: "SUMMARY #",
    //         styles: { halign: "right", textColor: textLight, fontSize: 10 },
    //       },
    //     ],
    //     [
    //       {
    //         content: currentCalculations.clientName,
    //         styles: { textColor: textDark, fontStyle: "bold", fontSize: 12 },
    //       },
    //       {
    //         content: quoteNum,
    //         styles: {
    //           halign: "right",
    //           textColor: textDark,
    //           fontStyle: "bold",
    //           fontSize: 11,
    //         },
    //       },
    //     ],
    //   ],
    // });

    // // Schedule Table Construction
    // console.log("[PDF Gen] Building Table Body...");
    // const tableBody = [];
    // tableBody.push([
    //   "1",
    //   `Investment for ${currentCalculations.projectName}\nUnit: ${currentCalculations.unitNumber}`,
    //   `${currentCalculations.netArea} sq. ft.`,
    //   `PKR ${currentCalculations.totalPrice}`,
    // ]);

    // const isInstallment = currentCalculations.condition
    //   .toLowerCase()
    //   .includes("installment");
    // console.log(
    //   `[PDF Gen] Payment Condition: "${currentCalculations.condition}" | isInstallment: ${isInstallment}`,
    // );

    // if (isInstallment) {
    //   console.log(
    //     `[PDF Gen] Adding ${currentCalculations.numberOfInstallments} installment rows...`,
    //   );
    //   for (let i = 1; i <= currentCalculations.numberOfInstallments; i++) {
    //     tableBody.push([
    //       "",
    //       `Installment #${i}`,
    //       "",
    //       `PKR ${currentCalculations.monthlyInstallment}`,
    //     ]);
    //   }
    // }

    // console.log("[PDF Gen] Final Table Body Array:", tableBody);

    // doc.autoTable({
    //   startY: doc.autoTable.previous.finalY + 15,
    //   head: [["#", "DESCRIPTION", "DIMENSIONS", "AMOUNT"]],
    //   body: tableBody,
    //   theme: "striped",
    //   headStyles: { fillColor: pciBlue, textColor: "#FFFFFF" },
    //   columnStyles: { 3: { halign: "right" } },
    // });

    // // Totals Table
    // console.log("[PDF Gen] Rendering Totals section...");
    // let totalsBody = [];
    // if (isInstallment) {
    //   totalsBody = [
    //     ["Total Price:", currentCalculations.totalPrice],
    //     [
    //       `Down Payment (${currentCalculations.downPaymentPercent}%):`,
    //       currentCalculations.downPayment,
    //     ],
    //     [
    //       `On Possession (${currentCalculations.possessionPercent}%):`,
    //       currentCalculations.possessionAmount,
    //     ],
    //     ["Remaining For Installments:", currentCalculations.remainingAmount],
    //   ];
    // } else {
    //   totalsBody = [["Grand Total:", currentCalculations.totalPrice]];
    // }

    // doc.autoTable({
    //   startY: doc.autoTable.previous.finalY + 8,
    //   theme: "plain",
    //   body: totalsBody,
    //   margin: { left: 100 },
    //   columnStyles: {
    //     0: { fontStyle: "bold", halign: "right" },
    //     1: { halign: "right" },
    //   },
    // });

    // console.log("[PDF Gen] Saving PDF...");

    return doc;
    console.log("[PDF Gen] Success!");
  } catch (err) {
    console.error("[PDF Gen] FATAL ERROR during generation:", err);
  }
};
