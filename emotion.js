async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceExpressionNet.loadFromUri('/models');
  console.log("✅ Models loaded");
}

document.addEventListener("DOMContentLoaded", async () => {
  // Load models
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("/models");
  console.log("✅ Models loaded!");

  // Start webcam
  await startWebcam();
});

async function startWebcam() {
  const video = document.getElementById("webcam");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    console.log("📷 Webcam started");
  } catch (err) {
    console.error("❌ Webcam access denied:", err);
  }
}

// 🎛️ Toggle Webcam Window
document.getElementById("toggle-webcam").addEventListener("click", () => {
  document.getElementById("webcam-wrapper").classList.toggle("collapsed");
});

