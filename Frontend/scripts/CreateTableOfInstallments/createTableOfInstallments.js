export const createTableOfInstallments = () => {
  console.log("Creating/updating the installment table...");

  const plan = document.getElementById("payment-condition").value;

  if (plan == "full") {
    const tableBody = document.getElementById("installment-table-body");
    tableBody.innerHTML = "";
    return;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    currency: "USD",
  });

  const getInstallmentNumber = parseInt(document.getElementById("installment-duration").value) || 0;
  const summaryInstallmentElement = document.getElementById("summary-installment");
  const installmentPerAmount = parseFloat(
    summaryInstallmentElement ? summaryInstallmentElement.textContent.replace(/[^0-9.-]+/g, "") : 0
  );

  // 1. GATHER ALL BALLOON PAYMENTS FROM THE DOM
  const balloonRows = document.querySelectorAll('.balloon-row');
  console.log(`Found ${balloonRows.length} balloon payment rows in the DOM.`);

  const balloonPayments = [];
  balloonRows.forEach(row => {
    const monthInput = parseInt(row.querySelector('.balloon-month').value);
    const amountInput = parseFloat(row.querySelector('.balloon-amount').value);
    if (!isNaN(monthInput) && monthInput > 0 && !isNaN(amountInput) && amountInput > 0) {
      balloonPayments.push({ month: monthInput, amount: amountInput });
    }
  });

  // 2. PRE-CALCULATE THE TOTAL DEDUCTION FOR EACH ROW
  // Each balloon at month N with amount A deducts (A / N) from rows 1 to N-1 independently.
  const deductionPerRow = {};

  balloonPayments.forEach(({ month, amount }) => {
    const deductionPerInstallment = amount / month;
    for (let i = 1; i < month; i++) {  // i < month excludes row N itself
      deductionPerRow[i] = (deductionPerRow[i] || 0) + deductionPerInstallment;
    }
  });

  // 3. BUILD THE TABLE
  const tableBody = document.getElementById("installment-table-body");
  tableBody.innerHTML = "";

  for (let i = 1; i <= getInstallmentNumber; i++) {
    const deduction = deductionPerRow[i] || 0;
    const adjustedAmount = installmentPerAmount - deduction;

    // --- Standard Installment Row ---
    const row = document.createElement("tr");
    row.classList.add("bg-white", "border-b", "border-gray-200");

    const installmentCell = document.createElement("td");
    installmentCell.classList.add("px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-900", "font-medium");
    installmentCell.textContent = `${i}`;

    const amountCell = document.createElement("td");
    amountCell.classList.add("px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-900");
    amountCell.textContent = `${formatter.format(adjustedAmount)}`;

    row.appendChild(installmentCell);
    row.appendChild(amountCell);
    tableBody.appendChild(row);

    // --- Balloon Payment Row(s) ---
    const balloonsForThisMonth = balloonPayments.filter(bp => bp.month === i);
    balloonsForThisMonth.forEach((balloon) => {
      const balloonRow = document.createElement("tr");
      balloonRow.classList.add("bg-slate-50", "border-b", "border-gray-300");

      const balloonInstallmentCell = document.createElement("td");
      balloonInstallmentCell.classList.add("px-6", "py-4", "whitespace-nowrap", "text-sm", "text-pci-blue", "font-bold", "italic");
      balloonInstallmentCell.textContent = `${i} - Balloon Payment`;

      const balloonAmountCell = document.createElement("td");
      balloonAmountCell.classList.add("px-6", "py-4", "whitespace-nowrap", "text-sm", "text-pci-blue", "font-bold");
      balloonAmountCell.textContent = `${formatter.format(balloon.amount)}`;

      balloonRow.appendChild(balloonInstallmentCell);
      balloonRow.appendChild(balloonAmountCell);
      tableBody.appendChild(balloonRow);
    });
  }
};