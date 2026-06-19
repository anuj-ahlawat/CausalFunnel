(function () {
  'use strict';

  const API_URL = 'http://localhost:5001/api/events';
  const SESSION_STORAGE_KEY = 'analytics_session_id';

  function getPageMetrics() {
    const docEl = document.documentElement;
    const body = document.body;

    const pageWidth = Math.max(
      docEl?.scrollWidth || 0,
      docEl?.offsetWidth || 0,
      body?.scrollWidth || 0,
      body?.offsetWidth || 0
    );

    const pageHeight = Math.max(
      docEl?.scrollHeight || 0,
      docEl?.offsetHeight || 0,
      body?.scrollHeight || 0,
      body?.offsetHeight || 0
    );

    return {
      viewportWidth: window.innerWidth || null,
      viewportHeight: window.innerHeight || null,
      pageWidth: pageWidth || null,
      pageHeight: pageHeight || null,
    };
  }

  function getSessionId() {
    let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }

    return sessionId;
  }

  function sendEvent(eventType, clickX, clickY) {
    const payload = {
      sessionId: getSessionId(),
      eventType,
      pageUrl: window.location.href,
      timestamp: new Date().toISOString(),
      ...getPageMetrics(),
    };

    if (eventType === 'click') {
      payload.clickX = clickX;
      payload.clickY = clickY;
    }

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function () {
      // Silently ignore network errors so tracking never breaks the host page.
    });
  }

  function trackPageView() {
    sendEvent('page_view');
  }

  function trackClick(event) {
    sendEvent('click', event.pageX, event.pageY);
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
