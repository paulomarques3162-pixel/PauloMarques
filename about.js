/* ===========================================================
   about.js — About Me + Journey + Goals management
   =========================================================== */
(function (global) {
  'use strict';

  const About = {
    // ----- About Me content -----
    update(field, value) {
      Store.about[field] = value;
      Store.persist();
      return value;
    },

    addParagraph() {
      Store.about.bio.push('');
      Store.persist();
      return Store.about.bio.length - 1;
    },

    removeParagraph(i) {
      Store.about.bio.splice(i, 1);
      Store.persist();
    },

    addStat() {
      Store.about.stats.push({ num: '0', label: 'New stat' });
      Store.persist();
    },

    removeStat(i) {
      Store.about.stats.splice(i, 1);
      Store.persist();
    },

    openEditor() {
      const root = document.createElement('div');
      root.className = 'editor-form';
      const bio = Store.about.bio.map((p, i) => `
        <div class="bio-row">
          <textarea name="bio_${i}" rows="3">${UI.escape(p)}</textarea>
          <button type="button" class="icon-btn" data-rm-bio="${i}" title="Remove paragraph">×</button>
        </div>
      `).join('');
      const stats = Store.about.stats.map((s, i) => `
        <div class="stat-row">
          <input type="text" name="stat_num_${i}" value="${UI.escape(s.num)}" placeholder="Number" />
          <input type="text" name="stat_lab_${i}" value="${UI.escape(s.label)}" placeholder="Label" />
          <button type="button" class="icon-btn" data-rm-stat="${i}" title="Remove statistic">×</button>
        </div>
      `).join('');

      root.innerHTML = `
        <div class="form-grid form-grid-2">
          <label class="field">
            <span>Display name</span>
            <input type="text" name="name" value="${UI.escape(Store.about.name)}" required />
          </label>
          <label class="field">
            <span>Professional title</span>
            <input type="text" name="title" value="${UI.escape(Store.about.title)}" />
          </label>
        </div>

        <div class="field">
          <span>Biography</span>
          <div class="bio-list js-bio">${bio}</div>
          <button type="button" class="btn btn-ghost btn-sm js-add-bio">+ Add paragraph</button>
        </div>

        <div class="field">
          <span>Statistics</span>
          <div class="stat-list js-stats">${stats}</div>
          <button type="button" class="btn btn-ghost btn-sm js-add-stat">+ Add stat</button>
        </div>

        <div class="form-grid form-grid-2">
          <div class="field">
            <span>Profile picture</span>
            <div class="dropzone js-avatar">
              ${Store.about.avatar
                ? `<img src="${Store.about.avatar}" alt="avatar" /><button type="button" class="dz-remove" data-rm-avatar>Remove</button>`
                : `<div class="dz-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6 18c1-3 4-5 6-5s5 2 6 5"/></svg><span>Click or drop an image</span></div>`}
              <input type="file" accept="image/*" hidden />
            </div>
          </div>
          <div class="field">
            <span>Resume (PDF)</span>
            <div class="dropzone js-resume">
              ${Store.about.resume
                ? `<div class="resume-card"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></svg><strong>${UI.escape(Store.about.resume.name)}</strong><small>${Math.round((Store.about.resume.data?.length||0)/1024)} KB</small></div><button type="button" class="dz-remove" data-rm-resume>Remove</button>`
                : `<div class="dz-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6M9 15l3 3 3-3"/></svg><span>Click or drop a PDF</span></div>`}
              <input type="file" accept="application/pdf" hidden />
            </div>
          </div>
        </div>
      `;

      // Bio interactions
      root.querySelector('.js-add-bio').onclick = () => {
        Store.about.bio.push('');
        rebuild();
      };
      root.querySelectorAll('[data-rm-bio]').forEach(b => b.onclick = () => {
        Store.about.bio.splice(+b.dataset.rmBio, 1);
        rebuild();
      });
      root.querySelector('.js-add-stat').onclick = () => {
        Store.about.stats.push({ num: '0', label: 'New stat' });
        rebuild();
      };
      root.querySelectorAll('[data-rm-stat]').forEach(b => b.onclick = () => {
        Store.about.stats.splice(+b.dataset.rmStat, 1);
        rebuild();
      });

      const avatarEl = root.querySelector('.js-avatar');
      const avatarFile = avatarEl.querySelector('input');
      avatarEl.onclick = (e) => {
        if (e.target.closest('[data-rm-avatar]')) { Store.about.avatar = ''; Store.persist(); Admin.renderAbout?.(); adminOpen(); return; }
        avatarFile.click();
      };
      avatarFile.onchange = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        if (f.size > 2 * 1024 * 1024) { UI.Toast.warning('Too large', 'Max 2 MB.'); return; }
        Store.about.avatar = await UI.readFileAsDataURL(f);
        Store.persist();
        Admin.renderAbout?.(); adminOpen();
      };

      const resumeEl = root.querySelector('.js-resume');
      const resumeFile = resumeEl.querySelector('input');
      resumeEl.onclick = (e) => {
        if (e.target.closest('[data-rm-resume]')) { Store.about.resume = null; Store.persist(); Admin.renderAbout?.(); adminOpen(); return; }
        resumeFile.click();
      };
      resumeFile.onchange = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        if (f.size > 6 * 1024 * 1024) { UI.Toast.warning('Too large', 'Max 6 MB.'); return; }
        Store.about.resume = { name: f.name, data: await UI.readFileAsDataURL(f) };
        Store.persist();
        UI.Toast.success('Resume uploaded', f.name);
        Admin.renderAbout?.(); adminOpen();
      };

      // We have an adminOpen() that re-runs the editor — but if it doesn't exist,
      // fall back to rebuilding the form in place.
      function rebuild() { Store.persist(); Admin.renderAbout?.(); if (typeof adminOpen === 'function') adminOpen(); }

      // Save handler collects inputs into Store.about
      UI.openDrawer({
        title: 'Edit About Me',
        content: root,
        saveLabel: 'Save',
        onSave: (body) => {
          const fd = new FormData(body);
          Store.about.name = fd.get('name')?.trim() || Store.about.name;
          Store.about.title = fd.get('title')?.trim() || Store.about.title;
          Store.about.bio = body.querySelectorAll('[name^="bio_"]').length
            ? Array.from(body.querySelectorAll('[name^="bio_"]')).map(t => t.value.trim()).filter(Boolean)
            : Store.about.bio;
          Store.about.stats = body.querySelectorAll('[name^="stat_num_"]').length
            ? Array.from(body.querySelectorAll('[name^="stat_num_"]')).map((n, i) => ({
                num: n.value,
                label: body.querySelector(`[name="stat_lab_${i}"]`)?.value || '',
              }))
            : Store.about.stats;
          Store.persist();
          UI.Toast.success('About saved', 'Your portfolio About section updated.');
          Admin.renderAbout?.();
          return true;
        },
      });
    },

    // ----- Journey timeline -----
    addMilestone() {
      Store.journey.push({ id: genId('j'), year: 'Year', title: 'New milestone', body: '', upcoming: false });
      Store.persist();
    },
    async removeMilestone(id) {
      const ok = await UI.confirm({ title: 'Remove milestone?', message: 'This entry will disappear from your timeline.', okLabel: 'Remove' });
      if (!ok) return;
      Store.remove(Store.journey, id);
      Notifications.push('warning', 'Milestone removed', '', { toast: false });
    },
    editMilestone(id) {
      const m = Store.findById(Store.journey, id); if (!m) return;
      const root = document.createElement('div');
      root.className = 'editor-form';
      root.innerHTML = `
        <div class="form-grid form-grid-2">
          <label class="field"><span>Year</span><input name="year" value="${UI.escape(m.year)}"/></label>
          <label class="switch"><input type="checkbox" name="upcoming" ${m.upcoming?'checked':''}/><span>Upcoming (dashed)</span></label>
        </div>
        <label class="field"><span>Title</span><input name="title" value="${UI.escape(m.title)}" required/></label>
        <label class="field"><span>Description</span><textarea name="body" rows="3">${UI.escape(m.body)}</textarea></label>
      `;
      UI.openDrawer({
        title: 'Edit milestone', content: root, saveLabel: 'Save',
        onSave: (body) => {
          const fd = new FormData(body);
          m.year = fd.get('year') || '';
          m.title = fd.get('title') || m.title;
          m.body = fd.get('body') || '';
          m.upcoming = !!fd.get('upcoming');
          Store.persist();
          UI.Toast.success('Milestone saved', m.title);
          Admin.renderJourney?.();
          return true;
        },
      });
    },

    // ----- Goals -----
    addGoal(group) {
      Store.goals[group].push({ id: genId('g'), label: 'New goal', done: false, priority: '' });
      Store.persist();
    },
    async removeGoal(group, id) {
      const ok = await UI.confirm({ title: 'Remove goal?', message: 'This will permanently remove the goal.', okLabel: 'Remove' });
      if (!ok) return;
      Store.remove(Store.goals[group], id);
    },
    toggleGoal(group, id) {
      const g = Store.findById(Store.goals[group], id); if (!g) return;
      g.done = !g.done;
      Store.persist();
    },
    editGoal(group, id) {
      const g = Store.findById(Store.goals[group], id); if (!g) return;
      const root = document.createElement('div');
      root.className = 'editor-form';
      root.innerHTML = `
        <label class="field"><span>Label</span><input name="label" value="${UI.escape(g.label)}" required/></label>
        <label class="field"><span>Priority / timeframe</span><input name="priority" value="${UI.escape(g.priority||'')}" placeholder="Q3 2026 / Ongoing"/></label>
        <label class="switch"><input type="checkbox" name="done" ${g.done?'checked':''}/><span>Done</span></label>
      `;
      UI.openDrawer({
        title: 'Edit goal', content: root, saveLabel: 'Save',
        onSave: (body) => {
          const fd = new FormData(body);
          g.label = fd.get('label') || g.label;
          g.priority = fd.get('priority') || '';
          g.done = !!fd.get('done');
          Store.persist();
          UI.Toast.success('Goal saved', g.label);
          Admin.renderGoals?.();
          return true;
        },
      });
    },
  };

  global.About = About;
})(window);
