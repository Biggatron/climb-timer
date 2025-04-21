// Web Audio API to play beeps
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let shortBeepBuffer = null;
let longBeepBuffer = null;

// Preload and decode once
fetch("/media/shortBeep.mp3")
  .then((response) => response.arrayBuffer())
  .then((data) => audioCtx.decodeAudioData(data))
  .then((decoded) => {
    shortBeepBuffer = decoded;
  });
fetch("/media/longBeep.mp3")
  .then((response) => response.arrayBuffer())
  .then((data) => audioCtx.decodeAudioData(data))
  .then((decoded) => {
    longBeepBuffer = decoded;
  });

function warmUpBeep() {
  console.log("Silent warmup beep");

  const duration = 0.05; // 50 ms
  const sampleRate = audioCtx.sampleRate;
  const length = duration * sampleRate;
  const frequency = 880; // A5, adjust if you want

  const buffer = audioCtx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const time = i / sampleRate;
    data[i] = Math.sin(2 * Math.PI * frequency * time) * 0.01; // Very quiet
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const gain = audioCtx.createGain();

  // Optional: fade in and out to avoid click
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.005);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);

  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

function playShortBeep() {
  if (shortBeepBuffer) {
    const source = audioCtx.createBufferSource();
    source.buffer = shortBeepBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  }
}

function playLongBeep() {
  if (longBeepBuffer) {
    const source = audioCtx.createBufferSource();
    source.buffer = longBeepBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  }
}
