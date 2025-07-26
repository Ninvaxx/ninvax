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
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form).entries());
  fetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.ok ? res.text() : Promise.reject('Error'))
  .then(() => {
    form.reset();
    const confirm = document.getElementById('confirmation');
    if (confirm) {
      confirm.style.display = 'block';
      gsap.fromTo('#confirmation', {opacity:0}, {opacity:1,duration:0.6});
      const ring = confirm.querySelector('.saturn-ring-animation');
      if (ring) ring.style.display = 'block';
    }
  })
  .catch(err => console.error(err));
}
