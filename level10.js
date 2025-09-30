document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Level 10 - Threat Hunter - 09:46 AM +03, Sep 26, 2025");

  let level10Score = 0;
  let actionsRemaining = 30;
  let selectedActions = new Set();

  const scoreDisplay = document.getElementById("level10-score");
  const actionsDisplay = document.getElementById("level10-actions-remaining");
  const actionList = document.getElementById("level10-action-list");
  const feedbackEl = document.getElementById("level10-feedback");
  const cyberBuddy = document.getElementById("cyberbuddy");
  const nextLevelBtn = document.getElementById("level10-go-to-next");
  const menuBtn = document.getElementById("go-to-menu-screen10");

  const actions = [
    // Suspicious Actions (7)
    { id: "susp-1", text: "Login attempt from IP 203.0.113.5 at 02:14 AM", isSuspicious: true, context: "محاولة تسجيل دخول من IP غير معروف في وقت متأخر.", hint: "IP عام في ساعة غريبة قد يكون مشبوهًا!" },
    { id: "susp-2", text: "File transfer to external server 198.51.100.7", isSuspicious: true, context: "نقل ملفات إلى خادم خارجي غير مصرح به.", hint: "تحقق من وجهة النقل—الخوادم الخارجية خطيرة!" },
    { id: "susp-3", text: "Port scan detected on port 22 from 192.168.1.99", isSuspicious: true, context: "فحص منافذ على منفذ SSH من جهاز داخلي غير معروف.", hint: "فحص المنافذ عادةً يسبق الهجمات!" },
    { id: "susp-4", text: "Unusual SQL query from user 'guest'", isSuspicious: true, context: "استعلام SQL غير عادي من حساب ضيف.", hint: "حسابات الضيوف نادرًا ما تستخدم SQL!" },
    { id: "susp-5", text: "Multiple failed logins from IP 185.12.45.67", isSuspicious: true, context: "محاولات تسجيل دخول فاشلة متكررة من IP خارجي.", hint: "محاولات فاشلة متكررة تشير إلى هجوم قوة!" },
    { id: "susp-6", text: "Execution of script 'unknown.sh' on server", isSuspicious: true, context: "تنفيذ سكربت غير معروف على الخادم.", hint: "السكربتات المجهولة قد تكون خبيثة!" },
    { id: "susp-7", text: "Unauthorized access to /admin endpoint", isSuspicious: true, context: "محاولة وصول غير مصرح بها إلى نقطة نهاية إدارية.", hint: "الوصول غير المصرح به إلى /admin خطير!" },
    // Normal Actions (23)
    { id: "norm-1", text: "User 'admin' logged in from 192.168.1.10", isSuspicious: false, context: "تسجيل دخول عادي من حساب إداري معروف.", hint: "IP داخلي ومعروف يبدو آمنًا." },
    { id: "norm-2", text: "File download from internal server", isSuspicious: false, context: "تنزيل ملف من خادم داخلي مصرح به.", hint: "الخوادم الداخلية عادةً آمنة." },
    { id: "norm-3", text: "HTTPS traffic to port 443", isSuspicious: false, context: "حركة HTTPS عادية إلى منفذ آمن.", hint: "منفذ 443 شائع وآمن." },
    { id: "norm-4", text: "User 'john' updated profile", isSuspicious: false, context: "مستخدم معروف يحدّث ملفه الشخصي.", hint: "تحديثات الملف الشخصي عادية." },
    { id: "norm-5", text: "Backup initiated at 01:00 AM", isSuspicious: false, context: "نسخ احتياطي مجدول في وقت محدد.", hint: "النسخ الاحتياطي المجدول آمن." },
    { id: "norm-6", text: "Ping from internal device 192.168.1.15", isSuspicious: false, context: "اختبار اتصال من جهاز داخلي.", hint: "Ping داخلي عادي." },
    { id: "norm-7", text: "User 'sarah' logged out", isSuspicious: false, context: "تسجيل خروج مستخدم معروف.", hint: "تسجيل الخروج روتيني." },
    { id: "norm-8", text: "DNS query for internal domain", isSuspicious: false, context: "استعلام DNS لنطاق داخلي.", hint: "استعلامات DNS الداخلية آمنة." },
    { id: "norm-9", text: "HTTP request to internal API", isSuspicious: false, context: "طلب HTTP إلى واجهة برمجية داخلية.", hint: "الطلبات الداخلية لـ API آمنة." },
    { id: "norm-10", text: "User 'mary' changed password", isSuspicious: false, context: "مستخدم معروف يغير كلمة المرور.", hint: "تغيير كلمة المرور روتيني." },
    { id: "norm-11", text: "System update check at 03:00 AM", isSuspicious: false, context: "فحص تحديثات النظام المجدول.", hint: "فحص التحديثات المجدول آمن." },
    { id: "norm-12", text: "Internal email sent from user 'hr'", isSuspicious: false, context: "إرسال بريد إلكتروني داخلي من قسم الموارد البشرية.", hint: "البريد الداخلي عادي." },
    { id: "norm-13", text: "User 'dev' accessed codebase", isSuspicious: false, context: "مطور يصل إلى قاعدة التعليمات البرمجية.", hint: "الوصول إلى الكود من مطور آمن." },
    { id: "norm-14", text: "Scheduled server restart at 04:00 AM", isSuspicious: false, context: "إعادة تشغيل خادم مجدولة.", hint: "إعادة التشغيل المجدولة آمنة." },
    { id: "norm-15", text: "User 'support' responded to ticket", isSuspicious: false, context: "مستخدم دعم يرد على تذكرة.", hint: "ردود الدعم عادية." },
    { id: "norm-16", text: "Internal file share access by 'team'", isSuspicious: false, context: "وصول إلى مشاركة ملفات داخلية.", hint: "مشاركة الملفات الداخلية آمنة." },
    { id: "norm-17", text: "VPN connection from 192.168.1.20", isSuspicious: false, context: "اتصال VPN من جهاز داخلي معروف.", hint: "اتصالات VPN الداخلية آمنة." },
    { id: "norm-18", text: "User 'analyst' ran report", isSuspicious: false, context: "محلل يشغل تقريرًا.", hint: "تشغيل التقارير روتيني." },
    { id: "norm-19", text: "Firewall rule update by 'admin'", isSuspicious: false, context: "تحديث قاعدة جدار ناري بواسطة إداري.", hint: "تحديثات الإداريين آمنة." },
    { id: "norm-20", text: "Database backup completed", isSuspicious: false, context: "اكتمال نسخ قاعدة بيانات احتياطية.", hint: "النسخ الاحتياطي آمن." },
    { id: "norm-21", text: "User 'it' installed software update", isSuspicious: false, context: "قسم تكنولوجيا المعلومات يثبت تحديث برمجي.", hint: "تحديثات البرمجيات الداخلية آمنة." },
    { id: "norm-22", text: "Internal network scan by 'security'", isSuspicious: false, context: "فحص شبكة داخلي بواسطة فريق الأمان.", hint: "فحص الأمان الداخلي آمن." },
    { id: "norm-23", text: "User 'manager' accessed dashboard", isSuspicious: false, context: "مدير يصل إلى لوحة التحكم.", hint: "الوصول إلى لوحة التحكم روتيني." }
  ];

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function displayActions() {
    const shuffledActions = shuffleArray([...actions]);
    actionList.innerHTML = shuffledActions.map(action => `
      <li class="action-item" data-id="${action.id}">
        <label>
          <input type="checkbox" class="action-checkbox" data-id="${action.id}">
          ${action.text}
        </label>
        <span class="tooltip">${action.context}<br>تلميح: ${action.hint}</span>
      </li>
    `).join('');
    
    const checkboxes = document.querySelectorAll(".action-checkbox");
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const id = checkbox.getAttribute("data-id");
        if (checkbox.checked) {
          selectedActions.add(id);
        } else {
          selectedActions.delete(id);
        }
      });
    });
  }

  window.submitSelections = function() {
    let correct = 0;
    let incorrect = 0;

    selectedActions.forEach(id => {
      const action = actions.find(a => a.id === id);
      if (action.isSuspicious) {
        correct++;
        level10Score += 10;
        document.querySelector(`.action-item[data-id="${id}"]`).classList.add("correct");
      } else {
        incorrect++;
        level10Score -= 5;
        document.querySelector(`.action-item[data-id="${id}"]`).classList.add("incorrect");
      }
    });

    actionsRemaining = 0;
    updateDisplays();

    feedbackEl.innerHTML = `<div class="success">📤 تم الإرسال! رصدت ${correct} نشاط مشبوه بنجاح، وأخطأت في ${incorrect} نشاط عادي.</div>`;
    if (cyberBuddy) {
      cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>عمل رائع يا صياد! رصدت ${correct} من 7 تهديدات!`;
      getCyberBuddyResponse(`اللاعب أكمل مستوى Threat Hunter ورصد ${correct} من 7 تهديدات. اديله تهنئة باللهجة المصرية`)
        .then(response => cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`);
    }

    const checkboxes = document.querySelectorAll(".action-checkbox");
    checkboxes.forEach(checkbox => checkbox.disabled = true);
    document.querySelector(".btn-submit").disabled = true;

    setTimeout(endLevel, 3000);
  };

  function updateDisplays() {
    if (scoreDisplay) scoreDisplay.textContent = level10Score;
    if (actionsDisplay) actionsDisplay.textContent = actionsRemaining;
  }

  function endLevel() {
    document.getElementById("level10-screen").classList.add("hidden");
    document.getElementById("level10-congrats-screen").classList.remove("hidden");
    document.getElementById("level10-final-score").textContent = level10Score;
    if (cyberBuddy) {
      cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>يا سلام! بقيت صياد تهديدات محترف!`;
      getCyberBuddyResponse("اللاعب أكمل مستوى Threat Hunter. اديله تهنئة باللهجة المصرية")
        .then(response => cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>${response}`);
    }

    const currentUser = localStorage.getItem("currentUser");
    if (typeof completeLevel === 'function') {
      completeLevel(currentUser, "level10", "👁 Threat Hunter");
    }
  }

  function initLevel10() {
    level10Score = 0;
    actionsRemaining = 30;
    selectedActions = new Set();
    updateDisplays();
    displayActions();
    if (cyberBuddy) {
      cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>مراجعة السجل جاهزة! مرر على الأنشطة لتلميحاتي وحدد المشبوهة!`;
    }
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.id === "level10-screen" && !mutation.target.classList.contains("hidden")) {
        initLevel10();
        observer.disconnect();
      }
    });
  });

  // Start observing the level10-screen element
  const level10Screen = document.getElementById("level10-screen");
  if (level10Screen) {
    observer.observe(level10Screen, {
      attributes: true,
      attributeFilter: ["class"]
    });
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      document.getElementById("level10-congrats-screen").classList.add("hidden");
      document.getElementById("menu-screen").classList.remove("hidden");
    });
  }



});
