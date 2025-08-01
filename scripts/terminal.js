// optional enhancement for more control
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const boot = document.getElementById("boot-screen");
    if (boot) boot.style.display = 'none';
  }, 5000);
});