let generatedOTP = null;

function sendOTP() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("من فضلك أدخل اسم المستخدم وكلمة المرور.");
    return;
  }

  // توليد رمز تحقق عشوائي
  generatedOTP = Math.floor(100000 + Math.random() * 900000);
  console.log("رمز التحقق:", generatedOTP); // للاختبار

  // إظهار الإشعار
  document.getElementById("otp-code").textContent = generatedOTP;
  document.getElementById("otp-notification").classList.remove("hidden");
  document.getElementById("otp-input").classList.remove("hidden");
  document.getElementById("verify-btn").classList.remove("hidden");

  // إخفاء الإشعار بعد 7 ثواني
  setTimeout(() => {
    document.getElementById("otp-notification").classList.add("hidden");
  }, 7000);
}

function verifyOTP() {
  const userInput = document.getElementById("otp-input").value.trim();
  const resultMessage = document.getElementById("result-message");

  if (userInput === generatedOTP.toString()) {
    resultMessage.style.color = "#00ff88";
    resultMessage.textContent = "✅ تم تسجيل الدخول بنجاح. أهلاً بك في سايبر مايند!";
    // هنا ممكن ننتقل للمستوى الأول
  } else {
    resultMessage.style.color = "#ff5e5e";
    resultMessage.textContent = "❌ الرمز غير صحيح! سايبر بودي: شكلك نسيت تفعل التحقق الثنائي؟";
  }
}
