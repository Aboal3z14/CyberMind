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

  // Overlay close buttons
  document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const overlayId = btn.getAttribute("data-close");
      if (overlayId) closeOverlay(overlayId);
    });
  });

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

  // Init badges + matrix background
  initBadges();
  initMatrix();
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
  // Reset / start Level 1 logic
  if (typeof initLevel1 === "function") {
    initLevel1(); // call the Level 1 setup function (defined in level1.js)
  } else {
    console.warn("⚠️ initLevel1() not found. Make sure level1.js is loaded!");
  }
}
function showBadges() { openOverlay("badgesOverlay"); }
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


// Update the badgeRequirements object to match exact data-ids from HTML
const badgeRequirements = {
    '🛡️ MFA Enforcer': ['usedOTP'],  // Only unlocks with OTP
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

// Update the unlockBadge function to use exact matching
function unlockBadge(id) {
    const badge = document.querySelector(`.badge[data-id="${id}"]`);
    if (!badge || !badge.classList.contains("locked")) return false;

    // Special case for MFA Enforcer
    if (id === '🛡️ MFA Enforcer' && !usedOTP) {
        const cyberBuddy = document.getElementById("cyberbuddy");
        if (cyberBuddy) {
            cyberBuddy.innerHTML = `
                🤖 <strong>سايبر بودي</strong><br>
                🔒 لازم تستخدم التحقق بخطوتين (OTP) عشان تفتح الشارة دي!
            `;
        }
        return false;
    }

    // Check requirements
    const requirements = badgeRequirements[id];
    if (!requirements) return false;

    const hasRequired = requirements.every(req => {
        if (req === 'usedOTP') return usedOTP === true;
        return completedLevels.includes(req);
    });

    if (!hasRequired) {
        const cyberBuddy = document.getElementById("cyberbuddy");
        if (cyberBuddy) {
            const reqText = requirements.map(r => 
                r === 'usedOTP' ? 'استخدام التحقق بخطوتين' : `المرحلة ${r.replace('level', '')}`
            ).join(' و ');
            cyberBuddy.innerHTML = `
                🤖 <strong>سايبر بودي</strong><br>
                🔒 تحتاج إكمال ${reqText} لفتح هذه الشارة!
            `;
        }
        return false;
    }

    // Unlock the badge
    badge.classList.remove("locked");
    localStorage.setItem(`badge_${id}`, "unlocked");

    // Play unlock sound if enabled
    const sfxOn = localStorage.getItem("sfx") === "on";
    const unlockSound = document.getElementById("unlock-sound");
    if (sfxOn && unlockSound) {
        unlockSound.currentTime = 0;
        unlockSound.play().catch(() => {});
    }

    return true;
}

// Mark level as completed
function completeLevel(levelId) {
  if (!completedLevels.includes(levelId)) {
    completedLevels.push(levelId);
    localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
    
    Object.keys(badgeRequirements).forEach(badgeId => unlockBadge(badgeId));

    // NEW: update backend
    if (currentUser) {
      fetch(`${API_BASE}/progress/complete-level`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, levelId })
      }).catch(err => console.warn("⚠️ فشل تحديث المستوى على السيرفر:", err));
    }
  }
}


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
// 🎮 LEVEL 1: EMAIL PHISHING GAME
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------
  // 🔢 GAME STATE VARIABLES
  // -------------------------------
  let levelScore = 0;
  let levelCorrectAnswers = 0;
  let levelEmailsRemaining = 5;
  let currentEmailIsFake = false;
  let playerConfusionLevel = 0;
  let emotionDetectionInterval;

  // -------------------------------
  // 🎯 DOM ELEMENTS
  // -------------------------------
  const emailSender = document.getElementById("email-sender");
  const emailTime = document.getElementById("email-time");
  const emailSubject = document.getElementById("email-subject");
  const emailBody = document.getElementById("email-body");
  const emailLink = document.getElementById("email-link");

  const feedback = document.getElementById("feedback");
  const hint = document.getElementById("hint");

  const btnReal = document.getElementById("btn-real");
  const btnFake = document.getElementById("btn-fake");

  const scoreDisplay = document.getElementById("level-score");
  const emailsRemainingDisplay = document.getElementById("emails-remaining");
  const correctAnswersDisplay = document.getElementById("correct-answers");

  // -------------------------------
  // 📧 EMAILS DATA
  // -------------------------------
  const emails = [
  // إيميلات مزيفة
  {
    sender: "البنك الأهلي المصري <noreply@nbe-egypt.com>",
    subject: "تنبيه أمني عاجل: تفعيل الحماية على حسابك",
    body: "<p>عزيزي العميل،</p><p>لقد رصدنا محاولة دخول غير مصرحة إلى حسابك. يرجى النقر على الرابط أدناه لتأكيد هويتك وتفعيل نظام الحماية الجديد.</p><p>إذا لم تقم بهذا الإجراء خلال 24 ساعة، سيتم تجميد حسابك مؤقتاً.</p><p>شكراً لتعاونك،</p><p>فريق الأمن السيبراني - البنك الأهلي المصري</p>",
    link: "http://nbe-security-update.com/verify-account",
    isFake: true,
    hint: "انظر إلى عنوان الرابط: nbe-security-update.com ليس نطاق البنك الأهلي الرسمي"
  },
  {
    sender: "فيس بوك <security@facebook-mail.com>",
    subject: "تنبيه: نشاط غير معتاد على حسابك",
    body: "<p>مرحباً،</p><p>لقد اكتشفنا محاولة دخول إلى حسابك من جهاز جديد في القاهرة، مصر. إذا لم تكن هذه أنت، فيرجى النقر على الرابط أدناه لتأمين حسابك.</p><p>سيؤدي هذا إلى تسجيل خروج جميع الأجهزة وتغيير كلمة المرور.</p><p>فريق فيس بوك للأمان</p>",
    link: "http://facebook-secure-login.com/recover",
    isFake: true,
    hint: "عنوان البريد الإلكتروني facebook-mail.com ليس النطاق الرسمي لفيس بوك"
  },
  {
    sender: "CIB <service@cib-egypt.net>",
    subject: "تحديث معلومات حسابك المطلوب",
    body: "<p>عميلنا العزيز،</p><p>نقوم حالياً بتحديث نظامنا المصرفي. يرجى تحديث معلوماتك من خلال الرابط أدناه لضمان استمرار الخدمة دون انقطاع.</p><p>ملاحظة: إذا لم تقم بتحديث معلوماتك خلال 48 ساعة، قد يتم تعليق بعض الخدمات على حسابك.</p><p>شكراً لتفهمك،</p><p>البنك التجاري الدولي (CIB)</p>",
    link: "https://cib-account-update.com/profile",
    isFake: true,
    hint: "النطاق cib-egypt.net ليس النطاق الرسمي للبنك التجاري الدولي"
  },
  {
    sender: "Amazon <no-reply@amazon-eg.com>",
    subject: "فشل عملية الدفع - يتطلب إجراء فوري",
    body: "<p>عزيزي العميل،</p><p>لم نتمكن من معالجة دفعتك الأخيرة. يرجى النقر على الرابط أدناه لتحديث معلومات الدفع الخاصة بك وإكمال عملية الشراء.</p><p>إذا لم تقم بتحديث معلوماتك خلال 12 ساعة، سيتم إلغاء طلبك تلقائياً.</p><p>شكراً لاختيارك أمازون،</p><p>فريق الدعم</p>",
    link: "http://amazon-payment-update.eg/payment",
    isFake: true,
    hint: "amazon-eg.com ليس النطاق الرسمي لأمازون، والنطاق الرسمي هو amazon.com أو amazon.eg"
  },
  {
    sender: "Microsoft <account@microsoft-security.org>",
    subject: "تنبيه: انتهاء صلاحية ترخيص Windows",
    body: "<p>عزيزي مستخدم Windows،</p><p>ترخيص Windows الخاص بك على وشك الانتهاء. يرجى النقر على الرابط أدناه لتجديد الترخيص وتجنب تعطيل النظام.</p><p>سيؤدي عدم التجديد إلى فقدان الوصول إلى بعض الميزات وتعطيل النظام.</p><p>شكراً لاستخدامك Microsoft</p>",
    link: "http://microsoft-windows-renew.com/activate",
    isFake: true,
    hint: "microsoft-security.org ليس النطاق الرسمي لشركة Microsoft"
  },
  
  // إيميلات حقيقية
  {
    sender: "البنك الأهلي المصري <noreply@nbe.com.eg>",
    subject: "كشف حسابك الشهري متاح الآن",
    body: "<p>عزيزي العميل،</p><p>كشف حسابك الشهري لشهر يناير 2024 متاح الآن للتحميل من خلال تطبيق البنك الأهلي المصري أو من خلال موقعنا الإلكتروني.</p><p>لتحميل كشف الحساب، يرجى تسجيل الدخول إلى حسابك عبر القنوات الرسمية للبنك.</p><p>شكراً لثقتك في البنك الأهلي المصري</p>",
    link: "https://www.nbe.com.eg/onlinebanking",
    isFake: false
  },
  {
    sender: "فيس بوك <security@facebook.com>",
    subject: "كود تسجيل الدخول إلى فيس بوك",
    body: "<p>مرحباً،</p><p>لقد طلبتَ للتو كود تسجيل دخول إلى فيس بوك. لا تشارك هذا الكود مع任何人.</p><p>كود تسجيل الدخول: 458732</p><p>إذا لم تطلب هذا الكود، يمكنك تجاهل هذه الرسالة أو الإبلاغ عنها.</p><p>شكراً،</p><p>فريق فيس بوك</p>",
    link: "https://www.facebook.com",
    isFake: false
  },
  {
    sender: "CIB <noreply@cibeg.com>",
    subject: "إشعار: معاملة جديدة على حسابك",
    body: "<p>عميلنا العزيز،</p><p>لقد تمت معاملة سحب من حسابك بقيمة 500 جنيه مصري من ماكينة الصراف الآلي بفرع مدينة نصر.</p><p>إذا لم تكن هذه المعاملة معتمدة من قبلك، يرجى الاتصال بفريق الدعم على الرقم 19666 على الفور.</p><p>شكراً لثقتك في CIB</p>",
    link: "https://www.cibeg.com",
    isFake: false
  },
  {
    sender: "Amazon <no-reply@amazon.com>",
    subject: "تأكيد طلبك رقم #D785-4578962-365412",
    body: "<p>مرحباً،</p><p>شكراً لتسوقك مع أمازون. لقد تلقينا طلبك وسيتم شحنه خلال 2-3 أيام عمل.</p><p>يمكنك تتبع شحنك من خلال صفحة الطلبات في حسابك على أمازون.</p><p>شكراً لاختيارك أمازون،</p><p>فريق أمازون</p>",
    link: "https://www.amazon.com",
    isFake: false
  },
  {
    sender: "Microsoft <account@microsoft.com>",
    subject: "تأكيد تغيير كلمة المرور",
    body: "<p>عزيزي العميل،</p><p>لقد تم تغيير كلمة المرور لحساب Microsoft الخاص بك مؤخراً.</p><p>إذا كنت قد قمت بهذا التغيير، فلا داعي لاتخاذ أي إجراء آخر.</p><p>إذا لم تقم بتغيير كلمة المرور، فيرجى إعادة تعيينها على الفور من خلال موقعنا الرسمي.</p><p>شكراً،</p><p>فريق Microsoft</p>",
    link: "https://account.microsoft.com",
    isFake: false
  }  ];

  // -------------------------------
  // 📝 FUNCTIONS
  // -------------------------------
  function loadRandomEmail() {
    if (levelEmailsRemaining <= 0) {
      endLevel();
      return;
    }
  function initLevel1() {
    levelScore = 0;
    levelCorrectAnswers = 0;
    levelEmailsRemaining = 5;
    feedback.textContent = "";
    btnReal.disabled = false;
    btnFake.disabled = false;
    document.getElementById("next-level-btn").classList.add("hidden");
  
    // Shuffle emails array and pick 5
    levelEmails = emails
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
  
    // Show the first email
    loadRandomEmail();
  }

    const randomEmail = emails[Math.floor(Math.random() * emails.length)];

    emailSender.textContent = randomEmail.sender;
    emailSubject.textContent = randomEmail.subject;
    emailBody.innerHTML = randomEmail.body;
    emailLink.textContent = randomEmail.link;
    emailLink.href = randomEmail.link;

    currentEmailIsFake = randomEmail.isFake;
    hint.textContent = randomEmail.hint || "";
  }

function handleAnswer(isReal) {
  if (isReal === !currentEmailIsFake) {
    feedback.textContent = "✔️ إجابة صحيحة!";
    feedback.style.color = "green";
    levelScore += 10;
    levelCorrectAnswers++;
  } else {
    feedback.textContent = "❌ إجابة خاطئة!";
    feedback.style.color = "red";
  }

  levelEmailsRemaining--;

  // Update stats
  scoreDisplay.textContent = levelScore;
  correctAnswersDisplay.textContent = levelCorrectAnswers;
  remainingDisplay.textContent = levelEmailsRemaining;

  if (levelEmailsRemaining <= 0) {
    // 🏆 Show results
    feedback.style.color = "blue";
    feedback.innerHTML = `
      🎉 انتهى المستوى!<br>
      النقاط: ${levelScore}<br>
      الإجابات الصحيحة: ${levelCorrectAnswers}
    `;

    // Disable answer buttons
    btnReal.disabled = true;
    btnFake.disabled = true;

    // Show Next Level button
    const nextBtn = document.getElementById("next-level-btn");
    if (nextBtn) nextBtn.classList.remove("hidden");
  } else {
    setTimeout(() => {
      feedback.textContent = "";
      loadRandomEmail();
    }, 1200);
  }
}


  function endLevel() {
    feedback.textContent = "🎉 انتهى المستوى! أحسنت.";
    feedback.style.color = "blue";
    btnReal.disabled = true;
    btnFake.disabled = true;
  }

  // -------------------------------
  // 🎮 EVENT LISTENERS
  // -------------------------------
  btnReal.addEventListener("click", () => handleAnswer(true));
  btnFake.addEventListener("click", () => handleAnswer(false));
  const nextLevelBtn = document.getElementById("next-level-btn");
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener("click", () => {
      // Hide Level 1 screen
      document.getElementById("level1-screen").classList.add("hidden");
  
      // Show the next level (replace this with your next level function)
      startLevel2(); // <-- create this function later
    });
  }


  // -------------------------------
  // ▶️ START GAME
  // -------------------------------
  loadRandomEmail();
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










