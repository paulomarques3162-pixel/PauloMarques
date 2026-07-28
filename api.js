/* ===========================================================
   api.js — External services (email delivery)
   -----------------------------------------------------------
   The contact form on the public portfolio POSTs here. We
   persist the message locally first (so it's always visible in
   the dashboard inbox) and then forward it to a delivery
   endpoint, depending on the configured provider.

   Supported:
     - 'demo'      : local-only (default). Message stored.
     - 'formspree' : POST to a Formspree endpoint URL.
     - 'resend'    : POST JSON to a server proxy running Resend.
     - 'webhook'   : generic webhook URL receiving JSON.
   =========================================================== */
(function (global) {
  'use strict';

  const ENDPOINTS = {
    formspree: { method: 'POST', mode: 'form' },     // body = FormData
    resend:    { method: 'POST', mode: 'json' },     // body = JSON
    webhook:   { method: 'POST', mode: 'json' },     // body = JSON
    demo:      { method: 'noop', mode: 'local' },
  };

  const Api = {
    async sendMessage(payload) {
      const settings = Store.settings;
      const provider = settings.emailProvider || 'demo';
      const endpoint = settings.emailEndpoint || '';
      const adminEmail = settings.adminEmail || '';

      // Always save locally so admin can see it from any device
      const msg = {
        id: genId('m'),
        timestamp: Date.now(),
        read: false,
        ...payload,
      };
      Store.state.messages.unshift(msg);
      if (Store.state.messages.length > 500) Store.state.messages.length = 500;
      Store.persist();

      if (provider === 'demo' || !endpoint) {
        return { ok: true, delivered: false, mode: 'local', message: msg };
      }

      try {
        const conf = ENDPOINTS[provider] || ENDPOINTS.webhook;
        let res;
        if (conf.mode === 'form') {
          // Formspree expects a regular form-encoded POST
          const fd = new FormData();
          fd.append('name', payload.name);
          fd.append('email', payload.email);
          fd.append('subject', payload.subject);
          fd.append('message', payload.message);
          fd.append('_to', adminEmail);
          fd.append('submitted_at', new Date(msg.timestamp).toISOString());
          res = await fetch(endpoint, { method: conf.method, body: fd, headers: { 'Accept': 'application/json' } });
        } else {
          // Resend / Webhook — JSON
          res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: adminEmail,
              from: payload.email,
              reply_to: payload.email,
              name: payload.name,
              subject: payload.subject,
              message: payload.message,
              submitted_at: new Date(msg.timestamp).toISOString(),
            }),
          });
        }
        if (!res.ok) throw new Error('Upstream returned ' + res.status);
        msg.delivered = true;
        msg.deliveredAt = Date.now();
        Store.persist();
        Notifications.push('success', 'New message delivered', `From ${payload.name} — "${payload.subject}"`, { toast: false });
        return { ok: true, delivered: true, mode: 'remote', message: msg };
      } catch (e) {
        console.warn('[api] delivery failed:', e);
        msg.deliveryError = String(e.message || e);
        Store.persist();
        Notifications.push('warning', 'Delivery failed', 'Message saved locally. Check email settings.', { toast: false });
        return { ok: false, delivered: false, error: e, message: msg };
      }
    },

    getRecentMessages(limit = 10) {
      return Store.state.messages.slice(0, limit);
    },
  };

  global.Api = Api;
})(window);
