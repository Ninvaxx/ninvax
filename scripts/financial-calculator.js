// Simple financial projection calculator

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  if (!form) return;
  const units = form.querySelector('#units');
  const price = form.querySelector('#price');
  const cost = form.querySelector('#cost');
  const revenueEl = document.getElementById('revenue');
  const profitEl = document.getElementById('profit');

  function update() {
    const u = parseFloat(units.value) || 0;
    const p = parseFloat(price.value) || 0;
    const c = parseFloat(cost.value) || 0;
    const revenue = u * p;
    const profit = revenue - u * c;
    revenueEl.textContent = revenue.toFixed(2);
    profitEl.textContent = profit.toFixed(2);
  }

  [units, price, cost].forEach(el => el.addEventListener('input', update));
  form.addEventListener('submit', e => {
    e.preventDefault();
    update();
  });
});
