document.addEventListener("DOMContentLoaded", () => {
  initEmotionDetection();
});

async function initEmotionDetection() {
  const video = document.getElementById("webcam");
  const container = document.getElementById("webcam-container");
  const toggleBtn = document.getElementById("toggle-webcam");

  // Start webcam
  await startWebcam();

  // Load models
  console.log("⏳ Loading models...");
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("/models");
  console.log("✅ Models loaded!");

  // Detection loop
  video.addEventListener("playing", () => {
    setInterval(async () => {
      if (container.style.height === "40px") return; // Skip detection if minimized

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

  // Toggle button
  toggleBtn.addEventListener("click", () => {
    if (container.style.height !== "40px") {
      // Minimize
      video.style.display = "none";
      container.style.height = "40px";
      container.style.width = "80px";
      toggleBtn.textContent = "Open";
      toggleBtn.style.fontSize = "10px";
    } else {
      // Maximize
      video.style.display = "block";
      container.style.height = "200px";
      container.style.width = "200px";
      toggleBtn.textContent = "Minimize";
      toggleBtn.style.fontSize = "12px";
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
