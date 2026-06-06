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

  // generic API form handler — works on any <form data-api-form action="/api/inquiry">
  // Reads every named input/select/textarea, POSTs as JSON, toggles
  // .sending / .errored / .sent class states. Same .form-err for inline errors.
  document.querySelectorAll('form[data-api-form]').forEach(function(form){
    var errBox = form.querySelector('.form-err');
    function showError(msg){
      if(errBox){ errBox.textContent = msg; }
      form.classList.add('errored');
      form.classList.remove('sending');
    }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      form.classList.remove('errored');
      if(errBox) errBox.textContent = '';
      var fields = form.querySelectorAll('input[name], textarea[name], select[name]');
      // first required-empty wins focus
      var missing = null;
      for(var i=0; i<fields.length; i++){
        if(fields[i].required && !String(fields[i].value || '').trim()){ missing = fields[i]; break; }
      }
      if(missing){ missing.focus(); return; }
      var data = {};
      for(var j=0; j<fields.length; j++){
        if(fields[j].name) data[fields[j].name] = fields[j].value;
      }
      form.classList.add('sending');
      fetch(form.getAttribute('action') || '/api/inquiry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(data)
      }).then(function(r){
        return r.json().then(function(j){ return {status:r.status, body:j}; }).catch(function(){ return {status:r.status, body:{}}; });
      }).then(function(out){
        form.classList.remove('sending');
        if(out.status >= 200 && out.status < 300 && out.body && out.body.ok){
          form.classList.add('sent');
          return;
        }
        showError((out.body && out.body.error) || 'Something went wrong sending your form. Please email hello@outbridgeinc.com directly.');
      }).catch(function(){
        showError('Could not reach the server. Please email hello@outbridgeinc.com directly.');
      });
    });
  });

  // newsletter subscribe
  document.querySelectorAll('.subscribe form').forEach(function(sf){
    sf.addEventListener('submit', function(e){
      e.preventDefault();
      var inp = sf.querySelector('input');
      if(inp && !inp.value.trim()){ inp.focus(); return; }
      sf.closest('.subscribe').classList.add('done');
    });
  });

  // ---------- seasonal promo popup ----------
  (function seasonalPopup(){
    var KEY = 'ob_seasonal_v1';
    var DISMISS_DAYS = 14;
    var path = (window.location.pathname || '').toLowerCase();
    var qs = (window.location.search || '').toLowerCase();
    var force = qs.indexOf('seasonal=force') !== -1 || qs.indexOf('promo=preview') !== -1;
    if(!force && (path.indexOf('/contact') !== -1 || path.indexOf('contact.html') !== -1)) return;

    // Respect dismiss / submit unless theme key changed (new month = new popup)
    // — unless ?seasonal=force or ?promo=preview is on the URL (preview mode)
    var prevKey;
    if(!force){
      try{
        var stored = JSON.parse(localStorage.getItem(KEY) || 'null');
        if(stored && stored.expiresAt && stored.expiresAt > Date.now() && stored.themeKey){
          prevKey = stored.themeKey;
        }
      }catch(e){}
    }

    // Determine current month using US Eastern Time
    function currentUsMonth(){
      try{
        var fmt = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York', month:'numeric', day:'numeric'});
        var parts = fmt.formatToParts(new Date());
        var m = 1, d = 1;
        for(var i=0;i<parts.length;i++){
          if(parts[i].type==='month') m = parseInt(parts[i].value,10);
          if(parts[i].type==='day') d = parseInt(parts[i].value,10);
        }
        return {month:m, day:d};
      }catch(e){
        var now = new Date();
        return {month: now.getMonth()+1, day: now.getDate()};
      }
    }

    // Theme map keyed by month (1-12). November flips to Black-Friday from the 20th.
    var THEMES = {
      1:  {key:'new-year',     eyebrow:'New Year Offer',         emoji:'🎉', tagline:'New year, fresh team — start 2026 strong.',                particle:'❄️', count:18, motion:'fall',    anim:'wiggle',  accent:'cool'},
      2:  {key:'valentines',   eyebrow:'February Special',       emoji:'💕', tagline:'Show your customers the love — and the response times.',  particle:'❤️', count:14, motion:'rise',    anim:'bounce',  accent:'rose'},
      3:  {key:'st-patricks',  eyebrow:'St. Patrick’s Offer',    emoji:'🍀', tagline:'A little luck on your operations.',                       particle:'🍀', count:14, motion:'fall',    anim:'sway',    accent:'green'},
      4:  {key:'spring',       eyebrow:'Spring Offer',           emoji:'🌷', tagline:'Spring into action with a vetted team in place.',         particle:'🌸', count:14, motion:'fall',    anim:'sway',    accent:'pastel'},
      5:  {key:'may',          eyebrow:'May Special',            emoji:'🌸', tagline:'Bloom your operations with Outbridge.',                   particle:'🌼', count:14, motion:'fall',    anim:'sway',    accent:'pastel'},
      6:  {key:'summer-start', eyebrow:'Summer Offer',           emoji:'☀️',  tagline:'Soak up the summer — we’ll handle the work.',             particle:'☀️',  count:10, motion:'sway',    anim:'wiggle',  accent:'warm'},
      7:  {key:'july-4th',     eyebrow:'4th of July Special',    emoji:'🎆', tagline:'Independence Day savings on every engagement.',           particle:'🎆', count:12, motion:'sway',    anim:'bounce',  accent:'patriot'},
      8:  {key:'late-summer',  eyebrow:'Late Summer Special',    emoji:'🌻', tagline:'Back to business with a sharper team.',                   particle:'🌻', count:12, motion:'fall',    anim:'sway',    accent:'warm'},
      9:  {key:'fall',         eyebrow:'Fall Offer',             emoji:'🍁', tagline:'Fall into focus — outsource the busywork.',               particle:'🍂', count:18, motion:'fall',    anim:'sway',    accent:'autumn'},
      10: {key:'halloween',    eyebrow:'Halloween Special',      emoji:'🎃', tagline:'Spooky savings — treat your back office this month.',     particle:'🎃', count:16, motion:'fall',    anim:'wiggle',  accent:'halloween'},
      11: {key:'thanksgiving', eyebrow:'Thanksgiving Special',   emoji:'🦃', tagline:'Plenty to be thankful for — and plenty to save.',         particle:'🍂', count:18, motion:'fall',    anim:'wiggle',  accent:'autumn'},
      12: {key:'christmas',    eyebrow:'Christmas Special',      emoji:'☃️',  tagline:'Merry Christmas — wrap up the year with a vetted team in place.', particle:'❄️', count:26, motion:'fall',    anim:'sway',    accent:'cool'}
    };
    // Black Friday + Cyber Week overrides — Nov 20 through Dec 2
    // (catches BF Week + Black Friday itself + Cyber Monday + spillover)
    var nowUs = currentUsMonth();
    var theme = THEMES[nowUs.month] || THEMES[1];
    if((nowUs.month === 11 && nowUs.day >= 20) || (nowUs.month === 12 && nowUs.day <= 2)){
      theme = {key:'black-friday', eyebrow:'Black Friday — Cyber Week', emoji:'🛍️', tagline:'Our biggest savings of the year — limited window.', particle:'✨', count:22, motion:'fall', anim:'bounce', accent:'dark'};
    }
    // If we previously stored a dismiss for the SAME theme key, skip
    if(typeof prevKey !== 'undefined' && prevKey === theme.key) return;

    // Build the popup DOM (reuses .lead-pop shell + theme- modifiers)
    var pop = document.createElement('div');
    pop.className = 'lead-pop seasonal-pop theme-' + theme.accent;
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');
    pop.setAttribute('aria-labelledby', 'sp-heading');
    pop.innerHTML =
      '<div class="lead-pop-card seasonal-card" role="document">'+
        '<div class="seasonal-particles motion-' + theme.motion + '" aria-hidden="true"></div>'+
        '<button class="lead-pop-close" type="button" aria-label="Close">&times;</button>'+
        '<div class="seasonal-emoji anim-' + theme.anim + '" aria-hidden="true">' + theme.emoji + '</div>'+
        '<span class="lead-pop-eyebrow seasonal-eyebrow">' + theme.eyebrow + '</span>'+
        '<h3 id="sp-heading" class="seasonal-headline">Up to <em>75% OFF</em></h3>'+
        '<p>' + theme.tagline + ' Claim your discount on a new Outbridge engagement.</p>'+
        '<form class="lead-pop-form" novalidate>'+
          '<input name="name" type="text" placeholder="Full name" autocomplete="name" required />'+
          '<input name="email" type="email" placeholder="Work email" autocomplete="email" required />'+
          '<input name="phone" type="tel" placeholder="Phone number" autocomplete="tel" inputmode="tel" required />'+
          '<select name="service">'+
            '<option value="" disabled selected>What do you need help with?</option>'+
            '<option>Virtual Assistant</option>'+
            '<option>Customer Support</option>'+
            '<option>Sales Agents</option>'+
            '<option>BPO / managed team</option>'+
            '<option>Not sure yet — advise me</option>'+
          '</select>'+
          '<input class="hp-field" name="hp" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-10000px;width:1px;height:1px;" />'+
          '<button class="btn btn-zest" type="submit">Claim my discount '+
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'+
          '</button>'+
          '<div class="lead-pop-err" role="alert"></div>'+
        '</form>'+
        '<p class="lead-pop-note">First-time clients only · NDAs as standard · Up to 75% off your first month, scaled by service tier.</p>'+
        '<div class="lead-pop-ok">'+
          '<div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>'+
          '<h4>Discount locked in.</h4>'+
          '<p>A member of the Outbridge team will follow up within one business day with your custom quote.</p>'+
        '</div>'+
      '</div>';
    document.body.appendChild(pop);

    // Spawn the floating emoji particles
    var particles = pop.querySelector('.seasonal-particles');
    if(particles){
      for(var i=0; i<theme.count; i++){
        var p = document.createElement('span');
        p.className = 'seasonal-particle';
        p.textContent = theme.particle;
        p.style.left = (Math.random() * 100) + '%';
        p.style.animationDelay = (-Math.random() * 8) + 's';
        p.style.animationDuration = (5 + Math.random() * 5) + 's';
        p.style.fontSize = (12 + Math.random() * 16) + 'px';
        p.style.opacity = (0.45 + Math.random() * 0.4).toFixed(2);
        particles.appendChild(p);
      }
    }

    var card = pop.querySelector('.lead-pop-card');
    var form = pop.querySelector('.lead-pop-form');
    var errBox = pop.querySelector('.lead-pop-err');
    var nameInp = form.querySelector('input[name="name"]');
    var emailInp = form.querySelector('input[name="email"]');
    var phoneInp = form.querySelector('input[name="phone"]');
    var shown = false;

    function remember(submitted){
      try{
        localStorage.setItem(KEY, JSON.stringify({
          themeKey: theme.key,
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

    // Triggers — faster than the generic lead popup since this is a promo.
    // In force/preview mode, open immediately.
    if(force){
      setTimeout(open, 80);
    } else {
      setTimeout(open, 15000);
      var onScroll = function(){
        var h = document.documentElement;
        var pct = (window.scrollY + window.innerHeight) / Math.max(h.scrollHeight, 1);
        if(pct > 0.40){ window.removeEventListener('scroll', onScroll); open(); }
      };
      window.addEventListener('scroll', onScroll, {passive:true});
      if(window.matchMedia && window.matchMedia('(pointer:fine)').matches){
        document.addEventListener('mouseleave', function(e){
          if(e.clientY <= 0) open();
        });
      }
    }

    // Close handlers
    pop.querySelector('.lead-pop-close').addEventListener('click', function(){ close(true); });
    pop.addEventListener('click', function(e){ if(e.target === pop) close(true); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && pop.classList.contains('open')) close(true);
    });

    // Submit handler — same /api/inquiry pipe, source tagged with the theme
    form.addEventListener('submit', function(e){
      e.preventDefault();
      errBox.classList.remove('show');
      errBox.textContent = '';
      var missing = null;
      if(!nameInp.value.trim()) missing = nameInp;
      else if(!emailInp.value.trim()) missing = emailInp;
      else if(!phoneInp.value.trim()) missing = phoneInp;
      if(missing){ missing.focus(); return; }
      form.classList.add('sending');
      var data = {
        name: nameInp.value,
        email: emailInp.value,
        phone: phoneInp.value,
        service: form.querySelector('select[name="service"]').value || '',
        message: '(Claimed seasonal promo: ' + theme.eyebrow + ' — up to 75% off — from ' + path + ')',
        source: 'promo-' + theme.key,
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
