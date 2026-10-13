/* Line: personal / joshdlange */
(function () {
  // Photo slot: renders nothing unless img/josh.jpg loads. Drop the file in site/img/ and it appears (see NOTES.md).
  var probe = new Image();
  var hasSlot = document.querySelector('.about[data-photo]');
  probe.onload = function () {
    Array.prototype.forEach.call(document.querySelectorAll('.about[data-photo]'), function (box) {
      var fig = document.createElement('figure');
      fig.className = 'photo';
      var img = document.createElement('img');
      img.src = 'img/josh.jpg'; img.alt = 'Josh Lange';
      img.width = probe.naturalWidth; img.height = probe.naturalHeight; img.decoding = 'async';
      var cap = document.createElement('figcaption');
      cap.textContent = 'Josh Lange, Austin, TX';
      fig.appendChild(img); fig.appendChild(cap);
      box.appendChild(fig); box.classList.add('has-photo');
    });
  };
  if (hasSlot) probe.src = 'img/josh.jpg';

  var nav = document.querySelector('.nav');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Intake forms: build a mailto (and sms) with the answers. Nothing is sent from the page itself.
  Array.prototype.forEach.call(document.querySelectorAll('form.intake'), function (f) {
    var status = f.querySelector('.status');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var lines = [], filled = 0, seen = {};
      Array.prototype.forEach.call(f.elements, function (el) {
        if (!el.name || seen[el.name + el.type] && el.type !== 'radio') return;
        if (el.type === 'radio' && !el.checked) return;
        var v = (el.value || '').trim(); if (!v) return;
        lines.push((el.getAttribute('data-label') || el.name) + '\n' + v); filled++;
      });
      var contact = (f.elements.contact.value || '').trim();
      if (!contact) {
        status.hidden = false; status.className = 'status err';
        status.textContent = 'Add a phone number or email so Josh can reply.'; f.elements.contact.focus(); return;
      }
      var subject = f.getAttribute('data-subject');
      var body = lines.join('\n\n');
      var mail = 'mailto:josh@joshdlange.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var sms = 'sms:+15123379530?&body=' + encodeURIComponent(subject + '. ' + lines.join(' | ').replace(/\n/g, ': '));
      var sl = f.querySelector('.smslink'); if (sl) sl.setAttribute('href', sms);
      status.hidden = false; status.className = 'status';
      status.innerHTML = 'Your email app should open with your answers ready. Press send there and Josh replies to you directly. Nothing is sent until you do. No email app? <a href="' + sms.replace(/"/g, '&quot;') + '">Text the answers</a> to (512) 337-9530 instead.';
      window.location.href = mail;
    });
  });

  // Without GSAP, or with reduced motion, the page stays in its final, readable state.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var $ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    var struck = $('.item:not(.payoff)');
    var list = document.querySelector('.list');
    var payoff = document.querySelector('.payoff');
    var sky = !!document.querySelector('.list-sky');
    var lime = sky ? '#7CC0FF' : '#C6F24E', dim = '#7A88A3', text = '#F3F6FB';

    // ---- Hero copy: one calm rise ----
    gsap.from('.a-in', { y: 28, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.1 });
    if (document.querySelector('.trust')) gsap.from('.trust li', { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.07, ease: 'power2.out', delay: 0.8 });

    if (list) {
    gsap.from('.list', { y: 40, autoAlpha: 0, duration: 1.1, ease: 'power3.out', delay: 0.25 });

    // ---- Checklist: start un-ticked, then tick (and strike) one line at a time ----
    struck.forEach(function (li) {
      gsap.set(li.querySelector('.box'), { backgroundColor: 'rgba(198,242,78,0)', borderColor: dim });
      gsap.set(li.querySelector('.box path'), { strokeDashoffset: 20 });
      var st = li.querySelector('.strike');
      if (st) gsap.set(st, { backgroundSize: '0% 2.5px', color: text });
    });
    if (payoff) {
      gsap.set(payoff.querySelector('.box path'), { strokeDashoffset: 20 });
      gsap.set(payoff.querySelector('.box'), { boxShadow: '0 0 0 0px rgba(198,242,78,0)' });
      gsap.set(payoff, { autoAlpha: 0.25 });
    }
    if (list.querySelector('figcaption')) gsap.set('.list figcaption', { autoAlpha: 0 });

    var seq = gsap.timeline({ paused: true, delay: 0.2 });
    struck.forEach(function (li, i) {
      var at = i * 0.62;
      var strike = li.querySelector('.strike');
      seq.to(li.querySelector('.box'), { backgroundColor: lime, borderColor: lime, duration: 0.22, ease: 'power2.out' }, at)
         .to(li.querySelector('.box path'), { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' }, at + 0.06);
      if (strike) {
        // longer lines take a little longer to strike, so speed feels constant
        var d = gsap.utils.clamp(0.45, 0.8, strike.textContent.length / 70);
        seq.to(strike, { backgroundSize: window.innerWidth < 700 ? '100% 2px' : '100% 2.5px', duration: d, ease: 'power2.inOut' }, at + 0.14)
           .to(strike, { color: dim, duration: d, ease: 'power1.out' }, at + 0.2);
      }
    });
    var end = struck.length * 0.62 + 0.25;
    if (payoff) {
      seq.to(payoff, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, end)
         .to(payoff.querySelector('.box path'), { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, end + 0.15)
         .to(payoff.querySelector('.box'), { boxShadow: '0 0 0 6px rgba(198,242,78,.1)', duration: 0.6, ease: 'power2.out' }, end + 0.15);
    }
    if (list.querySelector('figcaption')) seq.to('.list figcaption', { autoAlpha: 1, duration: 0.6 }, end + 0.45);

    ScrollTrigger.create({ trigger: '.list ol', start: 'top 85%', once: true, onEnter: function () { seq.play(); } });
    }

    // ---- Section reveals ----
    $('.sec-head, .about > div:first-child, .cta h2').forEach(function (el) {
      gsap.from(el.children.length && !el.matches('h2') ? el.children : el, {
        y: 28, autoAlpha: 0, duration: 0.85, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
    ScrollTrigger.batch('.rv', {
      start: 'top 88%', once: true,
      onEnter: function (els) { gsap.from(els, { y: 36, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' }); }
    });
    if (document.querySelector('.cta-side')) gsap.from('.cta-side', { y: 28, autoAlpha: 0, duration: 0.85, delay: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.cta', start: 'top 75%', once: true } });

    // ---- How it works: the line between steps draws with scroll (desktop only, hidden on smaller screens) ----
    var steps = document.querySelector('.steps:not(.steps-3)');
    if (steps) gsap.fromTo(steps, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: steps, start: 'top 80%', end: 'bottom 60%', scrub: 0.6 } });

  });
})();
