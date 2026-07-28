/* ===========================================================
   settings.js — Application settings + export / import
   =========================================================== */
(function (global) {
  'use strict';

  const Settings = {
    update(patch) {
      Object.assign(Store.settings, patch);
      if (patch.notifications) Object.assign(Store.settings.notifications, patch.notifications);
      if (patch.security)      Object.assign(Store.settings.security,      patch.security);
      Store.persist();
    },

    openEmailEditor() {
      const root = document.createElement('div');
      root.className = 'editor-form';
      const ep = Store.settings;
      root.innerHTML = `
        <div class="callout">
          <strong>How contact form delivery works.</strong>
          <p>Every message is stored locally in the dashboard inbox. To also receive them in your inbox, configure a provider below. <em>For production, point this to a server endpoint to avoid leaking credentials.</em></p>
        </div>

        <label class="field">
          <span>Provider</span>
          <select name="provider">
            <option value="demo" ${ep.emailProvider==='demo'?'selected':''}>Demo — local only</option>
            <option value="formspree" ${ep.emailProvider==='formspree'?'selected':''}>Formspree (no backend needed)</option>
            <option value="resend" ${ep.emailProvider==='resend'?'selected':''}>Resend / SMTP relay</option>
            <option value="webhook" ${ep.emailProvider==='webhook'?'selected':''}>Custom webhook</option>
          </select>
        </label>

        <label class="field">
          <span>Endpoint URL</span>
          <input type="url" name="endpoint" value="${UI.escape(ep.emailEndpoint||'')}" placeholder="${ep.emailProvider==='formspree' ? 'https://formspree.io/f/xxxxxx' : 'https://your-server/api/contact'}" />
          <small class="hint">For Resend/Webhook, your server should accept POST JSON with: to, from, name, subject, message, submitted_at.</small>
        </label>

        <label class="field">
          <span>Delivery email</span>
          <input type="email" name="adminEmail" value="${UI.escape(ep.adminEmail||'')}" placeholder="your@email.com" />
        </label>

        <label class="switch">
          <input type="checkbox" name="contactEnabled" ${ep.contactEnabled ? 'checked' : ''} />
          <span>Enable contact form on the portfolio</span>
        </label>
      `;
      UI.openDrawer({
        title: 'Email delivery',
        content: root,
        saveLabel: 'Save',
        onSave: (body) => {
          const fd = new FormData(body);
          Store.settings.emailProvider = fd.get('provider') || 'demo';
          Store.settings.emailEndpoint  = fd.get('endpoint')?.trim() || '';
          Store.settings.adminEmail     = fd.get('adminEmail')?.trim() || '';
          Store.settings.contactEnabled = !!fd.get('contactEnabled');
          Store.persist();
          UI.Toast.success('Settings saved', 'Email provider updated.');
          Admin.renderSettings?.();
          return true;
        },
      });
    },

    openSecurityEditor() {
      const root = document.createElement('div');
      root.className = 'editor-form';
      root.innerHTML = `
        <div class="callout callout-info">
          <strong>Security notice.</strong>
          <p>This is a client-side login gate — useful for prototyping, but <strong>not safe</strong> for production. Replace with a real backend (Firebase, Supabase, your own server) before publishing publicly.</p>
        </div>
        <div class="form-grid form-grid-2">
          <label class="field"><span>Admin email</span><input name="email" value="${UI.escape(Auth.getCurrentEmail())}" /></label>
          <label class="field"><span>Session timeout (minutes)</span><input type="number" name="timeout" min="5" max="1440" value="${Store.settings.security.sessionTimeoutMin}" /></label>
        </div>
        <label class="field"><span>New password</span><input type="password" name="password" placeholder="Leave empty to keep current" /></label>
      `;
      UI.openDrawer({
        title: 'Security & session',
        content: root,
        saveLabel: 'Save',
        onSave: (body) => {
          const fd = new FormData(body);
          try {
            const email = fd.get('email')?.trim();
            if (email) Auth.changeEmail(email);

            const pw = fd.get('password');
            if (pw && pw.trim().length > 0) Auth.changePassword(Auth.getCurrentEmail(), pw); // current check via changePassword
            // Note: changePassword expects the *current* pass; here we use an empty pass check below
          } catch (e) { UI.Toast.error('Could not update', e.message); return false; }

          // Re-do password change correctly with hash retrieval (since changePassword requires current pw)
          const pwNew = (new FormData(body)).get('password');
          if (pwNew && pwNew.length > 0) {
            try {
              const raw = localStorage.getItem('paulo_cms_credentials_v1');
              const creds = raw ? JSON.parse(raw) : { password: 'admin123' };
              creds.password = pwNew;
              localStorage.setItem('paulo_cms_credentials_v1', JSON.stringify(creds));
              UI.Toast.success('Password updated', '');
            } catch (e) { UI.Toast.error('Password not updated', e.message); }
          }

          Store.settings.security.sessionTimeoutMin = Math.max(5, +((new FormData(body)).get('timeout') || 60));
          Store.persist();
          Admin.renderSettings?.();
          return true;
        },
      });
    },

    exportData() {
      const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `paulo-cms-export-${Date.now()}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      UI.Toast.success('Exported', 'Backup downloaded.');
    },

    async importData(file) {
      try {
        const text = await file.text();
        Store.importJSON(text);
        UI.Toast.success('Imported', 'Data restored.');
        setTimeout(() => location.reload(), 700);
      } catch (e) {
        UI.Toast.error('Import failed', e.message);
      }
    },

    async reset() {
      const ok = await UI.confirm({ title: 'Reset everything?', message: 'All projects, skills, social links and messages will be reset to defaults. This cannot be undone.', okLabel: 'Reset' });
      if (!ok) return;
      Store.reset();
      UI.Toast.warning('Reset complete', 'Reloading…');
      setTimeout(() => location.reload(), 700);
    },
  };

  global.Settings = Settings;
})(window);
