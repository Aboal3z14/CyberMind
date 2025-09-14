// Run everything after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initEmotionDetection();
});

async function initEmotionDetection() {
    // Start webcam
  startWebcam();
  console.log("⏳ Loading models...");
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("/models");
  console.log("✅ Models loaded!");


  // Start detection loop after video plays
  const video = document.getElementById("webcam");
  video.addEventListener("playing", () => {
    setInterval(async () => {
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

// Minimize/maximize button
document.addEventListener("click", (e) => {
  if (e.target.id === "toggle-webcam") {
    const video = document.getElementById("webcam");
    video.style.display = video.style.display === "none" ? "block" : "none";
  }
});
