(function () {
  'use strict';

  const current = document.querySelector('meta[name="atlas-version"]')?.content;
  if (!current) return;

  const banner = document.getElementById('atlas-update');
  const message = banner.querySelector('[role="status"]');
  const button = banner.querySelector('button');
  const reloadKey = version => `atlas-reloaded:${version}`;
  let pendingVersion = null;
  const messageKey = 'updateAvailable';
  let lastCheck = -Infinity;
  let checking = false;

  function translateBanner() {
    message.textContent = LORE_LANGUAGE.ui(messageKey);
    button.textContent = LORE_LANGUAGE.ui('reload');
  }

  function reloadIfSafe() {
    if (!pendingVersion || document.hidden || document.activeElement?.matches('textarea, input') ||
        document.getElementById('journey-summary')?.value ||
        document.querySelector('dialog[open], #map-popover:not([hidden])')) return false;

    let attempted;
    try {
      const key = reloadKey(pendingVersion);
      attempted = sessionStorage.getItem(key);
      if (!attempted) sessionStorage.setItem(key, '1');
    } catch (_) {
      return false; // A stale page could reload in a loop without the session marker.
    }
    pendingVersion = null;
    banner.hidden = true;
    if (attempted) return false;
    location.reload();
    return true;
  }

  async function checkForUpdate() {
    const now = performance.now();
    if (document.hidden || checking || now - lastCheck < 60_000) return;
    lastCheck = now;
    checking = true;
    try {
      const response = await fetch(`version.json?ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return;
      const { version } = await response.json();
      if (typeof version !== 'string' || !version) return;
      if (version === current || sessionStorage.getItem(reloadKey(version))) {
        pendingVersion = null;
        banner.hidden = true;
      } else if (version !== pendingVersion) {
        pendingVersion = version;
        if (reloadIfSafe()) return;
        banner.hidden = false;
        translateBanner();
      }
    } catch (_) {
      // The next check can retry if the network or version manifest is unavailable.
    } finally {
      checking = false;
    }
  }

  banner.addEventListener('click', event => {
    event.stopPropagation(); // Keep the atlas's outside-click handler from closing the open popover.
    // A click is the user's choice, so it reloads even over a draft; only automatic reloads wait.
    if (event.target === button) location.reload();
  });
  addEventListener('lore:languagechange', translateBanner);
  document.addEventListener('visibilitychange', () => {
    if (!reloadIfSafe()) checkForUpdate();
  });
  addEventListener('focus', checkForUpdate);
  setInterval(checkForUpdate, 60_000);
  document.addEventListener('DOMContentLoaded', checkForUpdate, { once: true });
})();
