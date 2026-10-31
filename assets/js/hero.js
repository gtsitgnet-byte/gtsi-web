(function(){
  var r=document.querySelector('.hero-slider'); if(!r) return;
  var tr=r.querySelector('.hs-track'), s=[].slice.call(r.querySelectorAll('.hs-slide')), d=r.querySelector('.hs-dots'), i=0, t=null, x0=null;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dots=s.map(function(_,k){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Diapositive '+(k+1));b.onclick=function(){go(k);start();};d.appendChild(b);return b;});
  function go(n){i=(n+s.length)%s.length;tr.style.transform='translateX(-'+(i*100)+'%)';s.forEach(function(e,k){e.setAttribute('aria-hidden',k===i?'false':'true');});dots.forEach(function(b,k){b.classList.toggle('on',k===i);});}
  function stop(){if(t){clearInterval(t);t=null;}}
  function start(){stop();if(!reduce)t=setInterval(function(){go(i+1);},5000);}
  r.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;stop();},{passive:true});
  r.addEventListener('touchend',function(e){if(x0!==null){var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(i+(dx<0?1:-1));}x0=null;start();});
  r.addEventListener('mouseenter',stop);r.addEventListener('mouseleave',start);
  go(0);start();
})();
