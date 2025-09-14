// ========================================
// Emotion Detection with dynamic import
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ face-api.js should be loaded now:", !!window.faceapi);
  initEmotionDetection();
  setupWebcamControls();
});



// ========================================
// Emotion Detection Functions
// ========================================
async function initEmotionDetection() {
  const video = document.getElementById("webcam");

  // Start webcam
  await startWebcam();

  console.log("⏳ Loading face-api models...");
  await faceapi.nets.tinyFaceDetector.loadFromUri("models");
  await faceapi.nets.faceExpressionNet.loadFromUri("models");
  console.log("✅ Models loaded!");

  // Start detection loop after video plays
  video.addEventListener("playing", () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const emotion = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );
        console.log("😃 Detected emotion:", emotion, expressions);
      }
    }, 1000); // every second
  });
}

async function startWebcam() {
  const video = document.getElementById("webcam");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error("❌ Webcam access denied:", err);
  }
}

// ========================================
// Webcam Minimize / Maximize
// ========================================
function setupWebcamControls() {
  const webcamWidget = document.getElementById("webcam-widget");
  const video = document.getElementById("webcam");
  const minimizeBtn = document.getElementById("minimize-webcam");
  const maximizeBtn = document.getElementById("maximize-webcam");

  minimizeBtn.addEventListener("click", () => {
    webcamWidget.style.width = "100px";
    webcamWidget.style.height = "80px";
    video.style.display = "none";
    minimizeBtn.style.display = "none";
    maximizeBtn.style.display = "inline-block";
  });

  maximizeBtn.addEventListener("click", () => {
    webcamWidget.style.width = "300px";
    webcamWidget.style.height = "230px";
    video.style.display = "block";
    maximizeBtn.style.display = "none";
    minimizeBtn.style.display = "inline-block";
  });
}
