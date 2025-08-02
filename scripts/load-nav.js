fetch('/components/nav.html')
  .then(res => res.text())
  .then(html => {
    const el = document.getElementById('nav');
    if (el) el.innerHTML = html;
  });
