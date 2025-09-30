document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Level 9 - Firewall Commander (Threat Defense Simulation) - 08:38 AM +03, Sep 26, 2025");

  let level9Score = 0;
  let scenariosRemaining = 3;
  let currentDifficulty = "easy";
  let currentScenarioData = null;
  let usedScenarios = { easy: [], medium: [], hard: [] };

  let emotionCounts = { happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0, fearful: 0, disgusted: 0 };
  let dominantEmotion = "neutral";

  const scoreDisplay = document.getElementById("level9-score");
  const scenariosDisplay = document.getElementById("level9-scenarios-remaining");
  const scenarioContainer = document.getElementById("level9-container");
  const feedbackEl = document.getElementById("level9-feedback");
  const cyberBuddy = document.getElementById("cyberbuddy");
  const nextLevelBtn = document.getElementById("go-to-level10");
  const menuBtn = document.getElementById("go-to-menu-screen9");

  const scenarios = {
    easy: [
      { id: "easy-1", title: "🔥 هجوم بسيط", description: "اكتب الأوامر للحماية:", commands: ["block IP 192.168.1.1", "allow port 443"], hint: "حظر الـ IP أولاً!" },
      { id: "easy-2", title: "🔥 تسرب بيانات", description: "استجب:", commands: ["isolate network", "scan system"], hint: "عزل الشبكة!" },
      { id: "easy-3", title: "🔥 هجوم DDoS", description: "اكتب:", commands: ["block traffic", "monitor logs"], hint: "راقب السجلات!" }
    ],
    medium: [
      { id: "medium-1", title: "🔥 هجوم متعدد", description: "قم بالدفاع:", commands: ["block IP 10.0.0.1", "allow port 80", "scan traffic"], hint: "حظر ثم فحص!" },
      { id: "medium-2", title: "🔥 اختراق", description: "استجب:", commands: ["isolate server", "update rules", "monitor activity"], hint: "عزل أولاً!" }
    ],
    hard: [
      { id: "hard-1", title: "🔥 هجوم صفري", description: "دافع بسرعة:", commands: ["block IP 172.16.254.1", "isolate network", "patch system", "monitor logs"], hint: "كل الأوامر ضرورية!" }
    ]
  };

  const situationDescriptions = {
    "easy-1": "تم اكتشاف محاولة وصول غير مصرح بها من عنوان IP خارجي. يجب حظر المصدر وتأمين المنافذ الآمنة!",
    "easy-2": "تم الكشف عن تسرب بيانات من شبكة داخلية. يجب عزل الشبكة وفحص الأنظمة على الفور!",
    "easy-3": "هجوم DDoS يغرق الشبكة بحركة مرور ضخمة. يجب حظر المرور الضار ورصد السجلات!",
    "medium-1": "هجوم متعدد المراحل يستهدف الشبكة الداخلية. قم بحظر المصدر، تأمين المنافذ، وفحص المرور!",
    "medium-2": "خادم رئيسي يتعرض لمحاولة اختراق. يجب عزله، تحديث القواعد، ومراقبة الأنشطة!",
    "hard-1": "هجوم صفري متقدم يستهدف ثغرة غير معروفة. قم بحظر المصدر، عزل الشبكة، تصحيح النظام، ومراقبة السجلات!"
  };

  const allCommands = [
    { command: "block IP 192.168.1.1", description: "يحظر عنوان IP محدد لمنع الوصول غير المصرح به." },
    { command: "allow port 443", description: "يسمح بالاتصالات عبر منفذ HTTPS الآمن (443)." },
    { command: "isolate network", description: "يعزل الشبكة لمنع انتشار الهجوم." },
    { command: "scan system", description: "يفحص النظام بحثًا عن البرمجيات الخبيثة أو الثغرات." },
    { command: "block traffic", description: "يوقف كل حركة المرور الواردة لتخفيف الهجمات الشاملة." },
    { command: "monitor logs", description: "يراقب سجلات النظام لتتبع الأنشطة المشبوهة." },
    { command: "block IP 10.0.0.1", description: "يحظر عنوان IP داخلي لمنع تهديدات الشبكة الداخلية." },
    { command: "allow port 80", description: "يسمح بالاتصالات عبر منفذ HTTP القياسي (80)." },
    { command: "scan traffic", description: "يحلل حركة المرور الشبكية للكشف عن التهديدات." },
    { command: "isolate server", description: "يعزل الخادم المصاب لاحتواء الاختراق." },
    { command: "update rules", description: "يحدّث قواعد الجدار الناري لتعزيز الأمان." },
    { command: "monitor activity", description: "يتتبع أنشطة الخادم للكشف عن محاولات الاختراق." },
    { command: "block IP 172.16.254.1", description: "يحظر عنوان IP محدد لتوقيف هجوم صفري." },
    { command: "patch system", description: "يطبق تصحيحات الأمان لتأمين النظام." }
  ];

  async function detectEmotion() {
    if (!window.faceapi || !window.videoElement) return;
    try {
      const detections = await faceapi.detectSingleFace(window.videoElement, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      if (detections?.expressions) {
        const bestEmotion = Object.entries(detections.expressions).reduce((a, b) => b[1] > a[1] ? b : a)[0];
        emotionCounts[bestEmotion]++;
        dominantEmotion = Object.entries(emotionCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0];
        adjustDifficulty();
      }
    } catch (e) {}
  }

  setInterval(detectEmotion, 3000);

  function adjustDifficulty() {
    if (dominantEmotion === "surprised") currentDifficulty = "hard";
    else if (["happy", "neutral"].includes(dominantEmotion)) currentDifficulty = "medium";
    else currentDifficulty = "easy";
  }

  function cleanupPreviousScenario() {
    scenarioContainer.innerHTML = '';
    if (feedbackEl) feedbackEl.textContent = '';
  }

  function displayScenario(scenario) {
    currentScenarioData = scenario;
    cleanupPreviousScenario();
    scenarioContainer.innerHTML = `
      <div class="scenario-content">
        <div class="scenario-header">
          <h3>${scenario.title}</h3>
          <p>${scenario.description}</p>
        </div>
        <div class="threats">
          <div class="threat-indicator">🚨 تهديد جديد!</div>
        </div>
        <div class="terminal">
          <input type="text" id="level9-command-input" placeholder="اكتب الأمر...">
          <button class="btn-execute" onclick="executeCommand()">▶️ نفّذ</button>
          <button class="btn-skip" onclick="skipScenario()">⏭ تخطّى</button>
          <div class="command-log" id="level9-command-log"></div>
        </div>
        <button class="btn-reset" onclick="resetScenario()">🔄 إعادة</button>
      </div>
      <div class="commands-list">
        <h4>الأوامر المتاحة:</h4>
        <ul>${allCommands.map(cmd => `<li><strong>${cmd.command}</strong>: ${cmd.description}</li>`).join('')}</ul>
      </div>`;
    setupTerminal();
    feedbackEl.innerHTML = '🎮 اكتب الأوامر من القائمة للدفاع!';
    feedbackEl.className = 'feedback info';
    if (cyberBuddy) {
      cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>الوضع: ${situationDescriptions[scenario.id] || "تهديد جديد!"}<br>تلميح: ${scenario.hint}`;
    }
  }

  function setupTerminal() {
    const input = document.getElementById('level9-command-input');
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') executeCommand();
    });
    input.addEventListener('input', () => {
      const suggestions = currentScenarioData.commands.filter(cmd => cmd.startsWith(input.value));
      if (suggestions.length > 0) feedbackEl.innerHTML = `💡 اقتراح: ${suggestions[0]}`;
    });
  }

  function executeCommand() {
    const input = document.getElementById('level9-command-input').value.trim();
    const log = document.getElementById('level9-command-log');
    log.innerHTML += `<div>${input}</div>`;
    if (currentScenarioData.commands.includes(input)) {
      currentScenarioData.commands = currentScenarioData.commands.filter(cmd => cmd !== input);
      log.lastChild.style.color = '#4CAF50';
      if (currentScenarioData.commands.length === 0) {
        level9Score += 15;
        scenariosRemaining--;
        updateDisplays();
        feedbackEl.innerHTML = '<div class="success">🎉 نجحت في الدفاع! +15 نقطة!</div>';
        if (cyberBuddy) {
          cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>عمل عظيم يا قائد!`;
          getCyberBuddyResponse("اللاعب نجح في مستوى Firewall Commander. اديله تهنئة وتشجيع باللهجة المصرية")
            .then(response => cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`);
        }
        setTimeout(() => scenariosRemaining > 0 ? loadNextScenario() : endLevel(), 3000);
      }
    } else {
      log.lastChild.style.color = '#f44336';
      feedbackEl.innerHTML = `<div class="error">❌ أ Busting
System: أمر خاطئ! <small>${currentScenarioData.hint}</small></div>`;
      if (cyberBuddy) {
        cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>جرّب تاني يا بطل!`;
        getCyberBuddyResponse("اللاعب فشل في مستوى Firewall Commander. اديله نصيحة وتحفيز باللهجة المصرية")
          .then(response => cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`);
      }
    }
    document.getElementById('level9-command-input').value = '';
  }

  window.resetScenario = function() {
    cleanupPreviousScenario();
    if (currentScenarioData) displayScenario(currentScenarioData);
    feedbackEl.innerHTML = '🎮 ابدأ من جديد!';
  };

  window.skipScenario = function() {
  scenariosRemaining--;
  updateDisplays();
  feedbackEl.innerHTML = '<div class="info">⏭ تم تخطي السيناريو!</div>';
  if (cyberBuddy) {
    cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>تمام، خلينا نروح للسيناريو اللي بعده!`;
  }
  setTimeout(() => scenariosRemaining > 0 ? loadNextScenario() : endLevel(), 2000);
};

  function updateDisplays() {
    if (scoreDisplay) scoreDisplay.textContent = level9Score;
    if (scenariosDisplay) scenariosDisplay.textContent = scenariosRemaining;
  }

  function loadNextScenario() {
    if (scenariosRemaining <= 0) return endLevel();
    cleanupPreviousScenario();
    let available = scenarios[currentDifficulty].filter(s => !usedScenarios[currentDifficulty].includes(s.id));
    if (available.length === 0) {
      const difficulties = ["easy", "medium", "hard"];
      for (let diff of difficulties) if (diff !== currentDifficulty) {
        const other = scenarios[diff].filter(s => !usedScenarios[diff].includes(s.id));
        if (other.length > 0) { currentDifficulty = diff; available = other; break; }
      }
    }
    if (available.length === 0) return endLevel();
    const scenario = available[Math.floor(Math.random() * available.length)];
    usedScenarios[currentDifficulty].push(scenario.id);
    displayScenario(scenario);
  }

  function endLevel() {
    document.getElementById("level9-screen").classList.add("hidden");
    document.getElementById("level9-congrats-screen").classList.remove("hidden");
    document.getElementById("go-to-level10").classList.remove("hidden");
    document.getElementById("level9-final-score").textContent = level9Score;
    if (cyberBuddy) {
      cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>مبروك! بقيت قائد حائط نار!`;
      getCyberBuddyResponse("اللاعب أكمل مستوى Firewall Commander. اديله تهنئة باللهجة المصرية")
        .then(response => cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`);
    }

    const currentUser = localStorage.getItem("currentUser");
    if (typeof completeLevel === 'function') {
      completeLevel(currentUser, "level9", "🔥 Firewall Commander");
    }
  }

  function initLevel9() {
    level9Score = 0;
    scenariosRemaining = 3;
    currentDifficulty = "easy";
    usedScenarios = { easy: [], medium: [], hard: [] };
    emotionCounts = { happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0, fearful: 0, disgusted: 0 };
    dominantEmotion = "neutral";
    updateDisplays();
    adjustDifficulty();
    loadNextScenario();
  }


  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.id === "level9-screen" && !mutation.target.classList.contains("hidden")) {
        initLevel9();
        observer.disconnect();
      }
    });
  });

  // Start observing the level9-screen element
  const level9Screen = document.getElementById("level9-screen");
  if (level9Screen) {
    observer.observe(level9Screen, {
      attributes: true,
      attributeFilter: ["class"]
    });
  }

  if (nextLevelBtn) nextLevelBtn.addEventListener("click", () => {
    document.getElementById("level9-congrats-screen").classList.add("hidden");
    document.getElementById("go-to-level10").classList.add("hidden");
    document.getElementById("level10-screen").classList.remove("hidden");
  });

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      document.getElementById("level9-congrats-screen").classList.add("hidden");
      document.getElementById("menu-screen").classList.remove("hidden");
    });
  }

  
});
