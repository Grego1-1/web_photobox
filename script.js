const video = document.getElementById('camera');
const countdown = document.getElementById('countdown');
const startBtn = document.getElementById('startBtn');
const grid = document.getElementById('photoGrid');
const photoFrame = document.getElementById('photoFrame');
const frameSelection = document.getElementById('frameSelection');
const downloadBtn = document.getElementById('downloadBtn');
const backBtn = document.getElementById('backBtn');
const penjelasan = document.getElementById('penjelasan');

let selectedFrame = "default";
let capturedImages = [];

// Akses kamera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => alert("Gagal akses kamera: " + err.message));

// FRAME SELECT
document.querySelectorAll('.frameOption').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedFrame = btn.dataset.frame;
    frameSelection.classList.add('hidden');
    startBtn.classList.remove('hidden');
    backBtn.classList.remove('hidden');
    penjelasan.classList.remove('hidden');
  });
});

// COUNTDOWN
function showCountdown(sec) {
  return new Promise(resolve => {
    countdown.classList.remove('hidden');
    countdown.textContent = sec;
    const interval = setInterval(() => {
      sec--;
      countdown.textContent = sec;
      if (sec <= 0) {
        clearInterval(interval);
        countdown.classList.add('hidden');
        resolve();
      }
    }, 1000);
  });
}

// CAPTURE
function capturePhoto() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg');
}

// START
async function startCapture() {
  capturedImages = [];
  startBtn.classList.add('hidden');
  penjelasan.classList.add('hidden');
  backBtn.classList.add('hidden');
  video.classList.remove('hidden');
  grid.innerHTML = "";
  grid.parentElement.classList.add('hidden');

  for (let i = 0; i < 6; i++) {
    await showCountdown(4);
    const data = capturePhoto();
    capturedImages.push(data);
    await new Promise(res => setTimeout(res, 1000));
  }

  video.classList.add('hidden');
  showResult();
}

// SHOW RESULT
function showResult() {
  grid.innerHTML = "";

  // Set styling berdasarkan frame
  switch (selectedFrame) {
    case 'birthday':
      photoFrame.style.backgroundColor = '#32004b';
      photoFrame.style.border = '10px solid gold';
      break;
    case 'white':
      photoFrame.style.backgroundColor = '#fff';
      photoFrame.style.border = '10px solid #fff';
      break;
    default:
      photoFrame.style.backgroundColor = '#000';
      photoFrame.style.border = '10px solid #000';
  }

  capturedImages.forEach(src => {
    const img = document.createElement('img');
    img.src = src;

    // Style berdasarkan frame
    if (selectedFrame === 'birthday') {
      img.style.border = '4px solid orange';
      img.style.boxShadow = '0 0 10px gold';
    } else if (selectedFrame === 'white') {
      img.style.border = 'none';
      img.style.boxShadow = 'none';
    } else {
      img.style.border = 'none';
      img.style.boxShadow = 'none';
    }

    img.style.width = '100%';
    img.style.maxWidth = '150px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '6px';

    grid.appendChild(img);
  });

  photoFrame.classList.remove('hidden');
  downloadBtn.classList.remove('hidden');
  backBtn.classList.remove('hidden');
  startBtn.classList.add('hidden');
}

// DOWNLOAD
downloadBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const imgW = 150;
  const imgH = 150;
  const paddingX = 16;
  const paddingY = 16;
  const cols = 2;
  const rows = Math.ceil(capturedImages.length / cols);
  const titleHeight = selectedFrame === 'birthday' ? 60 : 0;

  canvas.width = cols * (imgW + paddingX) + paddingX;
  canvas.height = titleHeight + rows * (imgH + paddingY) + paddingY;

  // Set background & border sesuai frame
  if (selectedFrame === 'birthday') {
    ctx.fillStyle = '#32004b';
  } else if (selectedFrame === 'white') {
    ctx.fillStyle = '#fff';
  } else {
    ctx.fillStyle = '#000';
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Tulis "Happy Birthday" kalau frame birthday
  if (selectedFrame === 'birthday') {
    ctx.fillStyle = 'gold';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 Happy Birthday! 🎉', canvas.width / 2, 40);
  }

  // Load & render tiap gambar
  let loaded = 0;

  capturedImages.forEach((src, i) => {
    const img = new Image();
    img.src = src;
    const col = i % cols;
    const row = Math.floor(i / cols);
    img.onload = () => {
      const x = paddingX + col * (imgW + paddingX);
      const y = titleHeight + paddingY + row * (imgH + paddingY);

      ctx.drawImage(img, x, y, imgW, imgH);

      // Tambah border/frame efek
      if (selectedFrame === 'birthday') {
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, imgW, imgH);
      } else if (selectedFrame === 'white') {
        // No border
      } else {
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, imgW, imgH);
      }

      loaded++;
      if (loaded === capturedImages.length) {
        const link = document.createElement('a');
        link.download = `photobox-${selectedFrame}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
  });
});


// BACK
backBtn.addEventListener('click', () => {
  photoFrame.classList.add('hidden');
  downloadBtn.classList.add('hidden');
  backBtn.classList.add('hidden');
  startBtn.classList.add('hidden');
  penjelasan.classList.add('hidden');
  frameSelection.classList.remove('hidden');
});

// MULAI TOMBOL
startBtn.addEventListener('click', startCapture);

