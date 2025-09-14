// Run everything after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initEmotionDetection();
});

async function initEmotionDetection() {
  const video = document.getElementById("webcam");

  // Start webcam
  await startWebcam();

  console.log("⏳ Loading models...");
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("/models");
  console.log("✅ Models loaded!");

  // Start detection loop after video plays
  video.addEventListener("playing", () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length > 0) {
        const expr = detections[0].expressions;
        const emotion = Object.keys(expr).reduce((a, b) =>
          expr[a] > expr[b] ? a : b
        );
        console.log("😃 Detected emotion:", emotion, expr);
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
// Minimize / Maximize logic
// ========================================
const webcamWidget = document.getElementById("webcam-widget");
const minimizeBtn = document.getElementById("minimize-webcam");
const maximizeBtn = document.getElementById("maximize-webcam");

minimizeBtn.addEventListener("click", () => {
  webcamWidget.style.width = "60px";
  webcamWidget.style.height = "50px";
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
