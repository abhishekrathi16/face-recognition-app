const video = document.getElementById('video')
let predictedAges = [];
const isScreenSmall = window.matchMedia("(max-width: 700px)");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
  faceapi.nets.ageGenderNet.loadFromUri('./models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
    const resizedDetections = faceapi.resizeResults(detections, displaySize)

    console.log(resizedDetections)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
//expressions
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
//age and gender
    document.getElementById("age").innerText = `Age - ${resizedDetections[0].age}`;
    document.getElementById("gender").innerText = `Gender - ${resizedDetections[0].gender}`;
  }, 100)
})

function interpolateAgePredictions(age) {
    predictedAges = [age].concat(predictedAges).slice(0, 30);
    const avgPredictedAge =
      predictedAges.reduce((total, a) => total + a) / predictedAges.length;
    return avgPredictedAge;
  }

//fixing video width for smaller screens
function screenResize(isScreenSmall) {
    if (isScreenSmall.matches) {
      video.style.width = "320px";
    } else {
      video.style.width = "720px";
    }
  }

screenResize(isScreenSmall);
isScreenSmall.addListener(screenResize);