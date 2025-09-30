// level5.js
document.addEventListener("DOMContentLoaded", () => {
  // Game state
  let level5Score = 0;
  let scenariosRemaining = 5; 
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
  let dominantEmotion = "neutral";

  // Track used scenarios to avoid repetition
  let usedScenarios = {
    easy: [],
    medium: [],
    hard: []
  };
  
  // DOM elements - Fixed to match HTML IDs
  const scoreDisplay = document.getElementById("level5-score");
  const scenariosDisplay = document.getElementById("calls-remaining"); // Fixed ID
  const scenarioContainer = document.getElementById("level5-container"); // Fixed ID
  const feedbackEl = document.getElementById("level5-feedback");
  const cyberBuddy = document.getElementById("cyberbuddy");
  const nextLevelBtn = document.getElementById("go-to-level6");
  const menuBtn = document.getElementById("go-to-menu-screen5");
  
  const scenarios = {
    easy: [
      {
        id: "easy-1",
        title: "مكالمة من البنك",
        description: "اتصل بك شخص يدعي أنه من البنك ويطلب رقم الكارت الائتماني لتأكيد عملية شراء.",
        options: [
          { text: "أعطيه رقم الكارت فوراً", correct: false },
          { text: "أرفض وأبلغ البنك مباشرة", correct: true },
          { text: "أطلب منه إرسال رسالة رسمية أولاً", correct: false }
        ],
        hint: "البنوك الحقيقية لا تطلب رقم الكارت عبر الهاتف أبداً. دائماً تواصل مع البنك مباشرة."
      },
      {
        id: "easy-2",
        title: "دعم فني مشبوه",
        description: "شخص يتصل بك يقول إنه من الدعم الفني ويطلب كلمة مرور الإيميل لحل مشكلة أمنية.",
        options: [
          { text: "أعطيه الباسورد لأنه من الدعم الفني", correct: false },
          { text: "أرفض وأطلب تفاصيل تثبت هويتهم", correct: true },
          { text: "أوافق لو كانت لهجة رسمية", correct: false }
        ],
        hint: "لا أحد من الدعم الفني الحقيقي سيطلب كلمة مرورك. أغلق المكالمة واتصل بالدعم الرسمي."
      },
      {
        id: "easy-3",
        title: "رسالة صوتية تحذيرية",
        description: "وصلتك رسالة صوتية تقول: 'جدّد اشتراكك الآن وإلا سيتم إيقاف الخدمة' مع رابط للتجديد.",
        options: [
          { text: "أتبع الرابط فوراً لتجنب الإيقاف", correct: false },
          { text: "أتجاهل الرسالة وأغلقها", correct: false },
          { text: "أتصل بخدمة العملاء من رقم الموقع الرسمي", correct: true }
        ],
        hint: "الرسائل التحذيرية المستعجلة غالباً احتيال. تحقق دائماً من خلال القنوات الرسمية."
      }
    ],
    medium: [
      {
        id: "medium-1",
        title: "معلومات شخصية جزئية",
        description: "شخص يتصل بك ويعرف بياناتك القديمة (اسمك، عنوان قديم) ويطلب معلومات جديدة لتحديث السجلات.",
        options: [
          { text: "تعطيه المعلومات لأنه عنده بياناتي القديمة", correct: false },
          { text: "تطلب تحقق رسمي وتبلغ الشركة", correct: true },
          { text: "تسأله سؤال أمني وتدلّيه", correct: false }
        ],
        hint: "المحتالون يجمعون معلومات من مصادر متعددة. لا تعطِ معلومات إضافية حتى لو كانوا يعرفون بعض التفاصيل."
      },
      {
        id: "medium-2",
        title: "مكالمة مستعجلة",
        description: "مكالمة عاجلة تقول جهازك مخترق ويطلبون كود التحقق OTP اللي وصل على موبايلك لإصلاح المشكلة.",
        options: [
          { text: "تزوّدهم بالـOTP لإصلاح المشكلة", correct: false },
          { text: "تغلق وتبلغ الدعم الأصلي", correct: true },
          { text: "تتعامل معاهم وتعمل فحص سريع", correct: false }
        ],
        hint: "لا أحد الحقيقي سيطلب OTP عبر الهاتف. هذا أكبر احتيال شائع - أغلق فوراً!"
      }
    ],
    hard: [
      {
        id: "hard-1",
        title: "مكالمة رسمية متقنة",
        description: "مكالمة تبدو رسمية جداً مع بيانات جزئية صحيحة عنك ويطلبون OTP على موبايلك لتأكيد هويتك في عملية أمنية.",
        options: [
          { text: "تعطي الـOTP لأنهم عندهم بيانات صحيحة", correct: false },
          { text: "ترفض وتحظر وتبلغ الجهة الرسمية", correct: true },
          { text: "تطلب منهم إرسال بريد رسمي أولاً", correct: false }
        ],
        hint: "حتى المحتالون المتقنون لا يحصلون على كل التفاصيل. OTP هو مفتاحك الأمني - لا تعطه لأحد عبر الهاتف أبداً."
      },
      {
        id: "hard-2",
        title: "طلب تحديث أمني",
        description: "شخص من 'الأمن السيبراني' يتصل ويقول إن حسابك مهدد ويحتاج تحديث فوري لكلمة المرور عبر المكالمة.",
        options: [
          { text: "تتعاون معه لتحديث الأمان", correct: false },
          { text: "تغلق وتغير كلمة المرور بنفسك", correct: true },
          { text: "تطلب إثبات هويتهم الرسمي", correct: false }
        ],
        hint: "الأمن السيبراني الحقيقي لا يتصل هكذا. غيّر كلمة المرور بنفسك عبر الموقع الرسمي فقط."
      }
    ]
  };

  // -------------------------------
  // 🧠 EMOTION DETECTION FUNCTIONS
  // -------------------------------
  async function detectEmotion() {
    if (!window.faceapi || !window.videoElement) return;

    try {
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
        
        console.log("Detected emotion:", dominantEmotion);
        adjustDifficulty(); // Adjust difficulty based on emotion
      }
    } catch (error) {
      console.log("Emotion detection error:", error);
    }
  }

  // call detectEmotion repeatedly
  setInterval(detectEmotion, 3000);

  // -------------------------------
  // ⚖️ Adjust difficulty based on dominant emotion
  // -------------------------------
  function adjustDifficulty() {
    // Map emotions -> difficulty
    if (dominantEmotion === "surprised") {
      currentDifficulty = "hard";
    } else if (dominantEmotion === "happy" || dominantEmotion === "neutral") {
      currentDifficulty = "medium";
    } else { // sad, angry, fearful, disgusted, etc.
      currentDifficulty = "easy";
    }
    
    console.log(`Difficulty adjusted to: ${currentDifficulty} (emotion: ${dominantEmotion})`);
  }

  // -------------------------------
  // 📝 FUNCTIONS
  // ------------------------------- 
  // Display scenario in the UI - Fixed variable names
  function displayScenario(scenario) { // Fixed parameter name
    scenarioContainer.innerHTML = `
      <div class="scenario-title">📞 ${scenario.title}</div>
      <div class="scenario-description">${scenario.description}</div>
      <div class="scenario-options">
        ${scenario.options.map((option, index) => 
          `<button class="option-btn" data-correct="${option.correct}" data-index="${index}">${option.text}</button>`
        ).join('')}
      </div>
      <div class="difficulty-indicator ${currentDifficulty}">
        مستوى: ${currentDifficulty === 'easy' ? 'سهل 💚' : currentDifficulty === 'medium' ? 'متوسط 🟡' : 'صعب 🔴'}
      </div>
    `;
    
    // Add event listeners to option buttons
    const optionButtons = scenarioContainer.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        handleAnswer(e.target.dataset.correct === 'true', scenario.hint); // Fixed variable name
        
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
    if (scoreDisplay) scoreDisplay.textContent = level5Score;
    if (scenariosDisplay) scenariosDisplay.textContent = scenariosRemaining;
  }

  // Initialize level 5
  function initLevel5() {
    console.log("🚀 Initializing Level 5");
    level5Score = 0;
    scenariosRemaining = 5;
    
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
  }

  // Handle user's answer
  function handleAnswer(isCorrect, hint) {
    if (isCorrect) {
      level5Score += 10;
      feedbackEl.textContent = "✅ إجابة صحيحة! أحسنت!";
      feedbackEl.style.color = "lightgreen";
      
      if (cyberBuddy) {
        cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>ممتاز! صحّيت النية الاحتيالية! 💪`;
      }
    } else {
      feedbackEl.innerHTML = `❌ إجابة خاطئة!<br><small>${hint}</small>`;
      feedbackEl.style.color = "lightpink";
      
      if (cyberBuddy) {
        cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>لسه محتاج تركيز شوية. المرة الجاية هتبقى أحسن! 🚀`;
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


    if (level5Score >= 30) {

      document.getElementById("final-level5-score").textContent = level5Score;


      document.getElementById("level5-screen").classList.add("hidden");
      document.getElementById("level5-congrats-screen").classList.remove("hidden");
      document.getElementById("go-to-level6").classList.remove("hidden");
  
      if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br> مبروك خلصت المستوى الخامس! 🎉`;
      getCyberBuddyResponse(`اللاعب خلص المرحلة الخامسة وعدى المستوى. شعوره الغالب كان ${dominantEmotion}. اديله تهنئة باللهجة المصرية`)
        .then(response => {
          if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`;
        });
  
      const currentUser = localStorage.getItem("currentUser");
      completeLevel(currentUser, "level5", "🧱 Human Firewall");


    } else {
      if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br> لسه محتاج تركيز شوية. جرّب تاني!`;
      getCyberBuddyResponse("اللاعب فشل في المستوى الخامس. اديله نصيحة وتحفيز باللهجة المصرية")
        .then(response => {
          if (cyberBuddy) cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`;
        });
  
      setTimeout(() => {
        initLevel5();
        feedback.textContent = "";
      }, 2000);
    }
  }

  // Next level button
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener("click", () => {
      document.getElementById("level5-congrats-screen").classList.add("hidden");
      document.getElementById("level6-screen").classList.remove("hidden");
      nextLevelBtn.classList.add("hidden");      
    });
  }
  
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      document.getElementById("level5-congrats-screen").classList.add("hidden");
      document.getElementById("menu-screen").classList.remove("hidden");
    });
  }

  initLevel5();

});
