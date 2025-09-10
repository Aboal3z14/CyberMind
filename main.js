
// ============================================
// CONFIG / GLOBALS
// ============================================
const API_BASE = "https://cybermind-backend-i44u.onrender.com"; // <-- change if needed

let generatedOTP = null;
let offsetX = 0, offsetY = 0, isDragging = false;
let currentUser = null;

let completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || [];
let usedOTP = JSON.parse(localStorage.getItem('usedOTP')) || false;

// canonical badge requirements (slugs or display IDs supported)
// If your HTML uses display names (with emoji), keep those here. Better: use slugs in data-id.
const badgeRequirements = {
  '🛡️ MFA Enforcer': ['usedOTP'],
  '🧠 Phishing Analyst': ['level2'],
  '🔒 Digital Lockmaster': ['level3'],
  '📱 Mobile Defender': ['level4'],
  '� Social Engineering Aware': ['level5'],
  '🗣️ Human Firewall': ['level6'],
  '� Backup Guardian': ['level7'],
  '🌐 Network Defender': ['level8'],
  '🧠 App Investigator': ['level9'],
  '🔥 Firewall Commander': ['level10'],
  '👁 Threat Hunter': ['level11'],
  '🏆 CyberMind Master': ['level12']
};

// Map slugs to display names (if you later switch to slugs, update here)
const SLUG_TO_DISPLAY = {
  mfa_enforcer: '🛡️ MFA Enforcer',
  phishing_analyst: '🧠 Phishing Analyst',
  digital_lockmaster: '🔒 Digital Lockmaster',
  mobile_defender: '📱 Mobile Defender',
  social_engineering_aware: '� Social Engineering Aware',
  human_firewall: '🗣️ Human Firewall',
  backup_guardian: '� Backup Guardian',
  network_defender: '🌐 Network Defender',
  app_investigator: '🧠 App Investigator',
  firewall_commander: '🔥 Firewall Commander',
  threat_hunter: '👁 Threat Hunter',
  cybermind_master: '🏆 CyberMind Master'
};

// ============================================
// UTILITIES
// ============================================
function qs(id) { return document.getElementById(id); }
function hide(el) { if (!el) return; el.classList.add('hidden'); }
function show(el) { if (!el) return; el.classList.remove('hidden'); }

// Safe fetch wrapper
async function safeFetch(url, options={}) {
  try {
    const res = await fetch(url, options);
    const json = await res.json().catch(()=>null);
    return { ok: res.ok, status: res.status, json };
  } catch (err) {
    return { ok: false, status: 0, error: err };
  }
}

// ============================================
// DOMContentLoaded - init
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // Basic UI elements
  const startBtn = qs("start-btn");
  const loginBtn = qs("login-btn");
  const signupBtn = qs("signup-btn");
  const verifyOtpBtn = qs("verify-otp-btn");
  const startLevelBtn = qs("start-level-btn");
  const badgesBtn = qs("badges-btn");
  const settingsBtn = qs("settings-btn");
  const otpArea = qs("otp-area");

  // Attach listeners (some elements may not exist if HTML differs)
  if (startBtn) startBtn.addEventListener("click", startGame);
  if (loginBtn) loginBtn.addEventListener("click", handleLogin);
  if (signupBtn) signupBtn.addEventListener("click", handleSignup);
  if (verifyOtpBtn) verifyOtpBtn.addEventListener("click", verifyOTP);
  if (startLevelBtn) startLevelBtn.addEventListener("click", startLevel);
  if (badgesBtn) badgesBtn.addEventListener("click", showBadges);
  if (settingsBtn) settingsBtn.addEventListener("click", showSettings);

  // Signup / Login screen toggles (if links exist)
  document.querySelectorAll("[data-show='signup']").forEach(a => a.addEventListener('click', (e)=>{ e.preventDefault(); showSignupScreen(); }));
  document.querySelectorAll("[data-show='login']").forEach(a => a.addEventListener('click', (e)=>{ e.preventDefault(); showLoginScreen(); }));

  // Close overlay buttons
  document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const overlayId = btn.getAttribute("data-close");
      if (overlayId) closeOverlay(overlayId);
    });
  });

  // Click outside overlay closes it
  document.querySelectorAll(".overlay").forEach(ov => {
    ov.addEventListener("click", (e) => {
      if (e.target === ov) ov.classList.add("hidden");
    });
  });

  // Esc to close overlays
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".overlay").forEach(ov => ov.classList.add("hidden"));
    }
  });

  // Load badge states and attach listeners (backwards-compatible approach)
  document.querySelectorAll(".badge").forEach(badge => {
    const id = badge.getAttribute("data-id");
    // restore unlocked from localStorage if present (legacy)
    if (localStorage.getItem(`badge_${id}`) === "unlocked") {
      badge.classList.remove("locked");
      badge.querySelector("img")?.classList.add("unlocked");
    }
    // click behavior: show info only (no unlock by click)
    badge.addEventListener("click", () => {
      if (badge.classList.contains("locked")) {
        const cb = qs("cyberbuddy");
        if (cb) cb.innerHTML = `🤖 <strong>سايبر بودي</strong><br>🔒 الشارة مقفولة!`;
      } else {
        alert(`شارة: ${badge.querySelector(".badge-title")?.innerText || id}\nحالتها: مفتوحة ✅`);
      }
    });
  });

  // Settings
  const musicToggle = qs("musicToggle");
  const sfxToggle = qs("sfxToggle");
  const volumeSlider = qs("volumeSlider");
  const themeSelect = qs("themeSelect");
  const resetBtn = qs("resetProgress");

  if (musicToggle) musicToggle.checked = localStorage.getItem("music") === "on";
  if (sfxToggle) sfxToggle.checked = localStorage.getItem("sfx") === "on";
  if (volumeSlider) volumeSlider.value = localStorage.getItem("volume") || 50;
  if (themeSelect) themeSelect.value = localStorage.getItem("theme") || "matrix";

  applyAudioSettings();

  if (musicToggle) musicToggle.addEventListener("change", (e) => {
    localStorage.setItem("music", e.target.checked ? "on" : "off");
    applyAudioSettings();
  });

  if (sfxToggle) sfxToggle.addEventListener("change", (e) => {
    localStorage.setItem("sfx", e.target.checked ? "on" : "off");
  });

  if (volumeSlider) volumeSlider.addEventListener("input", (e) => {
    localStorage.setItem("volume", e.target.value);
    applyAudioSettings();
  });

  if (themeSelect) themeSelect.addEventListener("change", (e) => {
    localStorage.setItem("theme", e.target.value);
    applyTheme(e.target.value);
  });

  if (resetBtn) resetBtn.addEventListener("click", () => {
    if (confirm("هل أنت متأكد أنك تريد إعادة التقدم؟")) {
      // only clear progress-related keys
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith("badge_") || k === "completedLevels" || k === "usedOTP") localStorage.removeItem(k);
      });
      location.reload();
    }
  });

  // initial theme
  applyTheme(themeSelect?.value || "matrix");

  // make cyberbuddy draggable
  const buddy = qs("cyberbuddy");
  if (buddy) {
    buddy.addEventListener("mousedown", dragStart);
    buddy.addEventListener("touchstart", dragStart, { passive: false });
  }

  // restore badges from server if logged in previously (session)
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = storedUser;
    // load progress but don't block UI
    loadProgressFromServer(currentUser).catch(()=>{});
  }
}); // DOMContentLoaded end

// ============================================
// UI Screen helpers
// ============================================
function showSignupScreen() {
  hide(qs("login-screen"));
  show(qs("signup-screen"));
}

function showLoginScreen() {
  hide(qs("signup-screen"));
  show(qs("login-screen"));
}

function goToMenu() {
  hide(qs("login-screen"));
  hide(qs("signup-screen"));
  show(qs("menu-screen"));
}

// ============================================
// AUTH: frontend <-> backend helpers
// ============================================
async function signupAPI(username, password) {
  if (!username || !password) return { success: false, error: "username and password required" };
  const resp = await safeFetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!resp.ok) return { success: false, error: resp.json?.error || "server error" };
  return resp.json;
}

async function loginAPI(username, password) {
  if (!username || !password) return { success: false, error: "username and password required" };
  const resp = await safeFetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!resp.ok) return { success: false, error: resp.json?.error || "server error" };
  return resp.json;
}

// ============================================
// Signup / Login handlers (UI-level)
// ============================================
async function handleSignup(e) {
  // prevent default if called from form submit
  if (e && e.preventDefault) e.preventDefault();

  const username = (qs("signup-username")?.value || "").trim();
  const password = (qs("signup-password")?.value || "").trim();
  const msgEl = qs("signup-message");

  msgEl && (msgEl.textContent = "");
  if (!username || !password) {
    if (msgEl) { msgEl.style.color = "#ff4d4d"; msgEl.textContent = "من فضلك املا الحقول"; }
    return;
  }

  const res = await signupAPI(username, password);
  if (res.success) {
    if (msgEl) { msgEl.style.color = "#00ff88"; msgEl.textContent = "✅ تم إنشاء الحساب، سجل الدخول الآن"; }
    // create initial progress on server to reserve username
    await ensureUserExists(username).catch(()=>{});
    showLoginScreen();
  } else {
    if (msgEl) { msgEl.style.color = "#ff4d4d"; msgEl.textContent = "❌ " + (res.error || "فشل التسجيل"); }
  }
}

async function handleLogin(e) {
  if (e && e.preventDefault) e.preventDefault();

  // accommodate both old and new IDs
  const username = (qs("login-username")?.value || qs("username")?.value || "").trim();
  const password = (qs("login-password")?.value || qs("password")?.value || "").trim();
  const mfaChecked = qs("mfa-check") ? qs("mfa-check").checked : false;
  const msgEl = qs("login-message") || qs("result-message");

  msgEl && (msgEl.textContent = "");

  if (!username || !password) {
    if (msgEl) { msgEl.style.color = "#ff4d4d"; msgEl.textContent = "من فضلك ادخل اسم المستخدم وكلمة المرور"; }
    return;
  }

  const res = await loginAPI(username, password);
  if (!res.success) {
    if (msgEl) { msgEl.style.color = "#ff4d4d"; msgEl.textContent = "❌ " + (res.error || "فشل تسجيل الدخول"); }
    return;
  }

  currentUser = res.username || username;
  localStorage.setItem("currentUser", currentUser);

  // ensure user row exists in progress DB
  await ensureUserExists(currentUser).catch(()=>{});

  if (mfaChecked) {
    // show OTP flow
    generatedOTP = Math.floor(100000 + Math.random() * 900000);
    qs("otp-code") && (qs("otp-code").textContent = generatedOTP);
    show(qs("otp-toast"));
    show(qs("otp-area"));
    // play sfx if enabled
    const otpSound = qs("otp-sound");
    if (localStorage.getItem("sfx") === "on" && otpSound) {
      otpSound.currentTime = 0;
      otpSound.play().catch(()=>{});
    }
    // hide toast after 7s
    setTimeout(()=>{ hide(qs("otp-toast")); }, 7000);
  } else {
    // normal login flow - load progress and go to menu
    await loadProgressFromServer(currentUser).catch(()=>{});
    goToMenu();
  }
}

// ============================================
// OTP Verification
// ============================================
async function verifyOTP() {
  const input = (qs("otp-input")?.value || "").trim();
  const msgEl = qs("login-message") || qs("result-message");

  if (!generatedOTP) {
    if (msgEl) { msgEl.style.color = "#ff4d4d"; msgEl.textContent = "لم يتم إنشاء رمز تحقق"; }
    return;
  }

  if (input === generatedOTP.toString()) {
    // mark used locally and on server
    usedOTP = true;
    localStorage.setItem("usedOTP", JSON.stringify(true));
    // notify server to set used_otp for this user and recompute badges
    if (currentUser) {
      await notifyServerOtpUsed(currentUser).catch(()=>{});
    }
    if (msgEl) { msgEl.style.color = "#00ff88"; msgEl.textContent = "✅ تم التحقق"; }
    // hide OTP area and go to menu
    hide(qs("otp-area"));
    goToMenu();
  } else {
    if (msgEl) { msgEl.style.color = "#ff4d4d"; msgEl.textContent = "❌ الرمز غير صحيح"; }
  }
}

// ============================================
// Backend Progress API helpers
// ============================================
async function ensureUserExists(username) {
  // call /progress/save with empty/default data - this will upsert a row
  if (!username) return;
  await safeFetch(`${API_BASE}/progress/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      badges: {}, 
      completed_levels: [],
      used_otp: false
    })
  });
}

async function loadProgressFromServer(username) {
  if (!username) return;
  const resp = await safeFetch(`${API_BASE}/progress/${encodeURIComponent(username)}`);
  if (!resp.ok) throw new Error("Failed to load progress");
  const data = resp.json || {};
  // apply server values locally
  completedLevels = data.completed_levels || [];
  usedOTP = !!data.used_otp;
  localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
  localStorage.setItem('usedOTP', JSON.stringify(usedOTP));
  // apply badges UI
  applyBadgesFromServer(data.badges || {});
}

async function notifyServerOtpUsed(username) {
  if (!username) return;
  const resp = await safeFetch(`${API_BASE}/progress/unlock-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  if (resp.ok) {
    // refresh progress
    await loadProgressFromServer(username).catch(()=>{});
  }
}

async function notifyServerCompleteLevel(username, levelId) {
  if (!username || !levelId) return;
  await safeFetch(`${API_BASE}/progress/complete-level`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, levelId })
  });
  await loadProgressFromServer(username).catch(()=>{});
}

// Applies badges JSON from server to UI
function applyBadgesFromServer(badgesObj) {
  // badgesObj can use slugs (mfa_enforcer) or display names
  Object.entries(badgesObj).forEach(([slug, unlocked]) => {
    const display = SLUG_TO_DISPLAY[slug];
    let badgeEl = document.querySelector(`.badge[data-id="${slug}"]`);
    if (!badgeEl && display) badgeEl = document.querySelector(`.badge[data-id="${display}"]`);
    if (!badgeEl) return;
    if (unlocked) badgeEl.classList.remove('locked');
    else badgeEl.classList.add('locked');
    // persist local fallback
    localStorage.setItem(`badge_${badgeEl.getAttribute('data-id')}`, unlocked ? 'unlocked' : 'locked');
  });
}

// ============================================
// BADGES LOGIC (client-side checks & unlocks)
// ============================================
function unlockBadge(id) {
  const badge = document.querySelector(`.badge[data-id="${id}"]`);
  if (!badge || !badge.classList.contains("locked")) return false;

  // MFA special: require usedOTP
  if (id === '🛡️ MFA Enforcer' && !usedOTP) {
    const cb = qs("cyberbuddy");
    if (cb) cb.innerHTML = `🤖 <strong>سايبر بودي</strong><br>🔒 لازم تستخدم التحقق بخطوتين (OTP) عشان تفتح الشارة دي!`;
    return false;
  }

  // check requirements
  const reqs = badgeRequirements[id];
  if (!reqs) return false;
  const ok = reqs.every(r => {
    if (r === 'usedOTP') return usedOTP === true;
    return completedLevels.includes(r);
  });
  if (!ok) {
    const cb = qs("cyberbuddy");
    if (cb) {
      const reqText = reqs.map(r => r === 'usedOTP' ? 'استخدام التحقق بخطوتين' : `المرحلة ${r.replace('level','')}`).join(' و ');
      cb.innerHTML = `🤖 <strong>سايبر بودي</strong><br>🔒 تحتاج إكمال ${reqText} لفتح هذه الشارة!`;
    }
    return false;
  }

  // unlock visually & locally
  badge.classList.remove("locked");
  badge.querySelector("img")?.classList.add("unlocked");
  localStorage.setItem(`badge_${id}`, "unlocked");

  // optionally notify server (you may prefer server-driven badges)
  if (currentUser) {
    // Build a minimal badges object for server (preserve existing server state would require fetch/merge)
    const badgeSlug = findBadgeSlugByDisplay(id);
    const payload = {};
    if (badgeSlug) payload[badgeSlug] = true;
    // send to server->progress/save (merge)
    safeFetch(`${API_BASE}/progress/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser, badges: payload, completed_levels: completedLevels, used_otp: usedOTP })
    }).catch(()=>{});
  }

  // play unlock sound
  if (localStorage.getItem("sfx") === "on") {
    const sfx = qs("unlock-sound");
    if (sfx) { sfx.currentTime = 0; sfx.play().catch(()=>{}); }
  }
  return true;
}

function findBadgeSlugByDisplay(display) {
  for (const [slug, disp] of Object.entries(SLUG_TO_DISPLAY)) {
    if (disp === display) return slug;
  }
  return null;
}

function completeLevel(levelId) {
  if (!completedLevels.includes(levelId)) {
    completedLevels.push(levelId);
    localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
    // recompute unlocks
    Object.keys(badgeRequirements).forEach(bid => unlockBadge(bid));
    // notify server
    if (currentUser) notifyServerCompleteLevel(currentUser, levelId).catch(()=>{});
  }
}

// On load, restore badges with special MFA check
document.addEventListener("DOMContentLoaded", () => {
  Object.keys(badgeRequirements).forEach(badgeId => {
    const badge = document.querySelector(`.badge[data-id="${badgeId}"]`);
    if (!badge) return;
    if (badgeId === '🛡️ MFA Enforcer') {
      const otpUsed = JSON.parse(localStorage.getItem("usedOTP")) || false;
      if (otpUsed && localStorage.getItem(`badge_${badgeId}`) === "unlocked") badge.classList.remove("locked");
      else badge.classList.add("locked");
    } else {
      if (localStorage.getItem(`badge_${badgeId}`) === "unlocked") badge.classList.remove("locked");
    }
  });
});

// ============================================
// CYBERBUDDY / OPENAI LINK (frontend)
// ============================================
async function getCyberBuddyResponse(userMessage) {
  if (!userMessage) return "قولّي تحب أعمل إيه؟";
  try {
    const resp = await safeFetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });
    if (resp.ok && resp.json && resp.json.reply) return resp.json.reply;
    return resp.json?.reply || "حصلت مشكلة، حاول تاني";
  } catch (err) {
    return "حصلت مشكلة في الاتصال بالمخدم";
  }
}

// ============================================
// MATRIX BACKGROUND (same effect)
// ============================================
(function initMatrix() {
  const canvas = qs("matrix");
  const ctx = canvas ? canvas.getContext("2d") : null;
  if (!canvas || !ctx) return;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  setInterval(drawMatrix, 50);
})();

// ============================================
// AUDIO / THEME HELPERS
// ============================================
function applyAudioSettings() {
  const bgMusic = qs("bg-music");
  const volume = Number(localStorage.getItem("volume") || 50) / 100;
  const musicOn = localStorage.getItem("music") === "on";
  if (bgMusic) {
    bgMusic.volume = volume;
    if (musicOn) bgMusic.play().catch(()=>{});
    else bgMusic.pause();
  }
  const otp = qs("otp-sound");
  const unlock = qs("unlock-sound");
  if (otp) otp.volume = volume;
  if (unlock) unlock.volume = volume;
}

function applyTheme(theme) {
  if (theme === "matrix") {
    qs("matrix")?.classList.remove("hidden");
    document.body.style.backgroundColor = "#0f0f1a";
  } else {
    qs("matrix")?.classList.add("hidden");
    document.body.style.backgroundColor = "#0b0b0d";
  }
}

// ============================================
// DRAGGING CYBERBUDDY (mouse & touch)
// ============================================
function dragStart(e) {
  e.preventDefault();
  const box = qs("cyberbuddy");
  if (!box) return;
  isDragging = true;
  const rect = box.getBoundingClientRect();
  const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
  const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchmove", drag, { passive: false });
  document.addEventListener("touchend", dragEnd);
}

function drag(e) {
  if (!isDragging) return;
  e.preventDefault();
  const box = qs("cyberbuddy");
  if (!box) return;
  const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
  const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
  const newLeft = clientX - offsetX;
  const newTop = clientY - offsetY;
  const maxLeft = window.innerWidth - box.offsetWidth - 10;
  const maxTop = window.innerHeight - box.offsetHeight - 10;
  box.style.left = Math.min(Math.max(10, newLeft), maxLeft) + "px";
  box.style.top = Math.min(Math.max(10, newTop), maxTop) + "px";
  box.style.right = "auto";
  box.style.bottom = "auto";
}

function dragEnd() {
  isDragging = false;
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", dragEnd);
  document.removeEventListener("touchmove", drag);
  document.removeEventListener("touchend", dragEnd);
}

// ============================================
// DEBUG / DEV Utilities (optional)
// ============================================
async function debugFetchAllProgress() {
  const resp = await safeFetch(`${API_BASE}/debug/all-progress`);
  if (resp.ok) return resp.json;
  return null;
}

// expose some functions for console debugging
window.CyberMind = {
  completeLevel, unlockBadge, loadProgressFromServer, notifyServerCompleteLevel, debugFetchAllProgress
};

