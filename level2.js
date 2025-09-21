const cyberBuddy = document.getElementById("cyberbuddy");
const validCountEl = document.getElementById("validCount");
const nextLevelBtn = document.getElementById("go-to-level3");
let validPasswords = 0;

// ------------------
// Password Strength Estimation
// ------------------

function estimateCrackTime(password) {
  let score = 0;
  score += password.length * 2;
  if (/[a-z]/.test(password)) score += 2;
  if (/[A-Z]/.test(password)) score += 2;
  if (/[0-9]/.test(password)) score += 2;
  if (/[^A-Za-z0-9]/.test(password)) score += 3;

  // Convert score to approximate hours → then days
  let hours = Math.pow(2, score) / 1000;
  let days = hours / 24;
  return days;
}

// ------------------
// CyberBuddy Response (ChatGPT API)
// ------------------
function sendCyberBuddyHint(promptText) {
  if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br> جاري تحضير رد ذكي... 🔄`;

  getCyberBuddyResponse(promptText)
    .then(response => {
      if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`;
    })
    .catch(() => {
      if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br> حصلت مشكلة في الاتصال، جرّب تاني بعد شوية! ⚠️`;
    });
}

// ------------------
// Handle Password Check
// ------------------
document.getElementById("checkPasswordBtn").addEventListener("click", () => {
  const pw1 = document.getElementById("password1").value;
  const pw2 = document.getElementById("password2").value;

  if (pw1 !== pw2) {
    document.getElementById("strengthFeedback").textContent = "❌ الكلمتين مش متطابقتين!";
    sendCyberBuddyHint("دخل اللاعب كلمة سر مش متطابقة، اعطيه نصيحة باللهجة المصرية");
    return;
  }

  const days = estimateCrackTime(pw1);
  let feedback = "";
  if (days < 1) feedback = "❌ ضعيفة جدًا، ممكن تتخمنها في ساعات";
  else if (days < 15) feedback = "⚠️ متوسطة، حاول تخليها أقوى";
  else feedback = "✅ قوية جدًا! ممكن تصمد أكتر من 15 يوم";

  document.getElementById("strengthFeedback").textContent = feedback;
  document.getElementById("passwordEstimate").textContent = `⏱️ تقريبًا هتستمر: ${Math.ceil(days)} يوم`;

  // Update valid passwords count
  if (days >= 15) {
    validPasswords++;
    validCountEl.textContent = validPasswords;
    sendCyberBuddyHint("اللاعب عمل كلمة سر قوية، امدحه وشجعه باللهجة المصرية");

    if (validPasswords >= 3) {


      document.getElementById("level2-screen").classList.add("hidden");
      document.getElementById("level2-congrats-screen").classList.remove("hidden");


      const currentUser = localStorage.getItem("currentUser");
      completeLevel(currentUser, "level2", "🔒 Digital Lockmaster");

      
      alert("🎉 ممتاز! خلصت Level 2، كل كلماتك السريّة قوية 💪");
    }
  } else {
    sendCyberBuddyHint("كلمة السر ضعيفة، اعطيه نصايح لتحسينها باللهجة المصرية");
  }

  // Clear inputs for next attempt
  document.getElementById("password1").value = "";
  document.getElementById("password2").value = "";
  
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener("click", () => {
      document.getElementById("level2-congrats-screen").classList.add("hidden");
      document.getElementById("go-to-level3").classList.add("hidden");
      document.getElementById("level3-screen").classList.remove("hidden");
     
    });
  }
});
