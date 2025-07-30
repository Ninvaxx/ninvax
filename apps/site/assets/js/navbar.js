function initNavbar(){
  const toggle=document.querySelector('.nav-toggle');
  const nav=document.querySelector('.site-nav');
  if(!toggle||!nav)return;
  toggle.addEventListener('click',()=>{
    nav.classList.toggle('open');
  });
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initNavbar);
}else{initNavbar();}
