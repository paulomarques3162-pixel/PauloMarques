/* ===========================================================
   messages.js — Contact form submissions inbox
   =========================================================== */
(function (global) {
  'use strict';

  const Messages = {
    list() { return Store.state.messages || []; },

    markRead(id) {
      const m = Store.findById(Store.messages, id);
      if (m && !m.read) { m.read = true; Store.persist(); }
    },

    unreadCount() { return this.list().filter(m => !m.read).length; },

    async remove(id) {
      const ok = await UI.confirm({ title: 'Delete message?', message: 'This message will be permanently removed.', okLabel: 'Delete' });
      if (!ok) return;
      Store.remove(Store.messages, id);
      Notifications.push('warning', 'Message deleted', '', { toast: false });
    },

    open(id) {
      const m = Store.findById(Store.messages, id);
      if (!m) return;
      this.markRead(id);
      const root = document.createElement('div');
      root.className = 'msg-detail';
      root.innerHTML = `
        <div class="msg-meta">
          <div class="msg-avatar">${(m.name||'?')[0].toUpperCase()}</div>
          <div>
            <strong>${UI.escape(m.name)}</strong>
            <a href="mailto:${UI.escape(m.email)}">${UI.escape(m.email)}</a>
          </div>
        </div>
        <div class="msg-when">${UI.formatDate(m.timestamp)}</div>
        <h3 class="msg-subject">${UI.escape(m.subject || '(no subject)')}</h3>
        <div class="msg-body"></div>
        <div class="msg-actions">
          <a class="btn btn-ghost" href="mailto:${UI.escape(m.email)}?subject=Re: ${encodeURIComponent(m.subject||'')}">Reply by email</a>
          <button class="btn btn-danger js-delete">Delete</button>
        </div>
        ${m.delivered ? '<div class="msg-tag">Delivered via ' + UI.escape(m.deliveryMode || 'remote') + '</div>' : ''}
      `;
      root.querySelector('.msg-body').textContent = m.message || '';
      UI.openDrawer({
        title: 'Message',
        content: root,
        saveLabel: 'Close',
        cancelLabel: 'Close',
        onSave: () => true,
      });
      setTimeout(() => root.querySelector('.js-delete').onclick = () => this.remove(id), 0);
    },
  };

  global.Messages = Messages;
})(window);
