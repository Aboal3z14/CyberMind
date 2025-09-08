// ============================================
// 🧠 GLOBAL VARIABLES
// ============================================
let generatedOTP = null;
let offsetX = 0, offsetY = 0, isDragging = false;

// ============================================
// 🚀 STARTUP & DOM INIT
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // Buttons & elements
  const startBtn = document.getElementById("start-btn");
  const loginBtn = document.getElementById("login-btn");
  const verifyOtpBtn = document.getElementById("verify-otp-btn");
  const startLevelBtn = document.getElementById("start-level-btn");
  const badgesBtn = document.getElementById("badges-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const otpArea = document.getElementById("otp-area");

  // Event bindings
  if (startBtn) startBtn.addEventListener("click", startGame);
  if (loginBtn) loginBtn.addEventListener("click", login);
  if (verifyOtpBtn) verifyOtpBtn.addEventListener("click", verifyOTP);
  if (startLevelBtn) startLevelBtn.addEventListener("click", startLevel);
  if (badgesBtn) badgesBtn.addEventListener("click", showBadges);
  if (settingsBtn) settingsBtn.addEventListener("click", showSettings);

  // Close buttons inside overlays
  document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const overlayId = btn.getAttribute("data-close");
      if (overlayId) closeOverlay(overlayId);
    });
  });

  // Click outside overlay-content closes overlay
  document.querySelectorAll(".overlay").forEach(ov => {
    ov.addEventListener("click", (e) => {
      if (e.target === ov) {
        ov.classList.add("hidden");
      }
    });
  });

  // Esc closes overlays
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".overlay").forEach(ov => ov.classList.add("hidden"));
    }
  });

  // Load badge states & attach badge listeners
  document.querySelectorAll(".badge").forEach(badge => {
    const id = badge.getAttribute("data-id");
    if (localStorage.getItem(`badge_${id}`) === "unlocked") {
      badge.classList.remove("locked");
      badge.querySelector("img")?.classList.add("unlocked");
    }

    // click to show / unlock (for testing)
    badge.addEventListener("click", () => {
      if (badge.classList.contains("locked")) {
        // Unlock on click (for demo) — change if you want other unlocking rules
        unlockBadge(id);
      } else {
        // show small info
        alert(`شارة: ${badge.querySelector(".badge-title")?.innerText || id}\nحالتها: مفتوحة`);
      }
    });
  });

  // Settings initialization
  const musicToggle = document.getElementById("musicToggle");
  const sfxToggle = document.getElementById("sfxToggle");
  const volumeSlider = document.getElementById("volumeSlider");
  const themeSelect = document.getElementById("themeSelect");
  const resetBtn = document.getElementById("resetProgress");

  // Elements: audio
  const bgMusic = document.getElementById("bg-music");
  const otpSound = document.getElementById("otp-sound");
  const unlockSound = document.getElementById("unlock-sound");

  // populate from localStorage or defaults
  if (musicToggle) musicToggle.checked = localStorage.getItem("music") === "on";
  if (sfxToggle) sfxToggle.checked = localStorage.getItem("sfx") === "on";
  if (volumeSlider) volumeSlider.value = localStorage.getItem("volume") || 50;
  if (themeSelect) themeSelect.value = localStorage.getItem("theme") || "matrix";

  // apply audio settings
  applyAudioSettings();

  // attach settings listeners
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
      localStorage.clear();
      location.reload();
    }
  });

  // initial theme
  applyTheme(themeSelect?.value || "matrix");

  // make cyberbuddy draggable (mouse + touch)
  const buddy = document.getElementById("cyberbuddy");
  if (buddy) {
    buddy.addEventListener("mousedown", dragStart);
    buddy.addEventListener("touchstart", dragStart, {passive: false});
  }
}); // DOMContentLoaded end

// ============================================
// 🚀 WELCOME SCREEN
// ============================================
function startGame() {
  const ws = document.getElementById("welcome-screen");
  const login = document.getElementById("login-screen");
  if (ws) ws.classList.add("hidden");
  if (login) login.classList.remove("hidden");
}

// ============================================
// 🔐 LOGIN + 2FA SYSTEM
// ============================================
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const mfaEnabled = document.getElementById("mfa-check").checked;

  const cyberBuddy = document.getElementById("cyberbuddy");
  const result = document.getElementById("result-message");

  result.textContent = ""; // Clear previous messages

  if (!username || !password) {
    result.style.color = "#ff4d4d";
    result.textContent = "من فضلك أدخل اسم المستخدم وكلمة المرور.";
    return;
  }

  if (mfaEnabled) {
    generatedOTP = Math.floor(100000 + Math.random() * 900000);
    document.getElementById("otp-code").textContent = generatedOTP;

    // play OTP sound if SFX enabled
    const sfxOn = localStorage.getItem("sfx") === "on";
    const otpSound = document.getElementById("otp-sound");
    if (sfxOn && otpSound) {
      otpSound.currentTime = 0;
      otpSound.play().catch(()=>{});
    }

    document.getElementById("otp-toast").classList.remove("hidden");
    document.getElementById("otp-area").classList.remove("hidden");

    if (cyberBuddy) cyberBuddy.innerHTML = `
      🤖 <strong>سايبر بودي</strong><br>
      تمام! شوف رمز التحقق اللي وصلك وسجّله هنا ✍️
    `;

    setTimeout(() => {
      document.getElementById("otp-toast").classList.add("hidden");
    }, 7000);

  } else {
    result.style.color = "#00ff88";
    result.textContent = "✅ تم التسجيل بنجاح!";

    // Show temporary loading message in CyberBuddy
    if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br> جاري تحضير رد ذكي... 🔄`;

    // optional: call backend to get message (if available)
    getCyberBuddyResponse("دخلت من غير التحقق الثنائي، وجه رسالة توعية للمستخدم باللهجة المصرية")
      .then(response => {
        if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`;
      }).catch(() => {
        if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br> حصلت مشكلة في الاتصال، جرّب تاني بعد شوية! ⚠️`;
      });

    // Move to menu after short delay
    setTimeout(() => {
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("menu-screen").classList.remove("hidden");
    }, 1200);
  }
}

function verifyOTP() {
  const input = document.getElementById("otp-input").value.trim();
  const result = document.getElementById("result-message");
  const cyberBuddy = document.getElementById("cyberbuddy");

  if (!generatedOTP) {
    result.style.color = "#ff4d4d";
    result.textContent = "لم يتم إنشاء رمز تحقق، فعّل 2FA أو جرّب تسجيل الدخول ثانية.";
    return;
  }

  if (input === generatedOTP.toString()) {
    result.style.color = "#00ff88";
    result.textContent = "✅ تم التحقق بنجاح!";
    markOtpUsed();


    if (cyberBuddy) cyberBuddy.innerHTML = `
      🤖 <strong>سايبر بودي</strong><br>
      ممتاز يا نجم! جاهز ندخل على المرحلة؟ 🎯
    `;

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
// 🎮 GAMEPLACE PLACEHOLDERS
// ============================================
function startLevel() {
  alert("🚧 المرحلة الأولى لسه تحت التطوير!");
}

function showBadges() {
  openOverlay("badgesOverlay");
}

function showSettings() {
  openOverlay("settingsOverlay");
}

// ============================================
// 🧠 CYBERBUDDY MOVEMENT (mouse + touch)
// ============================================
function dragStart(e) {
  e.preventDefault();
  const box = document.getElementById("cyberbuddy");
  if (!box) return;

  isDragging = true;
  const rect = box.getBoundingClientRect();

  const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
  const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;

  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;

  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchmove", drag, {passive: false});
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
// 💻 MATRIX BACKGROUND EFFECT
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
// 🏅 BADGES LOGIC (12 Levels + MFA)
// ============================================

let completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || [];
let usedOTP = JSON.parse(localStorage.getItem('usedOTP')) || false;


// Update the badgeRequirements object to match exact data-ids from HTML
const badgeRequirements = {
    //'🛡️ MFA Enforcer': ['usedOTP'],  // Only unlocks with OTP
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
    }
}

function markOtpUsed() {
    if (!usedOTP) {
        usedOTP = true;
        localStorage.setItem('usedOTP', JSON.stringify(true));

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
// 🎧 Settings helpers (audio + theme)
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
