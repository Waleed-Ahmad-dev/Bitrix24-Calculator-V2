const getBalloonPayments = () => {
  const balloonPayments = [];
  document.querySelectorAll(".balloon-row").forEach((row) => {
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
  return balloonPayments;
};

export const changeTheFinanceFields = () => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",

    currency: "USD",
  });

  const ballonPayments = getBalloonPayments();
  const totalBalloonAmount = ballonPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const balloonTotalField = document.getElementById("summary-balloon-total");
  balloonTotalField.textContent = formatter.format(totalBalloonAmount);

  const downPaymentAmountField = document.getElementById("summary-downpayment");

  const onPossessionAmountField = document.getElementById(
    "summary-possession-amount",
  );

  const installmentAmountField = document.getElementById("summary-remaining");

  const installmentAmountPerInstallmentField = document.getElementById(
    "summary-installment",
  );

  const installmentUnitsField = document.getElementById(
    "summary-installments-no",
  );

  const totalPriceField = document.getElementById("summary-total-price");

  const productPrice =
    parseFloat(
      document.getElementById("total-price").value.replace(/[^0-9.-]+/g, ""),
    ) || 0;

  const plan = document.getElementById("payment-condition").value;

  if (plan == "full") {
    totalPriceField.textContent = formatter.format(productPrice);
    downPaymentAmountField.textContent = "";
    onPossessionAmountField.textContent = "";
    installmentAmountField.textContent = "";
    installmentAmountPerInstallmentField.textContent = "";
    installmentUnitsField.textContent = "";
    return;
  }

  const downPaymentPercentage = document.getElementById(
    "downpayment-percentage",
  ).value;
  const onPossessionPercentage = document.getElementById(
    "possession-percentage",
  ).value;
  const installmentPlan = document.getElementById("installment-duration").value;

  console.log("Down Payment Percentage:", downPaymentPercentage);
  console.log("On Possession Percentage:", onPossessionPercentage);
  console.log("Installment Plan:", installmentPlan);

  const downPaymentAmount = parseFloat(
    (productPrice * downPaymentPercentage) / 100,
  ).toFixed(2);

  const onPossessionAmount = parseFloat(
    (productPrice * onPossessionPercentage) / 100,
  ).toFixed(2);

  const remainingAmountForInstallment = parseFloat(
    productPrice - downPaymentAmount - onPossessionAmount - totalBalloonAmount,
  ).toFixed(2);

  const installmentAmount = parseFloat(
    remainingAmountForInstallment / installmentPlan,
  ).toFixed(2);

  totalPriceField.textContent = formatter.format(productPrice);
  downPaymentAmountField.textContent = formatter.format(downPaymentAmount);
  onPossessionAmountField.textContent = formatter.format(onPossessionAmount);
  installmentAmountField.textContent = formatter.format(
    remainingAmountForInstallment,
  );
  installmentAmountPerInstallmentField.textContent =
    formatter.format(installmentAmount);
  installmentUnitsField.textContent = installmentPlan;
};
