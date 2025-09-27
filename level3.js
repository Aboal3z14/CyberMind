document.addEventListener("DOMContentLoaded", () => {
  const apps = document.querySelectorAll("#level3-screen .app");
  const checkBtn = document.getElementById("check-apps");
  const feedback = document.getElementById("level3-feedback");
  const progress = document.getElementById("level3-progress");
  const scoreEl = document.getElementById("level3-score");
  const cyberBuddy = document.getElementById("cyberbuddy");
  const nextLevelBtn = document.getElementById("go-to-level4");

  let score = 0;

  
  apps.forEach(app => {
    app.addEventListener("click", () => {
      app.classList.toggle("selected");
    });
  });

  checkBtn.addEventListener("click", () => {
    let correct = 0;
    let totalSuspicious = 0;

    apps.forEach(app => {
      const isSuspicious = app.dataset.suspicious === "true";
      const isSelected = app.classList.contains("selected");
      if (isSuspicious && isSelected) correct++;
      if (isSuspicious) totalSuspicious++;
    });

    score = Math.max(0, correct);
    scoreEl.textContent = score;
    progress.style.width = `${(correct / totalSuspicious) * 100}%`;

    if (correct === totalSuspicious) {
      feedback.textContent = "🎉 ممتاز! كشفت كل التطبيقات الخبيثة.";
      feedback.style.color = "lime";
      if (cyberBuddy) {
        cyberBuddy.innerHTML = "🤖 <strong>سايبر بودي</strong><br> تمام! دي طريقة الصح عشان تكشف البرامج الغريبة.";
      }
      setTimeout(() => {
      }, 2000);

      document.getElementById("final-level3-score").textContent = 30;

      const currentUser = localStorage.getItem("currentUser");
      completeLevel(currentUser, "level3", "📱 Mobile Defender");


      document.getElementById("level3-screen").classList.add("hidden");
      document.getElementById("level3-congrats-screen").classList.remove("hidden");
      document.getElementById("go-to-level4").classList.remove("hidden");
    } else {
      feedback.textContent = "⚠️ في تطبيقات خبيثة لسه ما اكتشفتهاش.";
      feedback.style.color = "orange";

      getCyberBuddyResponse("اللاعب اختار غلط في لعبة كشف التطبيقات. اديله نصيحة باللهجة المصرية")
        .then(response => {
          if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`;
        });
    }

  });
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener("click", () => {
      document.getElementById("level3-congrats-screen").classList.add("hidden");
      document.getElementById("go-to-level4").classList.add("hidden");
      document.getElementById("level4-screen").classList.remove("hidden");

     
    });
  }
});
