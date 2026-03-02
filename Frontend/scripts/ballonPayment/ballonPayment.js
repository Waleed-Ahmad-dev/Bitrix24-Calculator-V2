export const addBalloonPaymentRow = () => {
  const balloonRowsContainer = document.getElementById('balloon-rows-container');
  
  // Safety check to ensure the container exists
  if (!balloonRowsContainer) return;

  // Create a new row container
  const row = document.createElement('div');
  row.className = 'flex gap-3 items-center balloon-row fade-in';

  // HTML template for the two columns (1/3 width and 2/3 width) + a remove button
  row.innerHTML = `
    <div class="w-1/3">
      <input 
        type="number" 
        placeholder="Month" 
        class="balloon-month w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg text-white focus:ring-pci-gold focus:border-pci-gold transition"
      />
    </div>
    <div class="w-2/3">
      <input 
        type="number" 
        placeholder="Amount (PKR)" 
        class="balloon-amount w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg text-white focus:ring-pci-gold focus:border-pci-gold transition"
      />
    </div>
    <button type="button" class="remove-balloon-btn text-red-400 hover:text-red-300 transition p-2 focus:outline-none" title="Remove row">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;

  // Append the new row to the container
  balloonRowsContainer.appendChild(row);

  // Add event listener to the specific remove button we just created
  const removeBtn = row.querySelector('.remove-balloon-btn');
  removeBtn.addEventListener('click', () => {
    row.remove();
    // TODO: Call your calculation update function here later
  });
  
  // Note: You can also attach 'input' event listeners to .balloon-month and .balloon-amount here later
}