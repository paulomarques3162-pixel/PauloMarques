/* ===========================================================
   store.js — Persistence layer (localStorage abstraction)
   -----------------------------------------------------------
   Single source of truth for the whole CMS. Every module reads
   from and writes through this object. In production, swap the
   implementation for a REST/GraphQL client without touching
   any callers.
   =========================================================== */
(function (global) {
  'use strict';

  const KEY = 'paulo_cms_v1';

  const DEFAULT_STATE = {
    auth: {
      loggedIn: false,
      user: { email: '', name: '', avatar: '' },
      lastLoginAt: null,
    },
    projects: [
      // Seeded with the same six cards from the static portfolio
      { id: genId('p'), title: 'Deshboard industrial monitoring', description: 'Professional real-time industrial monitoring and weighing system.', stack: ['HTML','CSS'], category: 'Industrial', github: '#', demo: 'dashboard.html', date: '2026-07', featured: true, order: 6, status: 'published', color: 't1', thumbnail: '', screenshots: [] },
      { id: genId('p'), title: 'Glassmorphism Dashboard', description: "Exploring soft UI and glass surfaces — a fictional analytics dashboard built with pure HTML and CSS.", stack: ['HTML','CSS','Glassmorphism'], category: 'UI Design', github: '#', demo: '#', date: '2026-02', featured: false, order: 1, status: 'published', color: 't2', thumbnail: '', screenshots: [] },
      { id: genId('p'), title: 'Python CLI Toolkit', description: 'A small collection of Python scripts for file organization, quick calculations, and habit tracking.', stack: ['Python','CLI','Automation'], category: 'Python', github: '#', demo: '#', date: '2026-01', featured: false, order: 2, status: 'published', color: 't3', thumbnail: '', screenshots: [] },
      { id: genId('p'), title: 'Landing Page Concept', description: 'A clean, animated landing page made as a study project — focus on typography, spacing, and motion.', stack: ['HTML','CSS','Animation'], category: 'Web', github: '#', demo: '#', date: '2025-12', featured: false, order: 3, status: 'published', color: 't4', thumbnail: '', screenshots: [] },
      { id: genId('p'), title: '30 HTML Components', description: 'A 30-day challenge where I built one small HTML+CSS component per day, from scratch with care.', stack: ['HTML','CSS','Challenge'], category: 'Challenge', github: '#', demo: '#', date: '2025-11', featured: false, order: 4, status: 'published', color: 't5', thumbnail: '', screenshots: [] },
      { id: genId('p'), title: 'Mobile App Concept UI', description: 'A fictional mobile-first app interface built in HTML/CSS, exploring cards, chips, and bottom navigation.', stack: ['HTML','CSS','Mobile First'], category: 'UI Design', github: '#', demo: '#', date: '2025-10', featured: false, order: 5, status: 'published', color: 't6', thumbnail: '', screenshots: [] },
    ],
    skills: [
      { id: genId('s'), name: 'HTML5',       icon: 'html',     proficiency: 92, visible: true,  locked: false, badge: 'Strong' },
      { id: genId('s'), name: 'CSS3',        icon: 'css',      proficiency: 85, visible: true,  locked: false, badge: 'Strong' },
      { id: genId('s'), name: 'Python',      icon: 'python',   proficiency: 70, visible: true,  locked: false, badge: 'Solid'  },
      { id: genId('s'), name: 'JavaScript',  icon: 'js',       proficiency: 30, visible: true,  locked: true,  badge: 'Soon'   },
      { id: genId('s'), name: 'React',       icon: 'react',    proficiency: 5,  visible: true,  locked: true,  badge: 'Next'   },
      { id: genId('s'), name: 'Next.js',     icon: 'nextjs',   proficiency: 5,  visible: true,  locked: true,  badge: 'Goals'  },
    ],
    social: {
      github:    { url: 'https://www.linkedin.com/in/paulo-marques-6149033a1/', enabled: true  },
      linkedin:  { url: 'https://www.linkedin.com/in/paulo-marques-6149033a1/', enabled: true },
      email:     { url: 'mailto:paulo.marques3162@example.com',    enabled: true },
      whatsapp:  { url: 'https://wa.me/5519989534466',         enabled: true },
      portfolio: { url: '#', enabled: true },
      instagram: { url: 'https://www.instagram.com/pqp_paulo0/', enabled: true },
      x:         { url: '', enabled: false },
    },
    about: {
      name: 'Paulo Marques',
      title: 'Aspiring Front-End Developer',
      avatar: '',
      resume: null,             // { name, data }
      bio: [
        "I recently embarked on my journey in Computer Science / Software Development and I'm at the very beginning of my professional journey. Even though I don't have industry experience yet, I treat every day as an opportunity to learn, ship something small, and get one percent better.",
        "My goal is clear: to become an outstanding Front-End Developer who builds interfaces that feel effortless, accessible, and memorable. I'm also studying English independently because I believe clear communication is part of being a great teammate in tech.",
        "I don't try to hide that I'm a beginner — I want this portfolio to show the trajectory: someone who is growing fast, shipping consistently, and investing seriously in the craft.",
      ],
      stats: [
        { num: '3+',  label: 'Technologies' },
        { num: '2026', label: 'Started CS' },
        { num: 'Daily', label: 'Study practice' },
        { num: '∞',   label: 'Curiosity' },
      ],
    },
    journey: [
      { id: genId('j'), year: '2026 · Q1', title: 'Started College — Computer Science', body: "Began my degree in Computer Science / Software Development, formally kicking off my professional journey.", upcoming: false },
      { id: genId('j'), year: '2025 · Q4', title: 'Learned HTML',                       body: 'Built a strong semantic foundation — accessibility-aware markup, clean structure, and good habits from day one.', upcoming: false },
      { id: genId('j'), year: '2025 · Q4', title: 'Learned CSS',                        body: 'Flexbox, Grid, animations, responsive design, glassmorphism, and design systems — all through daily practice.', upcoming: false },
      { id: genId('j'), year: '2025 · Q4', title: 'Started Python',                     body: 'Exploring scripting, automation, and basic problem-solving fundamentals for future back-end work.', upcoming: false },
      { id: genId('j'), year: '2026 · Now', title: 'Built My First Projects',            body: 'Shipped landing pages, dashboards, components, and small functional apps — focusing on quality over quantity.', upcoming: false },
      { id: genId('j'), year: 'Next · 2026', title: 'Searching for my first Front-End opportunity', body: 'Open to junior / internship roles where I can keep learning, contribute real value, and grow alongside a team.', upcoming: true },
    ],
    goals: {
      technical: [
        { id: genId('g'), label: 'Learn JavaScript deeply',                done: false, priority: 'Q2 2026' },
        { id: genId('g'), label: 'Master React fundamentals',              done: false, priority: 'Q3 2026' },
        { id: genId('g'), label: 'Learn TypeScript basics',                 done: false, priority: 'Q3 2026' },
        { id: genId('g'), label: 'Build my first Next.js app',             done: false, priority: 'Q4 2026' },
        { id: genId('g'), label: 'HTML5 & semantic markup',                done: true,  priority: '' },
        { id: genId('g'), label: 'CSS3 — modern layout & motion',           done: true,  priority: '' },
      ],
      personal: [
        { id: genId('g'), label: "Land my first Front-End Developer role", done: false, priority: '2026 - 2027' },
        { id: genId('g'), label: 'Improve English to intermediate / advanced', done: false, priority: 'Ongoing' },
        { id: genId('g'), label: 'Contribute to an open-source project',   done: false, priority: '2026' },
        { id: genId('g'), label: 'Build & ship 10+ portfolio projects',    done: false, priority: '2026' },
        { id: genId('g'), label: 'Enroll in Computer Science degree',       done: true,  priority: '' },
        { id: genId('g'), label: 'Define a clear Front-End path',          done: true,  priority: '' },
      ],
    },
    messages: [],         // contact form submissions
    notifications: [],    // in-app notifications
    settings: {
      emailProvider: 'demo',            // 'demo' | 'formspree' | 'resend' | 'webhook'
      emailEndpoint: '',                // URL to POST to for delivery
      contactEnabled: true,
      adminEmail: 'paulo.marques@example.com',
      defaultLocale: 'en',
      theme: 'dark',
      notifications: { sound: false, desktop: false },
      security: { sessionTimeoutMin: 60 },
    },
    meta: { version: 1, createdAt: Date.now(), updatedAt: Date.now() },
  };

  function genId(prefix) {
    return prefix + '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  // ---- public API ----
  const Store = {
    KEY,
    state: null,
    subscribers: new Set(),

    init() {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          // Light migration: keep saved data, fill missing keys with defaults
          this.state = mergeDeep(deepClone(DEFAULT_STATE), parsed);
        } catch (e) {
          console.warn('[store] corrupt state, restoring defaults', e);
          this.state = deepClone(DEFAULT_STATE);
          this.persist();
        }
      } else {
        this.state = deepClone(DEFAULT_STATE);
        this.persist();
      }
      // Touch meta
      if (!this.state.meta) this.state.meta = { version: 1, createdAt: Date.now() };
      this.state.meta.updatedAt = Date.now();
      return this;
    },

    persist() {
      this.state.meta.updatedAt = Date.now();
      localStorage.setItem(KEY, JSON.stringify(this.state));
      this._notify();
      return this;
    },

    subscribe(fn) { this.subscribers.add(fn); return () => this.subscribers.delete(fn); },
    _notify() { this.subscribers.forEach(fn => { try { fn(this.state); } catch(e){console.warn(e);} }); },

    // ---- typed accessors ----
    get auth()         { return this.state.auth; },
    get projects()     { return this.state.projects; },
    get skills()       { return this.state.skills; },
    get social()       { return this.state.social; },
    get about()        { return this.state.about; },
    get journey()      { return this.state.journey; },
    get goals()        { return this.state.goals; },
    get messages()     { return this.state.messages; },
    get notifications(){ return this.state.notifications; },
    get settings()     { return this.state.settings; },

    set(patch)         { Object.assign(this.state, patch); this.persist(); },

    reset() {
      localStorage.removeItem(KEY);
      this.state = deepClone(DEFAULT_STATE);
      this.persist();
      return this;
    },

    exportJSON() { return JSON.stringify(this.state, null, 2); },

    importJSON(json) {
      const obj = typeof json === 'string' ? JSON.parse(json) : json;
      this.state = mergeDeep(deepClone(DEFAULT_STATE), obj);
      this.persist();
      return this;
    },

    newId(prefix) { return genId(prefix); },

    // ---- helpers ----
    findById(list, id) { return list.find(x => x.id === id); },
    upsert(list, item) {
      const i = list.findIndex(x => x.id === item.id);
      if (i >= 0) list[i] = item; else list.push(item);
      this.persist();
    },
    remove(list, id) {
      const i = list.findIndex(x => x.id === id);
      if (i >= 0) { list.splice(i, 1); this.persist(); return true; }
      return false;
    },
  };

  function mergeDeep(target, source) {
    if (typeof source !== 'object' || source === null) return source;
    for (const k of Object.keys(source)) {
      const sv = source[k], tv = target[k];
      if (Array.isArray(sv)) target[k] = deepClone(sv);
      else if (sv && typeof sv === 'object' && !Array.isArray(tv)) target[k] = mergeDeep(tv && typeof tv === 'object' ? tv : {}, sv);
      else if (typeof sv !== 'undefined') target[k] = sv;
    }
    return target;
  }

  // ---- seed demo notifications ----
  function seedDemoNotifications() {
    if (Store.state && Store.state.notifications.length === 0) {
      const now = Date.now();
      Store.state.notifications = [
        { id: genId('n'), type: 'info',    title: 'Welcome to your CMS',        message: 'Everything you change here is saved locally and updates the live portfolio instantly.', timestamp: now - 60000, read: false },
        { id: genId('n'), type: 'success', title: 'Default data seeded',        message: 'Six demo projects, six skills and your social links are pre-filled — edit anything you want.', timestamp: now - 30000, read: false },
        { id: genId('n'), type: 'warning', title: 'Email delivery not configured', message: 'Contact form messages are saved locally. Configure Formspree or a webhook in Settings to forward to your inbox.', timestamp: now - 5000, read: false },
      ];
      Store.persist();
    }
  }

  Store.init();
  seedDemoNotifications();

  global.Store = Store;
  global.genId = genId;
})(window);
