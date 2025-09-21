// level4.js
document.addEventListener("DOMContentLoaded", () => {
  // Game state
  let level4Score = 0;
  let scenariosRemaining = 3;
  let currentDifficulty = "easy";
  // 🧠 Emotion tracking
  let emotionCounts = {
    happy: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    neutral: 0,
    fearful: 0,
    disgusted: 0
  };

  let dominantEmotion = "neutral"; // default

  // Track used scenarios to avoid repetition
  let usedScenarios = {
    easy: [],
    medium: [],
    hard: []
  };
  
  // DOM elements
  const scoreDisplay = document.getElementById("level4-score");
  const scenariosDisplay = document.getElementById("scenarios-remaining");
  const scenarioContainer = document.getElementById("scenario-container");
  const feedbackEl = document.getElementById("level4-feedback");
  const cyberBuddy = document.getElementById("cyberbuddy");
  const nextLevelBtn = document.getElementById("go-to-level5");
  
  // Social engineering scenarios by difficulty
  const scenarios = {
    easy: [
      {
        id: "easy-1",
        title: "مكالمة هاتفية مشبوهة",
        description: "اتصل بك شخص يدعي أنه من البنك ويطلب معلوماتك الشخصية للحصول على مكافأة خاصة. يقول إن العرض سينتهي خلال ساعة.",
        options: [
          { text: "أعطيه المعلومات لأنه يعرف اسمي ويعرف أنني عميل في البنك", correct: false },
          { text: "أطلب رقمه وأتواصل مع البنك مباشرة للتأكد", correct: true },
          { text: "أقطع المكالمة وأحظر الرقم", correct: true }
        ],
        hint: "البنوك لا تطلب معلوماتك الشخصية عبر الهاتف. دائماً تواصل مع البنك مباشرة عبر قنواتهم الرسمية."
      },
      {
        id: "easy-2",
        title: "بريد إلكتروني عاجل",
        description: "وصلك إيميل من \"مديرك\" يطلب منك تحويل مبلغ عاجل إلى حساب جديد بسبب \"ظروف طارئة\".",
        options: [
          { text: "أنفذ الطلب فوراً لأن المدير يبدو في حالة طارئة", correct: false },
          { text: "أتصل بالمدير مباشرة على رقمه المعروف للتأكد", correct: true },
          { text: "أبلغ قسم تكنولوجيا المعلومات عن البريد المشبوه", correct: true }
        ],
        hint: "المهاجمون غالباً ما يخلقون حالة من الإلحاع لدفعك لاتخاذ قرار خاطئ. دائماً تحقق من الطلبات غير العادية."
      }
    ],
    medium: [
      {
        id: "medium-1",
        title: "عرض عمل مغرٍ",
        description: "عرض عمل من شركة غير معروعة براتب مرتفع جداً، يطلبون منك دفع مبلغ مقدم \"كضمان\" للحصول على الوظيفة.",
        options: [
          { text: "أدفع المبلغ لأن الراتب مرتفع ويغطي هذا المبلغ", correct: false },
          { text: "أبحث عن معلومات عن الشركة وأتصل بهم عبر قنوات رسمية", correct: true },
          { text: "أرفض العرض لأن الشركات الشرعية لا تطلب أموالاً مقدمة", correct: true }
        ],
        hint: "العروض التي تبدو جيدة جداً لدرجة يصعب تصديقها غالباً ما تكون احتيال. الشركات الشرعية لا تطلب أموالاً مقدمة من الموظفين."
      },
      {
        id: "medium-2",
        title: "مسح ضوئي للوجه",
        description: "تطبيق على هاتفك يعدك بتحويل صورتك إلى رسم كارتوني محترف، لكنه يطلب صلاحية الوصول إلى الكاميرا وجهات اتصالك.",
        options: [
          { text: "أمنحه الصلاحيات لأنه تطبيق مسلي وغير ضار", correct: false },
          { text: "أرفض منح الصلاحيات وأبحث عن تطبيق بديل مع تقييمات جيدة", correct: true },
          { text: "أقبل الصلاحيات ولكن أمنع الوصول إلى جهات الاتصال", correct: false }
        ],
        hint: "التطبيقات التي تطلب صلاحيات أكثر مما تحتاجه لمهمتها الأساسية قد تكون خطيرة. اقرأ التقييمات وتحقق من المطور قبل تثبيت أي تطبيق."
      }
    ],
    hard: [
      {
        id: "hard-1",
        title: "تسريب معلوماتي",
        description: "شخص يتصل بك ويعرف معلومات شخصية دقيقة عنك (عنوانك، تاريخ ميلادك)، ويطلب التأكد من بعض المعلومات الأخرى \"لحمايتك\".",
        options: [
          { text: "أتعاون معه لأنه يعرف معلوماتي already", correct: false },
          { text: "أقطع المكالمة وأبلغ السلطات المختصة", correct: true },
          { text: "أطلب منه معلومات للتحقق من هويته قبل أي حديث", correct: true }
        ],
        hint: "المحتالون يجمعون المعلومات المتاحة publicly ليكسبوا ثقتك. لا تعط أي معلومات إضافية حتى لو كانوا يعرفون بعض معلوماتك."
      }
    ]
  };

  // -------------------------------
  // 🧠 EMOTION DETECTION FUNCTIONS
  // -------------------------------
  async function detectEmotion() {
    if (!window.faceapi || !window.videoElement) return;

    const detections = await faceapi
      .detectSingleFace(window.videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections && detections.expressions) {
      // find top expression
      let bestEmotion = "neutral";
      let bestValue = 0;
      for (let [emotion, value] of Object.entries(detections.expressions)) {
        if (value > bestValue) {
          bestEmotion = emotion;
          bestValue = value;
        }
      }

      // increment counter
      if (emotionCounts[bestEmotion] !== undefined) {
        emotionCounts[bestEmotion]++;
      }

      // update dominantEmotion (the one with highest total count so far)
      dominantEmotion = Object.entries(emotionCounts).reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0];
    }
  }

  // call detectEmotion repeatedly (every 2s for example)
  setInterval(detectEmotion, 3000);

  // -------------------------------
  // ⚖️ Adjust difficulty based on dominant emotion
  // -------------------------------
  function adjustDifficulty() {
    // Map emotions -> difficulty
    // tweak mapping as you prefer
    if (dominantEmotion === "surprised") {
      currentDifficulty = "hard";
    } else if (dominantEmotion === "happy" || dominantEmotion === "neutral") {
      currentDifficulty = "medium";
    } else { // sad, angry, fearful, disgusted, etc.
      currentDifficulty = "easy";
    }
  }

  // -------------------------------
  // 📝 FUNCTIONS
  // ------------------------------- 
    // Display scenario in the UI
  function displayScenario(scenario) {
    scenarioContainer.innerHTML = `
      <div class="scenario-title">${scenario.title}</div>
      <div class="scenario-description">${scenario.description}</div>
      <div class="scenario-options">
        ${scenario.options.map((option, index) => 
          `<button class="option-btn" data-correct="${option.correct}" data-index="${index}">${option.text}</button>`
        ).join('')}
      </div>
    `;
    
    // Add event listeners to option buttons
    const optionButtons = scenarioContainer.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        handleAnswer(e.target.dataset.correct === 'true', scenario.hint);
        
        // Visual feedback
        optionButtons.forEach(b => {
          b.disabled = true;
          if (b.dataset.correct === 'true') {
            b.classList.add('correct');
          } else {
            b.classList.add('incorrect');
          }
        });
      });
    });
    
    feedbackEl.textContent = '';
  }


  function loadNextScenario() {
    if (scenariosRemaining <= 0) {
      endLevel();
      return;
    }
    
    const availableScenarios = scenarios[currentDifficulty].filter(
      scenario => !usedScenarios[currentDifficulty].includes(scenario.id)
    );
    
    // If no scenarios left in current difficulty, try other difficulties
    if (availableScenarios.length === 0) {
      const difficulties = ["easy", "medium", "hard"];
      for (let diff of difficulties) {
        if (diff !== currentDifficulty && scenarios[diff].length > 0) {
          const otherAvailable = scenarios[diff].filter(
            scenario => !usedScenarios[diff].includes(scenario.id)
          );
          if (otherAvailable.length > 0) {
            currentDifficulty = diff;
            break;
          }
        }
      }
    }
    
    const finalAvailableScenarios = scenarios[currentDifficulty].filter(
      scenario => !usedScenarios[currentDifficulty].includes(scenario.id)
    );
    
    if (finalAvailableScenarios.length === 0) {
      endLevel();
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * finalAvailableScenarios.length);
    const scenario = finalAvailableScenarios[randomIndex];
    
    // Mark this scenario as used
    usedScenarios[currentDifficulty].push(scenario.id);
    
    // Display the scenario
    displayScenario(scenario);
    
    scenariosRemaining--;
    updateDisplays();
  }

  function updateDisplays() {
    scoreDisplay.textContent = level4Score;
    scenariosDisplay.textContent = scenariosRemaining;
  }

  // Initialize level 4
  function initLevel4() {
    level4Score = 0;
    scenariosRemaining = 3;
    // Reset used scenarios
    usedScenarios = {
      easy: [],
      medium: [],
      hard: []
    };
    updateDisplays();
    
    // Adjust difficulty based on emotion
    adjustDifficulty();
    
    // Load first scenario
    loadNextScenario();
    
    // Setup CyberBuddy initial message
    if (cyberBuddy) {
      cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>شعورك اليوم: <span class="emotion-badge">${dominantEmotion}</span>. هنبدأ بمستوى ${currentDifficulty === 'easy' ? 'سهل' : currentDifficulty === 'medium' ? 'متوسط' : 'صعب'} بناءً على مزاجك.`;
    }
  }

  // Handle user's answer
  function handleAnswer(isCorrect, hint) {
    if (isCorrect) {
      level4Score += 10;
      feedbackEl.textContent = "✅ إجابة صحيحة! أحسنت!";
      feedbackEl.style.color = "lightgreen";
      
      if (cyberBuddy) {
        cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>أحسنت! كدة بتكون عارف تتعامل مع الموقف!`;
      }
    } else {
      feedbackEl.innerHTML = `❌ إجابة خاطئة!<br>${hint}`;
      feedbackEl.style.color = "lightpink";
      
      if (cyberBuddy) {
        cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>مشكلة! المرة الجاية خد بالك من ${hint}`;
      }
    }
    
    updateDisplays();
    
    // Load next scenario after a delay
    setTimeout(() => {
      loadNextScenario();
    }, 3000);
  }

  // End the level
  function endLevel() {
    document.getElementById("level4-screen").classList.add("hidden");
    document.getElementById("level4-congrats-screen").classList.remove("hidden");
    
    // Update CyberBuddy message
    if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br> مبروك خلصت المستوى الرابع! 🎉`;
      getCyberBuddyResponse(`اللاعب خلص المرحلة الرابعة وعدى المستوى. شعوره الغالب كان ${dominantEmotion}. اديله تهنئة باللهجة المصرية`)
        .then(response => {
          if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`;
        });

        
    const currentUser = localStorage.getItem("currentUser");
    completeLevel(currentUser, "level4", "🗣️ Human Firewall");
    
  }

  // Next level button
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener("click", () => {
      document.getElementById("level4-congrats-screen").classList.add("hidden");
    });
  }

  // Initialize level 4 when the screen is shown
  const level4Screen = document.getElementById("level4-screen");
  if (level4Screen) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (!mutation.target.classList.contains('hidden')) {
          initLevel4();
        }
      });
    });
    
    observer.observe(level4Screen, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
  }
});
