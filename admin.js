/* ===========================================================
   admin.js — Admin entry point / router / shell.
   Orchestrates the SPA: sidebar nav, top bar, route switching,
   view rendering, and lazy module coordination.
   =========================================================== */
(function (global) {
  'use strict';

  const ROUTES = [
    { id: 'dashboard',    title: 'Dashboard',     icon: 'grid',     render: (el) => Dashboard.render(el) },
    { id: 'projects',     title: 'Projects',      icon: 'folder',   render: (el) => Admin.renderProjects(el),  badge: () => Store.projects.length },
    { id: 'skills',       title: 'Skills',        icon: 'tool',     render: (el) => Admin.renderSkills(el),    badge: () => Store.skills.filter(s => s.visible).length },
    { id: 'social',       title: 'Social Links',  icon: 'share',    render: (el) => Admin.renderSocial(el) },
    { id: 'about',        title: 'About Me',      icon: 'user',     render: (el) => Admin.renderAbout(el) },
    { id: 'journey',      title: 'Journey',       icon: 'map',      render: (el) => Admin.renderJourney(el) },
    { id: 'goals',        title: 'Goals',         icon: 'target',   render: (el) => Admin.renderGoals(el) },
    { id: 'messages',     title: 'Messages',      icon: 'inbox',    render: (el) => Admin.renderMessages(el), badge: () => Messages.unreadCount() },
    { id: 'notifications',title: 'Notifications', icon: 'bell',     render: (el) => Admin.renderNotifications(el), badge: () => Notifications.unreadCount() },
    { id: 'settings',     title: 'Settings',      icon: 'gear',     render: (el) => Admin.renderSettings(el) },
  ];

  const ICON_SVG = {
    grid:    '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
    folder:  '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    tool:    '<path d="m14.7 6.3 3 3-9 9H5.7v-3zM9 16l3-3"/>',
    share:   '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.5 13.5 7 4M15.5 6.5l-7 4"/>',
    user:    '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    map:     '<path d="M3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15"/>',
    target:  '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    inbox:   '<path d="M3 14h6l1 3h4l1-3h6M3 14V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9"/>',
    bell:    '<path d="M6 9a6 6 0 1 1 12 0c0 6 3 8 3 8H3s3-2 3-8M10 21a2 2 0 0 0 4 0"/>',
    gear:    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    search:  '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    logout:  '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    plus:    '<path d="M12 5v14M5 12h14"/>',
    trash:   '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6M10 11v6M14 11v6"/>',
    edit:    '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>',
    drag:    '<circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>',
  };

  function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_SVG[name] || ''}</svg>`; }

  const Admin = {
    currentRoute: 'dashboard',
    elShell: null,
    elMain: null,

    boot() {
      if (!Auth.requireAuth()) { this.renderLogin(); return; }
      this.renderShell();
      this.go(this.currentRoute);
      Store.subscribe(() => this.refreshBadges());
      this.refreshBadges();
    },

    renderLogin() {
      document.body.classList.add('login-mode');
      const root = document.createElement('div');
      root.className = 'login-root';
      root.innerHTML = `
        <div class="login-bg" aria-hidden="true">
          <div class="blob b1"></div><div class="blob b2"></div>
        </div>
        <div class="login-card">
          <div class="brand">
            <span class="dot"></span><strong>Paulo</strong>.cms
          </div>
          <h1>Welcome back 👋</h1>
          <p class="muted">Sign in to manage your portfolio CMS.</p>

          <form class="login-form js-login">
            <label><span>Email</span><input type="email" name="email" required autocomplete="email" value="paulomarques@gmail.com" /></label>
            <label><span>Password</span><input type="password" name="password" required autocomplete="current-password" value="040206" /></label>
            <button class="btn btn-primary" type="submit">
              <span class="js-label">Sign in</span>
            </button>
          </form>

          <div class="callout callout-info" style="margin-top:18px;">
            <strong>Demo credentials</strong>
            <p>Email: <code>admin@portfolio.dev</code> · Password: <code>admin123</code></p>
          </div>
        </div>
      `;
      document.body.appendChild(root);

      const form = root.querySelector('.js-login');
      const btn = form.querySelector('button');
      form.onsubmit = async (e) => {
        e.preventDefault();
        btn.disabled = true; btn.querySelector('.js-label').textContent = 'Signing in…';
        try {
          const fd = new FormData(form);
          await Auth.login(fd.get('email'), fd.get('password'));
          UI.Toast.success('Welcome back!', 'Loading your dashboard…');
          setTimeout(() => location.reload(), 600);
        } catch (e) {
          UI.Toast.error('Sign in failed', e.message);
          btn.disabled = false; btn.querySelector('.js-label').textContent = 'Sign in';
        }
      };
    },

    renderShell() {
      document.body.classList.remove('login-mode');
      this.elShell = document.createElement('div');
      this.elShell.className = 'admin-shell';
      this.elShell.innerHTML = `
        <aside class="sidebar">
          <a class="brand" href="#" data-nav="dashboard">
            <span class="dot"></span><strong>Paulo</strong>.cms
          </a>
          <nav class="side-nav">
            ${ROUTES.map(r => `
              <a class="side-link" data-nav="${r.id}" href="#${r.id}">
                <span class="sl-icon">${icon(r.icon)}</span>
                <span class="sl-label">${r.title}</span>
                <span class="sl-badge" data-badge="${r.id}"></span>
              </a>
            `).join('')}
          </nav>
          <div class="side-foot">
            <a href="portfolio-live.html" target="_blank" class="side-link">
              <span class="sl-icon">${icon('share')}</span>
              <span class="sl-label">View live site ↗</span>
            </a>
          </div>
        </aside>
        <div class="main">
          <header class="topbar">
            <div class="search">
              <span class="search-icon">${icon('search')}</span>
              <input type="search" placeholder="Search projects, skills…" class="js-search" />
            </div>
            <div class="top-actions">
              <button class="icon-btn bell js-bell" data-bell>
                ${icon('bell')}
                <span class="notif-pip" data-bell-pip></span>
              </button>
              <div class="user-menu js-user">
                <div class="avatar">${(Store.auth.user.name||'P')[0].toUpperCase()}</div>
                <span class="user-name">${UI.escape(Store.auth.user.name || 'Paulo')}</span>
                <div class="user-drop">
                  <a href="#" data-action="account">Account & Security</a>
                  <a href="#" data-action="export">Export data (JSON)</a>
                  <a href="#" data-action="reset">Reset everything…</a>
                  <a href="#" data-action="logout" class="danger">Sign out</a>
                </div>
              </div>
            </div>
          </header>
          <main class="page-host js-page" id="page"></main>
        </div>
      `;
      document.body.appendChild(this.elShell);
      this.elMain = this.elShell.querySelector('.js-page');

      // Wire sidebar + topbar
      this.elShell.querySelectorAll('[data-nav]').forEach(el => {
        el.onclick = (e) => {
          if (el.getAttribute('target') === '_blank') return;
          e.preventDefault();
          this.go(el.dataset.nav);
        };
      });
      const search = this.elShell.querySelector('.js-search');
      search.addEventListener('input', UI.debounce(() => this.runSearch(search.value), 200));
      const bell = this.elShell.querySelector('[data-bell]');
      bell.onclick = (e) => {
        e.stopPropagation();
        this.go('notifications');
      };
      const um = this.elShell.querySelector('.js-user');
      um.querySelector('.avatar').onclick = (e) => { e.stopPropagation(); UI.toggleDropdown(um); };
      um.querySelectorAll('[data-action]').forEach(a => {
        a.onclick = (e) => {
          e.preventDefault();
          UI.toggleDropdown(um); // close
          const act = a.dataset.action;
          if (act === 'logout') { Auth.logout(); UI.Toast.info('Signed out'); setTimeout(() => location.reload(), 400); }
          if (act === 'account') Settings.openSecurityEditor();
          if (act === 'export') Settings.exportData();
          if (act === 'reset') Settings.reset();
        };
      });

      this.refreshBadges();
    },

    refreshBadges() {
      if (!this.elShell) return;
      ROUTES.forEach(r => {
        const badge = this.elShell.querySelector(`[data-badge="${r.id}"]`);
        if (!badge) return;
        const val = r.badge ? r.badge() : null;
        if (val) {
          badge.textContent = val > 99 ? '99+' : val;
          badge.style.display = 'inline-flex';
        } else {
          badge.style.display = 'none';
        }
      });

      // Bell pip
      const pip = this.elShell?.querySelector('[data-bell-pip]');
      if (pip) {
        const c = Notifications.unreadCount();
        pip.style.display = c > 0 ? 'inline-flex' : 'none';
        pip.textContent = c > 9 ? '9+' : c;
      }
    },

    refreshNotifications() {
      // Just refresh the bell pip + badge; if currently viewing notifications page, re-render
      this.refreshBadges();
      if (this.currentRoute === 'notifications') this.go('notifications');
    },

    refreshDashboard() {
      if (this.currentRoute === 'dashboard') this.go('dashboard');
    },

    go(id) {
      const route = ROUTES.find(r => r.id === id) || ROUTES[0];
      this.currentRoute = route.id;
      this.elMain.innerHTML = '';
      // Active state in sidebar
      this.elShell.querySelectorAll('.side-link').forEach(el => {
        el.classList.toggle('active', el.dataset.nav === route.id);
      });
      window.scrollTo({ top: 0 });
      try { route.render(this.elMain); } catch (e) { console.error(e); this.elMain.innerHTML = '<div class="error">Failed to render: ' + e.message + '</div>'; }
    },

    runSearch(q) { /* simple search: navigates by partial title match */
      if (!q) return;
      q = q.toLowerCase().trim();
      const matches = [];
      Projects.list().forEach(p => { if ((p.title||'').toLowerCase().includes(q)) matches.push({ route: 'projects', id: p.id }); });
      Store.skills.forEach(s => { if ((s.name||'').toLowerCase().includes(q)) matches.push({ route: 'skills', id: s.id }); });
      if (!matches.length) return this.go(this.currentRoute);
      const target = matches[0];
      this.go(target.route);
      // Briefly highlight the matched item
      setTimeout(() => {
        const node = document.querySelector(`[data-row-id="${target.id}"]`);
        node?.classList.add('flash');
        node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    },

    // ----- Projects view -----
    renderProjects(el) {
      el.innerHTML = `
        <header class="page-head">
          <div>
            <h1>Projects</h1>
            <p>Add, edit and reorder the cards that appear on your portfolio.</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary js-new">+ New Project</button>
          </div>
        </header>
        <div class="filter-row">
          ${Projects.CATEGORIES.map(c => `<button class="chip" data-filter="${c}">${c}</button>`).join('')}
          <button class="chip chip-active" data-filter="all">All</button>
        </div>
        <div class="list-grid js-list"></div>
      `;

      const renderList = (filter = 'all') => {
        const list = el.querySelector('.js-list');
        const items = Projects.list().filter(p => filter === 'all' || p.category === filter);
        list.innerHTML = items.length ? items.map(p => this.projectRow(p)).join('') : `<div class="empty-card">No projects yet — click <strong>+ New Project</strong> to add your first one.</div>`;
        list.querySelectorAll('[data-act]').forEach(b => {
          const id = b.closest('[data-row-id]').dataset.rowId;
          b.onclick = (e) => {
            const act = b.dataset.act;
            const p = Store.findById(Store.projects, id);
            if (!p) return;
            if (act === 'edit')   Projects.openEditor(p);
            if (act === 'delete') Projects.remove(id).then(() => this.renderProjects(el));
            if (act === 'featured') { Projects.toggleFeatured(id); UI.Toast.info('Toggled featured'); this.renderProjects(el); }
            if (act === 'up')   { this.swapOrder(p, -1); this.renderProjects(el); }
            if (act === 'down') { this.swapOrder(p, +1); this.renderProjects(el); }
          };
        });

        // Drag and drop reorder
        let dragId = null;
        list.querySelectorAll('.drag-handle').forEach(h => {
          const row = h.closest('[data-row-id]');
          row.draggable = true;
          row.addEventListener('dragstart', () => { dragId = row.dataset.rowId; row.classList.add('dragging'); });
          row.addEventListener('dragend',   () => { row.classList.remove('dragging'); commit(); });
          row.addEventListener('dragover',  (e) => { e.preventDefault(); const r2 = row.getBoundingClientRect(); const after = (e.clientY - r2.top) > r2.height/2; row.style.borderTop = after ? '' : '2px solid var(--blue)'; row.style.borderBottom = after ? '2px solid var(--blue)' : ''; });
          row.addEventListener('dragleave', () => { row.style.borderTop = ''; row.style.borderBottom = ''; });
          row.addEventListener('drop',      (e) => {
            e.preventDefault();
            row.style.borderTop = ''; row.style.borderBottom = '';
            if (!dragId || dragId === row.dataset.rowId) return;
            const r2 = row.getBoundingClientRect();
            const after = (e.clientY - r2.top) > r2.height / 2;
            const ordered = Projects.list().map(p => p.id);
            const fromIdx = ordered.indexOf(dragId);
            const toIdx = ordered.indexOf(row.dataset.rowId);
            ordered.splice(fromIdx, 1);
            ordered.splice(after ? toIdx + 1 : toIdx, 0, dragId);
            Projects.reorder(ordered);
          });
        });
        function commit() { UI.Toast.success('Order saved', ''); }
      };

      el.querySelector('.js-new').onclick = () => { const p = Projects.create(); Projects.openEditor(p); };
      el.querySelectorAll('[data-filter]').forEach(b => {
        b.onclick = () => {
          el.querySelectorAll('[data-filter]').forEach(x => x.classList.remove('chip-active'));
          b.classList.add('chip-active');
          renderList(b.dataset.filter);
        };
      });
      renderList();
    },

    projectRow(p) {
      return `
        <article class="row-card" data-row-id="${p.id}">
          <div class="row-drag drag-handle">${icon('drag')}</div>
          <div class="row-thumb ${p.color || 't1'}">${p.thumbnail ? `<img src="${p.thumbnail}" />` : `<span class="thumb-code">…</span>`}</div>
          <div class="row-meta">
            <div class="row-head">
              <h3>${UI.escape(p.title)}</h3>
              ${p.featured ? '<span class="badge featured">⭐ Featured</span>' : ''}
              ${p.status === 'draft' ? '<span class="badge draft">Draft</span>' : '<span class="badge published">Published</span>'}
            </div>
            <p class="muted">${UI.escape((p.description||'').slice(0, 120))}${(p.description||'').length>120?'…':''}</p>
            <div class="row-tags">
              ${(p.stack||[]).slice(0,4).map(s => `<span class="pill">${UI.escape(s)}</span>`).join('')}
              ${(p.stack||[]).length > 4 ? `<span class="pill muted">+${p.stack.length-4}</span>` : ''}
              <span class="pill cat">${UI.escape(p.category||'Web')}</span>
              <span class="pill muted">${UI.escape(p.date||'')}</span>
            </div>
          </div>
          <div class="row-actions">
            <button data-act="edit"      title="Edit">${icon('edit')}</button>
            <button data-act="featured"  title="${p.featured?'Unfeature':'Feature'}">⭐</button>
            <button data-act="up"        title="Move up">↑</button>
            <button data-act="down"      title="Move down">↓</button>
            <button data-act="delete"    title="Delete" class="danger">${icon('trash')}</button>
          </div>
        </article>
      `;
    },

    swapOrder(project, delta) {
      const list = Projects.list();
      const i = list.findIndex(p => p.id === project.id);
      const j = i + delta;
      if (j < 0 || j >= list.length) return;
      [list[i].order, list[j].order] = [list[j].order, list[i].order];
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      Projects.reorder(list.map(p => p.id));
    },

    // ----- Skills view -----
    renderSkills(el) {
      el.innerHTML = `
        <header class="page-head">
          <div>
            <h1>Skills</h1>
            <p>Show off your tech stack — keep visible skills concise, set proficiency, and mark goals as locked.</p>
          </div>
          <div class="page-actions"><button class="btn btn-primary js-new">+ New Skill</button></div>
        </header>
        <div class="skills-grid-admin js-list"></div>
      `;
      el.querySelector('.js-new').onclick = () => { const s = Skills.create(); Skills.openEditor(s); };

      const list = el.querySelector('.js-list');
      const draw = () => {
        list.innerHTML = Store.skills.map(s => `
          <article class="skill-admin ${s.locked?'locked':''}" data-row-id="${s.id}">
            <div class="sa-icon">${Skills.iconSVG(s.icon)}</div>
            <div class="sa-meta">
              <strong>${UI.escape(s.name)}</strong>
              <small>${UI.escape(s.badge || '')}</small>
              <div class="sa-bar"><span style="width:${s.proficiency}%"></span></div>
            </div>
            <div class="sa-actions">
              <button data-act="edit" title="Edit">${icon('edit')}</button>
              <button data-act="visible" title="${s.visible?'Hidden (click to show)':'Visible'}">${s.visible?'👁':'🚫'}</button>
              <button data-act="delete" title="Delete" class="danger">${icon('trash')}</button>
            </div>
          </article>
        `).join('');
        list.querySelectorAll('[data-act]').forEach(b => {
          const id = b.closest('[data-row-id]').dataset.rowId;
          b.onclick = () => {
            const act = b.dataset.act;
            if (act === 'edit')    Skills.openEditor(Store.findById(Store.skills, id));
            if (act === 'delete')  Skills.remove(id).then(() => draw());
            if (act === 'visible') { Skills.toggleVisible(id); UI.Toast.info('Toggled visibility'); draw(); }
          };
        });
      };
      draw();
    },

    // ----- Social view -----
    renderSocial(el) {
      el.innerHTML = `
        <header class="page-head">
          <div><h1>Social Links</h1><p>Manage the icons displayed in your portfolio's contact section.</p></div>
        </header>
        <div class="social-grid js-list"></div>
      `;
      const list = el.querySelector('.js-list');
      list.innerHTML = Social.PLATFORMS.map(p => {
        const data = Store.social[p.id] || { url: '', enabled: false };
        return `
          <button class="social-tile" data-row-id="${p.id}" data-platform="${p.id}">
            <span class="st-icon">${Social.iconSVG(p.icon)}</span>
            <strong>${p.name}</strong>
            <small class="${data.enabled ? 'visible' : 'hidden'}">${data.enabled ? 'Visible' : 'Hidden'}</small>
            <span class="st-url">${UI.escape(data.url || p.hint)}</span>
          </button>
        `;
      }).join('');
      list.querySelectorAll('.social-tile').forEach(t => {
        t.onclick = () => Social.openEditor(t.dataset.platform);
      });
    },

    // ----- About view -----
    renderAbout(el) {
      const a = Store.about;
      el.innerHTML = `
        <header class="page-head">
          <div><h1>About Me</h1><p>Edit your bio, profile picture, resume and stats.</p></div>
          <div class="page-actions"><button class="btn btn-primary js-edit">✎ Edit</button></div>
        </header>
        <div class="about-grid-admin">
          <section class="card">
            <header class="card-head"><h3>Identity</h3></header>
            <div class="about-row">
              <div class="avatar-big">${a.avatar ? `<img src="${a.avatar}" />` : UI.escape((a.name||'?')[0])}</div>
              <div>
                <strong>${UI.escape(a.name)}</strong>
                <p>${UI.escape(a.title)}</p>
                ${a.resume ? `<p class="muted">Resume: ${UI.escape(a.resume.name)}</p>` : `<p class="muted">No resume uploaded.</p>`}
              </div>
            </div>
          </section>
          <section class="card">
            <header class="card-head"><h3>Stats</h3></header>
            <div class="stats-grid">
              ${a.stats.map(s => `<div class="mini-stat"><strong>${UI.escape(s.num)}</strong><small>${UI.escape(s.label)}</small></div>`).join('')}
            </div>
          </section>
          <section class="card card-wide">
            <header class="card-head"><h3>Biography</h3></header>
            <div class="bio-render">${a.bio.map(p => `<p>${UI.escape(p)}</p>`).join('')}</div>
          </section>
        </div>
      `;
      el.querySelector('.js-edit').onclick = () => About.openEditor();
    },

    // ----- Journey view -----
    renderJourney(el) {
      el.innerHTML = `
        <header class="page-head">
          <div><h1>Learning Journey</h1><p>The timeline of milestones your visitors see. Drag to reorder.</p></div>
          <div class="page-actions"><button class="btn btn-primary js-new">+ Add milestone</button></div>
        </header>
        <div class="timeline-admin js-list"></div>
      `;
      el.querySelector('.js-new').onclick = () => { About.addMilestone(); this.renderJourney(el); };
      const draw = () => {
        el.querySelector('.js-list').innerHTML = Store.journey.map(m => `
          <article class="tla-row" data-row-id="${m.id}">
            <span class="tla-dot ${m.upcoming?'upcoming':''}"></span>
            <div class="tla-meta">
              <span class="yr">${UI.escape(m.year)}</span>
              <h3>${UI.escape(m.title)}</h3>
              <p>${UI.escape(m.body)}</p>
            </div>
            <div class="tla-actions">
              <button data-act="edit" title="Edit">${icon('edit')}</button>
              <button data-act="delete" title="Delete" class="danger">${icon('trash')}</button>
            </div>
          </article>
        `).join('');
        el.querySelectorAll('[data-act]').forEach(b => {
          const id = b.closest('[data-row-id]').dataset.rowId;
          b.onclick = () => {
            const act = b.dataset.act;
            if (act === 'edit')   { About.editMilestone(id); }
            if (act === 'delete') { About.removeMilestone(id).then(() => draw()); }
          };
        });
      };
      draw();
    },

    // ----- Goals view -----
    renderGoals(el) {
      el.innerHTML = `
        <header class="page-head">
          <div><h1>Goals</h1><p>Technical and personal goals shown on your portfolio. Drag is not supported here — use Add / Edit.</p></div>
        </header>
        <div class="goals-grid">
          ${['technical','personal'].map(group => `
            <section class="card">
              <header class="card-head">
                <h3>${group === 'technical' ? 'Technical' : 'Personal & career'}</h3>
                <button class="btn btn-ghost btn-sm js-add" data-group="${group}">+ Add</button>
              </header>
              <ul class="admin-goals">
                ${Store.goals[group].map(g => `
                  <li data-row-id="${g.id}" data-group="${group}">
                    <button class="g-check ${g.done?'done':'todo'}" data-act="toggle">${g.done ? '✓' : '＋'}</button>
                    <span class="g-label ${g.done?'done':''}">${UI.escape(g.label)}</span>
                    <span class="g-priority">${UI.escape(g.priority||'')}</span>
                    <button data-act="edit" class="icon-btn">${icon('edit')}</button>
                    <button data-act="delete" class="icon-btn danger">${icon('trash')}</button>
                  </li>
                `).join('')}
              </ul>
            </section>
          `).join('')}
        </div>
      `;
      el.querySelectorAll('[data-group]').forEach(b => {
        b.onclick = () => { About.addGoal(b.dataset.group); this.renderGoals(el); };
      });
      el.querySelectorAll('[data-act]').forEach(b => {
        const li = b.closest('[data-row-id]');
        const id = li.dataset.rowId, group = li.dataset.group;
        b.onclick = () => {
          const a = b.dataset.act;
          if (a === 'toggle') { About.toggleGoal(group, id); this.renderGoals(el); }
          if (a === 'edit')   { About.editGoal(group, id); }
          if (a === 'delete') { About.removeGoal(group, id).then(() => this.renderGoals(el)); }
        };
      });
    },

    // ----- Messages view -----
    renderMessages(el) {
      el.innerHTML = `
        <header class="page-head">
          <div><h1>Contact messages</h1><p>Submissions from your portfolio contact form.</p></div>
          <div class="page-actions">
            <span class="muted">${Store.messages.length} total · ${Messages.unreadCount()} unread</span>
          </div>
        </header>
        <div class="messages-list js-list"></div>
      `;
      const list = el.querySelector('.js-list');
      if (Store.messages.length === 0) {
        list.innerHTML = `<div class="empty-card">No messages yet. When visitors use the contact form on your portfolio, submissions will appear here.</div>`;
        return;
      }
      list.innerHTML = Store.messages.map(m => `
        <article class="msg-row ${m.read ? '' : 'unread'}" data-row-id="${m.id}" data-act="open">
          <div class="msg-avatar">${(m.name||'?')[0].toUpperCase()}</div>
          <div class="msg-summary">
            <strong>${UI.escape(m.name)} <span class="muted">&lt;${UI.escape(m.email)}&gt;</span></strong>
            <p>${UI.escape(m.subject || '(no subject)')}</p>
          </div>
          <time>${UI.timeAgo(m.timestamp)}</time>
          ${m.delivered ? '<span class="badge delivered">Delivered</span>' : '<span class="badge local">Local only</span>'}
          <button class="msg-delete" data-act="delete" title="Delete">${icon('trash')}</button>
        </article>
      `).join('');
      list.querySelectorAll('[data-act]').forEach(b => {
        const row = b.closest('[data-row-id]'); const id = row.dataset.rowId;
        const act = b.dataset.act;
        b.onclick = (e) => {
          e.stopPropagation();
          if (act === 'open')   Messages.open(id);
          if (act === 'delete') Messages.remove(id).then(() => this.renderMessages(el));
        };
      });
      list.querySelectorAll('.msg-row').forEach(r => {
        r.addEventListener('click', () => Messages.open(r.dataset.rowId));
      });
    },

    // ----- Notifications view -----
    renderNotifications(el) {
      el.innerHTML = `
        <header class="page-head">
          <div><h1>Notifications</h1><p>Recent activity across your portfolio CMS.</p></div>
          <div class="page-actions">
            <button class="btn btn-ghost js-mark">Mark all read</button>
            <button class="btn btn-ghost js-clear">Clear all</button>
          </div>
        </header>
        <div class="notif-list js-list"></div>
      `;
      el.querySelector('.js-mark').onclick = () => Notifications.markAllRead();
      el.querySelector('.js-clear').onclick = () => Notifications.clear();
      const draw = () => {
        el.querySelector('.js-list').innerHTML = Store.notifications.length ? Store.notifications.map(n => `
          <article class="notif ${n.read?'':'unread'} notif-${n.type}" data-row-id="${n.id}">
            <span class="n-dot"></span>
            <div>
              <strong>${UI.escape(n.title)} ${n.read?'':'<span class="pip"></span>'}</strong>
              <p>${UI.escape(n.message||'')}</p>
            </div>
            <time>${UI.timeAgo(n.timestamp)}</time>
          </article>
        `).join('') : `<div class="empty-card">No notifications yet.</div>`;
      };
      draw();
    },

    // ----- Settings view -----
    renderSettings(el) {
      const s = Store.settings;
      el.innerHTML = `
        <header class="page-head">
          <div><h1>Settings</h1><p>Configure email delivery, security and platform behaviour.</p></div>
        </header>
        <div class="settings-grid">
          <section class="card">
            <header class="card-head"><h3>Email delivery</h3><button class="btn btn-ghost js-edit-email">Configure</button></header>
            <p class="muted">Provider: <strong>${UI.escape(s.emailProvider)}</strong></p>
            <p class="muted">Endpoint: <code>${UI.escape(s.emailEndpoint || '(not set)')}</code></p>
            <p class="muted">Delivery email: <strong>${UI.escape(s.adminEmail)}</strong></p>
            <p class="muted">Contact form: <strong>${s.contactEnabled ? 'Enabled' : 'Disabled'}</strong></p>
          </section>
          <section class="card">
            <header class="card-head"><h3>Security</h3><button class="btn btn-ghost js-edit-security">Configure</button></header>
            <p class="muted">Signed in as: <strong>${UI.escape(Auth.getCurrentEmail())}</strong></p>
            <p class="muted">Session timeout: <strong>${s.security.sessionTimeoutMin} min</strong></p>
            <p class="muted"><small>This CMS uses a client-side login gate. Replace with a real backend (Firebase, Supabase, your own server) for production.</small></p>
          </section>
          <section class="card">
            <header class="card-head"><h3>Data</h3></header>
            <p class="muted">Export everything as JSON for backup or migration.</p>
            <div class="data-actions">
              <button class="btn btn-ghost js-export">Export JSON</button>
              <label class="btn btn-ghost js-import">Import JSON<input type="file" accept="application/json" hidden /></label>
              <button class="btn btn-danger js-reset">Reset everything</button>
            </div>
          </section>
          <section class="card card-wide">
            <header class="card-head"><h3>About this build</h3></header>
            <p class="muted">A modular, client-first portfolio CMS — designed so the public portfolio and the admin dashboard stay perfectly in sync, while cleanly separating data, UI, modules, and external services.</p>
            <p class="muted">Total projects: <strong>${Store.projects.length}</strong> · Skills: <strong>${Store.skills.length}</strong> · Messages: <strong>${Store.messages.length}</strong></p>
          </section>
        </div>
      `;
      el.querySelector('.js-edit-email').onclick    = () => Settings.openEmailEditor();
      el.querySelector('.js-edit-security').onclick = () => Settings.openSecurityEditor();
      el.querySelector('.js-export').onclick        = () => Settings.exportData();
      el.querySelector('.js-import input').onchange = (e) => { const f = e.target.files[0]; if (f) Settings.importData(f); };
      el.querySelector('.js-reset').onclick         = () => Settings.reset();
    },
  };

  global.Admin = Admin;

  document.addEventListener('DOMContentLoaded', () => Admin.boot());
})(window);
