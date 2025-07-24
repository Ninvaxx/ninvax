// Global GSAP animations
window.addEventListener('load', () => {
  if (document.querySelector('.hero')) {
    const tl = gsap.timeline();
    tl.from('.hero img', {y: 50, opacity: 0, duration: 1})
      .from('.hero h1', {y: 50, opacity: 0, duration: 1}, '-=0.5')
      .from('.hero .neon-button', {opacity: 0, duration: 0.5}, '-=0.3');
  }

  if (document.getElementById('beta-signup')) {
    gsap.from('#beta-signup', {y: 100, opacity: 0, duration: 1});
    document.querySelectorAll('#beta-signup input').forEach(input => {
      input.addEventListener('focus', () => gsap.to(input, {scale: 1.05, boxShadow: '0 0 15px #ff007a'}));
      input.addEventListener('blur', () => gsap.to(input, {scale: 1, boxShadow: '0 0 0 #000'}));
    });
  }

  if (document.querySelector('.about-text')) {
    gsap.from('.about-text', {
      scrollTrigger: '.about-text',
      y: 50,
      opacity: 0,
      duration: 1
    });
  }
});
