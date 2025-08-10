// ============================================
// 🧠 GLOBAL VARIABLES
// ============================================
let generatedOTP = null;
let offsetX = 0, offsetY = 0, isDragging = false;

// ============================================
// 🚀 WELCOME SCREEN
// ============================================
function startGame() {
  document.getElementById("welcome-screen").style.display = "none";
  document.getElementById("login-screen").classList.remove("hidden");
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

    document.getElementById("otp-sound").play();
    document.getElementById("otp-toast").classList.remove("hidden");
    document.getElementById("otp-area").classList.remove("hidden");

    cyberBuddy.innerHTML = `
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
    cyberBuddy.innerHTML = `
      🤖 <strong>سايبر بودي</strong><br>
      جاري تحضير رد ذكي... 🔄
    `;

    console.log("✅ 2FA not enabled – Sending message to GPT");

    // Get dynamic response from ChatGPT
    getCyberBuddyResponse("دخلت من غير التحقق الثنائي، وجه رسالة توعية للمستخدم باللهجة المصرية")
      .then(response => {
        console.log("🤖 Received response from GPT:", response);
        cyberBuddy.innerHTML = `
          🤖 <strong>سايبر بودي</strong><br>
          ${response}
        `;
      }).catch((err) => {
        console.error("❌ Error getting response from GPT:", err);
        cyberBuddy.innerHTML = `
          🤖 <strong>سايبر بودي</strong><br>
          حصلت مشكلة في الاتصال، جرّب تاني بعد شوية! ⚠️
        `;
      });

    // Move to menu after short delay
    setTimeout(() => {
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("menu-screen").classList.remove("hidden");
    }, 1500);
  }
}

function verifyOTP() {
  const input = document.getElementById("otp-input").value.trim();
  const result = document.getElementById("result-message");
  const cyberBuddy = document.getElementById("cyberbuddy");

  if (input === generatedOTP.toString()) {
    result.style.color = "#00ff88";
    result.textContent = "✅ تم التحقق بنجاح!";

    cyberBuddy.innerHTML = `
      🤖 <strong>سايبر بودي</strong><br>
      ممتاز يا نجم! جاهز ندخل على المرحلة؟ 🎯
    `;

    setTimeout(() => {
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("menu-screen").classList.remove("hidden");
    }, 1500);
  } else {
    result.style.color = "#ff4d4d";
    result.textContent = "❌ الرمز غير صحيح. حاول مرة تانية.";
    cyberBuddy.innerHTML = `
      🤖 <strong>سايبر بودي</strong><br>
      مفيش مشكلة يا بطل! الغلط وارد، جرب تاني وأنا معاك! 💪
    `;
  }
}

function startLevel() {
  alert("🚧 المرحلة الأولى لسه تحت التطوير!");
}

function showBadges() {
  alert("🏅 هنا هيظهر تقدمك وشاراتك قريبًا!");
}

function showSettings() {
  alert("⚙️ إعدادات اللعبة جاية قريب!");
}

// ============================================
// 🧠 CYBERBUDDY MOVEMENT
// ============================================
function dragStart(e) {
  const box = document.getElementById("cyberbuddy");
  isDragging = true;
  offsetX = e.clientX - box.offsetLeft;
  offsetY = e.clientY - box.offsetTop;

  document.onmousemove = drag;
  document.onmouseup = () => {
    isDragging = false;
    document.onmousemove = null;
  };
}

function drag(e) {
  if (isDragging) {
    const box = document.getElementById("cyberbuddy");
    box.style.left = (e.clientX - offsetX) + "px";
    box.style.top = (e.clientY - offsetY) + "px";
  }
}

// ============================================
// 💻 MATRIX BACKGROUND EFFECT
// ============================================
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

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

setInterval(drawMatrix, 50);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ============================================
// 🔄 2FA CHECKBOX REAL-TIME TOGGLE
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  const mfaCheckbox = document.getElementById("mfa-check");

  mfaCheckbox.addEventListener("change", () => {
    const otpArea = document.getElementById("otp-area");
    const result = document.getElementById("result-message");

    if (!mfaCheckbox.checked) {
      otpArea.classList.add("hidden");
      result.textContent = "";
      document.getElementById("otp-input").value = "";
    }
  });
});

// ============================================
// 🧠 CyberBuddy API ChatGPT Link and Prompt
// ============================================
async function getCyberBuddyResponse(userMessage) {
  console.log("📤 Sending user message to backend:", userMessage);

  try {
    const response = await fetch("https://cybermind-backend-i44u.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage
      })
    });

    const data = await response.json();
    console.log("📥 Response from backend:", data);

    if (response.ok && data && data.reply) {
      return data.reply;
    } else {
      console.warn("⚠️ Backend did not return a valid reply.");
      return "😕 معرفتش أرد دلوقتي، جرب تاني بعد شوية!";
    }

  } catch (error) {
    console.error("❌ Error calling backend:", error);
    return "حصلت مشكلة في الاتصال، جرّب تاني بعد شوية! ⚠️";
  }
}

async function triggerBuddyMessage(userAction) {
  const buddyBox = document.getElementById("cyberbuddy");
  console.log("🔁 Triggering GPT for action:", userAction);

  buddyBox.innerHTML = "🤖 <strong>سايبر بودي</strong><br> ... بيحمّل الرد";

  const response = await getCyberBuddyResponse(userAction);

  console.log("✅ Final GPT reply:", response);
  buddyBox.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`;
}

//<!-- ======================================
//  🏆 BADGES & SETTINGS OVERLAYS
//  ======================================= -->
// ===== OPEN / CLOSE OVERLAYS =====
function openOverlay(id) {
    document.getElementById(id).classList.remove("hidden");
}
function closeOverlay(id) {
    document.getElementById(id).classList.add("hidden");
}

// ===== BADGE UNLOCK FUNCTION =====
function unlockBadge(id) {
    let badge = document.querySelector(`.badge[data-id="${id}"]`);
    if (badge && badge.classList.contains("locked")) {
        badge.classList.remove("locked");
        badge.querySelector("img").style.animation = "rotateBadge 8s linear infinite";
        localStorage.setItem(`badge_${id}`, "unlocked");

        // Play unlock sound if available
        let audio = new Audio("unlock.mp3");
        audio.play();
    }
}

// ===== LOAD BADGE STATES =====
document.querySelectorAll(".badge").forEach(badge => {
    let id = badge.getAttribute("data-id");
    if (localStorage.getItem(`badge_${id}`) === "unlocked") {
        badge.classList.remove("locked");
        badge.querySelector("img").style.animation = "rotateBadge 8s linear infinite";
    }
});

// ===== SETTINGS =====
document.getElementById("musicToggle").checked = localStorage.getItem("music") === "on";
document.getElementById("sfxToggle").checked = localStorage.getItem("sfx") === "on";
document.getElementById("volumeSlider").value = localStorage.getItem("volume") || 50;
document.getElementById("themeSelect").value = localStorage.getItem("theme") || "matrix";

document.getElementById("musicToggle").addEventListener("change", e => {
    localStorage.setItem("music", e.target.checked ? "on" : "off");
});

document.getElementById("sfxToggle").addEventListener("change", e => {
    localStorage.setItem("sfx", e.target.checked ? "on" : "off");
});

document.getElementById("volumeSlider").addEventListener("input", e => {
    localStorage.setItem("volume", e.target.value);
});

document.getElementById("themeSelect").addEventListener("change", e => {
    localStorage.setItem("theme", e.target.value);
    // Apply theme change instantly if needed
});

document.getElementById("resetProgress").addEventListener("click", () => {
    if (confirm("هل أنت متأكد أنك تريد إعادة التقدم؟")) {
        localStorage.clear();
        location.reload();
    }
});






