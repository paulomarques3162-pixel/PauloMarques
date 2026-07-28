/* ===========================================================
   projects.js — Project CRUD + reorder
   =========================================================== */
(function (global) {
  'use strict';

  const CATEGORIES = ['Web', 'UI Design', 'Python', 'Challenge', 'Mobile', 'Other'];
  const COLORS = ['t1','t2','t3','t4','t5','t6'];

  const Projects = {
    CATEGORIES,

    list() {
      return [...Store.projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },

    featured() { return this.list().filter(p => p.featured); },

    create() {
      const p = {
        id: genId('p'),
        title: 'New project',
        description: '',
        stack: [],
        category: 'Web',
        github: '',
        demo: '',
        date: new Date().toISOString().slice(0, 7),
        featured: false,
        order: Store.projects.length,
        status: 'draft',
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        thumbnail: '',
        screenshots: [],
      };
      Store.projects.push(p);
      Store.persist();
      Notifications.push('info', 'Project created', `Draft "${p.title}" added to the list.`, { toast: false });
      return p;
    },

    update(id, patch) {
      const p = Store.findById(Store.projects, id);
      if (!p) return null;
      Object.assign(p, patch);
      Store.persist();
      Notifications.push('success', 'Project saved', `"${p.title}" updated.`, { toast: false });
      return p;
    },

    async remove(id) {
      const p = Store.findById(Store.projects, id);
      if (!p) return false;
      const ok = await UI.confirm({
        title: 'Delete project?',
        message: `"${p.title}" will be permanently removed from your portfolio.`,
        okLabel: 'Delete',
      });
      if (!ok) return false;
      Store.remove(Store.projects, id);
      Notifications.push('warning', 'Project removed', `"${p.title}" was deleted.`, { toast: false });
      return true;
    },

    toggleFeatured(id) {
      const p = Store.findById(Store.projects, id);
      if (!p) return;
      p.featured = !p.featured;
      Store.persist();
    },

    reorder(orderedIds) {
      orderedIds.forEach((id, idx) => {
        const p = Store.findById(Store.projects, id);
        if (p) p.order = idx;
      });
      Store.persist();
    },

    /**
     * Render the project editor drawer content. Returns the form root.
     */
    renderEditor(project, opts = {}) {
      const root = document.createElement('div');
      root.className = 'editor-form';
      root.innerHTML = `
        <div class="form-grid form-grid-2">
          <label class="field">
            <span>Title</span>
            <input type="text" name="title" value="${UI.escape(project.title)}" required />
          </label>
          <label class="field">
            <span>Category</span>
            <select name="category">
              ${CATEGORIES.map(c => `<option value="${c}" ${project.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </label>
        </div>

        <label class="field">
          <span>Short description</span>
          <textarea name="description" rows="3" required>${UI.escape(project.description)}</textarea>
        </label>

        <div class="form-grid form-grid-2">
          <label class="field">
            <span>GitHub URL</span>
            <input type="url" name="github" value="${UI.escape(project.github || '')}" placeholder="https://github.com/..." />
          </label>
          <label class="field">
            <span>Live Demo URL</span>
            <input type="url" name="demo" value="${UI.escape(project.demo || '')}" placeholder="https://..." />
          </label>
        </div>

        <div class="form-grid form-grid-3">
          <label class="field">
            <span>Date</span>
            <input type="month" name="date" value="${UI.escape(project.date || '')}" />
          </label>
          <label class="field">
            <span>Status</span>
            <select name="status">
              <option value="draft" ${project.status === 'draft' ? 'selected' : ''}>Draft</option>
              <option value="published" ${project.status === 'published' ? 'selected' : ''}>Published</option>
            </select>
          </label>
          <label class="field">
            <span>Card color</span>
            <select name="color">
              ${COLORS.map(c => `<option value="${c}" ${project.color === c ? 'selected' : ''}>${c.toUpperCase()}</option>`).join('')}
            </select>
          </label>
        </div>

        <div class="field">
          <span>Technologies (comma-separated)</span>
          <input type="text" name="stack" value="${UI.escape((project.stack || []).join(', '))}" placeholder="HTML, CSS, JavaScript" />
        </div>

        <div class="form-grid form-grid-2">
          <div class="field">
            <span>Thumbnail</span>
            <div class="dropzone js-thumb">
              ${project.thumbnail
                ? `<img src="${project.thumbnail}" alt="thumb" /><button type="button" class="dz-remove" data-action="remove-thumb">Remove</button>`
                : `<div class="dz-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span>Click or drop an image</span></div>`}
              <input type="file" accept="image/*" hidden />
            </div>
          </div>
          <div class="field">
            <span>Featured?</span>
            <label class="switch">
              <input type="checkbox" name="featured" ${project.featured ? 'checked' : ''} />
              <span>Show on portfolio home</span>
            </label>
          </div>
        </div>

        <div class="field">
          <span>Screenshots</span>
          <div class="dropzone dropzone-grid js-shots">
            ${(project.screenshots || []).map((src, i) => `
              <div class="dz-thumb">
                <img src="${src}" alt="shot"/>
                <button type="button" data-action="remove-shot" data-index="${i}">×</button>
              </div>
            `).join('')}
            <label class="dz-add">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              <input type="file" accept="image/*" multiple hidden />
            </label>
          </div>
        </div>
      `;

      // Wire interactions
      const thumbEl = root.querySelector('.js-thumb');
      const thumbFile = thumbEl.querySelector('input[type="file"]');
      thumbEl.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="remove-thumb"]')) {
          project.thumbnail = '';
          Store.persist();
          this.renderEditor(project, opts); // not used
          // Replace node
          thumbEl.outerHTML = thumbEl.outerHTML; // quick refresh
          return;
        }
        thumbFile.click();
      });
      thumbFile.addEventListener('change', async (e) => {
        const f = e.target.files[0]; if (!f) return;
        if (f.size > 2 * 1024 * 1024) { UI.Toast.warning('Image too large', 'Max 2 MB.'); return; }
        project.thumbnail = await UI.readFileAsDataURL(f);
        Store.persist();
        thumbEl.innerHTML = `<img src="${project.thumbnail}" alt="thumb" /><button type="button" class="dz-remove" data-action="remove-thumb">Remove</button>`;
      });

      const shotEl = root.querySelector('.js-shots');
      const shotFile = shotEl.querySelector('input[type="file"]');
      shotEl.addEventListener('click', async (e) => {
        const rm = e.target.closest('[data-action="remove-shot"]');
        if (rm) {
          const i = +rm.dataset.index;
          project.screenshots.splice(i, 1);
          Store.persist();
          // re-render inline
          const wraps = shotEl.querySelectorAll('.dz-thumb');
          wraps[i]?.remove();
          rm.parentElement.remove();
          // Rebuild thumbnails (re-index)
          const newShots = shotEl.querySelectorAll('.dz-thumb');
          newShots.forEach((node, idx) => {
            node.querySelector('[data-action="remove-shot"]').dataset.index = idx;
          });
          return;
        }
        if (e.target.closest('.dz-add')) shotFile.click();
      });
      shotFile.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files || []);
        for (const f of files) {
          if (f.size > 2 * 1024 * 1024) { UI.Toast.warning('Skipped large image', f.name); continue; }
          const data = await UI.readFileAsDataURL(f);
          project.screenshots.push(data);
        }
        Store.persist();
        e.target.value = '';
        // Quickly rebuild screenshots
        const existing = shotEl.querySelectorAll('.dz-thumb');
        existing.forEach(n => n.remove());
        const addLabel = shotEl.querySelector('.dz-add');
        project.screenshots.forEach((src, i) => {
          const div = document.createElement('div');
          div.className = 'dz-thumb';
          div.innerHTML = `<img src="${src}" alt="shot"/><button type="button" data-action="remove-shot" data-index="${i}">×</button>`;
          shotEl.insertBefore(div, addLabel);
        });
      });

      return root;
    },

    collectForm(formEl, project) {
      const fd = new FormData(formEl);
      project.title       = fd.get('title')?.trim() || project.title;
      project.category    = fd.get('category') || project.category;
      project.description = fd.get('description')?.trim() || '';
      project.github      = fd.get('github')?.trim() || '';
      project.demo        = fd.get('demo')?.trim() || '';
      project.date        = fd.get('date') || project.date;
      project.status      = fd.get('status') || 'draft';
      project.color       = fd.get('color') || project.color;
      project.stack       = (fd.get('stack') || '').split(',').map(s => s.trim()).filter(Boolean);
      project.featured    = !!fd.get('featured');
      return project;
    },

    openEditor(project) {
      const formRoot = this.renderEditor(project);
      UI.openDrawer({
        title: project.title?.startsWith('New project') ? 'New project' : 'Edit project',
        content: formRoot,
        saveLabel: 'Save',
        onSave: (body) => {
          this.collectForm(body, project);
          Store.upsert(Store.projects, project);
          UI.Toast.success('Project saved', `"${project.title}" updated.`);
          Admin.renderProjects?.();
          return true;
        },
      });
    },
  };

  global.Projects = Projects;
})(window);
