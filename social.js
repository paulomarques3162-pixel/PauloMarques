/* ===========================================================
   social.js — Social Links CRUD
   =========================================================== */
(function (global) {
  'use strict';

  const PLATFORMS = [
    { id: 'github',    name: 'GitHub',    icon: 'github',    hint: 'https://github.com/username' },
    { id: 'linkedin',  name: 'LinkedIn',  icon: 'linkedin',  hint: 'https://linkedin.com/in/username' },
    { id: 'email',     name: 'Email',     icon: 'mail',      hint: 'mailto:you@example.com' },
    { id: 'whatsapp',  name: 'WhatsApp',  icon: 'whatsapp',  hint: 'https://wa.me/5511...' },
    { id: 'portfolio', name: 'Portfolio', icon: 'globe',     hint: 'https://yoursite.dev' },
    { id: 'instagram', name: 'Instagram', icon: 'instagram', hint: 'https://instagram.com/username' },
    { id: 'x',         name: 'X (Twitter)', icon: 'x',       hint: 'https://x.com/username' },
  ];

  const ICON_SVG = {
    github:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.7 5.5.7 11.8c0 5 3.2 9.2 7.7 10.7.6.1.8-.3.8-.6v-2.2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1.9-.3 1.8-.4 2.8-.4s1.9.1 2.8.4c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.3.8 1 .8 2v3c0 .3.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.3 5.5 18.3.5 12 .5z"/></svg>',
    linkedin:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5zM8 19H5V8h3v11zM6.5 6.7a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM20 19h-3v-5.6c0-3.4-4-3.1-4 0V19h-3V8h3v1.8c1.4-2.6 7-2.8 7 2.4V19z"/></svg>',
    mail:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="m4 7 8 6 8-6"/></svg>',
    whatsapp:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892h-.005a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>',
    globe:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    x:         '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21l-6.52 7.45L22 22h-6.83l-4.78-6.27L4.8 22H2l6.96-7.96L2 2h6.99l4.33 5.72L18.24 2zm-1.2 18h1.86L7.05 4H5.07l11.97 16z"/></svg>',
  };

  const Social = {
    PLATFORMS,

    update(platform, { url, enabled }) {
      if (!Store.social[platform]) return null;
      if (typeof url === 'string') Store.social[platform].url = url.trim();
      if (typeof enabled === 'boolean') Store.social[platform].enabled = enabled;
      Store.persist();
      return Store.social[platform];
    },

    iconSVG(platform) { return ICON_SVG[Store.social?.[platform]?.icon || platform] || ICON_SVG.globe; },

    openEditor(platformId) {
      const platform = PLATFORMS.find(p => p.id === platformId);
      const data = Store.social[platformId] || { url: '', enabled: false };
      const root = document.createElement('div');
      root.className = 'editor-form';
      root.innerHTML = `
        <div class="field">
          <span>URL</span>
          <input type="text" name="url" value="${UI.escape(data.url || '')}" placeholder="${platform.hint}" />
          <small class="hint">Visitors can reach you through this URL on the contact page.</small>
        </div>
        <label class="switch">
          <input type="checkbox" name="enabled" ${data.enabled ? 'checked' : ''} />
          <span>Show on portfolio</span>
        </label>
      `;
      UI.openDrawer({
        title: 'Edit ' + platform.name,
        content: root,
        saveLabel: 'Save',
        onSave: (body) => {
          const fd = new FormData(body);
          this.update(platformId, { url: fd.get('url') || '', enabled: !!fd.get('enabled') });
          UI.Toast.success('Saved', `${platform.name} updated.`);
          Admin.renderSocial?.();
          return true;
        },
      });
    },
  };

  global.Social = Social;
})(window);
