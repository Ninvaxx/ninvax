async function renderProducts() {
  const list = document.getElementById('productList');
  if (!list) return;
  try {
    const [dataRes, templateRes] = await Promise.all([
      fetch('data/products.json'),
      fetch('components/product-card.html')
    ]);
    const products = await dataRes.json();
    const template = await templateRes.text();

    products.forEach(product => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = template.trim();
      const card = wrapper.firstElementChild;
      const title = card.querySelector('h3');
      if (title) title.textContent = product.name;
      const typeEl = card.querySelector('p');
      if (typeEl) typeEl.textContent = product.type;

      if (product.image) {
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        card.insertBefore(img, card.firstChild);
      }

      if (product.description) {
        const desc = document.createElement('p');
        desc.textContent = product.description;
        card.appendChild(desc);
      }

      list.appendChild(card);
    });
  } catch (e) {
    console.error('Failed to render products', e);
  }
}

document.addEventListener('DOMContentLoaded', renderProducts);
