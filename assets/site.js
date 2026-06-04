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
    var setH = function(){ if(ans) ans.style.maxHeight = d.open ? ans.scrollHeight + 'px' : '0px'; };
    if(b){
      b.addEventListener('click', function(ev){
        ev.preventDefault();
        document.querySelectorAll('.faq').forEach(function(o){ if(o!==d && o.open){ o.open=false; var oa=o.querySelector('.ans'); if(oa) oa.style.maxHeight='0px'; } });
        d.open = !d.open;
        requestAnimationFrame(setH);
      });
    }
  });

  // Open an FAQ when navigated to via hash (e.g. compliance.html#privacy)
  function openFaqFromHash(){
    var hash = (window.location.hash || '').replace('#','');
    if(!hash) return;
    var target = document.getElementById(hash);
    if(!target || !target.classList || !target.classList.contains('faq')) return;
    // Close other FAQs in the same group
    document.querySelectorAll('.faq').forEach(function(o){
      if(o!==target && o.open){ o.open=false; var oa=o.querySelector('.ans'); if(oa) oa.style.maxHeight='0px'; }
    });
    target.open = true;
    var ans = target.querySelector('.ans');
    if(ans){ requestAnimationFrame(function(){ ans.style.maxHeight = ans.scrollHeight + 'px'; }); }
    // Scroll into view with offset for sticky header
    setTimeout(function(){
      var y = target.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({top:y, behavior: reduce ? 'auto' : 'smooth'});
    }, 60);
  }
  openFaqFromHash();
  window.addEventListener('hashchange', openFaqFromHash);

  // consultation form — POST to /api/inquiry, handle states
  var form = document.getElementById('ob-form');
  if(form){
    var errBox = form.querySelector('.form-err');
    function showError(msg){
      if(errBox){ errBox.textContent = msg; }
      form.classList.add('errored');
      form.classList.remove('sending');
    }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('f-name');
      var email = document.getElementById('f-email');
      if(!name.value.trim() || !email.value.trim()){
        form.classList.remove('errored');
        (!name.value.trim() ? name : email).focus();
        return;
      }
      form.classList.remove('errored');
      form.classList.add('sending');
      var data = {
        name: name.value,
        company: (document.getElementById('f-company')||{}).value || '',
        email: email.value,
        service: (document.getElementById('f-service')||{}).value || '',
        message: (document.getElementById('f-msg')||{}).value || '',
        hp: (document.getElementById('f-website')||{}).value || ''
      };
      fetch(form.getAttribute('action') || '/api/inquiry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(data)
      }).then(function(r){
        return r.json().then(function(j){ return {status:r.status, body:j}; }).catch(function(){ return {status:r.status, body:{}}; });
      }).then(function(out){
        if(out.status >= 200 && out.status < 300 && out.body && out.body.ok){
          form.classList.remove('sending');
          form.classList.add('sent');
          return;
        }
        var msg = (out.body && out.body.error) || 'Something went wrong sending your inquiry. Please email hello@outbridgeinc.com directly.';
        showError(msg);
      }).catch(function(){
        showError('Could not reach the server. Please email hello@outbridgeinc.com directly.');
      });
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

  // ---------- lead popup ----------
  (function leadPopup(){
    var KEY = 'ob_lead_pop_v1';
    var DISMISS_DAYS = 30;
    var path = (window.location.pathname || '').toLowerCase();
    // Don't show on the contact page — they're already there to convert
    if(path.indexOf('/contact') !== -1 || path.indexOf('contact.html') !== -1) return;
    // Honor previous dismiss / submit
    try{
      var stored = localStorage.getItem(KEY);
      if(stored){
        var s = JSON.parse(stored);
        if(s && s.expiresAt && s.expiresAt > Date.now()) return;
      }
    }catch(e){}

    // Build the popup DOM
    var pop = document.createElement('div');
    pop.className = 'lead-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');
    pop.setAttribute('aria-labelledby', 'lp-heading');
    pop.innerHTML =
      '<div class="lead-pop-card" role="document">'+
        '<button class="lead-pop-close" type="button" aria-label="Close">&times;</button>'+
        '<span class="lead-pop-eyebrow">Free consultation</span>'+
        '<h3 id="lp-heading">Let’s build the team your business <em>needs</em>.</h3>'+
        '<p>A 30-minute discovery call — no obligation, fully confidential. We’ll come back within one business day.</p>'+
        '<form class="lead-pop-form" novalidate>'+
          '<input name="name" type="text" placeholder="Full name" autocomplete="name" required />'+
          '<input name="email" type="email" placeholder="Work email" autocomplete="email" required />'+
          '<select name="service">'+
            '<option value="" disabled selected>What do you need help with?</option>'+
            '<option>Virtual Assistant</option>'+
            '<option>Customer Support</option>'+
            '<option>Sales Agents</option>'+
            '<option>BPO / managed team</option>'+
            '<option>Not sure yet — advise me</option>'+
          '</select>'+
          '<input class="hp-field" name="hp" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-10000px;width:1px;height:1px;" />'+
          '<button class="btn btn-zest" type="submit">Book my consultation '+
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'+
          '</button>'+
          '<div class="lead-pop-err" role="alert"></div>'+
        '</form>'+
        '<p class="lead-pop-note">We never share your details. NDAs as standard on every engagement.</p>'+
        '<div class="lead-pop-ok">'+
          '<div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>'+
          '<h4>Thank you — request received.</h4>'+
          '<p>A member of the Outbridge team will reach out within one business day.</p>'+
        '</div>'+
      '</div>';
    document.body.appendChild(pop);

    var card = pop.querySelector('.lead-pop-card');
    var form = pop.querySelector('.lead-pop-form');
    var errBox = pop.querySelector('.lead-pop-err');
    var nameInp = form.querySelector('input[name="name"]');
    var emailInp = form.querySelector('input[name="email"]');
    var shown = false;

    function remember(submitted){
      try{
        localStorage.setItem(KEY, JSON.stringify({
          expiresAt: Date.now() + DISMISS_DAYS*24*3600*1000,
          submitted: !!submitted
        }));
      }catch(e){}
    }
    function open(){
      if(shown) return;
      shown = true;
      pop.classList.add('open');
      setTimeout(function(){ if(nameInp) try{ nameInp.focus(); }catch(e){} }, 160);
    }
    function close(persist){
      pop.classList.remove('open');
      if(persist) remember(false);
    }

    // Triggers
    var idleTimer = setTimeout(open, 25000); // 25s of dwell
    var onScroll = function(){
      var h = document.documentElement;
      var pct = (window.scrollY + window.innerHeight) / Math.max(h.scrollHeight, 1);
      if(pct > 0.55){ window.removeEventListener('scroll', onScroll); open(); }
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    if(window.matchMedia && window.matchMedia('(pointer:fine)').matches){
      document.addEventListener('mouseleave', function(e){
        if(e.clientY <= 0) open();
      });
    }

    // Close handlers
    pop.querySelector('.lead-pop-close').addEventListener('click', function(){ close(true); });
    pop.addEventListener('click', function(e){ if(e.target === pop) close(true); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && pop.classList.contains('open')) close(true);
    });

    // Submit handler
    form.addEventListener('submit', function(e){
      e.preventDefault();
      errBox.classList.remove('show');
      errBox.textContent = '';
      if(!nameInp.value.trim() || !emailInp.value.trim()){
        (!nameInp.value.trim() ? nameInp : emailInp).focus();
        return;
      }
      form.classList.add('sending');
      var data = {
        name: nameInp.value,
        email: emailInp.value,
        service: form.querySelector('select[name="service"]').value || '',
        message: '(Submitted via on-site popup on ' + path + ')',
        source: 'popup',
        hp: form.querySelector('input[name="hp"]').value || ''
      };
      fetch('/api/inquiry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(data)
      }).then(function(r){
        return r.json().then(function(j){ return {status:r.status, body:j}; }).catch(function(){ return {status:r.status, body:{}}; });
      }).then(function(out){
        form.classList.remove('sending');
        if(out.status >= 200 && out.status < 300 && out.body && out.body.ok){
          card.classList.add('sent');
          remember(true);
          setTimeout(function(){ pop.classList.remove('open'); }, 4500);
          return;
        }
        var msg = (out.body && out.body.error) || 'Could not send. Please email hello@outbridgeinc.com directly.';
        errBox.textContent = msg;
        errBox.classList.add('show');
      }).catch(function(){
        form.classList.remove('sending');
        errBox.textContent = 'Network error. Please email hello@outbridgeinc.com directly.';
        errBox.classList.add('show');
      });
    });
  })();
})();
