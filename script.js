const video = document.getElementById('camera');
// Akses kamera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    video.style.transform = 'none'; // <--- TAMBAHIN INI BIAR TIDAK MIRROR
  })
  .catch(err => alert("Gagal akses kamera: " + err.message));

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

  // Flip horizontal biar ga mirror
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
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

  // Ukuran gambar lebih kecil biar frame kelihatan
  const imgW = 240;
  const imgH = 320;
  const paddingX = 50;
  const paddingY = 50;
  const textSpace = selectedFrame === 'birthday' ? 100 : 60;

  const cols = 2;
  const rows = Math.ceil(capturedImages.length / cols);

  canvas.width = (imgW + paddingX) * cols + paddingX;
  canvas.height = textSpace + (imgH + paddingY) * rows + paddingY;

  // Background/frame warna
  if (selectedFrame === 'birthday') {
    ctx.fillStyle = '#32004b';
  } else if (selectedFrame === 'white') {
    ctx.fillStyle = '#ffffff';
  } else {
    ctx.fillStyle = '#000000'; // frame default
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Teks Happy Birthday
  if (selectedFrame === 'birthday') {
    ctx.fillStyle = 'gold';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 Happy Birthday! 🎉', canvas.width / 2, 60);
  }

  let loaded = 0;

  capturedImages.forEach((src, i) => {
    const img = new Image();
    img.src = src;
    const col = i % cols;
    const row = Math.floor(i / cols);

    img.onload = () => {
      const x = paddingX + col * (imgW + paddingX);
      const y = textSpace + paddingY + row * (imgH + paddingY);

      // Gambar foto
      ctx.drawImage(img, x, y, imgW, imgH);

      // Kalau frame putih, kasih border putih
      if (selectedFrame === 'white') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
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

// MULAI TOMBOL
startBtn.addEventListener('click', startCapture);






