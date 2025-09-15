// ============================================
// 🧠 EMOTION DETECTION SCRIPT
// ============================================

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
    const MODEL_URL = "models";

    // Load multiple detectors + expressions + landmarks
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);

    console.log("✅ Models loaded!");
  } catch (err) {
    console.error("❌ Failed to load models:", err);
    return;
  }

  // Start detection when webcam is ready
  video.addEventListener("playing", () => {
    console.log("🎥 Webcam started. Detecting emotions...");
    runDetectionLoop(video);
  });

  // Fallback in case "playing" never fires
  setTimeout(() => {
    if (video.readyState >= 2) {
      console.log("⚡ Forcing detection start...");
      runDetectionLoop(video);
    }
  }, 2000);
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
    console.log("✅ Webcam initialized:", video.videoWidth, "x", video.videoHeight);
  } catch (err) {
    console.error("❌ Webcam access denied:", err);
  }
}

// ============================================
// 🔁 Continuous Emotion Detection
// ============================================
async function runDetectionLoop(video) {
  const tinyOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.3,
  });

  const ssdOptions = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5,
  });

  const detect = async () => {
    if (video.paused || video.ended) return requestAnimationFrame(detect);

    let detections;

    // Try SSD first (more accurate)
    detections = await faceapi
      .detectAllFaces(video, ssdOptions)
      .withFaceLandmarks(true)
      .withFaceExpressions();

    // Fallback to Tiny if SSD fails
    if (!detections || detections.length === 0) {
      detections = await faceapi
        .detectAllFaces(video, tinyOptions)
        .withFaceLandmarks(true)
        .withFaceExpressions();
    }

    if (detections && detections.length > 0) {
      const expr = detections[0].expressions;
      const emotion = Object.keys(expr).reduce((a, b) =>
        expr[a] > expr[b] ? a : b
      );
      console.log("😃 Detected emotion:", emotion, expr);
    } else {
      console.log("👀 No face detected");
    }

    requestAnimationFrame(detect);
  };

  detect();
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
