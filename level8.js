// level8.js - App Investigator Game Logic
let level8Apps = [
  { id: 1, name: "VPN Secure Pro", type: "unsafe", downloads: "1M+", rating: "2.1", reviews: ["مليان فيروسات!", "سرق بياناتي"], permissions: ["الوصول الكامل للكاميرا", "قراءة الرسائل", "تعديل الملفات"], class: "unsafe vpn" },
  { id: 2, name: "Fast VPN Free", type: "unsafe", downloads: "500K+", rating: "1.8", reviews: ["لا يعمل ويبطئ الجهاز", "إعلانات مزعجة"], permissions: ["الوصول للموقع", "تسجيل الصوت", "الوصول للشبكة"], class: "unsafe vpn" },
  { id: 3, name: "Super VPN Shield", type: "unsafe", downloads: "2M+", rating: "3.0", reviews: ["يبيع بيانات المستخدمين", "مشاكل أمان"], permissions: ["الوصول الكامل للجهاز", "قراءة جهات الاتصال", "إرسال بيانات"], class: "unsafe vpn" },
  { id: 4, name: "SafeVPN Elite", type: "safe", downloads: "10M+", rating: "4.5", reviews: ["ممتاز وآمن", "سريع وموثوق"], permissions: ["وصول الشبكة فقط"], class: "safe vpn" },
  { id: 5, name: "Photo Editor App", type: "safe", downloads: "5M+", rating: "4.2", reviews: ["سهل الاستخدام", "جودة عالية"], permissions: ["الوصول للصور"], class: "safe" },
  { id: 6, name: "Fake Camera App", type: "unsafe", downloads: "100K+", rating: "1.5", reviews: ["يسرق الصور", "فيروسات"], permissions: ["الوصول الكامل للكاميرا", "تسجيل الفيديو"], class: "unsafe" },
  { id: 7, name: "Battery Saver Pro", type: "safe", downloads: "800K+", rating: "3.8", reviews: ["يوفر بطارية", "جيد"], permissions: ["إدارة الطاقة"], class: "safe" }
];
let level8AnalyzedApps = 0;
let level8Score = 0;
let currentAppData = null;
let gameActive = true;

// Initialize Apps in Container
function setupLevel8Apps() {
  const container = document.getElementById("level8-container");
  if (!container) return;
  container.innerHTML = "";
  level8Apps.forEach(appData => {
    const app = document.createElement("div");
    app.className = `app-icon ${appData.class}`;
    app.dataset.appId = appData.id;
    app.innerHTML = `<span>${appData.name}<br>📱</span>`;
    app.addEventListener("click", () => showAppOverlay(appData));
    container.appendChild(app);
  });
}

// Show Overlay with App Info
function showAppOverlay(appData) {
  if (!gameActive) return;
  currentAppData = appData;
  document.getElementById("app-title").textContent = appData.name;
  document.getElementById("downloads-value").textContent = appData.downloads;
  document.getElementById("rating-value").textContent = appData.rating;
  const reviewsList = document.getElementById("reviews-list");
  reviewsList.innerHTML = "";
  appData.reviews.forEach(review => {
    const li = document.createElement("li");
    li.textContent = review;
    reviewsList.appendChild(li);
  });
  const permissionsList = document.getElementById("permissions-list");
  permissionsList.innerHTML = "";
  appData.permissions.forEach(perm => {
    const li = document.createElement("li");
    li.textContent = perm;
    permissionsList.appendChild(li);
  });
  document.getElementById("level8-overlay").classList.remove("hidden");
  document.getElementById("mark-safe").disabled = false;
  document.getElementById("mark-unsafe").disabled = false;
}

// Handle Safe/Unsafe Judgment
document.getElementById("mark-safe").addEventListener("click", () => judgeApp("safe"));
document.getElementById("mark-unsafe").addEventListener("click", () => judgeApp("unsafe"));

function judgeApp(choice) {
  if (!currentAppData || !gameActive) return;
  const isCorrect = (choice === "safe" && currentAppData.type === "safe") || (choice === "unsafe" && currentAppData.type === "unsafe");
  let points = isCorrect ? 10 : -5;
  level8Score = Math.max(0, level8Score + points);
  level8AnalyzedApps++;
  document.getElementById("level8-score").textContent = level8Score;
  document.getElementById("level8-apps-analyzed").textContent = level8AnalyzedApps;

  const feedbackEl = document.getElementById("level8-feedback");
  feedbackEl.textContent = isCorrect ? `صحيح! +${points} نقاط` : `خطأ! ${points} نقاط`;

  const message = isCorrect 
    ? `اللاعب اختار صحيح لتطبيق ${currentAppData.name}. احفزه باللهجة المصرية!`
    : `اللاعب اختار خطأ لتطبيق ${currentAppData.name}. اديله تلميح باللهجة المصرية عشان يركز على الصلاحيات.`;
  getCyberBuddyResponse(message)
    .then(response => {
      if (document.getElementById("cyberbuddy")) {
        document.getElementById("cyberbuddy").innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`;
      }
    });

  // Remove the app and close overlay
  const appToRemove = document.querySelector(`.app-icon[data-app-id="${currentAppData.id}"]`);
  if (appToRemove) appToRemove.remove();
  document.getElementById("level8-overlay").classList.add("hidden");
  currentAppData = null;

  // Check if Finished
  if (level8AnalyzedApps >= 7) {
    setTimeout(() => showCongrats(8), 1000);
  }
}

// Congrats Screen
function showCongrats(level) {
  gameActive = false;
  document.getElementById("level8-screen").classList.add("hidden");
  document.getElementById("level8-congrats-screen").classList.remove("hidden");
  document.getElementById("final-level8-score").textContent = level8Score;
  document.getElementById("go-to-level9").classList.remove("hidden");


  const currentUser = localStorage.getItem("currentUser");
  if (typeof completeLevel === 'function') {
      completeLevel(currentUser, "level8", "🧠 App Investigator");
  }


  getCyberBuddyResponse(`اللاعب خلّص المستوى ${level}. احفزه باللهجة المصرية!`)
    .then(response => {
      if (document.getElementById("cyberbuddy")) {
        document.getElementById("cyberbuddy").innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`;
      }
    });
}

// Level Transition
document.getElementById("go-to-level9").addEventListener("click", () => {
  document.getElementById("level8-congrats-screen").classList.add("hidden");
  document.getElementById("go-to-level9").classList.add("hidden");
  document.getElementById("level9-screen").classList.remove("hidden");
  
});

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupLevel8Apps();
});
