// ─── DOM References ───────────────────────────────────────────────────────────
const createIcon    = document.querySelector('.board-fab');
const createEnv     = document.querySelector('.new-selector');
const createButton  = document.querySelector('.create-button');
const panelCloseBtn = document.getElementById('panel-close');

const searchToggle  = document.querySelector('#search-toggle');
const searchBar     = document.querySelector('.searchbar');
const searchInput   = document.getElementById('userSearch');
const searchButton  = document.querySelector('.search-go');

const newBoardBtn   = document.querySelector('.add-board');
const boardNav      = document.querySelector('.boards-nav');

const composerEl    = document.getElementById('stringInput');
const formatBtns    = document.querySelectorAll('.fmt-btn');
const imagePasteBtn = document.getElementById('img-paste-btn');
const imageUploader = document.getElementById('image-uploader');

const saveBtn       = document.querySelector('.save1');
const statusBar     = document.getElementById('status-bar-msg');

let activeId    = '';
let colorSelect = 'rgb(255, 213, 0)';

// ─── Utilities ────────────────────────────────────────────────────────────────
function stripTags(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function setStatus(msg, duration = 3000) {
  if (!statusBar) return;
  statusBar.textContent = msg;
  if (duration > 0) setTimeout(() => { statusBar.textContent = 'Ready'; }, duration);
}

function markUnsaved() {
  const ind = document.getElementById('unsaved-indicator');
  if (ind) ind.style.display = 'inline';
}
function markSaved() {
  const ind = document.getElementById('unsaved-indicator');
  if (ind) ind.style.display = 'none';
}

function insertHtmlAtCursor(html) {
  composerEl.focus();
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const frag = range.createContextualFragment(html);
  const last = frag.lastChild;
  range.insertNode(frag);
  if (last) {
    const after = document.createRange();
    after.setStartAfter(last);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);
  }
}

// ─── Persistence ──────────────────────────────────────────────────────────────
let postContainer = {};

function saveToStorage() {
  try {
    // Save tab order alongside data
    const order = Array.from(document.querySelectorAll('.board-tab'))
      .map(t => t.id.replace('tab', ''));
    localStorage.setItem('permanentContainer', JSON.stringify(postContainer));
    localStorage.setItem('boardOrder', JSON.stringify(order));
    markSaved();
    setStatus('Saved ✓', 2500);
  } catch (e) {
    setStatus('Save failed!', 4000);
  }
}

saveBtn.addEventListener('click', saveToStorage);

// ─── Board Management ─────────────────────────────────────────────────────────
function buildBoardEl(id) {
  const boardCont = document.querySelector('.boards-container');
  const board = document.createElement('div');
  board.classList.add('board');
  board.id = String(id);
  boardCont.appendChild(board);

  const tab = document.createElement('div');
  tab.classList.add('board-tab');
  tab.id = `tab${id}`;
  tab.draggable = true;

  const tabTitle = document.createElement('span');
  tabTitle.classList.add('board-title');
  tabTitle.textContent = postContainer[id]?.boardTitle || `Board ${id}`;
  tab.appendChild(tabTitle);

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('board-close');
  closeBtn.innerHTML = '✕';
  closeBtn.title = 'Close board';
  tab.appendChild(closeBtn);

  // Insert before the add-board button
  boardNav.insertBefore(tab, newBoardBtn);
  setupTabDrag(tab);
}

function createBoard() {
  const id = Date.now();
  postContainer[id] = { boardTitle: 'Untitled' };
  buildBoardEl(id);
  const tab = document.getElementById(`tab${id}`);
  switchBoard(tab);
  markUnsaved();
  // Auto-focus the title for rename
  setTimeout(() => {
    const t = tab.querySelector('.board-title');
    if (t) makeEditable(t);
  }, 80);
}

function deleteBoard(boardEl) {
  if (!boardEl) return;
  const tab = document.getElementById(`tab${boardEl.id}`);
  delete postContainer[boardEl.id];
  boardEl.remove();
  if (tab) tab.remove();
  const remaining = document.querySelector('.board-tab');
  if (remaining) switchBoard(remaining);
  markUnsaved();
  saveToStorage();
}

function switchBoard(tabEl) {
  document.querySelectorAll('.board').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.board-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');
  const id = tabEl.id.replace('tab', '');
  const boardEl = document.getElementById(id);
  if (boardEl) boardEl.classList.add('active');
  activeId = id;
  try { localStorage.setItem('lastActiveBoard', activeId); } catch (e) {}
  const title = postContainer[id]?.boardTitle || id;
  setStatus(`Board: ${title}`, 2000);
}

function makeEditable(titleEl) {
  titleEl.setAttribute('contenteditable', 'true');
  titleEl.focus();
  // select all text
  const range = document.createRange();
  range.selectNodeContents(titleEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  function onKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); }
    e.stopPropagation();
  }
  function onBlur() {
    titleEl.removeAttribute('contenteditable');
    titleEl.removeEventListener('keydown', onKey);
    titleEl.removeEventListener('blur', onBlur);
    const boardId = titleEl.closest('.board-tab').id.replace('tab', '');
    if (postContainer[boardId]) {
      postContainer[boardId].boardTitle = titleEl.textContent.trim() || `Board ${boardId}`;
    }
    markUnsaved();
  }
  titleEl.addEventListener('keydown', onKey);
  titleEl.addEventListener('blur', onBlur);
}

boardNav.addEventListener('click', (e) => {
  const closeBtn = e.target.closest('.board-close');
  const tab      = e.target.closest('.board-tab');
  const title    = e.target.closest('.board-title');

  if (closeBtn && tab) {
    const boardEl = document.getElementById(tab.id.replace('tab', ''));
    if (boardEl) deleteBoard(boardEl);
    return;
  }
  if (title && tab && tab.classList.contains('active')) {
    makeEditable(title);
    return;
  }
  if (tab) switchBoard(tab);
});

newBoardBtn.addEventListener('click', createBoard);

// ─── Tab Drag-to-Reorder ──────────────────────────────────────────────────────
let dragSrcTab = null;

function setupTabDrag(tab) {
  tab.addEventListener('dragstart', (e) => {
    dragSrcTab = tab;
    tab.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tab.id);
  });
  tab.addEventListener('dragend', () => {
    tab.classList.remove('dragging');
    document.querySelectorAll('.board-tab').forEach(t => t.classList.remove('drag-over'));
    dragSrcTab = null;
    markUnsaved();
  });
  tab.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragSrcTab && dragSrcTab !== tab) {
      document.querySelectorAll('.board-tab').forEach(t => t.classList.remove('drag-over'));
      tab.classList.add('drag-over');
    }
  });
  tab.addEventListener('dragleave', () => tab.classList.remove('drag-over'));
  tab.addEventListener('drop', (e) => {
    e.preventDefault();
    tab.classList.remove('drag-over');
    if (!dragSrcTab || dragSrcTab === tab) return;
    // Insert dragSrcTab before this tab
    boardNav.insertBefore(dragSrcTab, tab);
  });
}

// ─── Post-it Construction ─────────────────────────────────────────────────────
function buildPostIt(boardId, key, htmlContent, color, x, y) {
  const container = document.getElementById(boardId);
  if (!container) return;
  if (!color || color === 'null') color = 'rgb(255, 213, 0)';

  const div       = document.createElement('div');
  const divHeader = document.createElement('div');
  const divBorder = document.createElement('div');
  const divTitle  = document.createElement('div');
  const divSep    = document.createElement('div');
  const divText   = document.createElement('div');
  const divClose  = document.createElement('button');
  const divEdit   = document.createElement('button');

  div.classList.add('div-container');
  div.style.backgroundColor = color;
  div.style.left = `${x}px`;
  div.style.top  = `${y}px`;
  div.dataset.postKey = key;

  // Title bar (Win95 titlebar style)
  divBorder.classList.add('div-border');
  divTitle.classList.add('div-title');
  divTitle.textContent = key;

  divClose.classList.add('div-close');
  divClose.innerHTML = '✕';
  divClose.title = 'Delete';

  divEdit.classList.add('div-edit');
  divEdit.innerHTML = '✎';
  divEdit.title = 'Edit';

  divBorder.appendChild(divTitle);
  divBorder.appendChild(divEdit);
  divBorder.appendChild(divClose);

  // Separator
  divSep.classList.add('div-sep');

  // Body
  divText.classList.add('div-text');
  divText.innerHTML = htmlContent || '';

  div.appendChild(divBorder);
  div.appendChild(divSep);
  div.appendChild(divText);
  container.appendChild(div);
}

// ─── Create Post-it ───────────────────────────────────────────────────────────
createButton.addEventListener('click', () => {
  const titleInput = document.getElementById('newTitle');
  const newTitle   = titleInput.value.trim();
  const newHtml    = composerEl.innerHTML.trim();
  const newColor   = colorSelect || 'rgb(255, 213, 0)';

  if (!newTitle) { setStatus('Please enter a title.', 2500); return; }
  if (!newHtml)  { setStatus('Please enter some content.', 2500); return; }

  const x = 60 + Math.random() * Math.max(60, window.innerWidth - 500);
  const y = 60 + Math.random() * Math.max(60, window.innerHeight - 350);

  postContainer[activeId][newTitle] = { html: newHtml, text: stripTags(newHtml), color: newColor, x, y };
  buildPostIt(activeId, newTitle, newHtml, newColor, x, y);
  markUnsaved();
  saveToStorage();

  // Reset form
  titleInput.value = '';
  composerEl.innerHTML = '';
  resetColorPicker();
  setStatus(`Created "${newTitle}"`, 2500);
});

// ─── Color Picker (HSL + Hex + Presets) ──────────────────────────────────────
const hueSlider = document.getElementById('color-hue');
const satSlider = document.getElementById('color-sat');
const litSlider = document.getElementById('color-lit');
const hexInput  = document.getElementById('color-hex');
const colorPreview = document.getElementById('color-preview');

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1]+hex[1],16); g = parseInt(hex[2]+hex[2],16); b = parseInt(hex[3]+hex[3],16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1,3),16); g = parseInt(hex.slice(3,5),16); b = parseInt(hex.slice(5,7),16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) {
      case r: h=((g-b)/d + (g<b?6:0))/6; break;
      case g: h=((b-r)/d + 2)/6; break;
      case b: h=((r-g)/d + 4)/6; break;
    }
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}

function updateColorFromSliders() {
  const h = hueSlider.value, s = satSlider.value, l = litSlider.value;
  const hex = hslToHex(+h, +s, +l);
  colorSelect = `hsl(${h},${s}%,${l}%)`;
  colorPreview.style.backgroundColor = colorSelect;
  hexInput.value = hex;
  createButton.style.backgroundColor = colorSelect;
  createButton.style.color = +l > 55 ? '#000' : '#fff';
  updateHueTrack();
}

function updateHueTrack() {
  if (hueSlider) {
    hueSlider.style.setProperty('--hue', hueSlider.value);
  }
}

function updateColorFromHex(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  const [h,s,l] = hexToHsl(hex);
  hueSlider.value = h; satSlider.value = s; litSlider.value = l;
  colorSelect = `hsl(${h},${s}%,${l}%)`;
  colorPreview.style.backgroundColor = colorSelect;
  createButton.style.backgroundColor = colorSelect;
  createButton.style.color = l > 55 ? '#000' : '#fff';
  updateHueTrack();
}

function resetColorPicker() {
  hueSlider.value = 48; satSlider.value = 100; litSlider.value = 50;
  colorSelect = 'rgb(255, 213, 0)';
  colorPreview.style.backgroundColor = colorSelect;
  hexInput.value = '#ffd500';
  createButton.style.backgroundColor = '';
  createButton.style.color = '';
  document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('selected'));
}

if (hueSlider) {
  hueSlider.addEventListener('input', updateColorFromSliders);
  satSlider.addEventListener('input', updateColorFromSliders);
  litSlider.addEventListener('input', updateColorFromSliders);
  hexInput.addEventListener('change', () => updateColorFromHex(hexInput.value));
  hexInput.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) updateColorFromHex(hexInput.value);
  });
}

document.querySelectorAll('.color-preset').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateColorFromHex(btn.dataset.color);
  });
});

// ─── Formatting Toolbar ───────────────────────────────────────────────────────
formatBtns.forEach(btn => {
  btn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    document.execCommand(btn.dataset.cmd, false, null);
  });
});

// Helper: is the cursor currently inside a list element?
function cursorInList() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return false;
  let node = sel.getRangeAt(0).startContainer;
  while (node) {
    if (node.nodeName === 'UL' || node.nodeName === 'OL' || node.nodeName === 'LI') return true;
    node = node.parentNode;
  }
  return false;
}

composerEl.addEventListener('keydown', (e) => {
  // Tab inside a list → indent; Shift+Tab → outdent
  if (e.key === 'Tab') {
    e.preventDefault();
    if (cursorInList()) {
      document.execCommand(e.shiftKey ? 'outdent' : 'indent', false, null);
    } else {
      // outside a list: insert two non-breaking spaces
      document.execCommand('insertText', false, '  ');
    }
    return;
  }
  if (!(e.ctrlKey || e.metaKey)) return;
  const map = { b:'bold', i:'italic', u:'underline' };
  if (map[e.key.toLowerCase()]) { e.preventDefault(); document.execCommand(map[e.key.toLowerCase()], false, null); }
});

// ─── Image Insertion ──────────────────────────────────────────────────────────
imagePasteBtn.addEventListener('click', () => imageUploader.click());

imageUploader.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => insertHtmlAtCursor(`<img src="${evt.target.result}" style="max-width:100%;display:block;margin:4px 0">`);
  reader.readAsDataURL(file);
  imageUploader.value = '';
});

composerEl.addEventListener('paste', (e) => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = evt => insertHtmlAtCursor(`<img src="${evt.target.result}" style="max-width:100%;display:block;margin:4px 0">`);
      reader.readAsDataURL(item.getAsFile());
      return;
    }
  }
});

// ─── New Post-it Panel Toggle ─────────────────────────────────────────────────
function openCreatePanel() {
  createEnv.classList.add('open');
  createIcon.classList.add('activated');
  searchBar.classList.remove('searching');
  closeSearchResults();
}
function closeCreatePanel() {
  createEnv.classList.remove('open');
  createIcon.classList.remove('activated');
}

createIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  createEnv.classList.contains('open') ? closeCreatePanel() : openCreatePanel();
});

if (panelCloseBtn) {
  panelCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeCreatePanel();
  });
}

// Close panel when clicking outside
document.addEventListener('click', (e) => {
  if (createEnv.classList.contains('open') &&
      !createEnv.contains(e.target) &&
      !createIcon.contains(e.target)) {
    closeCreatePanel();
  }
});

// Keyboard shortcut: N opens new note panel
document.addEventListener('keydown', (e) => {
  if (e.key === 'n' && !e.ctrlKey && !e.metaKey &&
      document.activeElement.tagName !== 'INPUT' &&
      !document.activeElement.isContentEditable) {
    openCreatePanel();
    document.getElementById('newTitle')?.focus();
  }
});

// ─── Format Button Toggle State ───────────────────────────────────────────────
function updateFormatButtonStates() {
  formatBtns.forEach(btn => {
    const cmd = btn.dataset.cmd;
    if (!cmd || cmd === 'insertUnorderedList') return;
    try {
      const active = document.queryCommandState(cmd);
      btn.classList.toggle('active', active);
    } catch (e) {}
  });
  // bullet button
  const bulletBtn = document.querySelector('.fmt-btn[data-cmd="insertUnorderedList"]');
  if (bulletBtn) {
    try {
      bulletBtn.classList.toggle('active', document.queryCommandState('insertUnorderedList'));
    } catch(e) {}
  }
}

composerEl.addEventListener('keyup', updateFormatButtonStates);
composerEl.addEventListener('mouseup', updateFormatButtonStates);
composerEl.addEventListener('focus', updateFormatButtonStates);
document.addEventListener('selectionchange', () => {
  if (document.activeElement === composerEl) updateFormatButtonStates();
});

// ─── Delete / Edit Post-it ────────────────────────────────────────────────────
function deletePostIt(box) {
  const key = box.dataset.postKey;
  if (activeId && postContainer[activeId]) delete postContainer[activeId][key];
  box.remove();
  markUnsaved();
  saveToStorage();
}

function openInlineEdit(box) {
  if (box.classList.contains('editing')) return;
  const titleEl = box.querySelector('.div-title');
  const textEl  = box.querySelector('.div-text');
  const oldKey  = box.dataset.postKey;

  box.classList.add('editing');
  titleEl.setAttribute('contenteditable', 'true');
  textEl.setAttribute('contenteditable', 'true');

  if (!box.querySelector('.inline-fmt')) {
    const bar = document.createElement('div');
    bar.className = 'inline-fmt';
    bar.innerHTML = `
      <button data-cmd="bold"                title="Bold (Ctrl+B)"><b>B</b></button>
      <button data-cmd="italic"              title="Italic (Ctrl+I)"><i>I</i></button>
      <button data-cmd="underline"           title="Underline (Ctrl+U)"><u>U</u></button>
      <button data-cmd="insertUnorderedList" title="Bullet list">≡</button>
    `;

    function updateInlineBtns() {
      bar.querySelectorAll('button[data-cmd]').forEach(b => {
        try { b.classList.toggle('active', document.queryCommandState(b.dataset.cmd)); } catch(e) {}
      });
    }

    bar.querySelectorAll('button').forEach(b => {
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.execCommand(b.dataset.cmd, false, null);
        setTimeout(updateInlineBtns, 0);
      });
    });
    textEl.addEventListener('keyup',   updateInlineBtns);
    textEl.addEventListener('mouseup', updateInlineBtns);

    box.insertBefore(bar, textEl);
  }

  textEl.focus();

  let saveTimeout = null;
  function scheduleFinish() { clearTimeout(saveTimeout); saveTimeout = setTimeout(finishEdit, 180); }
  function cancelFinish()   { clearTimeout(saveTimeout); }

  function finishEdit() {
    if (box.contains(document.activeElement)) return;
    const newTitle = titleEl.textContent.trim() || oldKey;
    const newHtml  = textEl.innerHTML;
    const boardId  = document.querySelector('.board.active')?.id || activeId;

    if (postContainer[boardId]?.[oldKey]) {
      if (newTitle !== oldKey) {
        postContainer[boardId][newTitle] = postContainer[boardId][oldKey];
        delete postContainer[boardId][oldKey];
        box.dataset.postKey = newTitle;
        titleEl.textContent = newTitle;
      }
      postContainer[boardId][newTitle].html = newHtml;
      postContainer[boardId][newTitle].text = stripTags(newHtml);
    }
    markUnsaved();
    saveToStorage();
    titleEl.removeAttribute('contenteditable');
    textEl.removeAttribute('contenteditable');
    box.classList.remove('editing');
    const bar = box.querySelector('.inline-fmt');
    if (bar) bar.remove();
    titleEl.removeEventListener('blur', scheduleFinish);
    textEl.removeEventListener('blur', scheduleFinish);
    titleEl.removeEventListener('focus', cancelFinish);
    textEl.removeEventListener('focus', cancelFinish);
  }

  titleEl.addEventListener('blur', scheduleFinish);
  textEl.addEventListener('blur', scheduleFinish);
  titleEl.addEventListener('focus', cancelFinish);
  textEl.addEventListener('focus', cancelFinish);
  textEl.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (cursorInList()) {
        document.execCommand(e.shiftKey ? 'outdent' : 'indent', false, null);
      } else {
        document.execCommand('insertText', false, '  ');
      }
      return;
    }
    if (e.key === 'Escape') textEl.blur();
  });
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.div-close')) { deletePostIt(e.target.closest('.div-container')); return; }
  if (e.target.closest('.div-edit'))  { openInlineEdit(e.target.closest('.div-container')); return; }
});

// ─── Drag Post-its ────────────────────────────────────────────────────────────
document.querySelector('.boards-container').addEventListener('mousedown', (e) => {
  if (e.target.closest('.div-close, .div-edit, .inline-fmt, [contenteditable="true"]')) return;
  const box = e.target.closest('.div-container');
  if (!box) return;

  let dragged = false;
  const startX = e.clientX - box.offsetLeft;
  const startY = e.clientY - box.offsetTop;

  function onMove(me) {
    dragged = true;
    box.style.left = `${me.clientX - startX}px`;
    box.style.top  = `${me.clientY - startY}px`;
    box.style.zIndex = 9999;
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    box.style.zIndex = '';
    if (dragged) {
      const bid = document.querySelector('.board.active')?.id || activeId;
      const key = box.dataset.postKey;
      if (postContainer[bid]?.[key]) {
        postContainer[bid][key].x = box.offsetLeft;
        postContainer[bid][key].y = box.offsetTop;
      }
      markUnsaved();
      saveToStorage();
    }
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
});

// ─── Search ───────────────────────────────────────────────────────────────────
function closeSearchResults() {
  const old = document.querySelector('.search-results');
  if (old) old.remove();
}

searchToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  // Close create panel if open
  createEnv.classList.remove('open');
  createIcon.classList.remove('activated');

  const open = searchBar.classList.toggle('searching');
  if (open) searchInput.focus();
  else closeSearchResults();
});

function runSearch() {
  const q = searchInput.value.toLowerCase().trim();
  closeSearchResults();
  if (!q) return;

  const resultsBox = document.createElement('div');
  resultsBox.classList.add('search-results');

  const header = document.createElement('div');
  header.className = 'search-results-header';
  header.innerHTML = `<span>Results for "<strong>${escapeHtml(q)}</strong>"</span><button class="search-close-btn">✕</button>`;
  header.querySelector('.search-close-btn').addEventListener('click', closeSearchResults);
  resultsBox.appendChild(header);

  const results = [];
  Object.keys(postContainer).forEach(boardId => {
    const board = postContainer[boardId];
    const boardTitle = board.boardTitle || `Board ${boardId}`;
    Object.keys(board).forEach(postKey => {
      if (postKey === 'boardTitle') return;
      const post = board[postKey];
      const plainText = (post.text || '').toLowerCase();
      if (postKey.toLowerCase().includes(q) || plainText.includes(q)) {
        results.push({ boardId, boardTitle, title: postKey, snippet: stripTags(post.html || post.text || '').slice(0, 100) });
      }
    });
  });

  if (results.length === 0) {
    const noRes = document.createElement('div');
    noRes.className = 'search-no-results';
    noRes.textContent = 'No matches found.';
    resultsBox.appendChild(noRes);
  } else {
    results.forEach(r => {
      const item = document.createElement('div');
      item.classList.add('search-result-item');
      const re = new RegExp(`(${escapeHtml(q)})`, 'gi');
      const hl = escapeHtml(r.snippet).replace(re, '<mark>$1</mark>');
      item.innerHTML = `<div class="sr-title">${escapeHtml(r.title)}</div><div class="sr-board">📋 ${escapeHtml(r.boardTitle)}</div><div class="sr-snippet">${hl}</div>`;
      item.addEventListener('click', () => {
        const tab = document.getElementById('tab' + r.boardId);
        if (tab) switchBoard(tab);
        closeSearchResults();
        setTimeout(() => {
          document.querySelectorAll('.div-container').forEach(el => {
            if (el.dataset.postKey === r.title) {
              el.classList.add('highlighted');
              setTimeout(() => el.classList.remove('highlighted'), 2500);
            }
          });
        }, 100);
      });
      resultsBox.appendChild(item);
    });
  }

  document.querySelector('.search-group').appendChild(resultsBox);
}

searchButton.addEventListener('click', runSearch);
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch();
  if (e.key === 'Escape') { searchBar.classList.remove('searching'); closeSearchResults(); }
});
let searchDebounce = null;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => { if (searchInput.value.trim().length >= 2) runSearch(); }, 300);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  postContainer = JSON.parse(localStorage.getItem('permanentContainer')) || {};
  const lastActive = localStorage.getItem('lastActiveBoard');
  const savedOrder = JSON.parse(localStorage.getItem('boardOrder')) || null;

  if (Object.keys(postContainer).length === 0) {
    // ── Demo seed — shown to first-time visitors ──────────────────────────────
    // Board 1: Welcome!
    postContainer['1'] = {
      boardTitle: 'Welcome!',

      'My First "Full-Stack" Project': {
        html: `Welcome to my second independent project!<br><br>I call it <b>Post-It Que?</b> <i>(post-it what?)</i>`,
        text: 'Welcome to my second independent project! I call it Post-It Que? (post-it what?)',
        color: 'rgb(0, 255, 0)',
        x: 52, y: 140
      },

      'Inspiration': {
        html: `Call me simple, but I still use Post-It notes everyday to keep track of things I need to get done.<br><br>Simultaneously, I'd been using MS OneNote a LOT at work.<br><br><b>Post-It Que</b> was born mainly from those two influences (and the need to practice my newly-learned JavaScript skills)`,
        text: 'Call me simple, but I still use Post-It notes everyday to keep track of things I need to get done.',
        color: 'rgb(218, 125, 244)',
        x: 275, y: 140
      },

      'About': {
        html: `The tool is pretty simple:<br>- <b>HTML</b> shell to structure the website<br>- <b>CSS</b> (variables) to set consistent styles for reusable elements in the UI<br>- <b>JavaScript</b> to define elements (post-its and boards) and their respective functions`,
        text: 'The tool is pretty simple: HTML shell to structure the website. CSS variables to set consistent styles. JavaScript to define elements.',
        color: 'rgb(14, 135, 255)',
        x: 496, y: 140
      },

      'Functionalities': {
        html: `<ul><li><b>Create</b>, edit, and delete post-its</li><li>Add bold, italic, underlined, or event pasted images to your post-it</li><li>Query amongst all saved data using the <b>Search</b> button</li><li><b>Save</b> data (in localStorage)</li></ul>`,
        text: 'Create, edit, and delete post-its. Add bold, italic, underlined, or event pasted images to your post-it.',
        color: 'rgb(255, 80, 80)',
        x: 706, y: 140
      },

      'Image Functionality': {
        html: `<b>You can even paste images!</b><br><i>(my girlfriend is not too happy about the screenshot I'm using for it)</i><br><img src="./sample-img.jpg" style="max-width:100%;display:block;margin:4px 0">`,
        text: 'You can even paste images!',
        color: 'rgb(255, 213, 0)',
        x: 706, y: 340
      }
    };

    // Board 2: Try it Out!
    postContainer['2'] = {
      boardTitle: 'Try it Out!',

      'Try It Out': {
        html: `If you made it this far, <b>try it out!</b> Make a note that says:<ul><li>Your name (or initials)</li><li>A short message <i>(try pasting an image in!)</i></li><li>Drag the post-it wherever you want on the board</li></ul>`,
        text: 'If you made it this far, try it out! Make a note that says: Your name, a short message, drag it around.',
        color: 'rgb(42, 161, 152)',
        x: 36, y: 130
      },

      'Example': {
        html: `Hello! Checking in from Albuquerque.<br>- KM<br><img src="./sample-img1.webp" style="max-width:100%;display:block;margin:4px 0">`,
        text: 'Hello! Checking in from Albuquerque. - KM',
        color: 'rgb(255, 213, 0)',
        x: 36, y: 320
      }
    };
    // ─────────────────────────────────────────────────────────────────────────
  }

  // Build boards in saved order if available
  const allIds = Object.keys(postContainer);
  const savedOrderDefault = allIds; // insertion order is correct for fresh seed
  const orderedIds = savedOrder
    ? [...savedOrder.filter(id => allIds.includes(id)), ...allIds.filter(id => !savedOrder.includes(id))]
    : savedOrderDefault;

  orderedIds.forEach(boardId => {
    buildBoardEl(boardId);
    Object.keys(postContainer[boardId]).forEach(key => {
      if (key === 'boardTitle') return;
      const p = postContainer[boardId][key];
      if (p && p.x !== undefined) {
        buildPostIt(boardId, key, p.html || escapeHtml(p.text || ''), p.color, p.x, p.y);
      }
    });
  });

  let toActivate = lastActive ? document.getElementById(`tab${lastActive}`) : null;
  if (!toActivate) toActivate = document.querySelector('.board-tab');
  if (toActivate) switchBoard(toActivate);

  createEnv.classList.remove('open');

  // Init color picker display
  updateColorFromSliders();
  setStatus('Ready', 0);
  markSaved();
});
