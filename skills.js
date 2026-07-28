/* ===========================================================
   skills.js — Skills CRUD
   =========================================================== */
(function (global) {
  'use strict';

  const ICON_OPTIONS = [
    { id: 'html',       label: 'HTML5' },
    { id: 'css',        label: 'CSS3' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'js',         label: 'JavaScript (alt)' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'python',     label: 'Python' },
    { id: 'react',      label: 'React' },
    { id: 'nextjs',     label: 'Next.js' },
    { id: 'vue',        label: 'Vue' },
    { id: 'node',       label: 'Node.js' },
    { id: 'git',        label: 'Git' },
    { id: 'docker',     label: 'Docker' },
    { id: 'figma',      label: 'Figma' },
    { id: 'database',   label: 'Database' },
    { id: 'code',       label: 'Code (generic)' },
    { id: 'sparkles',   label: 'Sparkles' },
    { id: 'rocket',     label: 'Rocket' },
    { id: 'palette',    label: 'Palette / Design' },
    { id: 'globe',      label: 'Globe / Web' },
    { id: 'star',       label: 'Star' },
  ];

  function iconSVG(iconId) {
    const c = (id) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-icon="${id}">${iconPath(id)}</svg>`;
    return c(iconId);
  }

  function iconPath(id) {
    const map = {
      html:       '<path d="m4 7 8-4 8 4-8 4z"/><path d="m4 12 8 4 8-4M4 17l8 4 8-4"/>',
      css:        '<path d="M4 4h16v6H4zM4 14h16v6H4z"/><circle cx="8" cy="7" r="1"/><circle cx="8" cy="17" r="1"/>',
      javascript: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 17v-4M9 17v-5"/>',
      js:         '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m11 11-2 5 4-1 2 5"/>',
      typescript: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h6M11 12v6"/>',
      python:     '<path d="m9 11-3 9 5-2 3 6 6-16-11 3z"/>',
      react:      '<circle cx="12" cy="12" r="2"/><path d="M12 2a14 14 0 0 1 0 20M2 12h20M5 5l14 14M19 5L5 19"/>',
      nextjs:     '<circle cx="12" cy="12" r="9"/><path d="M9 9h6M9 15h6"/>',
      vue:        '<path d="M3 12h6l3 6 9-18-6 12h-3z"/>',
      node:       '<path d="M12 2 3 7v10l9 5 9-5V7z"/>',
      git:        '<circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 12v4a2 2 0 0 0 2 2h6"/>',
      docker:     '<rect x="3" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M3 9V5h6v4"/>',
      figma:      '<circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/><path d="M11 6h4v6h-4"/>',
      database:   '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/>',
      code:       '<path d="m9 18-6-6 6-6M15 6l6 6-6 6"/>',
      sparkles:   '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/>',
      rocket:     '<path d="M12 2c4 4 6 8 6 12s-2 7-6 9c-4-2-6-5-6-9s2-8 6-12z"/>',
      palette:    '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="9" r="1.2"/><circle cx="16" cy="9" r="1.2"/><circle cx="9" cy="16" r="1.2"/><circle cx="15" cy="15" r="1.2"/>',
      globe:      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
      star:       '<path d="m12 3 3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 10l6-1z"/>',
    };
    return map[id] || map.star;
  }

  function iconLabel(id) {
    return (ICON_OPTIONS.find(o => o.id === id) || {}).label || id;
  }

  const Skills = {
    ICON_OPTIONS, iconSVG, iconLabel,

    create() {
      const s = {
        id: genId('s'),
        name: 'New skill',
        icon: 'sparkles',
        proficiency: 50,
        visible: true,
        locked: false,
        badge: 'Solid',
      };
      Store.skills.push(s);
      Store.persist();
      return s;
    },

    update(id, patch) {
      const s = Store.findById(Store.skills, id);
      if (!s) return null;
      Object.assign(s, patch);
      Store.persist();
      return s;
    },

    async remove(id) {
      const s = Store.findById(Store.skills, id);
      if (!s) return false;
      const ok = await UI.confirm({ title: 'Remove skill?', message: `"${s.name}" will be removed from your portfolio.`, okLabel: 'Remove' });
      if (!ok) return false;
      Store.remove(Store.skills, id);
      Notifications.push('warning', 'Skill removed', `"${s.name}" deleted.`, { toast: false });
      return true;
    },

    toggleVisible(id) {
      const s = Store.findById(Store.skills, id);
      if (!s) return;
      s.visible = !s.visible;
      Store.persist();
    },

    renderEditor(skill) {
      const root = document.createElement('div');
      root.className = 'editor-form';
      root.innerHTML = `
        <div class="form-grid form-grid-2">
          <label class="field">
            <span>Name</span>
            <input type="text" name="name" value="${UI.escape(skill.name)}" required />
          </label>
          <label class="field">
            <span>Badge</span>
            <input type="text" name="badge" value="${UI.escape(skill.badge || '')}" placeholder="Strong / Solid / Soon..." />
          </label>
        </div>

        <label class="field">
          <span>Icon</span>
          <div class="icon-picker js-picker">
            ${ICON_OPTIONS.map(o => `
              <button type="button" class="icon-tile ${skill.icon === o.id ? 'active' : ''}" data-icon="${o.id}" title="${o.label}">
                ${iconSVG(o.id)}
                <span>${o.label}</span>
              </button>
            `).join('')}
          </div>
        </label>

        <div class="field">
          <span>Proficiency — <strong class="js-pct">${skill.proficiency}</strong>%</span>
          <input type="range" name="proficiency" min="0" max="100" step="5" value="${skill.proficiency}" class="js-slider" />
        </div>

        <div class="form-grid form-grid-2">
          <label class="switch">
            <input type="checkbox" name="visible" ${skill.visible ? 'checked' : ''} />
            <span>Visible on portfolio</span>
          </label>
          <label class="switch">
            <input type="checkbox" name="locked" ${skill.locked ? 'checked' : ''} />
            <span>Show as "coming soon" (locked style)</span>
          </label>
        </div>
      `;

      root.querySelector('.js-picker').addEventListener('click', (e) => {
        const tile = e.target.closest('.icon-tile');
        if (!tile) return;
        root.querySelectorAll('.icon-tile').forEach(t => t.classList.remove('active'));
        tile.classList.add('active');
      });

      const slider = root.querySelector('.js-slider');
      const pct = root.querySelector('.js-pct');
      slider.addEventListener('input', () => { pct.textContent = slider.value; });

      return root;
    },

    collectForm(formEl, skill) {
      const fd = new FormData(formEl);
      skill.name        = fd.get('name')?.trim() || skill.name;
      skill.badge       = fd.get('badge')?.trim() || '';
      skill.proficiency = +fd.get('proficiency') || 0;
      skill.visible     = !!fd.get('visible');
      skill.locked      = !!fd.get('locked');
      const active = formEl.querySelector('.icon-tile.active');
      if (active) skill.icon = active.dataset.icon;
      return skill;
    },

    openEditor(skill) {
      const root = this.renderEditor(skill);
      UI.openDrawer({
        title: skill.name?.startsWith('New skill') ? 'New skill' : 'Edit skill',
        content: root,
        saveLabel: 'Save',
        onSave: (body) => {
          this.collectForm(body, skill);
          Store.upsert(Store.skills, skill);
          UI.Toast.success('Skill saved', `"${skill.name}" updated.`);
          Admin.renderSkills?.();
          return true;
        },
      });
    },
  };

  global.Skills = Skills;
})(window);
