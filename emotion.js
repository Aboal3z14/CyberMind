// ============================================
// 🧠 EMOTION DETECTION SCRIPT
// ============================================

// Run everything after DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  console.log("⏳ Initializing face-api.js...");

  if (!window.faceapi) {
    console.error("❌ face-api.js is not loaded!");
    return;
  }

  await initEmotionDetection();
  setupWebcamControls();
});

// ============================================
// 🚀 Initialize Emotion Detection
// ============================================
async function initEmotionDetection() {
  const video = document.getElementById("webcam");

  // Start webcam
  await startWebcam();

  console.log("⏳ Loading face-api models...");

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri("models");
    await faceapi.nets.faceExpressionNet.loadFromUri("models");
    console.log("✅ Models loaded!");
  } catch (err) {
    console.error("❌ Failed to load models:", err);
    return;
  }

  // Start detection loop after video plays
  video.addEventListener("playing", () => {
    console.log("🎥 Webcam started. Detecting emotions...");
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length > 0) {
        const expr = detections[0].expressions;
        const emotion = Object.keys(expr).reduce((a, b) =>
          expr[a] > expr[b] ? a : b
        );
        console.log("😃 Current emotion:", emotion, expr);
      }
    }, 500); // update every 0.5 second
  });
}

// ============================================
// 🚦 Start Webcam
// ============================================
async function startWebcam() {
  const video = document.getElementById("webcam");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    console.log("✅ Webcam initialized");
  } catch (err) {
    console.error("❌ Webcam access denied:", err);
  }
}

// ============================================
// 🖥️ Minimize / Maximize webcam widget
// ============================================
function setupWebcamControls() {
  const webcamWidget = document.getElementById("webcam-widget");
  const minimizeBtn = document.getElementById("minimize-webcam");
  const maximizeBtn = document.getElementById("maximize-webcam");

  minimizeBtn.addEventListener("click", () => {
    webcamWidget.style.width = "100px";
    webcamWidget.style.height = "80px";
    webcamWidget.style.overflow = "hidden";
    document.getElementById("webcam").style.display = "none";
    minimizeBtn.style.display = "none";
    maximizeBtn.style.display = "inline-block";
  });

  maximizeBtn.addEventListener("click", () => {
    webcamWidget.style.width = "300px";
    webcamWidget.style.height = "230px";
    document.getElementById("webcam").style.display = "block";
    maximizeBtn.style.display = "none";
    minimizeBtn.style.display = "inline-block";
  });
}
