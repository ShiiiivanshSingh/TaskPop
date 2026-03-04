const TK = 'tp_tasks_v1';
const NK = 'tp_notes_v1';
const TH = 'tp_theme_v1';

let tasks = [];
let notes = [];
let filter = 'all';
let view = 'notes';
let editId = null;

const SUN = "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85 1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM1 11h3v2H1v-2z";
const MOON = "M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z";

const heroData = {
  notes: {
    ey: 'Notes · 2025',
    title: 'Note<em>s.</em>',
    sub: 'Capture thoughts, ideas, and anything worth keeping. Tap a card to edit.'
  },
  tasks: {
    ey: 'Tasks · 2025',
    title: 'Task<em>s.</em>',
    sub: 'A focused list of what needs doing. Click any task to mark it complete.'
  }
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function fmtTime(t) {
  return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(t) {
  return new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function save() {
  localStorage.setItem(TK, JSON.stringify(tasks));
  localStorage.setItem(NK, JSON.stringify(notes));
}

function load() {
  try { tasks = JSON.parse(localStorage.getItem(TK)) || []; } catch { tasks = []; }
  try { notes = JSON.parse(localStorage.getItem(NK)) || []; } catch { notes = []; }
}

function shake(el) {
  el.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(0)' }
    ],
    { duration: 280 }
  );
}

function renderTasks() {
  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  document.getElementById('cAll').textContent = tasks.length;
  document.getElementById('cActive').textContent = active.length;
  document.getElementById('cDone').textContent = done.length;
  document.getElementById('remaining').textContent = active.length + ' remaining';

  const tl = document.getElementById('taskList');
  const dl = document.getElementById('doneList');
  const showA = filter === 'all' || filter === 'active';
  const showD = filter === 'all' || filter === 'done';

  tl.innerHTML = '';
  if (showA) active.forEach(t => tl.appendChild(mkRow(t)));
  document.getElementById('taskEmpty').style.display = (showA && !active.length) ? 'block' : 'none';

  dl.innerHTML = '';
  const da = document.getElementById('doneArea');
  if (showD && done.length) {
    done.forEach(t => dl.appendChild(mkRow(t)));
    da.style.display = 'block';
  } else {
    da.style.display = 'none';
  }
}

function mkRow(t) {
  const li = document.createElement('li');
  li.className = 'row-item' + (t.done ? ' done' : '');
  li.dataset.id = t.id;
  li.innerHTML = `
    <button class="row-check" data-id="${t.id}">
      <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
    </button>
    <span class="row-text" data-id="${t.id}">${esc(t.text)}</span>
    <span class="row-time">${fmtTime(t.at)}</span>
    <button class="row-del" data-id="${t.id}">
      <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
    </button>`;
  return li;
}

function addTask() {
  const inp = document.getElementById('taskInput');
  const text = inp.value.trim();
  if (!text) { inp.focus(); shake(inp); return; }
  tasks.unshift({ id: uid(), text, done: false, at: Date.now() });
  save();
  renderTasks();
  inp.value = '';
  inp.focus();
}

function renderNotes() {
  const g = document.getElementById('notesGrid');
  const e = document.getElementById('notesEmpty');
  document.getElementById('noteCount').textContent = notes.length + ' entries';
  g.innerHTML = '';
  if (!notes.length) { e.style.display = 'block'; return; }
  e.style.display = 'none';
  notes.forEach(n => g.appendChild(mkCard(n)));
}

function mkCard(n) {
  const d = document.createElement('div');
  d.className = 'note-card';
  d.dataset.id = n.id;
  d.innerHTML = `
    ${n.tag ? `<span class="note-tag">${esc(n.tag)}</span>` : ''}
    <div class="note-title">${esc(n.title || 'Untitled')}</div>
    <div class="note-body">${esc(n.body || '')}</div>
    <div class="note-footer">
      <span class="note-date">${fmtDate(n.at)}</span>
      <button class="note-del" data-id="${n.id}">
        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
      </button>
    </div>`;
  return d;
}

function openModal(id) {
  editId = id || null;
  const n = id ? notes.find(x => x.id === id) : null;
  document.getElementById('modalLbl').textContent = id ? 'Edit Note' : 'New Note';
  document.getElementById('nTitle').value = n?.title || '';
  document.getElementById('nBody').value = n?.body || '';
  document.getElementById('nTag').value = n?.tag || '';
  document.getElementById('overlay').classList.add('open');
  setTimeout(() => document.getElementById('nTitle').focus(), 80);
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  editId = null;
}

function applyTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.getElementById('themeIcon').querySelector('path').setAttribute('d', dark ? SUN : MOON);
  localStorage.setItem(TH, dark ? 'dark' : 'light');
}

function switchView(v) {
  view = v;
  document.getElementById('notesView').style.display = v === 'notes' ? 'block' : 'none';
  document.getElementById('tasksView').style.display = v === 'tasks' ? 'block' : 'none';
  document.getElementById('fab').classList.toggle('show', v === 'notes');
  document.getElementById('eyebrow').textContent = heroData[v].ey;
  document.getElementById('heroTitle').innerHTML = heroData[v].title;
  document.getElementById('heroSub').textContent = heroData[v].sub;
  document.querySelectorAll('.nav-pill').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  if (v === 'notes') renderNotes();
  else renderTasks();
}

document.getElementById('addTaskBtn').addEventListener('click', addTask);

document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

document.getElementById('clearBtn').addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  save();
  renderTasks();
});

document.getElementById('fab').addEventListener('click', () => openModal(null));
document.getElementById('modalClose').addEventListener('click', closeModal);

document.getElementById('overlay').addEventListener('click', e => {
  if (e.target.id === 'overlay') closeModal();
});

document.getElementById('nSave').addEventListener('click', () => {
  const title = document.getElementById('nTitle').value.trim();
  const body = document.getElementById('nBody').value.trim();
  const tag = document.getElementById('nTag').value.trim();
  if (!title && !body) { closeModal(); return; }
  if (editId) {
    const n = notes.find(x => x.id === editId);
    if (n) { n.title = title; n.body = body; n.tag = tag; }
  } else {
    notes.unshift({ id: uid(), title, body, tag, at: Date.now() });
  }
  save();
  renderNotes();
  closeModal();
});

document.getElementById('themeBtn').addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme !== 'dark');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && document.getElementById('overlay').classList.contains('open')) {
    document.getElementById('nSave').click();
  }
});

document.addEventListener('click', e => {
  const chk = e.target.closest('.row-check');
  if (chk) {
    const t = tasks.find(x => x.id === chk.dataset.id);
    if (t) { t.done = !t.done; save(); renderTasks(); }
    return;
  }

  const rt = e.target.closest('.row-text');
  if (rt) {
    const t = tasks.find(x => x.id === rt.dataset.id);
    if (t) { t.done = !t.done; save(); renderTasks(); }
    return;
  }

  const td = e.target.closest('.row-del');
  if (td) {
    tasks = tasks.filter(x => x.id !== td.dataset.id);
    save();
    renderTasks();
    return;
  }

  const fp = e.target.closest('.f-pill');
  if (fp) {
    filter = fp.dataset.filter;
    document.querySelectorAll('.f-pill').forEach(b => b.classList.remove('active'));
    fp.classList.add('active');
    renderTasks();
    return;
  }

  const np = e.target.closest('.nav-pill[data-view]');
  if (np) { switchView(np.dataset.view); return; }

  const nd = e.target.closest('.note-del');
  if (nd) {
    notes = notes.filter(x => x.id !== nd.dataset.id);
    save();
    renderNotes();
    return;
  }

  const nc = e.target.closest('.note-card');
  if (nc && !e.target.closest('.note-del')) openModal(nc.dataset.id);
});

load();
const saved = localStorage.getItem(TH);
applyTheme(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme:dark)').matches);
switchView('notes');
