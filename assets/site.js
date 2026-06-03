// Outbridge Inc — restrained site behaviour
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // header hairline on scroll
  var header = document.querySelector('header');
  if(header){
    var onScroll = function(){ header.classList.toggle('scrolled', window.scrollY > 6); };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  // stagger index
  document.querySelectorAll('.stagger').forEach(function(g){
    Array.prototype.forEach.call(g.children, function(el, i){ el.style.setProperty('--i', i); });
  });

  // reveal on scroll (with immediate pass for in-view + safety net)
  var revealEls = [].slice.call(document.querySelectorAll('.reveal'));
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
  function showInView(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach(function(el){
      if(el.classList.contains('in')) return;
      if(el.getBoundingClientRect().top < vh * 0.92){ el.classList.add('in'); }
    });
  }
  if('IntersectionObserver' in window){
    revealEls.forEach(function(el){ io.observe(el); });
    showInView(); // reveal anything already in view immediately
    // safety net: if anything above-fold is still hidden shortly after load, show it
    setTimeout(showInView, 700);
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  // count-up stats
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    if(reduce){ el.textContent = prefix + target + suffix; return; }
    var dur = 1400, start = null;
    function tick(now){
      if(start === null) start = now;
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if(p < 1) requestAnimationFrame(tick); else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(tick);
  }
  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); } });
  }, {threshold:0.5});
  document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });

  // mobile menu
  var nav = document.querySelector('.nav');
  var links = document.querySelector('.nav-links');
  if(nav && links){
    var btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.setAttribute('aria-label', 'Menu');
    btn.innerHTML = '<i></i><i></i><i></i>';
    nav.appendChild(btn);
    var panel = document.createElement('div');
    panel.className = 'mobile-menu';
    panel.innerHTML = links.innerHTML + '<a class="btn btn-accent" href="contact.html">Book a consultation</a>';
    document.body.appendChild(panel);
    btn.addEventListener('click', function(){
      var open = btn.classList.toggle('open');
      panel.classList.toggle('open', open);
    });
    panel.addEventListener('click', function(e){
      if(e.target.tagName === 'A'){ btn.classList.remove('open'); panel.classList.remove('open'); }
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq').forEach(function(d){
    var ans = d.querySelector('.ans');
    var b = d.querySelector('button');
    var setH = function(){ ans.style.maxHeight = d.open ? ans.scrollHeight + 'px' : '0px'; };
    if(b){
      b.addEventListener('click', function(ev){
        ev.preventDefault();
        document.querySelectorAll('.faq').forEach(function(o){ if(o!==d && o.open){ o.open=false; o.querySelector('.ans').style.maxHeight='0px'; } });
        d.open = !d.open;
        requestAnimationFrame(setH);
      });
    }
  });

  // consultation form
  var form = document.getElementById('ob-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('f-name');
      var email = document.getElementById('f-email');
      if(!name.value.trim() || !email.value.trim()){
        (!name.value.trim() ? name : email).focus();
        return;
      }
      form.classList.add('sent');
    });
  }

  // newsletter subscribe
  document.querySelectorAll('.subscribe form').forEach(function(sf){
    sf.addEventListener('submit', function(e){
      e.preventDefault();
      var inp = sf.querySelector('input');
      if(inp && !inp.value.trim()){ inp.focus(); return; }
      sf.closest('.subscribe').classList.add('done');
    });
  });
})();
