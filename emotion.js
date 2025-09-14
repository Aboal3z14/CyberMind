// Run everything after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initEmotionDetection();
});

async function initEmotionDetection() {
  const video = document.getElementById("webcam");

  // Start webcam first
  await startWebcam();

  console.log("⏳ Loading models...");
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("/models");
  console.log("✅ Models loaded!");

  // Start detection loop after video plays
  video.addEventListener("playing", () => {
    const detectionInterval = setInterval(async () => {
      if (video.style.display === "none") return; // Skip detection if minimized

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length > 0) {
        const expr = detections[0].expressions;
        const emotion = Object.keys(expr).reduce((a, b) => expr[a] > expr[b] ? a : b);
        console.log("😃 Detected emotion:", emotion, expr);
      }
    }, 1000); // every second
  });

  // Setup toggle button
  const toggleBtn = document.getElementById("toggle-webcam");
  toggleBtn.addEventListener("click", () => {
    if (video.style.display === "none") {
      video.style.display = "block";
      toggleBtn.textContent = "Minimize Webcam";
    } else {
      video.style.display = "none";
      toggleBtn.textContent = "Open Webcam";
    }
  });
}

async function startWebcam() {
  const video = document.getElementById("webcam");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });
  } catch (err) {
    console.error("❌ Webcam access denied:", err);
  }
}
