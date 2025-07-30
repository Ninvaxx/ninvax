export function enableGrayscaleHover(selector = 'img') {
  document.querySelectorAll(selector).forEach(el => {
    el.style.filter = 'grayscale(100%)';
    el.addEventListener('mouseover', () => {
      el.style.filter = 'grayscale(0%)';
    });
    el.addEventListener('mouseout', () => {
      el.style.filter = 'grayscale(100%)';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => enableGrayscaleHover());
