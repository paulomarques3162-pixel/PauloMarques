/* ===========================================================
   dashboard.js — Home dashboard (metrics + activity)
   =========================================================== */
(function (global) {
  'use strict';

  const Dashboard = {
    render(el) {
      const stats = this.computeStats();
      const recent = this.recentActivity();

      el.innerHTML = `
        <header class="page-head">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, <strong>${UI.escape(Store.auth.user.name || 'Paulo')}</strong>. Here's what's happening with your portfolio.</p>
          </div>
          <div class="page-actions">
            <a class="btn btn-ghost" href="portfolio-live.html" target="_blank">View live portfolio ↗</a>
            <button class="btn btn-primary js-new-project">+ New Project</button>
          </div>
        </header>

        <div class="stat-grid">
          ${this.statCard('Projects',        stats.projectCount,            '+ this week', 'projects')}
          ${this.statCard('Skills',          stats.skillCount,              `${stats.lockedSkills} locked`, 'skills')}
          ${this.statCard('Contact Messages', stats.unreadMessages,         `${stats.messageCount} total`, 'messages')}
          ${this.statCard('Profile',         stats.completion + '%',        'completeness', 'profile')}
        </div>

        <div class="dash-grid">
          <section class="card">
            <header class="card-head">
              <h3>Project activity</h3>
              <span class="muted">Last 28 days</span>
            </header>
            <div class="chart-host">
              <canvas id="chart-activity" height="160"></canvas>
            </div>
          </section>

          <section class="card">
            <header class="card-head">
              <h3>Quick actions</h3>
            </header>
            <div class="quick-actions">
              <button class="qa" data-action="new-project"><span>＋</span><strong>New project</strong><small>Add a card to your portfolio</small></button>
              <button class="qa" data-action="new-skill"><span>＋</span><strong>New skill</strong><small>Track another technology</small></button>
              <button class="qa" data-action="edit-about"><span>✎</span><strong>Edit About</strong><small>Refresh your bio</small></button>
              <button class="qa" data-action="email-settings"><span>✉</span><strong>Email delivery</strong><small>Forward contact messages</small></button>
            </div>
          </section>
        </div>

        <section class="card">
          <header class="card-head">
            <h3>Recent activity</h3>
            <a href="#" class="link" data-action="view-notifications">View all →</a>
          </header>
          <ul class="activity-list">
            ${recent.length ? recent.map(a => `
              <li>
                <span class="dot dot-${a.type}"></span>
                <div>
                  <strong>${UI.escape(a.title)}</strong>
                  <small>${UI.escape(a.message || '')}</small>
                </div>
                <time>${UI.timeAgo(a.timestamp)}</time>
              </li>
            `).join('') : `<li class="empty">No activity yet.</li>`}
          </ul>
        </section>
      `;

      // Wire quick actions
      el.querySelectorAll('[data-action]').forEach(b => {
        b.onclick = () => {
          const a = b.dataset.action;
          if (a === 'new-project')   { const p = Projects.create(); Projects.openEditor(p); }
          if (a === 'new-skill')     { const s = Skills.create();   Skills.openEditor(s); }
          if (a === 'edit-about')    { About.openEditor(); }
          if (a === 'email-settings'){ Settings.openEmailEditor(); }
          if (a === 'view-notifications') {
            el.querySelector('[data-nav="notifications"]')?.click();
          }
        };
      });

      el.querySelector('.js-new-project').onclick = () => {
        const p = Projects.create();
        Projects.openEditor(p);
      };

      this.renderChart();
    },

    statCard(title, value, sub, kind) {
      const colors = { projects: 'blue', skills: 'purple', messages: 'cyan', profile: 'green' };
      return `
        <div class="stat-card stat-${colors[kind] || 'blue'}">
          <span class="stat-label">${title}</span>
          <strong class="stat-value">${UI.escape(String(value))}</strong>
          <small class="stat-sub">${UI.escape(sub)}</small>
        </div>
      `;
    },

    computeStats() {
      const projectCount = Store.projects.length;
      const skillCount   = Store.skills.length;
      const lockedSkills = Store.skills.filter(s => s.locked).length;
      const messageCount = Store.messages.length;
      const unreadMessages = Store.messages.filter(m => !m.read).length;

      // Profile completeness — heuristic
      const checks = [
        !!Store.about.name,
        !!Store.about.title,
        (Store.about.bio || []).length >= 2,
        Store.projects.length >= 3,
        Store.skills.length >= 3,
        !!Store.social.github.enabled,
        !!Store.social.linkedin.enabled,
        !!Store.social.email.enabled,
        !!Store.about.avatar,
        !!Store.about.resume,
      ];
      const completion = Math.round((checks.filter(Boolean).length / checks.length) * 100);

      const weekAgo = Date.now() - 7 * 86400 * 1000;
      const newProjectsThisWeek = Store.projects.filter(p => p.createdAt && p.createdAt > weekAgo).length;

      return { projectCount, skillCount, lockedSkills, messageCount, unreadMessages, completion, newProjectsThisWeek };
    },

    recentActivity(limit = 10) {
      const items = [];

      // Most recent notifications are already activity items
      Store.notifications.slice(0, limit).forEach(n => items.push(n));

      // Add a synthetic "Project added" for each project if not present
      Store.projects.slice(-limit).forEach(p => items.push({
        id: 'syn_' + p.id,
        type: 'info',
        title: 'Project ' + (p.status === 'draft' ? 'drafted' : 'published'),
        message: p.title,
        timestamp: p.updatedAt || Store.meta.updatedAt,
      }));

      // Add a synthetic "Message received" for each unread message
      Store.messages.slice(0, limit).forEach(m => items.push({
        id: 'syn_' + m.id,
        type: 'success',
        title: 'New message',
        message: `${m.name} — "${m.subject}"`,
        timestamp: m.timestamp,
      }));

      return items
        .filter((v, i, a) => a.findIndex(x => x.id === v.id) === i)
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, limit);
    },

    renderChart() {
      const canvas = document.getElementById('chart-activity');
      if (!canvas || !global.Chart) return;

      // Aggregate notifications by day for the last 14 days
      const days = 14;
      const labels = [];
      const data = [];
      for (let i = days - 1; i >= 0; i--) {
        const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() - i);
        const end = new Date(start); end.setDate(end.getDate() + 1);
        labels.push(start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data.push(Store.state.notifications.filter(n => n.timestamp >= start.getTime() && n.timestamp < end.getTime()).length);
      }

      new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Notifications',
            data,
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || '#3b82f6',
            backgroundColor: 'rgba(168,85,247,0.15)',
            fill: true, tension: .35, borderWidth: 2, pointRadius: 0,
          }],
        },
        options: {
          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', titleColor: '#fff', bodyColor: '#cbd5e1' } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7a93', font: { size: 11 } } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7a93', font: { size: 11 } }, beginAtZero: true, precision: 0 },
          },
        },
      });
    },
  };

  global.Dashboard = Dashboard;
})(window);
