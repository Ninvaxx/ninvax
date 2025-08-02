fetch('/data/members.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('team-members');
    if (!container) return;
    const categories = ['Key Members', 'Advisors', 'Strategic Partners'];
    categories.forEach(cat => {
      const group = data.filter(m => m.category === cat);
      if (group.length === 0) return;
      const section = document.createElement('section');
      const heading = document.createElement('h3');
      heading.textContent = cat;
      section.appendChild(heading);
      const list = document.createElement('ul');
      group.forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${m.name}</strong> – ${m.role}<br><span>${m.bio}</span>`;
        list.appendChild(li);
      });
      section.appendChild(list);
      container.appendChild(section);
    });
  })
  .catch(err => console.error('Error loading team members', err));
