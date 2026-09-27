/**
 * Real-Time Anonymous Presence Client
 * Tracks active visitors via Server-Sent Events (SSE)
 * Zero tracking of personal information, IP, or location.
 */
(function() {
  'use strict';

  const PRESENCE_ENDPOINT = '/api/presence/stream';
  const LEAVE_ENDPOINT = '/api/presence/leave';

  let eventSource = null;
  let retryTimer = null;
  let retryCount = 0;
  let currentCount = null;
  let isOnline = false;

  // Generate or retrieve an anonymous session-scoped identifier
  function getVisitorId() {
    try {
      let id = sessionStorage.getItem('c1_vid');
      if (!id) {
        id = 'v_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        sessionStorage.setItem('c1_vid', id);
      }
      return id;
    } catch (e) {
      return 'v_' + Math.random().toString(36).substring(2, 9);
    }
  }

  const visitorId = getVisitorId();

  function getElements() {
    return {
      container: document.getElementById('live-visitors-status'),
      dot: document.getElementById('live-dot'),
      text: document.getElementById('live-visitors-text'),
      count: document.getElementById('live-visitors-count'),
      unit: document.getElementById('live-visitors-unit'),
      sub: document.getElementById('live-visitors-sub')
    };
  }

  function setOnlineCount(count) {
    const els = getElements();
    if (!els.container || !els.dot || !els.text || !els.sub) return;

    isOnline = true;
    const num = Math.max(1, parseInt(count, 10) || 1);
    const formatted = String(num).padStart(2, '0');
    const unitText = num === 1 ? 'LIVE VISITOR' : 'LIVE VISITORS';

    els.dot.className = 'live-dot';
    els.sub.textContent = 'SYSTEM ONLINE';
    els.sub.className = 'live-visitors-sub';

    const label = num === 1
      ? '1 person currently viewing this website'
      : `${num} people currently viewing this website`;
    els.container.setAttribute('aria-label', label);
    els.container.title = label;

    // Restore standard HTML structure if it was replaced with offline fallback text
    if (!els.count) {
      els.text.innerHTML = `<span class="live-count" id="live-visitors-count">${formatted}</span> <span id="live-visitors-unit">${unitText}</span>`;
      currentCount = num;
      return;
    }

    if (currentCount !== num) {
      currentCount = num;
      els.count.classList.add('updating');
      setTimeout(() => {
        const freshEls = getElements();
        if (freshEls.count) freshEls.count.textContent = formatted;
        if (freshEls.unit) freshEls.unit.textContent = unitText;
        if (freshEls.count) freshEls.count.classList.remove('updating');
      }, 140);
    } else {
      els.count.textContent = formatted;
      if (els.unit) els.unit.textContent = unitText;
    }
  }

  function setUnavailableState() {
    const els = getElements();
    if (!els.container || !els.dot || !els.text || !els.sub) return;

    isOnline = false;
    currentCount = null;

    els.dot.className = 'live-dot dot-offline';
    els.text.innerHTML = 'LIVE STATUS UNAVAILABLE';
    els.sub.textContent = 'SYSTEM OFFLINE';
    els.sub.className = 'live-visitors-sub sub-offline';
    els.container.setAttribute('aria-label', 'Real-time visitor count unavailable');
    els.container.title = 'Real-time visitor count unavailable';
  }

  function connect() {
    if (typeof EventSource === 'undefined') {
      setUnavailableState();
      return;
    }

    if (eventSource) {
      try { eventSource.close(); } catch(e){}
      eventSource = null;
    }

    const streamUrl = `${PRESENCE_ENDPOINT}?id=${encodeURIComponent(visitorId)}`;
    try {
      eventSource = new EventSource(streamUrl);

      // Timeout guard: if no message received within 4.5 seconds, show unavailable
      const connTimeout = setTimeout(() => {
        if (!isOnline) {
          setUnavailableState();
        }
      }, 4500);

      eventSource.onopen = function() {
        clearTimeout(connTimeout);
        retryCount = 0;
      };

      eventSource.onmessage = function(e) {
        clearTimeout(connTimeout);
        try {
          const data = JSON.parse(e.data);
          if (data && typeof data.count === 'number') {
            setOnlineCount(data.count);
          }
        } catch(err){}
      };

      eventSource.onerror = function() {
        clearTimeout(connTimeout);
        setUnavailableState();
        if (eventSource) {
          try { eventSource.close(); } catch(e){}
          eventSource = null;
        }

        // Exponential backoff reconnect: 5s, 8s, 12s, max 25s
        const delay = Math.min(25000, 5000 * Math.pow(1.5, retryCount++));
        clearTimeout(retryTimer);
        retryTimer = setTimeout(connect, delay);
      };
    } catch (e) {
      setUnavailableState();
    }
  }

  // Graceful cleanup on page departure
  function handleDeparture() {
    if (eventSource) {
      try { eventSource.close(); } catch(e){}
    }
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${LEAVE_ENDPOINT}?id=${encodeURIComponent(visitorId)}`, '');
      }
    } catch(e){}
  }

  window.addEventListener('beforeunload', handleDeparture, { capture: true });
  window.addEventListener('pagehide', handleDeparture, { capture: true });

  // Developer & debugging hook
  window.LivePresence = {
    getVisitorId: () => visitorId,
    getCount: () => currentCount,
    isOnline: () => isOnline,
    reconnect: connect
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connect);
  } else {
    connect();
  }
})();
