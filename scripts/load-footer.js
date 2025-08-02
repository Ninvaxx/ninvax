fetch('/components/footer.html')
  .then(res => res.text())
  .then(html => {
    const el = document.getElementById('footer');
    if (el) el.innerHTML = html;
  });
