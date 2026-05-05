/* ── AI Doubt Solver Widget — integrated into AI-Learning2026 ─────────────── */
/* Source: partner project's doubt-widget.js                                    */
/* Adapted: endpoint changed from /ask-doubt → /api/ask-doubt                  */
(function () {
  // ── State ──────────────────────────────────────────────────────────────────
  var chatHistory = [];
  var isTyping    = false;
  var courseCtx   = null;

  // ── Build Widget HTML ──────────────────────────────────────────────────────
  var widget = document.createElement('div');
  widget.id  = 'doubtWidget';
  widget.innerHTML = [
    '<button id="doubtToggleBtn" onclick="DoubtWidget.toggle()" title="Ask AI Tutor">',
      '<span>🤖</span>',
      '<span class="dw-badge"></span>',
    '</button>',
    '<div id="doubtPanel">',
      '<div class="dw-header">',
        '<div class="dw-header-left">',
          '<div class="dw-avatar">🎓</div>',
          '<div>',
            '<div class="dw-title">AI Doubt Solver</div>',
            '<div class="dw-sub"><span class="dw-online"></span> Available 24/7 · Instant Answers</div>',
          '</div>',
        '</div>',
        '<button class="dw-close" onclick="DoubtWidget.toggle()">✕</button>',
      '</div>',
      '<div class="dw-ctx-bar" id="dwCtxBar">',
        '<span>📘</span><span id="dwCtxLabel"></span>',
      '</div>',
      '<div class="dw-messages" id="dwMessages"></div>',
      '<div class="dw-chips" id="dwChips"></div>',
      '<div class="dw-input-row">',
        '<textarea id="dwInput" rows="1" placeholder="Ask anything about your course..."></textarea>',
        '<button id="dwSendBtn" onclick="DoubtWidget.send()">➤</button>',
      '</div>',
    '</div>',
    '<style>',
      '#doubtWidget{position:fixed;bottom:24px;right:24px;z-index:9999;font-family:inherit}',
      '#doubtToggleBtn{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;cursor:pointer;font-size:22px;box-shadow:0 4px 20px rgba(99,102,241,.4);position:relative;transition:.2s}',
      '#doubtToggleBtn:hover{transform:scale(1.1)}',
      '.dw-badge{position:absolute;top:4px;right:4px;width:10px;height:10px;background:#22c55e;border-radius:50%;border:2px solid #fff}',
      '#doubtPanel{display:none;position:absolute;bottom:68px;right:0;width:360px;max-height:520px;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.15);flex-direction:column;overflow:hidden}',
      '#doubtPanel.open{display:flex}',
      '.dw-header{background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:16px;display:flex;justify-content:space-between;align-items:center;color:#fff}',
      '.dw-header-left{display:flex;align-items:center;gap:10px}',
      '.dw-avatar{width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px}',
      '.dw-title{font-weight:700;font-size:14px}',
      '.dw-sub{font-size:11px;opacity:.85;display:flex;align-items:center;gap:4px}',
      '.dw-online{width:6px;height:6px;background:#4ade80;border-radius:50%;display:inline-block}',
      '.dw-close{background:none;border:none;color:#fff;cursor:pointer;font-size:16px;padding:4px;border-radius:4px}',
      '.dw-close:hover{background:rgba(255,255,255,.2)}',
      '.dw-ctx-bar{display:none;background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:8px 14px;font-size:12px;color:#1d4ed8;gap:6px}',
      '.dw-ctx-bar.visible{display:flex;align-items:center}',
      '.dw-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:180px}',
      '.msg-bubble{padding:10px 14px;border-radius:12px;max-width:85%;font-size:13px;line-height:1.5;word-break:break-word}',
      '.msg-bubble.bot{background:#f3f4f6;color:#111;align-self:flex-start;border-bottom-left-radius:4px}',
      '.msg-bubble.user{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;align-self:flex-end;border-bottom-right-radius:4px;margin-left:auto}',
      '.msg-time{font-size:10px;color:#9ca3af;margin-top:2px}',
      '.msg-bubble pre{background:#1e293b;color:#e2e8f0;padding:8px;border-radius:6px;overflow-x:auto;margin:6px 0}',
      '.msg-bubble code{font-family:monospace;font-size:12px}',
      '.msg-bubble strong{font-weight:700}',
      '.typing-indicator{display:flex;gap:4px;padding:10px 14px;background:#f3f4f6;border-radius:12px;width:fit-content}',
      '.typing-dot{width:7px;height:7px;background:#6366f1;border-radius:50%;animation:dwBounce 1.2s infinite}',
      '.typing-dot:nth-child(2){animation-delay:.2s}.typing-dot:nth-child(3){animation-delay:.4s}',
      '@keyframes dwBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}',
      '.dw-chips{padding:6px 10px;display:flex;flex-wrap:wrap;gap:5px}',
      '.dw-chip{background:#f0f0ff;border:1px solid #c7d2fe;color:#4f46e5;padding:4px 10px;border-radius:20px;font-size:11px;cursor:pointer;border:1px solid #c7d2fe;transition:.15s}',
      '.dw-chip:hover{background:#e0e7ff}',
      '.dw-input-row{display:flex;gap:8px;padding:10px;border-top:1px solid #e5e7eb;align-items:flex-end}',
      '#dwInput{flex:1;border:2px solid #e5e7eb;border-radius:10px;padding:8px 12px;font-size:13px;resize:none;outline:none;font-family:inherit;max-height:100px;transition:.15s}',
      '#dwInput:focus{border-color:#6366f1}',
      '#dwSendBtn{width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:10px;color:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
      '#dwSendBtn:disabled{opacity:.5;cursor:not-allowed}',
    '</style>'
  ].join('');
  document.body.appendChild(widget);

  // ── Textarea auto-resize + Enter key ──────────────────────────────────────
  var inp = document.getElementById('dwInput');
  inp.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); DoubtWidget.send(); }
  });

  // ── Welcome message ────────────────────────────────────────────────────────
  var welcomeShown = false;
  function showWelcome() {
    if (welcomeShown) return;
    welcomeShown = true;
    var name = '';
    try { name = JSON.parse(localStorage.getItem('user') || '{}').name || ''; } catch (e) {}
    var greeting = name ? 'Hi ' + name.split(' ')[0] + '! 👋' : 'Hi there! 👋';
    appendBot(greeting + ' I\'m your AI tutor — available 24/7 to answer doubts.\n\nAsk me anything: code errors, concepts, or how-to questions! 🚀');
    showChips(getDefaultChips());
  }

  function getDefaultChips() {
    if (courseCtx) {
      return ['Explain ' + (courseCtx.topics && courseCtx.topics[0] || 'this topic'), 'Give me a code example', 'How do I start?', 'What\'s next to learn?'];
    }
    return ['What is a variable?', 'Explain loops', 'What is OOP?', 'How does Git work?'];
  }

  function showChips(chips) {
    var el = document.getElementById('dwChips');
    el.innerHTML = chips.map(function (c) {
      return '<button class="dw-chip" onclick="DoubtWidget.sendText(\'' + c.replace(/'/g, "\\'") + '\')">' + c + '</button>';
    }).join('');
  }

  // ── Render helpers ─────────────────────────────────────────────────────────
  function fmt(text) {
    text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, function (_, lang, code) {
      return '<pre><code>' + esc(code.trim()) + '</code></pre>';
    });
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\n/g, '<br>');
    return text;
  }

  function esc(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function nowTime() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'AM' : 'PM');
  }

  function appendBot(text) {
    var msgs = document.getElementById('dwMessages');
    var div = document.createElement('div');
    div.innerHTML = '<div class="msg-bubble bot">' + fmt(text) + '</div><div class="msg-time">' + nowTime() + '</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function appendUser(text) {
    var msgs = document.getElementById('dwMessages');
    var div = document.createElement('div');
    div.innerHTML = '<div class="msg-bubble user">' + esc(text) + '</div><div class="msg-time" style="text-align:right">' + nowTime() + '</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    var msgs = document.getElementById('dwMessages');
    var div = document.createElement('div');
    div.id = 'dwTyping';
    div.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    var el = document.getElementById('dwTyping');
    if (el) el.parentNode.removeChild(el);
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  window.DoubtWidget = {

    toggle: function () {
      var panel = document.getElementById('doubtPanel');
      var isOpen = panel.classList.toggle('open');
      if (isOpen) showWelcome();
    },

    setCourse: function (course) {
      courseCtx = course;
      var bar   = document.getElementById('dwCtxBar');
      var label = document.getElementById('dwCtxLabel');
      if (course) {
        label.textContent = 'Asking about: ' + course.title;
        bar.classList.add('visible');
        document.getElementById('dwInput').placeholder = 'Ask about ' + course.title + '...';
      } else {
        bar.classList.remove('visible');
        document.getElementById('dwInput').placeholder = 'Ask anything about your course...';
      }
    },

    sendText: function (text) {
      document.getElementById('dwInput').value = text;
      DoubtWidget.send();
    },

    send: function () {
      if (isTyping) return;
      var inp  = document.getElementById('dwInput');
      var text = inp.value.trim();
      if (!text) return;
      inp.value = '';
      inp.style.height = 'auto';

      document.getElementById('dwChips').innerHTML = '';
      appendUser(text);
      chatHistory.push({ role: 'user', content: text });

      isTyping = true;
      document.getElementById('dwSendBtn').disabled = true;
      showTyping();

      // Calls teammate project's backend at /api/ask-doubt
      fetch('/api/ask-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, courseContext: courseCtx, history: chatHistory.slice(-8) })
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        removeTyping();
        isTyping = false;
        document.getElementById('dwSendBtn').disabled = false;
        if (data.success) {
          appendBot(data.answer);
          chatHistory.push({ role: 'assistant', content: data.answer });
          showChips(['Ask another question', 'Give me an example', 'Explain more simply', "What's next?"]);
        } else {
          appendBot('Sorry, something went wrong. Please try again.');
        }
      })
      .catch(function () {
        removeTyping();
        isTyping = false;
        document.getElementById('dwSendBtn').disabled = false;
        appendBot('Cannot reach the server. Make sure `node server.js` is running!');
      });
    }
  };
})();