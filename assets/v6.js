/* Line: personal / joshdlange (v6) */
(function () {
  var $ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var nav = document.querySelector('.nav');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Product strip arrows
  $('.strip-wrap').forEach(function (w) {
    var s = w.querySelector('.strip');
    $('.arrows button', w).forEach(function (b) {
      b.addEventListener('click', function () {
        var step = (s.querySelector('.pcard').offsetWidth + 28) * (b.getAttribute('data-dir') === 'next' ? 1 : -1);
        s.scrollBy({ left: step, behavior: 'smooth' });
      });
    });
  });

  // Intake forms: build a mailto with the answers. Nothing is sent from the page itself.
  $('form.intake').forEach(function (f) {
    var status = f.querySelector('.status');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var lines = [];
      $('input', f).forEach(function (el) {
        var v = (el.value || '').trim(); if (v) lines.push((el.getAttribute('data-label') || el.name) + '\n' + v);
      });
      var contact = (f.elements.contact.value || '').trim();
      if (!contact) { status.hidden = false; status.className = 'status err'; status.textContent = 'Add a phone number or email so Josh can reply.'; f.elements.contact.focus(); return; }
      var subject = f.getAttribute('data-subject');
      var mail = 'mailto:josh@joshdlange.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n\n'));
      var sms = 'sms:+15123379530?&body=' + encodeURIComponent(subject + '. ' + lines.join(' | ').replace(/\n/g, ': '));
      var sl = f.querySelector('.smslink'); if (sl) sl.setAttribute('href', sms);
      status.hidden = false; status.className = 'status';
      status.innerHTML = 'Your email app should open with your answers ready. Press send there and Josh replies to you directly. Nothing is sent until you do. No email app? <a href="' + sms.replace(/"/g, '&quot;') + '">Text the answers</a> to (512) 337-9530 instead.';
      window.location.href = mail;
    });
  });

  // Motion. Without GSAP or with reduced motion the page stays in its final, readable state.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var mm = gsap.matchMedia();
  // Draw-on from the real path length; the dash is removed at the end so the stroke stays fully drawn.
  var drawAt = function (tl, p, vars, pos) {
    var len = Math.ceil(p.getTotalLength()) + 1;
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    tl.to(p, Object.assign({ strokeDashoffset: 0, onComplete: function () { p.style.strokeDasharray = 'none'; p.style.strokeDashoffset = '0'; } }, vars), pos);
  };
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    gsap.from('.a-in', { y: 28, opacity: 0, duration: .9, ease: 'power3.out', stagger: .1, delay: .1, clearProps: 'all' });

    // hero stage: one product at rest, the name card settles in after it
    gsap.from('.hero-home .stage .laptop', { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', delay: .2 });

    // icon cloud: tick off one by one, icons float
    $('.cloud .ic').forEach(function (c, k) {
      gsap.from(c, { y: 40, opacity: 0, scale: .9, duration: .8, delay: .3 + k * .12, ease: 'back.out(1.5)' });
      gsap.from($('.ok', c), { scale: 0, duration: .5, delay: 1.1 + k * .35, ease: 'back.out(3)' });
      gsap.to(c, { y: k % 2 ? 8 : -8, duration: 3 + k * .3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });
    });

    // scroll reveals
    $('.rv').forEach(function (el) {
      gsap.from(el, { y: 44, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $('.stag').forEach(function (g) {
      gsap.from(g.children, { y: 40, opacity: 0, duration: .8, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: g, start: 'top 85%', once: true } });
    });

    // tile art
    $('.tile.ai .art').forEach(function (a) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: a, start: 'top 85%', once: true } });
      tl.from($('.pile rect', a), { scaleX: 0, transformOrigin: 'left center', duration: .5, stagger: .1 })
        .from($('.go', a), { opacity: 0, x: -10, duration: .4 }, '-=.1')
        .from($('.big', a), { scale: 0, transformOrigin: 'center', duration: .6, ease: 'back.out(2)' })
        ;
      drawAt(tl, $('.chk', a)[0], { duration: .5 }, '-=.2');
    });
    $('.tile.rev .art').forEach(function (a) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: a, start: 'top 85%', once: true } });
      tl.from($('.bars rect', a), { scaleY: 0, transformOrigin: 'bottom', duration: .5, stagger: .07 })
        ;
      drawAt(tl, $('.ln', a)[0], { duration: 1.1, ease: 'power2.out' }, '-=.3');
      tl.from($('.hd', a), { opacity: 0, scale: 0, transformOrigin: 'center', duration: .3 });
    });

    // ticks
    $('.ticks').forEach(function (l) {
      gsap.from($('.tk, .done, .ok2', l), { scale: 0, duration: .45, ease: 'back.out(3)', stagger: .3, delay: .5, scrollTrigger: { trigger: l, start: 'top 85%', once: true } });
    });
    // trend line
    $('.trend path.ln').forEach(function (p) {
      var tl = gsap.timeline({ delay: .6, scrollTrigger: { trigger: p, start: 'top 90%', once: true } });
      drawAt(tl, p, { duration: 1.4, ease: 'power2.out' }, 0);
    });

    // flow diagrams
    $('.flow').forEach(function (f) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: f, start: 'top 80%', once: true } });
      $('.node', f).forEach(function (n, k) {
        tl.from($('.dot', n), { scale: 0, duration: .55, ease: 'back.out(2)' }, k * .55)
          .from($('b,span', n), { y: 14, opacity: 0, duration: .5, stagger: .08 }, k * .55 + .25);
        var a = $('.arr', f)[k];
        if (a) drawAt(tl, $('path', a)[0], { duration: .5 }, k * .55 + .35);
      });
    });
  });
})();
