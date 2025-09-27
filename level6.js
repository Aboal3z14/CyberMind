document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Level 6 - Guardian Backup (Compact)");

  // Game state
  let level6Score = 0;
  let scenariosRemaining = 3;
  let currentDifficulty = "easy";
  let currentScenarioData = null;
  let usedScenarios = { easy: [], medium: [], hard: [] };

  // Emotion tracking
  let emotionCounts = { happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0, fearful: 0, disgusted: 0 };
  let dominantEmotion = "neutral";

  // DOM elements
  const scoreDisplay = document.getElementById("level6-score");
  const scenariosDisplay = document.getElementById("level6-calls-remaining");
  const scenarioContainer = document.getElementById("level6-container");
  const feedbackEl = document.getElementById("level6-feedback");
  const cyberBuddy = document.getElementById("cyberbuddy");
  const nextLevelBtn = document.getElementById("go-to-level7");

  // Compact scenarios
  const scenarios = {
    easy: [
      {
        id: "easy-1",
        title: "💾 جهازك مصاب بالفدية!",
        description: "ملفاتك مقفلة! رتب الخطوات الصحيحة:",
        correctOrder: [3, 1, 4, 2],
        steps: [
          { id: 1, text: "اتصل بالأمان السيبراني", icon: "📞" },
          { id: 2, text: "ادفع الفدية بسرعة", icon: "💰" },
          { id: 3, text: "فصل الجهاز عن الإنترنت", icon: "🔌" },
          { id: 4, text: "استعمل الباك آب الأخير", icon: "💾" }
        ],
        hint: "أولاً فصل الجهاز، آخر حاجة الباك آب!"
      },
      {
        id: "easy-2",
        title: "💻 إيميل فايروس",
        description: "فتحت ملف وملفاتك مقفلت! رتب الإجراءات:",
        correctOrder: [2, 4, 1, 3],
        steps: [
          { id: 1, text: "افتح المزيد من المرفقات", icon: "📎" },
          { id: 2, text: "أوقف الاتصالات الشبكية", icon: "🌐" },
          { id: 3, text: "ادفع الفدية", icon: "💸" },
          { id: 4, text: "شغّل أنتي فايروس", icon: "🛡️" }
        ],
        hint: "أوقف الشبكة أولاً، ثم الأنتي فايروس!"
      }
    ],
    medium: [
      {
        id: "medium-1",
        title: "🏢 هجوم على الشركة",
        description: "كل الأجهزة مصابة! رتب خطة الاستجابة:",
        correctOrder: [1, 4, 2, 5, 3],
        steps: [
          { id: 1, text: "عزل الشبكة كلها", icon: "🔌" },
          { id: 2, text: "ادفع الفدية لكل جهاز", icon: "💰" },
          { id: 3, text: "استعادة من باك آب", icon: "💾" },
          { id: 4, text: "تقييم الضرر", icon: "🔍" },
          { id: 5, text: "فحص بأدوات متخصصة", icon: "🛡️" }
        ],
        hint: "عزل أولاً، فحص، آخر حاجة الاستعادة!"
      }
    ],
    hard: [
      {
        id: "hard-1",
        title: "🔒 فدية مع تسريب",
        description: "سرقوا البيانات وبيطلبوا فدية! رتب الاستجابة:",
        correctOrder: [2, 5, 1, 4, 3],
        steps: [
          { id: 1, text: "ادفع الفدية", icon: "💰" },
          { id: 2, text: "بلّغ السلطات", icon: "🚨" },
          { id: 3, text: "خطة للعملاء", icon: "📢" },
          { id: 4, text: "حلّل الضرر", icon: "🔍" },
          { id: 5, text: "عزل الأنظمة", icon: "🛡️" }
        ],
        hint: "السلطات أولاً، آخر حاجة التواصل!"
      }
    ]
  };

  // -------------------------------
  // 🧠 EMOTION DETECTION
  // -------------------------------
  async function detectEmotion() {
    if (!window.faceapi || !window.videoElement) return;
    try {
      const detections = await faceapi
        .detectSingleFace(window.videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections?.expressions) {
        const bestEmotion = Object.entries(detections.expressions)
          .reduce((a, b) => b[1] > a[1] ? b : a)[0];

        emotionCounts[bestEmotion]++;
        dominantEmotion = Object.entries(emotionCounts)
          .reduce((a, b) => b[1] > a[1] ? b : a)[0];

        adjustDifficulty();
      }
    } catch (e) {
      console.error('Emotion detection failed:', e);
    }
  }

  setInterval(detectEmotion, 3000);

  function adjustDifficulty() {
    if (dominantEmotion === "surprised") currentDifficulty = "hard";
    else if (["happy", "neutral"].includes(dominantEmotion)) currentDifficulty = "medium";
    else currentDifficulty = "easy";
  }

  // -------------------------------
  // 🧹 CLEANUP
  // -------------------------------
  function cleanupPreviousScenario() {
    if (scenarioContainer) {
      scenarioContainer.innerHTML = '';
    }
    window.currentDragging = null;
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
    }
  }

  // -------------------------------
  // 🎮 DISPLAY SCENARIO
  // -------------------------------
  function displayScenario(scenario) {
    if (!scenarioContainer || !feedbackEl) {
      console.error('Required DOM elements are missing');
      return;
    }

    currentScenarioData = scenario;
    cleanupPreviousScenario();

    const numSteps = scenario.steps.length;
    const dropZonesHTML = Array.from({ length: numSteps }, (_, i) =>
      `<div class="drop-zone" data-position="${i + 1}">
         <div class="position-number">${i + 1}️⃣</div>
         <div class="zone-content"></div>
       </div>`
    ).join('');

    scenarioContainer.innerHTML = `
      <div class="scenario-header">
        <h3>${scenario.title}</h3>
        <p>${scenario.description}</p>
        <div class="difficulty-badge ${scenario.difficulty}">
          ${scenario.difficulty === 'easy' ? '💚 سهل' : scenario.difficulty === 'medium' ? '🟡 متوسط' : '🔴 صعب'}
        </div>
      </div>

      <div class="drag-drop-area">
        <div class="steps-pool">
          <h4>🚀 الخطوات المتاحة:</h4>
          <div class="steps-container">
            ${scenario.steps.map(step => `
              <div class="step-item" draggable="true" data-id="${step.id}" data-text="${step.text}" data-icon="${step.icon}">
                <span class="step-icon">${step.icon}</span>
                <span class="step-text">${step.text}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="drop-zones">
          <h4>📋 رتب الخطوات:</h4>
          <div class="zones-container">${dropZonesHTML}</div>
        </div>
      </div>

      <div class="check-answer">
        <button class="btn-check" disabled>✅ تحقق</button>
        <button class="btn-reset">🔄 إعادة</button>
      </div>
    `;

    // Attach event listeners to buttons
    const checkBtn = scenarioContainer.querySelector('.btn-check');
    const resetBtn = scenarioContainer.querySelector('.btn-reset');
    checkBtn.addEventListener('click', () => checkOrder(scenario.correctOrder));
    resetBtn.addEventListener('click', resetScenario);

    setupDragDrop();
    feedbackEl.innerHTML = '<span class="feedback-icon">🎮</span> اسحب الخطوات واتركها في الترتيب الصحيح!';
    feedbackEl.className = 'feedback info';
  }

  // -------------------------------
  // 🎯 DRAG & DROP SETUP
  // -------------------------------
  function setupDragDrop() {
    const steps = scenarioContainer.querySelectorAll('.step-item');
    const zones = scenarioContainer.querySelectorAll('.drop-zone');

    steps.forEach(step => {
      step.addEventListener('dragstart', e => {
        step.classList.add('dragging');
        window.currentDragging = step.dataset.id;
        e.dataTransfer.setData('text/plain', step.dataset.id);
      });

      step.addEventListener('dragend', () => {
        step.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(z => z.classList.remove('drag-over'));
      });
    });

    zones.forEach(zone => {
      zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', e => {
        e.preventDefault();
        const stepId = e.dataTransfer.getData('text/plain');
        const draggedStep = Array.from(steps).find(s => s.dataset.id === stepId);

        if (draggedStep && !zone.querySelector('.step-item')) {
          draggedStep.style.display = 'none';

          const stepCopy = document.createElement('div');
          stepCopy.classList.add('step-item', 'dropped');
          stepCopy.draggable = false;
          stepCopy.dataset.id = draggedStep.dataset.id;
          stepCopy.innerHTML = `
            <span class="step-icon">${draggedStep.dataset.icon}</span>
            <span class="step-text">${draggedStep.dataset.text}</span>
          `;
          zone.querySelector('.zone-content').appendChild(stepCopy);
          zone.classList.add('has-item');

          updateZoneNumbers();
          checkAllPlaced();
          feedbackEl.innerHTML = `✅ "${draggedStep.dataset.text}" في الموضع ${zone.dataset.position}!`;
          feedbackEl.className = 'feedback success';
        }
      });
    });
  }

  // -------------------------------
  // 🔢 UTILITY FUNCTIONS
  // -------------------------------
  function updateZoneNumbers() {
    const zones = scenarioContainer.querySelectorAll('.drop-zone');
    zones.forEach((zone, i) => {
      const positionNumber = zone.querySelector('.position-number');
      positionNumber.textContent = `${i + 1}️⃣`;
      positionNumber.style.display = zone.querySelector('.step-item') ? 'none' : 'block';
    });
  }

  function checkAllPlaced() {
    const totalSteps = currentScenarioData?.steps.length || 0;
    const placedSteps = scenarioContainer.querySelectorAll('.drop-zone.has-item').length;

    if (placedSteps === totalSteps) {
      const checkBtn = scenarioContainer.querySelector('.btn-check');
      checkBtn.disabled = false;
      checkBtn.style.opacity = '1';
      checkBtn.innerHTML = '✅ تحقق الآن!';
      feedbackEl.innerHTML = 'ممتاز! وضعت كل الخطوات! 🎯';
    }
  }

  function checkOrder(correctOrder) {
    if (!scenarioContainer || !feedbackEl || !scenariosDisplay || !currentScenarioData) {
      console.error('Required DOM elements or scenario data are missing');
      return;
    }

    const zones = scenarioContainer.querySelectorAll('.drop-zone');
    let userOrder = [];

    zones.forEach(zone => {
      const step = zone.querySelector('.step-item');
      userOrder.push(step ? parseInt(step.dataset.id) : 0);
    });

    if (userOrder.includes(0)) {
      feedbackEl.innerHTML = '<div class="error">❌ الرجاء وضع كل الخطوات قبل التحقق!</div>';
      feedbackEl.className = 'feedback error';
      return;
    }

    const isCorrect = userOrder.every((id, index) => id === correctOrder[index]);

    if (isCorrect) {
      level6Score += 15;
      scenariosRemaining--;
      scenariosDisplay.textContent = scenariosRemaining;
      feedbackEl.innerHTML = '<div class="success">🎉 ترتيب مثالي! +15 نقطة!</div>';
      feedbackEl.className = 'feedback success';

      if (cyberBuddy) {
        cyberBuddy.innerHTML = '🤖 سايبر بودي<br>برافو! بقيت مدير الاستجابة! 🚨💾';
      }

      disableInteractions();
    } else {
      feedbackEl.innerHTML = `<div class="error">❌ مش مظبوط!<br><small>${currentScenarioData.hint}</small></div>`;
      feedbackEl.className = 'feedback error';
      scenariosRemaining--;
      scenariosDisplay.textContent = scenariosRemaining;
      if (cyberBuddy) {
        cyberBuddy.innerHTML = '🤖 سايبر بودي<br>جرّب تاني! ركّز على الخطوة الأولى! 💪';
      }
    }

    updateDisplays();
    setTimeout(() => scenariosRemaining > 0 ? loadNextScenario() : endLevel(), 5000);
  }

  function resetScenario() {
    if (!currentScenarioData || !scenarioContainer) return;

    cleanupPreviousScenario();
    displayScenario(currentScenarioData);
    feedbackEl.innerHTML = '🎮 ابدأ من جديد!';
    feedbackEl.className = 'feedback info';

    const checkBtn = scenarioContainer.querySelector('.btn-check');
    const resetBtn = scenarioContainer.querySelector('.btn-reset');
    if (checkBtn) checkBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = false;
  }

  function disableInteractions() {
    scenarioContainer.querySelectorAll('.step-item').forEach(s => s.draggable = false);
    scenarioContainer.querySelectorAll('.drop-zone').forEach(z => z.style.pointerEvents = 'none');
    const checkBtn = scenarioContainer.querySelector('.btn-check');
    const resetBtn = scenarioContainer.querySelector('.btn-reset');
    if (checkBtn) checkBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
  }

  // -------------------------------
  // 📊 UPDATE DISPLAYS
  // -------------------------------
  function updateDisplays() {
    if (scoreDisplay) scoreDisplay.textContent = level6Score;
    if (scenariosDisplay) scenariosDisplay.textContent = scenariosRemaining;
  }

  // -------------------------------
  // 📋 LOAD NEXT SCENARIO
  // -------------------------------
  function loadNextScenario() {
    if (scenariosRemaining <= 0) {
      endLevel();
      return;
    }

    cleanupPreviousScenario();

    let available = scenarios[currentDifficulty].filter(s => !usedScenarios[currentDifficulty].includes(s.id));

    if (available.length === 0) {
      const difficulties = ["easy", "medium", "hard"];
      for (let diff of difficulties) {
        if (diff !== currentDifficulty) {
          const other = scenarios[diff].filter(s => !usedScenarios[diff].includes(s.id));
          if (other.length > 0) {
            currentDifficulty = diff;
            available = other;
            break;
          }
        }
      }
    }

    if (available.length === 0) {
      endLevel();
      return;
    }

    const scenario = available[Math.floor(Math.random() * available.length)];
    usedScenarios[currentDifficulty].push(scenario.id);
    scenario.difficulty = currentDifficulty; // Add difficulty to scenario for rendering
    displayScenario(scenario);
  }

  // -------------------------------
  // 🏆 END LEVEL
  // -------------------------------
  function endLevel() {
    const level6Screen = document.getElementById("level6-screen");
    const congratsScreen = document.getElementById("level6-congrats-screen");

    if (level6Screen) level6Screen.classList.add("hidden");
    if (congratsScreen) congratsScreen.classList.remove("hidden");

    const finalScoreEl = document.getElementById("final-level6-score");
    if (finalScoreEl) finalScoreEl.textContent = level6Score;

    if (cyberBuddy) {
      const messages = ["مبروك! بقيت خبير الاستجابة! 🚨🎉", "برافو! خلّصت الفدية! 💾✨"];
      cyberBuddy.innerHTML = `🤖 سايبر بودي<br>${messages[Math.floor(Math.random() * 2)]}`;
    }

    const user = localStorage.getItem("currentUser");
    if (typeof completeLevel === 'function') completeLevel(user, "level6", "💾 Backup Guardian");
  }

  // -------------------------------
  // 🎮 INIT LEVEL 6
  // -------------------------------
  function initLevel6() {
    if (!scoreDisplay || !scenariosDisplay || !scenarioContainer || !feedbackEl) {
      console.error('Required DOM elements are missing');
      return;
    }

    level6Score = 0;
    scenariosRemaining = 3;
    currentDifficulty = "easy";
    usedScenarios = { easy: [], medium: [], hard: [] };
    emotionCounts = { happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0, fearful: 0, disgusted: 0 };
    dominantEmotion = "neutral";

    updateDisplays();
    adjustDifficulty();
    loadNextScenario();
  }

  // Next level button
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener("click", () => {
      const congratsScreen = document.getElementById("level6-congrats-screen");
      const level7Screen = document.getElementById("level7-screen");
      if (congratsScreen) congratsScreen.classList.add("hidden");
      if (level7Screen) level7Screen.classList.remove("hidden");
    });
  }

  initLevel6();
});
