async function loadConstructionStatus(elId = 'constructionStatus') {
  try {
    const res = await fetch('/data/construction-status.json?_=' + Date.now());
    if (!res.ok) throw new Error('Failed to load status');
    const data = await res.json();
    const el = document.getElementById(elId);
    if (el) {
      el.innerHTML = `<strong>Phase:</strong> ${data.phase} – <strong>Progress:</strong> ${data.progress}% – <strong>Launch:</strong> ${data.expectedLaunch}`;
    }
  } catch (err) {
    console.error('Error loading construction status', err);
  }
}

function startConstructionStatusUpdates(interval = 60000) {
  loadConstructionStatus();
  setInterval(loadConstructionStatus, interval);
}

startConstructionStatusUpdates();
