export const createTableOfInstallments = () => {
  console.log("Creating/updating the installment table...");

  const plan = document.getElementById("payment-condition").value;
  const totalPriceValue = document.getElementById("total-price").value;
  const downPaymentAmountValue = document.getElementById(
    "downpayment-percentage",
  ).value;
  const onPossessionAmountValues = document.getElementById(
    "possession-percentage",
  ).value;

  console.log("Total Price Value:", totalPriceValue);
  console.log("Down Payment Amount Value:", downPaymentAmountValue);
  console.log("On Possession Amount Value:", onPossessionAmountValues);

  if (plan == "full") {
    const tableBody = document.getElementById("installment-table-body");
    tableBody.innerHTML = "";
    return;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    currency: "USD",
  });

  const getInstallmentNumber =
    parseInt(document.getElementById("installment-duration").value) || 0;
  const summaryInstallmentElement = document.getElementById(
    "summary-installment",
  );
  // const installmentPerAmount = parseFloat(
  //   summaryInstallmentElement ? summaryInstallmentElement.textContent.replace(/[^0-9.-]+/g, "") : 0
  // );

  const totalPriceNumeric =
    parseFloat(totalPriceValue.replace(/[^0-9.-]+/g, "")) || 0;
  const downPaymentPercent = parseFloat(downPaymentAmountValue) || 0;
  const onPossessionPercent = parseFloat(onPossessionAmountValues) || 0;

  const installmentPerAmount =
    ((totalPriceNumeric -
    (totalPriceNumeric * downPaymentPercent) / 100 -
    (totalPriceNumeric * onPossessionPercent) / 100) / getInstallmentNumber).toFixed(2);

  // 1. GATHER ALL BALLOON PAYMENTS FROM THE DOM
  const balloonRows = document.querySelectorAll(".balloon-row");
  console.log(`Found ${balloonRows.length} balloon payment rows in the DOM.`);

  const balloonPayments = [];
  balloonRows.forEach((row) => {
    const monthInput = parseInt(row.querySelector(".balloon-month").value);
    const amountInput = parseFloat(row.querySelector(".balloon-amount").value);
    if (
      !isNaN(monthInput) &&
      monthInput > 0 &&
      !isNaN(amountInput) &&
      amountInput > 0
    ) {
      balloonPayments.push({ month: monthInput, amount: amountInput });
    }
  });

  // 2. PRE-CALCULATE THE TOTAL DEDUCTION FOR EACH ROW
  // Sort balloons by month, then each balloon's deduction only applies
  // to rows within its own exclusive range (since the previous balloon).
  const deductionPerRow = {};
  const sortedBalloons = [...balloonPayments].sort((a, b) => a.month - b.month);
  let prevMonth = 0;

  sortedBalloons.forEach(({ month, amount }) => {
    const rangeLength = month - prevMonth;
    const deductionPerInstallment = amount / rangeLength;
    for (let i = prevMonth + 1; i <= month; i++) {
      deductionPerRow[i] = (deductionPerRow[i] || 0) + deductionPerInstallment;
    }
    prevMonth = month;
  });

  // 3. BUILD THE TABLE
  const tableBody = document.getElementById("installment-table-body");
  tableBody.innerHTML = "";

  for (let i = 1; i <= getInstallmentNumber; i++) {
    const deduction = deductionPerRow[i] || 0;
    const adjustedAmount = parseFloat(installmentPerAmount - deduction).toFixed(2);

    // --- Standard Installment Row ---
    const row = document.createElement("tr");
    row.classList.add("bg-white", "border-b", "border-gray-200");

    const installmentCell = document.createElement("td");
    installmentCell.classList.add(
      "px-6",
      "py-4",
      "whitespace-nowrap",
      "text-sm",
      "text-gray-900",
      "font-medium",
    );
    installmentCell.textContent = `${i}`;

    const amountCell = document.createElement("td");
    amountCell.classList.add(
      "px-6",
      "py-4",
      "whitespace-nowrap",
      "text-sm",
      "text-gray-900",
    );
    amountCell.textContent = `${formatter.format(adjustedAmount)}`;

    row.appendChild(installmentCell);
    row.appendChild(amountCell);
    tableBody.appendChild(row);

    // --- Balloon Payment Row(s) ---
    const balloonsForThisMonth = balloonPayments.filter((bp) => bp.month === i);
    balloonsForThisMonth.forEach((balloon) => {
      const balloonRow = document.createElement("tr");
      balloonRow.classList.add("bg-slate-50", "border-b", "border-gray-300");

      const balloonInstallmentCell = document.createElement("td");
      balloonInstallmentCell.classList.add(
        "px-6",
        "py-4",
        "whitespace-nowrap",
        "text-sm",
        "text-pci-blue",
        "font-bold",
        "italic",
      );
      balloonInstallmentCell.textContent = `${i} - Balloon Payment`;

      const balloonAmountCell = document.createElement("td");
      balloonAmountCell.classList.add(
        "px-6",
        "py-4",
        "whitespace-nowrap",
        "text-sm",
        "text-pci-blue",
        "font-bold",
      );
      balloonAmountCell.textContent = `${formatter.format(balloon.amount)}`;

      balloonRow.appendChild(balloonInstallmentCell);
      balloonRow.appendChild(balloonAmountCell);
      tableBody.appendChild(balloonRow);
    });
  }
};
