// ============================================
// 🎮 LEVEL 1: EMAIL PHISHING GAME + EMOTION TRACKER
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------
  // 🔢 GAME STATE VARIABLES
  // -------------------------------
  let levelScore = 0;
  let levelCorrectAnswers = 0;
  let levelEmailsRemaining = 5;
  let currentEmailIsFake = false;
  let currentDifficulty = "easy";
  let levelEmails = [];

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

  // -------------------------------
  // 🎯 DOM ELEMENTS
  // -------------------------------
  const emailSender = document.getElementById("email-sender");
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

  const nextLevelBtn = document.getElementById("next-level-btn");

  // -------------------------------
  // 📧 EMAILS DATA (same as before)...
  // -------------------------------
  const emails = {
    easy: [
      {
        sender: "البنك الأهلي المصري <noreply@nbe-egypt.com>",
        subject: "تنبيه أمني عاجل: تفعيل الحماية على حسابك",
        body: "<p>عزيزي العميل،</p><p>لقد رصدنا محاولة دخول غير مصرحة إلى حسابك. يرجى النقر على الرابط أدناه لتأكيد هويتك وتفعيل نظام الحماية الجديد.</p><p>إذا لم تقم بهذا الإجراء خلال 24 ساعة، سيتم تجميد حسابك مؤقتاً.</p><p>شكراً لتعاونك،</p><p>فريق الأمن السيبراني - البنك الأهلي المصري</p>",
        link: "http://nbe-security-update.com/verify-account",
        isFake: true,
        hint: "انظر إلى عنوان الرابط: nbe-security-update.com ليس نطاق البنك الأهلي الرسمي (النطاق الرسمي هو nbe.com.eg)"
      },
      {
        sender: "فيس بوك <security@facebook-mail.com>",
        subject: "تنبيه: نشاط غير معتاد على حسابك",
        body: "<p>مرحباً،</p><p>لقد اكتشفنا محاولة دخول إلى حسابك من جهاز جديد في القاهرة، مصر. إذا لم تكن هذه أنت، فيرجى النقر على الرابط أدناه لتأمين حسابك.</p><p>سيؤدي هذا إلى تسجيل خروج جميع الأجهزة وتغيير كلمة المرور.</p><p>فريق فيس بوك للأمان</p>",
        link: "http://facebook-secure-login.com/recover",
        isFake: true,
        hint: "عنوان البريد الإلكتروني facebook-mail.com ليس النطاق الرسمي لفيس بوك (النطاق الرسمي هو facebook.com)"
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
        sender: "البنك الأهلي المصري <noreply@nbe.com.eg>",
        subject: "كشف حسابك الشهري متاح الآن",
        body: "<p>عزيزي العميل،</p><p>كشف حسابك الشهري لشهر يناير 2024 متاح الآن للتحميل من خلال تطبيق البنك الأهلي المصري أو من خلال موقعنا الإلكتروني.</p><p>لتحميل كشف الحساب، يرجى تسجيل الدخول إلى حسابك عبر القنوات الرسمية للبنك.</p><p>شكراً لثقتك في البنك الأهلي المصري</p>",
        link: "https://www.nbe.com.eg/onlinebanking",
        isFake: false
      },
      {
        sender: "فيس بوك <security@facebook.com>",
        subject: "كود تسجيل الدخول إلى فيس بوك",
        body: "<p>مرحباً،</p><p>لقد طلبتَ للتو كود تسجيل دخول إلى فيس بوك. لا تشارك هذا الكود مع أي شخص.</p><p>كود تسجيل الدخول: 458732</p><p>إذا لم تطلب هذا الكود، يمكنك تجاهل هذه الرسالة أو الإبلاغ عنها.</p><p>شكراً،</p><p>فريق فيس بوك</p>",
        link: "https://www.facebook.com",
        isFake: false
      }
    ],
    medium: [
      {
        sender: "CIB <service@cib-egypt.net>",
        subject: "تحديث معلومات حسابك المطلوب",
        body: "<p>عميلنا العزيز،</p><p>نقوم حالياً بتحديث نظامنا المصرفي. يرجى تحديث معلوماتك من خلال الرابط أدناه لضمان استمرار الخدمة دون انقطاع.</p><p>ملاحظة: إذا لم تقم بتحديث معلوماتك خلال 48 ساعة، قد يتم تعليق بعض الخدمات على حسابك.</p><p>شكراً لتفهمك،</p><p>البنك التجاري الدولي (CIB)</p>",
        link: "https://cib-account-update.com/profile",
        isFake: true,
        hint: "النطاق cib-egypt.net ليس النطاق الرسمي للبنك التجاري الدولي (النطاق الرسمي هو cibeg.com)"
      },
      {
        sender: "Microsoft <account@microsoft-security.org>",
        subject: "تنبيه: انتهاء صلاحية ترخيص Windows",
        body: "<p>عزيزي مستخدم Windows،</p><p>ترخيص Windows الخاص بك على وشك الانتهاء. يرجى النقر على الرابط أدناه لتجديد الترخيص وتجنب تعطيل النظام.</p><p>سيؤدي عدم التجديد إلى فقدان الوصول إلى بعض الميزات وتعطيل النظام.</p><p>شكراً لاستخدامك Microsoft</p>",
        link: "http://microsoft-windows-renew.com/activate",
        isFake: true,
        hint: "microsoft-security.org ليس النطاق الرسمي لشركة Microsoft (النطاق الرسمي هو microsoft.com)"
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
      }
    ],
    hard: [
      {
        sender: "PayPal <security@paypal.com>",
        subject: "طلب تحقق من الحساب",
        body: "<p>عزيزي العميل،</p><p>لقد اكتشفنا نشاطًا غير معتاد على حسابك. للتحقق من هويتك وحماية حسابك، يرجى النقر على الرابط أدناه وإكمال عملية التحقق.</p><p>إذا لم تقم بهذا الإجراء خلال 24 ساعة، فقد يتم تقييد الوصول إلى حسابك مؤقتًا.</p><p>شكرًا لتعاونك،</p><p>فريق أمان PayPal</p>",
        link: "https://paypal-verification.secure-login.com/account",
        isFake: true,
        hint: "انظر إلى نطاق الرابط بعناية: paypal-verification.secure-login.com ليس نطاق PayPal الرسمي"
      },
      {
        sender: "Apple <no-reply@apple.com>",
        subject: "طلب تغيير كلمة المرور",
        body: "<p>مرحبًا،</p><p>لقد تلقينا طلبًا لتغيير كلمة المرور الخاصة بحساب Apple ID. إذا كنت قد طلبت هذا التغيير، فيرجى النقر على الرابط أدناه لإكمال العملية.</p><p>إذا لم تطلب تغيير كلمة المرور، فيرجى تجاهل هذه الرسالة أو الاتصال بالدعم.</p><p>شكرًا لك،</p><p>فريق دعم Apple</p>",
        link: "https://appleid-apple.com/account-management",
        isFake: true,
        hint: "appleid-apple.com ليس النطاق الرسمي لشركة Apple (النطاق الرسمي هو apple.com)"
      },
      {
        sender: "Microsoft <account@microsoft.com>",
        subject: "تأكيد تغيير كلمة المرور",
        body: "<p>عزيزي العميل،</p><p>لقد تم تغيير كلمة المرور لحساب Microsoft الخاص بك مؤخراً.</p><p>إذا كنت قد قمت بهذا التغيير، فلا داعي لاتخاذ أي إجراء آخر.</p><p>إذا لم تقم بتغيير كلمة المرور، فيرجى إعادة تعيينها على الفور من خلال موقعنا الرسمي.</p><p>شكراً،</p><p>فريق Microsoft</p>",
        link: "https://account.microsoft.com",
        isFake: false
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
  
  function loadRandomEmail() {
    if (levelEmailsRemaining < 1 || levelEmails.length === 0) {
      endLevel();
      return;
    }
      
    adjustDifficulty();


    const email = levelEmails.shift();

    emailSender.textContent = email.sender;
    emailSubject.textContent = email.subject;
    emailBody.innerHTML = email.body;
    emailLink.textContent = email.link;
    emailLink.href = email.link;

    currentEmailIsFake = email.isFake;

    // 👉 Add hint dynamically to CyberBuddy, with emotion context
    let emotionMsg = `📊 شعورك الغالب حتى الآن: ${dominantEmotion}`;
    hint.textContent = (email.hint ? email.hint + " | " + emotionMsg : emotionMsg);
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

    scoreDisplay.textContent = levelScore;
    correctAnswersDisplay.textContent = levelCorrectAnswers;
    emailsRemainingDisplay.textContent = levelEmailsRemaining;

    if (levelEmailsRemaining < 1) {
      endLevel();
    } else {
      setTimeout(() => {
        feedback.textContent = "";
        loadRandomEmail();
      }, 1200);
    }
  }

  function initLevel1() {
    levelScore = 0;
    levelCorrectAnswers = 0;
    levelEmailsRemaining = 5;
    currentEmailIsFake = false;
    currentDifficulty = "easy";
    levelEmails = [];

    // reset emotions
    for (let e in emotionCounts) emotionCounts[e] = 0;
    dominantEmotion = "neutral";

    feedback.textContent = "";
    btnReal.disabled = false;
    btnFake.disabled = false;
    if (nextLevelBtn) nextLevelBtn.classList.add("hidden");

    const emailArray = emails[currentDifficulty];
    levelEmails = [...emailArray].sort(() => 0.5 - Math.random()).slice(0, levelEmailsRemaining);

    loadRandomEmail();
  }

  function endLevel() {
    if (levelCorrectAnswers >= 3) {
      btnReal.disabled = true;
      btnFake.disabled = true;

      document.getElementById("level1-screen").classList.add("hidden");
      document.getElementById("congrats-screen").classList.remove("hidden");

      // 🧠 Show final dominant emotion
      alert(`🎉 مبروك! انتهيت من المستوى الأول.\n😊 الشعور الغالب عليك كان: ${dominantEmotion}`);
      const theusername = localStorage.getItem("currentUser"); 
      completeLevel(theusername, "level1", "🧠 Phishing Analyst");
    } else {
      alert("😢 للأسف، لم تحقق العدد الكافي من الإجابات الصحيحة. حاول مرة أخرى!");
      setTimeout(() => {
        initLevel1();
        feedback.textContent = "";
      }, 2000);
    }
  }

  // -------------------------------
  // 🎮 EVENT LISTENERS
  // -------------------------------
  btnReal.addEventListener("click", () => handleAnswer(true));
  btnFake.addEventListener("click", () => handleAnswer(false));

  if (nextLevelBtn) {
    nextLevelBtn.addEventListener("click", () => {
      document.getElementById("level1-screen").classList.add("hidden");
      startLevel2();
    });
  }

  // -------------------------------
  // ▶️ START GAME
  // -------------------------------
  initLevel1();
});

