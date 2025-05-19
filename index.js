const net = require('net');

const HOST = 'jason-calc.local';
const PORT = 1234;

const WIDTH = 64;
const HEIGHT = 64;

// 5x7 font digits 0-9 (1=on,0=off)
const DIGITS_FONT = {
  '0': [
    "01110",
    "10001",
    "10011",
    "10101",
    "11001",
    "10001",
    "01110",
  ],
  '1': [
    "00100",
    "01100",
    "00100",
    "00100",
    "00100",
    "00100",
    "01110",
  ],
  '2': [
    "01110",
    "10001",
    "00001",
    "00010",
    "00100",
    "01000",
    "11111",
  ],
  '3': [
    "11110",
    "00001",
    "00001",
    "01110",
    "00001",
    "00001",
    "11110",
  ],
  '4': [
    "00010",
    "00110",
    "01010",
    "10010",
    "11111",
    "00010",
    "00010",
  ],
  '5': [
    "11111",
    "10000",
    "11110",
    "00001",
    "00001",
    "10001",
    "01110",
  ],
  '6': [
    "00110",
    "01000",
    "10000",
    "11110",
    "10001",
    "10001",
    "01110",
  ],
  '7': [
    "11111",
    "00001",
    "00010",
    "00100",
    "01000",
    "01000",
    "01000",
  ],
  '8': [
    "01110",
    "10001",
    "10001",
    "01110",
    "10001",
    "10001",
    "01110",
  ],
  '9': [
    "01110",
    "10001",
    "10001",
    "01111",
    "00001",
    "00010",
    "01100",
  ],
};

// Create empty 64x64 frame
function createEmptyFrame() {
  return Array.from({ length: HEIGHT }, () => Array(WIDTH).fill('0'));
}

// Draw a single digit (5x7) at offset (x,y)
function drawDigit(frame, digit, offsetX, offsetY) {
  const pattern = DIGITS_FONT[digit];
  if (!pattern) return;
  for (let y = 0; y < pattern.length; y++) {
    for (let x = 0; x < pattern[y].length; x++) {
      if (pattern[y][x] === '1') {
        const px = offsetX + x;
        const py = offsetY + y;
        if (px < WIDTH && py < HEIGHT) {
          frame[py][px] = '1';
        }
      }
    }
  }
}

// Draw a number (1 or 2 digits) centered horizontally and vertically
function drawNumber(frame, number) {
  const str = number.toString();
  const digitWidth = 5;
  const digitHeight = 7;
  const spacing = 1; // space between digits
  const totalWidth = str.length * digitWidth + (str.length - 1) * spacing;
  const offsetX = Math.floor((WIDTH - totalWidth) / 2);
  const offsetY = Math.floor((HEIGHT - digitHeight) / 2);

  for (let i = 0; i < str.length; i++) {
    drawDigit(frame, str[i], offsetX + i * (digitWidth + spacing), offsetY);
  }
}

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log(`✅ Connected to ${HOST}:${PORT}`);

  let count = 1;
  const maxCount = 10;

  const interval = setInterval(() => {
    if (count > maxCount) {
      console.log('✅ Sent all numbers 1 to 10, closing connection.');
      clearInterval(interval);
      client.end();
      return;
    }

    const frame = createEmptyFrame();
    drawNumber(frame, count);

    const dataToSend = frame.flat().join('');
    client.write(dataToSend, (err) => {
      if (err) {
        console.error('❌ Error sending data:', err.message);
        clearInterval(interval);
        client.destroy();
      } else {
        console.log(`📤 Sent number ${count}`);
      }
    });

    count++;
  }, 500);
});

client.on('data', (data) => {
  console.log('📥 Received:', data.toString());
});

client.on('close', () => {
  console.log('❌ Connection closed');
});

client.on('error', (err) => {
  console.error('❌ Error:', err.message);
});
