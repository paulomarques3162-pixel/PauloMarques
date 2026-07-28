/* ===========================================================
   portfolio.js — Renders the live public portfolio from Store
   =========================================================== */
(function (global) {
  'use strict';

  const ICONS = {
    github:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.7 5.5.7 11.8c0 5 3.2 9.2 7.7 10.7.6.1.8-.3.8-.6v-2.2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1.9-.3 1.8-.4 2.8-.4s1.9.1 2.8.4c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.3.8 1 .8 2v3c0 .3.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.3 5.5 18.3.5 12 .5z"/></svg>',
    linkedin:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5zM8 19H5V8h3v11zM6.5 6.7a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM20 19h-3v-5.6c0-3.4-4-3.1-4 0V19h-3V8h3v1.8c1.4-2.6 7-2.8 7 2.4V19z"/></svg>',
    mail:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="m4 7 8 6 8-6"/></svg>',
    whatsapp:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892h-.005a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>',
    globe:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    x:         '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21l-6.52 7.45L22 22h-6.83l-4.78-6.27L4.8 22H2l6.96-7.96L2 2h6.99l4.33 5.72L18.24 2zm-1.2 18h1.86L7.05 4H5.07l11.97 16z"/></svg>',
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

  function formatDate(ym) {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    const d = new Date(+y, (+m || 1) - 1);
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  }

  // ===========================================================
  // Render helpers — each section gets rendered on boot and
  // re-rendered when the store changes (via Store.subscribe).
  // ===========================================================
  const PORTFOLIO = {
    init() {
      this.renderNav();
      this.renderHero();
      this.renderAbout();
      this.renderSkills();
      this.renderProjects();
      this.renderJourney();
      this.renderGoals();
      this.renderContact();
      this.renderContactFooter();
      this.renderResumeCTA();
      this.bindContactForm();
      this.animate();

      // Re-render when the CMS updates data
      Store?.subscribe(() => {
        this.renderNav();
        this.renderHero();
        this.renderAbout();
        this.renderSkills();
        this.renderProjects();
        this.renderJourney();
        this.renderGoals();
        this.renderContact();
        this.renderContactFooter();
        this.renderResumeCTA();
      });
    },

    /* ---------- NAV ---------- */
    renderNav() {
      const logo = (Store?.about?.name || 'Paulo Marques');
      const nav = document.querySelector('[data-nav-logo]');
      if (nav) nav.textContent = logo.split(' ')[0] + '.dev';
    },

    /* ---------- HERO ---------- */
    renderHero() {
      const a = Store.about;
      const heroName = document.querySelector('[data-hero-name]');
      const heroSub  = document.querySelector('[data-hero-sub]');
      const heroIntro = document.querySelector('[data-hero-intro]');
      if (heroName) heroName.textContent = a.name;
      if (heroSub)  heroSub.textContent  = a.title;
      if (heroIntro) heroIntro.innerHTML = `${a.bio[0] || ''}`;
    },

    /* ---------- ABOUT ---------- */
    renderAbout() {
      const a = Store.about;
      const root = document.querySelector('[data-about]');
      if (!root) return;
      root.innerHTML = `
        <span class="eyebrow"><span class="pulse-dot"></span> About me</span>
        <h2 class="reveal in">A beginner with <span class="gradient-text">builder mindset</span>.</h2>
        ${a.bio.map(p => `<p class="reveal in">${esc(p)}</p>`).join('')}
        <div class="about-stats reveal in">
          ${a.stats.map(s => `<div class="about-stat"><strong>${esc(s.num)}</strong><small>${esc(s.label)}</small></div>`).join('')}
        </div>
      `;
    },

    /* ---------- SKILLS ---------- */
    renderSkills() {
      const root = document.querySelector('[data-skills]');
      if (!root) return;
      const visible = Store.skills.filter(s => s.visible);
      root.innerHTML = visible.map((s, i) => `
        <article class="skill-card reveal in ${s.locked ? 'locked' : ''}" style="--p:${s.proficiency/100}; animation-delay:${i*60}ms;">
          <div class="top">
            <div class="icon-wrap">${Skills.iconSVG(s.icon)}</div>
            <span class="badge">${esc(s.badge || '')}</span>
          </div>
          <h3>${esc(s.name)}</h3>
          <p>${s.locked ? "Currently studying — building projects to deepen my knowledge." : "Daily-practice skill used across my projects and study time."}</p>
          <div class="progress"><span></span></div>
          <div class="progress-label"><span>Comfort</span><span>${s.proficiency}%</span></div>
        </article>
      `).join('');
    },

    /* ---------- PROJECTS ---------- */
    renderProjects() {
      const root = document.querySelector('[data-projects]');
      if (!root) return;
      const projects = Store.projects.filter(p => p.status === 'published').sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      root.innerHTML = projects.map((p, i) => `
        <article class="project-card reveal in" data-cat="${esc(p.category)}" style="animation-delay:${(i % 3) * 70}ms;">
          <div class="project-thumb">
            <div class="tag-row">
              <span class="tag cat">${esc(p.category)}</span>
              <span class="tag">${esc(p.date || '')}</span>
            </div>
            <div class="preview ${esc(p.color || 't1')}">
              ${p.thumbnail
                ? `<img src="${p.thumbnail}" alt="${esc(p.title)}" style="max-width:80%; max-height:80%; border-radius:8px;"/>`
                : `<div class="code-mock"><div class="dot-row"><span></span><span></span><span></span></div><div class="lines"><div></div><div></div><div></div><div></div></div></div>`}
            </div>
          </div>
          <div class="project-body">
            <div class="project-meta">
              <span class="date">${p.date ? formatDate(p.date) : '—'}</span>
              <span>${p.featured ? '⭐ Featured' : ''}</span>
            </div>
            <h3>${esc(p.title)}</h3>
            <p class="desc">${esc(p.description)}</p>
            <div class="project-stack">
              ${(p.stack || []).slice(0, 4).map(t => `<span class="pill">${esc(t)}</span>`).join('')}
              ${(p.stack || []).length > 4 ? `<span class="pill muted">+${p.stack.length - 4}</span>` : ''}
            </div>
            <div class="project-actions">
              ${p.github ? `<a class="github" href="${esc(p.github)}" target="_blank" rel="noopener">${ICONS.github}<span>GitHub</span></a>` : ''}
              ${p.demo ? `<a class="demo" href="${esc(p.demo)}" target="_blank" rel="noopener">Live</a>` : ''}
            </div>
          </div>
        </article>
      `).join('') || '<div class="empty-card">No published projects yet — open the <a href="admin.html">admin dashboard</a> to add some.</div>';
    },

    /* ---------- JOURNEY ---------- */
    renderJourney() {
      const root = document.querySelector('[data-journey]');
      if (!root) return;
      root.innerHTML = Store.journey.map(m => `
        <div class="tl-item ${m.upcoming ? 'upcoming' : ''} reveal in">
          <div class="tl-dot"></div>
          <div class="tl-card">
            <span class="yr">${esc(m.year)}</span>
            <h3>${esc(m.title)}</h3>
            <p>${esc(m.body)}</p>
          </div>
        </div>
      `).join('');
    },

    /* ---------- GOALS ---------- */
    renderGoals() {
      const root = document.querySelector('[data-goals]');
      if (!root) return;
      root.innerHTML = `
        <section class="goals-card reveal in">
          <h3>Technical milestones</h3>
          <div class="sub">Stack goals I'm working on.</div>
          <ul class="goals-list">
            ${Store.goals.technical.map(g => `
              <li>
                ${g.done
                  ? '<span class="check done"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L20 7"/></svg></span>'
                  : '<span class="check todo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg></span>'}
                ${esc(g.label)}
                ${g.priority ? `<span class="priority">${esc(g.priority)}</span>` : ''}
              </li>
            `).join('')}
          </ul>
        </section>
        <section class="goals-card reveal in">
          <h3>Personal & career goals</h3>
          <div class="sub">Career and communication goals.</div>
          <ul class="goals-list">
            ${Store.goals.personal.map(g => `
              <li>
                ${g.done
                  ? '<span class="check done"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L20 7"/></svg></span>'
                  : '<span class="check todo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg></span>'}
                ${esc(g.label)}
                ${g.priority ? `<span class="priority">${esc(g.priority)}</span>` : ''}
              </li>
            `).join('')}
          </ul>
        </section>
      `;
    },

    /* ---------- CONTACT ---------- */
    renderContact() {
      const root = document.querySelector('[data-contact-channels]');
      if (!root) return;

      const platforms = [
        { id: 'github',    name: 'GitHub',     svg: ICONS.github,    cls: 'github' },
        { id: 'linkedin',  name: 'LinkedIn',   svg: ICONS.linkedin,  cls: 'linkedin' },
        { id: 'email',     name: 'Email',      svg: ICONS.mail,      cls: 'email' },
        { id: 'whatsapp',  name: 'WhatsApp',   svg: ICONS.whatsapp,  cls: 'whatsapp' },
        { id: 'portfolio', name: 'Portfolio',  svg: ICONS.globe,     cls: 'portfolio' },
        { id: 'instagram', name: 'Instagram',  svg: ICONS.instagram, cls: 'instagram' },
        { id: 'x',         name: 'X',          svg: ICONS.x,         cls: 'x' },
      ];
      const enabled = platforms.filter(p => Store.social[p.id]?.enabled && Store.social[p.id]?.url);
      root.innerHTML = enabled.map(p => `
        <a class="contact-channel ${p.cls}" href="${esc(Store.social[p.id].url)}" target="_blank" rel="noopener">
          <span class="icon">${p.svg}</span>
          <strong>${p.name}</strong>
          <span>${p.id === 'email' ? 'Drop me a message anytime' : 'Open '+p.name}</span>
          <span class="arrow">Open <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg></span>
        </a>
      `).join('');
    },

    /* ---------- Footer contact (compact list) ---------- */
    renderContactFooter() {
      const root = document.querySelector('[data-footer-contact]');
      if (!root) return;
      const visible = Object.entries(Store.social).filter(([k, v]) => v.enabled && v.url);
      root.innerHTML = visible.map(([k, v]) => `<a href="${esc(v.url)}" target="_blank" rel="noopener">${k[0].toUpperCase()+k.slice(1)}</a>`).join('');
    },

    /* ---------- Resume CTA ---------- */
    renderResumeCTA() {
      const root = document.querySelector('[data-resume-cta]');
      if (!root) return;
      const r = Store.about.resume;
      if (r) {
        root.innerHTML = `
          <a class="btn btn-ghost" href="${esc(r.data)}" download="${esc(r.name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Download resume (${esc(r.name)})
          </a>
        `;
      } else {
        root.innerHTML = '';
      }
    },

    /* ---------- CONTACT FORM ---------- */
    bindContactForm() {
      const form = document.querySelector('[data-contact-form]');
      if (!form) return;
      const status = form.querySelector('[data-form-status]');
      const submit = form.querySelector('[data-form-submit]');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!Store.settings.contactEnabled) {
          UI?.Toast?.info('Contact form disabled', '');
          status.textContent = 'The contact form is currently disabled.';
          return;
        }
        // Basic honeypot
        if (form.querySelector('[name="website"]')?.value) return;

        const fd = new FormData(form);
        const payload = {
          name:    (fd.get('name')    || '').toString().trim().slice(0, 100),
          email:   (fd.get('email')   || '').toString().trim().slice(0, 200),
          subject: (fd.get('subject') || '').toString().trim().slice(0, 150),
          message: (fd.get('message') || '').toString().trim().slice(0, 2000),
        };

        // Validate
        const errors = [];
        if (!payload.name)   errors.push('Name is required.');
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) errors.push('A valid email is required.');
        if (!payload.subject) errors.push('Please add a subject.');
        if (payload.message.length < 10) errors.push('Message must be at least 10 characters.');
        if (errors.length) {
          status.textContent = errors.join(' ');
          status.className = 'form-status error';
          return;
        }

        // Loading
        submit.disabled = true;
        const oldLabel = submit.querySelector('[data-label]')?.textContent;
        if (submit.querySelector('[data-label]')) submit.querySelector('[data-label]').textContent = 'Sending…';
        submit.classList.add('loading');
        status.textContent = '';
        status.className = 'form-status';

        try {
          const r = await Api.sendMessage(payload);
          if (r.ok && r.delivered) {
            status.textContent = 'Thanks! Your message has been sent. I\'ll get back to you soon.';
            status.className = 'form-status success';
            form.reset();
          } else if (r.ok && !r.delivered) {
            status.textContent = 'Thanks! Your message has been saved. (Email delivery is disabled in the CMS — open the admin to enable it.)';
            status.className = 'form-status success';
            form.reset();
          } else {
            status.textContent = 'Something went wrong. Please try again or email me directly.';
            status.className = 'form-status error';
          }
        } catch (e) {
          status.textContent = 'Network error. Please try again later.';
          status.className = 'form-status error';
        } finally {
          submit.disabled = false;
          if (submit.querySelector('[data-label]')) submit.querySelector('[data-label]').textContent = oldLabel;
          submit.classList.remove('loading');
        }
      });
    },

    animate() {
      // IntersectionObserver for scroll reveals (no-op on already-in items)
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
      }, { threshold: 0.12 });
      document.querySelectorAll('.reveal').forEach(el => io.observe(el));

      // Animated hero typing
      const typedEl = document.querySelector('[data-typed]');
      if (typedEl) this.startTyping(typedEl);

      // Progress bars trigger when in view
      const pio = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const span = e.target.querySelector('.progress > span');
            if (span) span.style.transform = `scaleX(${e.target.style.getPropertyValue('--p') || 1})`;
          }
        });
      }, { threshold: 0.4 });
      document.querySelectorAll('.skill-card').forEach(c => pio.observe(c));
    },

    startTyping(el) {
      const titles = [
        Store.about.title || 'Aspiring Front-End Developer.',
        'Building interfaces.',
        'Learning every day.',
        'CS Student.',
      ];
      let wi = 0, ci = 0, deleting = false;
      const tick = () => {
        const w = titles[wi % titles.length];
        if (!deleting) {
          el.textContent = w.slice(0, ++ci);
          if (ci === w.length) { deleting = true; setTimeout(tick, 1600); return; }
          setTimeout(tick, 70);
        } else {
          el.textContent = w.slice(0, --ci);
          if (ci === 0) { deleting = false; wi++; setTimeout(tick, 200); return; }
          setTimeout(tick, 30);
        }
      };
      tick();
    },
  };

  global.PORTFOLIO = PORTFOLIO;
  document.addEventListener('DOMContentLoaded', () => PORTFOLIO.init());
})(window);
