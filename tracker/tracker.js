(function () {
  'use strict';

  const API_URL = 'https://causalfunnelbackend.onrender.com';
  const SESSION_STORAGE_KEY = 'analytics_session_id';
  const DEBUG = true;

  function log(stage, payload) {
    if (DEBUG) {
      console.log('[Analytics:tracker]', stage, payload);
    }
  }

  function normalizePageUrl(url) {
    try {
      const parsed = new URL(url);
      parsed.hash = '';
      if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }
      return parsed.toString();
    } catch {
      let base = url;
      const hashIndex = url.indexOf('#');
      if (hashIndex !== -1) base = url.slice(0, hashIndex);
      if (base.length > 1 && base.endsWith('/')) base = base.slice(0, -1);
      return base;
    }
  }

  /**
   * Document scroll dimensions — the coordinate space for pageX/pageY.
   * Must NOT use viewport (innerWidth/innerHeight) here.
   */
  function getPageMetrics() {
    const docEl = document.documentElement;
    const body = document.body;

    const pageWidth = Math.max(docEl.scrollWidth, body?.scrollWidth || 0, 1);
    const pageHeight = Math.max(docEl.scrollHeight, body?.scrollHeight || 0, 1);

    return {
      viewportWidth: window.innerWidth || 0,
      viewportHeight: window.innerHeight || 0,
      pageWidth,
      pageHeight,
    };
  }

  function getScrollOffset() {
    return {
      scrollX: Math.round(window.pageXOffset ?? document.documentElement.scrollLeft ?? 0),
      scrollY: Math.round(window.pageYOffset ?? document.documentElement.scrollTop ?? 0),
    };
  }

  function getClickData(event, metrics) {
    const { scrollX, scrollY } = getScrollOffset();

    if (typeof event.pageX !== 'number' || typeof event.pageY !== 'number') {
      log('WARN: pageX/pageY missing, falling back to client+scroll', {
        clientX: event.clientX,
        clientY: event.clientY,
        scrollX,
        scrollY,
      });
    }

    const pageX = Math.round(
      typeof event.pageX === 'number' ? event.pageX : event.clientX + scrollX
    );
    const pageY = Math.round(
      typeof event.pageY === 'number' ? event.pageY : event.clientY + scrollY
    );

    const normalizedX = pageX / metrics.pageWidth;
    const normalizedY = pageY / metrics.pageHeight;

    const data = {
      pageX,
      pageY,
      clickX: pageX,
      clickY: pageY,
      scrollX,
      scrollY,
      normalizedX,
      normalizedY,
    };

    log('click-captured', {
      pageX,
      pageY,
      scrollX,
      scrollY,
      pageWidth: metrics.pageWidth,
      pageHeight: metrics.pageHeight,
      viewportWidth: metrics.viewportWidth,
      viewportHeight: metrics.viewportHeight,
      normalizedX,
      normalizedY,
      verifyClientSum: {
        x: event.clientX + scrollX,
        y: event.clientY + scrollY,
      },
    });

    return data;
  }

  function getSessionId() {
    let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }

    return sessionId;
  }

  function sendPayload(payload) {
    log('posting', payload);

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function (err) {
      log('post-error', { message: err?.message || 'network error' });
    });
  }

  function trackPageView() {
    const pageUrl = window.location.href;
    const metrics = getPageMetrics();

    log('page-view', metrics);

    sendPayload({
      sessionId: getSessionId(),
      eventType: 'page_view',
      pageUrl,
      pageUrlNormalized: normalizePageUrl(pageUrl),
      timestamp: new Date().toISOString(),
      ...metrics,
    });
  }

  function trackClick(event) {
    const metrics = getPageMetrics();
    const pageUrl = window.location.href;
    const clickData = getClickData(event, metrics);

    sendPayload({
      sessionId: getSessionId(),
      eventType: 'click',
      pageUrl,
      pageUrlNormalized: normalizePageUrl(pageUrl),
      timestamp: new Date().toISOString(),
      ...metrics,
      ...clickData,
    });
  }

  function init() {
    trackPageView();
    document.addEventListener('click', trackClick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
