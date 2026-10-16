/* Line: personal / joshdlange. Provider-agnostic click and form tracking.
   Config comes from window.JL_ANALYTICS = {provider, id} (set by build.py). Empty id = every call is a no-op.
   Elements opt in with data-track="<event name>"; forms with data-track-form. */
(function () {
  var cfg = window.JL_ANALYTICS || {};
  var on = !!(cfg.id && cfg.provider);
  var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';

  function send(name, params) {
    params = params || {}; params.page = page;
    if (!on) return;
    try {
      if (cfg.provider === 'ga4' && window.gtag) window.gtag('event', name, params);
      else if (cfg.provider === 'goatcounter' && window.goatcounter && window.goatcounter.count)
        window.goatcounter.count({ path: 'event/' + name, title: name, event: true });
    } catch (e) {}
  }
  window.jlTrack = send;

  if (on && cfg.provider === 'ga4') {
    // Analytics cookies: analytics_storage granted; ad storage and personalization stay denied.
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('js', new Date());
    gtag('config', cfg.id, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.id);
    document.head.appendChild(s);
  } else if (on && cfg.provider === 'goatcounter') {
    var g = document.createElement('script'); g.async = true;
    g.setAttribute('data-goatcounter', 'https://' + cfg.id + '.goatcounter.com/count');
    g.src = 'https://gc.zgo.at/count.js'; document.head.appendChild(g);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-track]');
    if (!a) return;
    send(a.getAttribute('data-track'), { where: a.getAttribute('data-where') || '' });
  }, true);
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && f.hasAttribute && f.hasAttribute('data-track-form')) send('form_submit', { form: f.getAttribute('data-track-form') });
  }, true);
})();
