function handleContact(event, endpoint) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form).entries());
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.ok ? res.json() : Promise.reject('Error'))
  .then(() => {
    form.reset();
    const confirm = document.getElementById('confirmation');
    if (confirm) confirm.style.display = 'block';
  })
  .catch(err => console.error(err));
}

function handleSignup(event) {
  handleContact(event, '/signup');
  const ring = document.querySelector('.saturn-ring-animation');
  if (ring) ring.style.display = 'block';
}
