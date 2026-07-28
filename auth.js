/* ===========================================================
   auth.js — Authentication service (client-side demo gate)
   -----------------------------------------------------------
   IMPORTANT: This is a client-side gate suitable for prototyping
   and protecting a developer-only dashboard behind a small
   barrier. For production, replace `verify()` with a real
   backend call (Firebase Auth, Supabase, NextAuth, your own
   server, etc.) and serve the dashboard behind cookie-based
   session middleware. The Store.auth shape is intentionally
   compatible with a real backend payload so the swap is easy.
   =========================================================== */
(function (global) {
  'use strict';

  // Demo credentials — change in Settings → Security after login
  const DEFAULT_EMAIL = 'paulomarques@gmail.com';
  const DEFAULT_PASSWORD = '040206';

  const KEY_HASH = 'paulo_cms_credentials_v1';

  function loadCredentials() {
    try {
      const raw = localStorage.getItem(KEY_HASH);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD };
  }

  function saveCredentials(creds) {
    localStorage.setItem(KEY_HASH, JSON.stringify(creds));
  }

  // Extremely lightweight obfuscation — not real security
  function maskForLog(s) {
    return s ? s[0] + '***' + s.slice(-1) : '';
  }

  const Auth = {
    isLoggedIn() { return !!Store.auth.loggedIn; },

    async login(email, password) {
      // Simulate network latency so loading state is visible
      await new Promise(r => setTimeout(r, 600));

      const creds = loadCredentials();
      const ok = String(email||'').trim().toLowerCase() === creds.email.toLowerCase()
                && password === creds.password;

      if (!ok) {
        logAction('login_failed', { email: maskForLog(email) });
        throw new Error('Invalid email or password.');
      }

      Store.auth.loggedIn = true;
      Store.auth.user = { email: creds.email, name: 'Paulo Marques', avatar: Store.about.avatar || '' };
      Store.auth.lastLoginAt = Date.now();
      Store.persist();

      logAction('login_success', { email: creds.email });
      Notifications.push('success', 'Welcome back 👋', `Signed in as ${creds.email}`);
      return Store.auth.user;
    },

    logout() {
      const who = Store.auth.user.email;
      Store.auth.loggedIn = false;
      Store.auth.user = { email: '', name: '', avatar: '' };
      Store.auth.lastLoginAt = null;
      Store.persist();
      logAction('logout', { email: who });
      Notifications.push('info', 'Signed out', 'You can log back in any time.');
    },

    changePassword(current, next) {
      const creds = loadCredentials();
      if (current !== creds.password) throw new Error('Current password is incorrect.');
      if (!next || next.length < 6) throw new Error('New password must be at least 6 characters.');
      creds.password = next;
      saveCredentials(creds);
      logAction('password_changed', {});
      return true;
    },

    changeEmail(next) {
      const creds = loadCredentials();
      if (!/.+@.+\..+/.test(next)) throw new Error('Enter a valid email address.');
      creds.email = next;
      saveCredentials(creds);
      Store.auth.user.email = next;
      Store.persist();
      return true;
    },

    getCurrentEmail() { return loadCredentials().email; },

    // Route protection helper
    requireAuth() {
      // Also check session timeout
      const ttl = (Store.settings?.security?.sessionTimeoutMin ?? 60) * 60 * 1000;
      const last = Store.auth.lastLoginAt;
      if (Store.auth.loggedIn && last && (Date.now() - last) > ttl) {
        this.logout();
        return false;
      }
      return Store.auth.loggedIn;
    },
  };

  function logAction(type, data) {
    try {
      const log = JSON.parse(localStorage.getItem('paulo_cms_audit_log') || '[]');
      log.push({ type, data, timestamp: Date.now() });
      // Keep last 200 entries
      while (log.length > 200) log.shift();
      localStorage.setItem('paulo_cms_audit_log', JSON.stringify(log));
    } catch {}
  }

  global.Auth = Auth;
})(window);

/* ===========================================================
   notifications.js — In-app notifications + activity log
   =========================================================== */
(function (global) {
  'use strict';

  const Notifications = {
    push(type, title, message, opts = {}) {
      const note = {
        id: genId('n'),
        type, title, message,
        timestamp: Date.now(),
        read: false,
        ...opts,
      };
      Store.state.notifications.unshift(note);
      // cap at 50
      if (Store.state.notifications.length > 50) Store.state.notifications.length = 50;
      Store.persist();

      // Also surface as toast for immediate UX feedback
      if (opts.toast !== false) UI.Toast.show(type, title, message);

      // Refresh any open notification feeds
      if (typeof Admin !== 'undefined') {
        Admin.refreshNotifications?.();
        Admin.refreshDashboard?.();
      }
      return note;
    },

    markAllRead() {
      Store.state.notifications.forEach(n => n.read = true);
      Store.persist();
      Admin.refreshNotifications?.();
    },

    unreadCount() {
      return Store.state.notifications.filter(n => !n.read).length;
    },

    clear() {
      Store.state.notifications = [];
      Store.persist();
      Admin.refreshNotifications?.();
    },
  };

  global.Notifications = Notifications;
})(window);
