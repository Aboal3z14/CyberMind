// ============================================
// 🧠 GLOBAL VARIABLES
// ============================================
let generatedOTP = null;
let offsetX = 0, offsetY = 0, isDragging = false;
let currentUser = null;
const API_BASE = "https://cybermind-backend-i44u.onrender.com";

// ============================================
// 🚀 STARTUP & DOM INIT
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("main.js loaded ✅");

  // Buttons & elements
  const signupBtn = document.getElementById("signup-btn");
  const loginBtn = document.getElementById("login-btn");
  const startBtn = document.getElementById("start-btn");
  const toSignupLink = document.getElementById("to-signup");
  const toLoginLink = document.getElementById("to-login");
  const verifyOtpBtn = document.getElementById("verify-otp-btn");
  const startLevelBtn = document.getElementById("start-level-btn");
  const badgesBtn = document.getElementById("badges-btn");
  const settingsBtn = document.getElementById("settings-btn");
  
  // 🔹 Attach event listeners
  if (signupBtn) {
    signupBtn.addEventListener("click", (e) => { e.preventDefault(); handleSignup(); });
    console.log("signup listener attached");
  }
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => { e.preventDefault(); handleLogin(); });
    console.log("login listener attached");
  }
  if (toSignupLink) {
  toSignupLink.addEventListener("click", (e) => {
    e.preventDefault();
    showSignupScreen();
  });
  }
  if (toLoginLink) {
    toLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginScreen();
    });
  }
  if (startBtn) startBtn.addEventListener("click", startGame);
  if (verifyOtpBtn) verifyOtpBtn.addEventListener("click", verifyOTP);
  if (startLevelBtn) startLevelBtn.addEventListener("click", startLevel);
  if (badgesBtn) badgesBtn.addEventListener("click", showBadges);
  if (settingsBtn) settingsBtn.addEventListener("click", showSettings);

  // Links (signup/login)

  if (toSignupLink) toSignupLink.addEventListener("click", (e) => { e.preventDefault(); showSignupScreen(); });
  if (toLoginLink) toLoginLink.addEventListener("click", (e) => { e.preventDefault(); showLoginScreen(); });

  // Overlay click outside to close
  document.querySelectorAll(".overlay").forEach(ov => {
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.classList.add("hidden"); });
  });

  // ESC to close
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".overlay").forEach(ov => ov.classList.add("hidden"));
  });

  // Init settings
  const musicToggle = document.getElementById("musicToggle");
  const sfxToggle = document.getElementById("sfxToggle");
  const volumeSlider = document.getElementById("volumeSlider");
  const themeSelect = document.getElementById("themeSelect");
  const resetBtn = document.getElementById("resetProgress");

  if (musicToggle) musicToggle.checked = localStorage.getItem("music") === "on";
  if (sfxToggle) sfxToggle.checked = localStorage.getItem("sfx") === "on";
  if (volumeSlider) volumeSlider.value = localStorage.getItem("volume") || 50;
  if (themeSelect) themeSelect.value = localStorage.getItem("theme") || "matrix";

  applyAudioSettings();
  if (musicToggle) musicToggle.addEventListener("change", (e) => { localStorage.setItem("music", e.target.checked ? "on" : "off"); applyAudioSettings(); });
  if (sfxToggle) sfxToggle.addEventListener("change", (e) => localStorage.setItem("sfx", e.target.checked ? "on" : "off"));
  if (volumeSlider) volumeSlider.addEventListener("input", (e) => { localStorage.setItem("volume", e.target.value); applyAudioSettings(); });
  if (themeSelect) themeSelect.addEventListener("change", (e) => { localStorage.setItem("theme", e.target.value); applyTheme(e.target.value); });
  if (resetBtn) resetBtn.addEventListener("click", () => { if (confirm("هل أنت متأكد أنك تريد إعادة التقدم؟")) { localStorage.clear(); location.reload(); } });

  applyTheme(themeSelect?.value || "matrix");

  // CyberBuddy draggable
  const buddy = document.getElementById("cyberbuddy");
  if (buddy) {
    buddy.addEventListener("mousedown", dragStart);
    buddy.addEventListener("touchstart", dragStart, { passive: false });
  }
});

// ============================================
// 🔐 SIGNUP HANDLER
// ============================================
async function handleSignup() {
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (!username || !password) {
    alert("❌ يا معلم، اكتب اسم المستخدم وكلمة السر");
    return;
  }

  try {
    const result = await apiSignup(username, password);
    if (result && result.success) {
      alert("✅ تمام! الحساب اتعمل على السيرفر، دلوقتي تقدر تسجل دخولك");
      localStorage.setItem("currentUser", username);
      showLoginScreen();
      try {
        await fetch(`${API_BASE}/progress/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            badges: {},
            completed_levels: [],
            used_otp: false
          })
        });
      } catch (err) {
        console.warn("⚠️ فشل إنشاء progress على السيرفر:", err);
      }

    } else {
      alert(result?.message || "❌ حصلت مشكلة أثناء التسجيل");
    }
  } catch (err) {
    // 🔹 fallback local (offline)
    localStorage.setItem(`user_${username}`, JSON.stringify({ password }));
    alert("⚠ السيرفر مش متاح دلوقتي، الحساب اتخزن محلياً للاختبار.");
    showLoginScreen();

  }
}




function showSignupScreen() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("signup-screen").classList.remove("hidden");
}

function showLoginScreen() {
  document.getElementById("signup-screen").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
}


// ============================================
// 🔐 LOGIN HANDLER
// ============================================
async function handleLogin() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const mfaEnabled = document.getElementById("mfa-check").checked;

  const cyberBuddy = document.getElementById("cyberbuddy");
  const result = document.getElementById("login-message");
  result.textContent = "";

  if (!username || !password) {
    result.style.color = "#ff4d4d";
    result.textContent = "من فضلك أدخل اسم المستخدم وكلمة المرور.";
    return;
  }

  try {
    const res = await apiLogin(username, password);
    if (!res || !res.success) {
      result.style.color = "#ff4d4d";
      result.textContent = res?.message || "❌ اسم المستخدم أو كلمة المرور غلط.";
      return;
    }
    onLoginSuccess(mfaEnabled, cyberBuddy, result);
  } catch (err) {
    // fallback local
    const localUser = JSON.parse(localStorage.getItem(`user_${username}`) || "null");
    if (localUser && localUser.password === password) {
      onLoginSuccess(mfaEnabled, cyberBuddy, result);
    } else {
      result.style.color = "#ff4d4d";
      result.textContent = "❌ السيرفر غير متاح ومفيش حساب محلي مطابق.";
    }
  }
}

// ============================================
// 🔐 ON LOGIN SUCCESS + OTP
// ============================================
function onLoginSuccess(mfaEnabled, cyberBuddy, resultElem) {
  currentUser = document.getElementById("login-username").value.trim(); // NEW

  if (mfaEnabled) {
    generatedOTP = Math.floor(100000 + Math.random() * 900000);
    document.getElementById("otp-code").textContent = generatedOTP;

    // Play OTP sound
    const otpSound = new Audio("sounds/otp-sound.mp3"); 
    otpSound.play();

    document.getElementById("otp-toast").classList.remove("hidden");
    document.getElementById("otp-area").classList.remove("hidden");

    if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br> تمام! شوف رمز التحقق اللي وصلك ✍️`;

    setTimeout(() => { document.getElementById("otp-toast").classList.add("hidden"); }, 7000);
  } else {
    resultElem.style.color = "#00ff88";
    resultElem.textContent = "✅ تم تسجيل الدخول بنجاح!";

    
    if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br> جاري تحضير رد ذكي... 🔄`;

    getCyberBuddyResponse("دخلت من غير التحقق الثنائي، وجه رسالة توعية للمستخدم باللهجة المصرية")
      .then(response => {
        if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`;
      }).catch(() => {
        if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br> حصلت مشكلة في الاتصال، جرّب تاني بعد شوية! ⚠️`;
      });

  

    setTimeout(() => {
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("menu-screen").classList.remove("hidden");
    }, 900);
  }
}


async function verifyOTP() {
  const input = document.getElementById("otp-input").value.trim();
  const result = document.getElementById("login-message");
  const cyberBuddy = document.getElementById("cyberbuddy");

  // Get the logged-in username from login input or from state
  const username = document.getElementById("login-username").value.trim();

  if (!generatedOTP) {
    result.style.color = "#ff4d4d";
    result.textContent = "❌ مفيش رمز تحقق مولّد.";
    return;
  }

  if (input === generatedOTP.toString()) {
    result.style.color = "#00ff88";
    result.textContent = "✅ تم التحقق بنجاح!";

    // Await the backend call
    await markOtpUsed(username);

    if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>ممتاز يا نجم! جاهز ندخل على المرحلة الاولى؟ 🎯`;

    setTimeout(() => {
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("menu-screen").classList.remove("hidden");
    }, 900);
  } else {
    result.style.color = "#ff4d4d";
    result.textContent = "❌ الرمز غير صحيح. حاول مرة تانية.";
    if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br> مفيش مشكلة يا بطل! جرب تاني وأنا معاك! 💪`;
  }
}


// ============================================
// 📡 BACKEND API HELPERS
// ============================================
async function apiSignup(username, password) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

async function apiLogin(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}


// ============================================
// 🎮 PLACEHOLDER GAME FUNCS
// ============================================
function startGame() {
  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
}
function startLevel() {
  document.getElementById("menu-screen").classList.add("hidden");
  document.getElementById("level1-screen").classList.remove("hidden");
}
function showBadges() {
  openOverlay("badgesOverlay");
  document.addEventListener("DOMContentLoaded", restoreBadges);

}
function showSettings() { openOverlay("settingsOverlay"); }

// ============================================
// 🧠 CYBERBUDDY MOVEMENT
// ============================================
function dragStart(e) {
  e.preventDefault();
  const box = document.getElementById("cyberbuddy");
  if (!box) return;
  isDragging = true;
  const rect = box.getBoundingClientRect();
  const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
  const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
  offsetX = clientX - rect.left; offsetY = clientY - rect.top;
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchmove", drag, { passive: false });
  document.addEventListener("touchend", dragEnd);
}
function drag(e) {
  if (!isDragging) return;
  e.preventDefault();
  const box = document.getElementById("cyberbuddy");
  if (!box) return;

  const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
  const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;

  const newLeft = clientX - offsetX;
  const newTop = clientY - offsetY;

  // keep inside viewport
  const maxLeft = window.innerWidth - box.offsetWidth - 10;
  const maxTop = window.innerHeight - box.offsetHeight - 10;
  box.style.left = Math.min(Math.max(10, newLeft), maxLeft) + "px";
  box.style.top = Math.min(Math.max(10, newTop), maxTop) + "px";
  box.style.right = "auto"; // ensure RTL doesn't conflict
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
// 💻 MATRIX BACKGROUND
// ============================================
const canvas = document.getElementById("matrix");
const ctx = canvas ? canvas.getContext("2d") : null;

if (canvas && ctx) {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

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

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  let matrixInterval = setInterval(drawMatrix, 50);

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}


// ============================================
// 🔄 Overlay Controls (open/close)
// ============================================
function openOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

function closeOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

// ============================================
// 🏅 BADGES LOGIC
// ============================================

let completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || [];
let usedOTP = JSON.parse(localStorage.getItem('usedOTP')) || false;
let progressLevel = localStorage.getItem("progressLevel") 
  ? parseInt(localStorage.getItem("progressLevel")) 
  : 1; // لو مفيش بيانات يبدأ من 1


// Update the badgeRequirements object to match exact data-ids from HTML
const badgeRequirements = {
    '🛡️ MFA Enforcer': ['usedOTP'],  // Only unlocks with OTP
    '🧠 Phishing Analyst': ['level2'],
    '🔒 Digital Lockmaster': ['level3'],
    '📱 Mobile Defender': ['level4'],
    '👨🏻‍💻 Social Engineering Aware': ['level5'],
    '🧱 Human Firewall': ['level6'],
    '💾 Backup Guardian': ['level7'],
    '🌐 Network Defender': ['level8'],
    '🧠 App Investigator': ['level9'],
    '🔥 Firewall Commander': ['level10'],
    '👁 Threat Hunter': ['level11'],
    '🏆 CyberMind Master': ['level12']
};

// ✅ Unlock a badge locally (frontend + localStorage)
function unlockBadgeLocal(badgeId) {
  const badgeEl = document.querySelector(`.badge[data-id="${badgeId}"]`);
  if (badgeEl && badgeEl.classList.contains("locked")) {
    badgeEl.classList.remove("locked");
    badgeEl.classList.add("unlocked");

    // Save in localStorage so it stays unlocked after refresh
    localStorage.setItem(`badge_${badgeId}`, "unlocked");

  }
}

// ✅ Complete a level and unlock its badge
function completeLevel(username, levelId, badge) {
  fetch(`${API_BASE}/progress/complete-level`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, levelId, badge })
  })
  .then(res => res.json())
  .then(data => {
    // Directly unlock the badge in the frontend
    unlockBadgeLocal(badge);
    progressLevel++;
    localStorage.setItem("progressLevel", progressLevel);
    console.log(progressLevel);

  })
  .catch(err => console.error("❌ Error completing level:", err));
}

// Restore all badges from localStorage on page load
function restoreBadges() {
  document.querySelectorAll(".badge").forEach(badgeEl => {
    const badgeId = badgeEl.dataset.id;
    if (localStorage.getItem(`badge_${badgeId}`) === "unlocked") {
      badgeEl.classList.remove("locked");
      badgeEl.classList.add("unlocked");
    }
  });
}


document.getElementById("continue-btn").addEventListener("click", () => {
  let progressLevel = localStorage.getItem("progressLevel") 
    ? parseInt(localStorage.getItem("progressLevel")) 
    : 1;

  if (progressLevel > 10) {
    alert("🎉 مبروك! خلصت اللعبة كلها");
    return;
  }

  let nextLevelId = "level" + progressLevel + "-screen";

  document.querySelectorAll(".level-screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(nextLevelId).classList.remove("hidden");
  document.getElementById("menu-screen").classList.add("hidden");

  console.log("🎮 دخلت على:", nextLevelId);
});



async function markOtpUsed(username) {
  if (!username) return;

  try {
    const res = await fetch(`${API_BASE}/progress/unlock-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      usedOTP = true;
      localStorage.setItem("usedOTP", JSON.stringify(true));

      const mfaBadge = document.querySelector('.badge[data-id="🛡️ MFA Enforcer"]');
      if (mfaBadge) {
        mfaBadge.classList.remove("locked");
        localStorage.setItem('badge_🛡️ MFA Enforcer', 'unlocked');

        const sfxOn = localStorage.getItem("sfx") === "on";
        const unlockSound = document.getElementById("unlock-sound");
        if (sfxOn && unlockSound) {
          unlockSound.currentTime = 0;
          unlockSound.play().catch(() => {});
        }
      }
    } else {
      console.error("❌ Backend did not mark OTP used:", data);
    }
  } catch (err) {
    console.error("❌ Failed to mark OTP used:", err);
  }
}









document.addEventListener("DOMContentLoaded", () => {
    Object.keys(badgeRequirements).forEach(badgeId => {
        const badge = document.querySelector(`.badge[data-id="${badgeId}"]`);
        if (!badge) return;

        // Special case: MFA badge
        if (badgeId === "🛡️ MFA Enforcer") {
            const otpUsed = JSON.parse(localStorage.getItem("usedOTP")) || false;
            if (otpUsed && localStorage.getItem(`badge_${badgeId}`) === "unlocked") {
                badge.classList.remove("locked");
            } else {
                badge.classList.add("locked");
            }
        } else {
            // Normal badges
            if (localStorage.getItem(`badge_${badgeId}`) === "unlocked") {
                badge.classList.remove("locked");
            }
        }
    });
});




// ============================================
// 🧠 CyberBuddy API ChatGPT Link (optional)
// ============================================
async function getCyberBuddyResponse(userMessage) {
  // If you have your backend, it can be used. Otherwise this function returns a fallback string.
  // Replace the URL with your backend endpoint that calls ChatGPT.
  try {
    const res = await fetch("https://cybermind-backend-i44u.onrender.com/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });
    const data = await res.json();
    if (res.ok && data && data.reply) return data.reply;
    return "حاضر! هحاول أساعدك دلوقتي 😊";
  } catch (err) {
    return "حصلت مشكلة في الاتصال بالـ backend، جرب تاني بعد شوية.";
  }
}

// ============================================
// 🎧 SETTINGS HELPERS
// ============================================
function applyAudioSettings() {
  const bgMusic = document.getElementById("bg-music");
  const volume = Number(localStorage.getItem("volume") || 50) / 100;
  const musicOn = localStorage.getItem("music") === "on";

  if (bgMusic) {
    bgMusic.volume = volume;
    if (musicOn) {
      bgMusic.play().catch(()=>{});
    } else {
      bgMusic.pause();
    }
  }

  // OTP & unlock volume also follow same setting
  const otp = document.getElementById("otp-sound");
  const unlock = document.getElementById("unlock-sound");
  if (otp) otp.volume = volume;
  if (unlock) unlock.volume = volume;
}

function applyTheme(theme) {
  if (theme === "matrix") {
    document.getElementById("matrix")?.classList.remove("hidden");
    document.body.style.backgroundColor = "#0f0f1a";
  } else if (theme === "dark") {
    document.getElementById("matrix")?.classList.add("hidden");
    document.body.style.backgroundColor = "#0b0b0d";
  }
}






