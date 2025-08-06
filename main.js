let otpCode = null;

function sendOTP() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("من فضلك أدخل اسم المستخدم وكلمة المرور");
    return;
  }

  // Generate 6-digit OTP
  otpCode = Math.floor(100000 + Math.random() * 900000);

  // Show fake email notification
  document.getElementById("otp-code").textContent = otpCode;
  document.getElementById("otp-notification").style.display = "block";

  // Show input + button
  document.getElementById("otp-input").classList.remove("hidden");
  document.getElementById("verify-btn").classList.remove("hidden");

  // Hide previous message
  document.getElementById("result-message").textContent = "";

  // Auto-hide notification after 7 seconds
  setTimeout(() => {
    document.getElementById("otp-notification").style.display = "none";
  }, 7000);
}

function verifyOTP() {
  const userOTP = document.getElementById("otp-input").value.trim();
  const message = document.getElementById("result-message");

  if (userOTP === otpCode.toString()) {
    message.style.color = "#00ff88";
    message.textContent = "✅ تم تسجيل الدخول بنجاح!";
  } else {
    message.style.color = "#ff4d4d";
    message.textContent = "❌ الرمز غير صحيح! سايبر بودي: كنت فعلت التحقق الثنائي؟ 😅";
  }
}
