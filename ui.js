/* ===========================================================
   ui.js — UI primitives (toast, modal, drawer, dropdown,
   confirm, helpers)
   -----------------------------------------------------------
   These primitives are reused across every module.
   =========================================================== */
(function (global) {
  'use strict';

  const ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12 5 5L20 7"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18h.01"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
    close:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6l-12 12"/></svg>',
  };

  // ===================================================
  // TOASTS
  // ===================================================
  const Toast = {
    host: null,
    ensure() {
      if (this.host) return this.host;
      this.host = document.createElement('div');
      this.host.className = 'toast-host';
      document.body.appendChild(this.host);
      return this.host;
    },
    show(type, title, message, opts = {}) {
      const host = this.ensure();
      const el = document.createElement('div');
      el.className = `toast toast-${type}`;
      el.innerHTML = `
        <div class="toast-icon">${ICONS[type] || ICONS.info}</div>
        <div class="toast-body">
          <strong></strong>
          ${message ? '<div class="toast-msg"></div>' : ''}
        </div>
        <button class="toast-close" aria-label="Dismiss">${ICONS.close}</button>
      `;
      el.querySelector('strong').textContent = title;
      if (message) el.querySelector('.toast-msg').textContent = message;
      const remove = () => {
        el.classList.add('toast-leaving');
        setTimeout(() => el.remove(), 220);
      };
      el.querySelector('.toast-close').addEventListener('click', remove);
      host.appendChild(el);
      const ttl = opts.ttl ?? 4200;
      if (ttl > 0) setTimeout(remove, ttl);
      return { dismiss: remove };
    },
    success(t, m, o) { return this.show('success', t, m, o); },
    error(t, m, o)   { return this.show('error',   t, m, o); },
    warning(t, m, o) { return this.show('warning', t, m, o); },
    info(t, m, o)    { return this.show('info',    t, m, o); },
  };

  // ===================================================
  // CONFIRM (replacement for window.confirm, nicer UX)
  // ===================================================
  function confirm(opts) {
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.innerHTML = `
        <div class="modal modal-sm">
          <h3 class="modal-title"></h3>
          <p class="modal-desc"></p>
          <div class="modal-actions">
            <button class="btn btn-ghost js-cancel"></button>
            <button class="btn btn-danger js-ok"></button>
          </div>
        </div>
      `;
      backdrop.querySelector('.modal-title').textContent = opts.title || 'Are you sure?';
      backdrop.querySelector('.modal-desc').textContent  = opts.message || '';
      backdrop.querySelector('.js-cancel').textContent   = opts.cancelLabel || 'Cancel';
      backdrop.querySelector('.js-ok').textContent       = opts.okLabel || 'Confirm';
      const close = (val) => { backdrop.classList.add('modal-leaving'); setTimeout(() => { backdrop.remove(); resolve(val); }, 180); };
      backdrop.querySelector('.js-cancel').onclick = () => close(false);
      backdrop.querySelector('.js-ok').onclick     = () => close(true);
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(false); });
      document.body.appendChild(backdrop);
    });
  }

  // ===================================================
  // DRAWER (right-sliding panel for forms)
  // ===================================================
  function openDrawer(opts) {
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = 'drawer-backdrop';
      backdrop.innerHTML = `
        <aside class="drawer" role="dialog" aria-label="${opts.title || ''}">
          <header class="drawer-head">
            <h3></h3>
            <button class="drawer-close" aria-label="Close">${ICONS.close}</button>
          </header>
          <div class="drawer-body"></div>
          <footer class="drawer-foot">
            <button class="btn btn-ghost js-cancel"></button>
            <button class="btn btn-primary js-save"></button>
          </footer>
        </aside>
      `;
      backdrop.querySelector('h3').textContent = opts.title || '';
      const body = backdrop.querySelector('.drawer-body');
      if (typeof opts.content === 'string') body.innerHTML = opts.content;
      else if (opts.content instanceof Node) body.appendChild(opts.content);
      backdrop.querySelector('.js-cancel').textContent = opts.cancelLabel || 'Cancel';
      backdrop.querySelector('.js-save').textContent   = opts.saveLabel   || 'Save';
      const close = (val) => { backdrop.classList.add('drawer-leaving'); setTimeout(() => { backdrop.remove(); resolve(val); }, 220); };
      backdrop.querySelector('.drawer-close').onclick = () => close(null);
      backdrop.querySelector('.js-cancel').onclick    = () => close(null);
      backdrop.querySelector('.js-save').onclick      = () => {
        if (typeof opts.onSave === 'function') {
          const ok = opts.onSave(body);
          if (ok === false) return;
        }
        close(true);
      };
      document.body.appendChild(backdrop);
    });
  }

  // ===================================================
  // DROPDOWN — generic, click out to close
  // ===================================================
  function toggleDropdown(el) {
    el.classList.toggle('open');
    const onClickAway = (e) => {
      if (!el.contains(e.target)) {
        el.classList.remove('open');
        document.removeEventListener('click', onClickAway);
      }
    };
    document.addEventListener('click', onClickAway);
  }

  // ===================================================
  // HELPERS
  // ===================================================
  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatDate(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString(global.LOCALE || 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function timeAgo(ts) {
    if (!ts) return '—';
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    if (s < 604800) return Math.floor(s/86400) + 'd ago';
    return formatDate(ts);
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function debounce(fn, wait = 200) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }

  global.UI = { Toast, confirm, openDrawer, toggleDropdown, escape, formatDate, timeAgo, readFileAsDataURL, debounce };
})(window);
