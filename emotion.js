document.addEventListener("DOMContentLoaded", () => {
  initEmotionDetection();
});

async function initEmotionDetection() {
  const video = document.getElementById("webcam");

  // Start webcam
  await startWebcam();

  // Load models
  console.log("⏳ Loading models...");
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("/models");
  console.log("✅ Models loaded!");

  // Emotion detection loop
  video.addEventListener("playing", () => {
    setInterval(async () => {
      if (video.style.display === "none") return; // Skip if minimized

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length > 0) {
        const expr = detections[0].expressions;
        const emotion = Object.keys(expr).reduce((a, b) => expr[a] > expr[b] ? a : b);
        console.log("😃 Detected emotion:", emotion, expr);
      }
    }, 1000);
  });

  // Minimize button
  document.getElementById("minimize-webcam").addEventListener("click", () => {
    video.style.display = "none";
  });

  // Maximize button
  document.getElementById("maximize-webcam").addEventListener("click", () => {
    video.style.display = "block";
  });
}

// Start webcam
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
