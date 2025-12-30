const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const levelSpan = document.getElementById("level");
const scoreSpan = document.getElementById("score");
const livesSpan = document.getElementById("lives");
const restartBtn = document.getElementById("restart-btn");

const charSelect = document.getElementById("character-select");
const girlButtons = document.querySelectorAll(".girl-btn");
const startBtn = document.getElementById("start-btn");

const messageBox = document.getElementById("message-box");
const msgTitle = document.getElementById("message-title");
const msgText = document.getElementById("message-text");
const nextLevelBtn = document.getElementById("next-level-btn");

let selectedGirl = 1;
let keys = {};
let gameRunning = false;

let level = 1;
let maxLevel = 3;
let score = 0;
let lives = 3;

// പ്ലെയർ – always girl
const player = {
  x: 80,
  y: 0,
  w: 40,
  h: 70,
  vy: 0,
  onGround: false,
  color: "#ff99cc"
};

// പ്ലാറ്റ്ഫോമുകളും ഒബ്സ്റ്റക്കളുകളും, ഓരോ ലെവലിലും different
const levels = [
  [], // dummy index 0
  {
    platforms: [
      { x: 0, y: 430, w: 900, h: 70 },
      { x: 220, y: 340, w: 120, h: 20 },
      { x: 440, y: 280, w: 140, h: 20 },
      { x: 680, y: 330, w: 120, h: 20 }
    ],
    spikes: [
      { x: 330, y: 410, w: 60, h: 20 },
      { x: 600, y: 410, w: 60, h: 20 }
    ],
    stars: [
      { x: 250, y: 300, r: 10, collected: false },
      { x: 470, y: 240, r: 10, collected: false },
      { x: 710, y: 290, r: 10, collected: false }
    ],
    goal: { x: 820, y: 380, w: 40, h: 50 }
  },
  {
    platforms: [
      { x: 0, y: 430, w: 900, h: 70 },
      { x: 160, y: 330, w: 120, h: 20 },
      { x: 340, y: 270, w: 120, h: 20 },
      { x: 520, y: 220, w: 120, h: 20 },
      { x: 700, y: 280, w: 120, h: 20 }
    ],
    spikes: [
      { x: 260, y: 410, w: 70, h: 20 },
      { x: 460, y: 410, w: 70, h: 20 },
      { x: 660, y: 410, w: 70, h: 20 }
    ],
    stars: [
      { x: 190, y: 290, r: 10, collected: false },
      { x: 370, y: 230, r: 10, collected: false },
      { x: 550, y: 180, r: 10, collected: false },
      { x: 730, y: 240, r: 10, collected: false }
    ],
    goal: { x: 830, y: 180, w: 40, h: 50 }
  },
  {
    platforms: [
      { x: 0, y: 430, w: 900, h: 70 },
      { x: 180, y: 360, w: 90, h: 20 },
      { x: 320, y: 310, w: 90, h: 20 },
      { x: 460, y: 260, w: 90, h: 20 },
      { x: 600, y: 310, w: 90, h: 20 },
      { x: 740, y: 360, w: 90, h: 20 }
    ],
    spikes: [
      { x: 260, y: 410, w: 70, h: 20 },
      { x: 380, y: 410, w: 70, h: 20 },
      { x: 500, y: 410, w: 70, h: 20 },
      { x: 620, y: 410, w: 70, h: 20 }
    ],
    stars: [
      { x: 200, y: 320, r: 10, collected: false },
      { x: 340, y: 270, r: 10, collected: false },
      { x: 480, y: 220, r: 10, collected: false },
      { x: 620, y: 270, r: 10, collected: false },
      { x: 760, y: 320, r: 10, collected: false }
    ],
    goal: { x: 830, y: 330, w: 40, h: 50 }
  }
];

// കീബോർഡ് കൺട്രോൾ – left/right + jump (space / up)
window.addEventListener("keydown", e => {
  keys[e.key] = true;
});
window.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// ഗേൾ സെലക്ഷൻ
girlButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    girlButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedGirl = parseInt(btn.dataset.girl, 10);
    // different dress color
    if (selectedGirl === 1) player.color = "#ff99cc";
    if (selectedGirl === 2) player.color = "#ffdd55";
    if (selectedGirl === 3) player.color = "#9b8cff";
  });
});

startBtn.addEventListener("click", () => {
  charSelect.classList.add("hidden");
  resetGame();
  gameRunning = true;
  loop();
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

// ലെവൽ, സ്കോർ reset
function resetGame() {
  level = 1;
  score = 0;
  lives = 3;
  resetPlayer();
  resetStars();
  updateUI();
}

function resetPlayer() {
  player.x = 80;
  player.y = 340;
  player.vy = 0;
  player.onGround = false;
}

function resetStars() {
  levels.forEach((lv, i) => {
    if (!lv || !lv.stars) return;
    lv.stars.forEach(s => (s.collected = false));
  });
}

function updateUI() {
  levelSpan.textContent = level;
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
}

// മെസ്സേജ് show
function showMessage(title, text, cb) {
  msgTitle.textContent = title;
  msgText.textContent = text;
  messageBox.classList.remove("hidden");
  const handler = () => {
    messageBox.classList.add("hidden");
    nextLevelBtn.removeEventListener("click", handler);
    if (cb) cb();
  };
  nextLevelBtn.addEventListener("click", handler);
}

// ഡിഫിക്കൾറ്റി സിമ്പിൾ, 7 വയസ്സ് mind
const GRAVITY = 0.7;
const MOVE_SPEED = 3.0;
const JUMP_FORCE = 13;

// മെയിൻ ഗെയിം loop
function loop() {
  if (!gameRunning) return;

  update();
  draw();

  requestAnimationFrame(loop);
}

function update() {
  const current = levels[level];

  // horizontal move
  if (keys["ArrowLeft"] || keys["a"]) {
    player.x -= MOVE_SPEED;
  }
  if (keys["ArrowRight"] || keys["d"]) {
    player.x += MOVE_SPEED;
  }

  // jump
  if ((keys[" "] || keys["ArrowUp"]) && player.onGround) {
    player.vy = -JUMP_FORCE;
    player.onGround = false;
  }

  // gravity
  player.vy += GRAVITY;
  player.y += player.vy;

  // simple world bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

  // platform collision
  player.onGround = false;
  current.platforms.forEach(p => {
    if (
      player.x < p.x + p.w &&
      player.x + player.w > p.x &&
      player.y + player.h > p.y &&
      player.y + player.h < p.y + p.h &&
      player.vy >= 0
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  });

  // spikes (obstacles)
  current.spikes.forEach(s => {
    if (
      player.x < s.x + s.w &&
      player.x + player.w > s.x &&
      player.y + player.h > s.y
    ) {
      handleHit();
    }
  });

  // stars collect
  current.stars.forEach(s => {
    if (s.collected) return;
    const dx = player.x + player.w / 2 - s.x;
    const dy = player.y + player.h / 2 - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 30) {
      s.collected = true;
      score += 1;
      updateUI();
    }
  });

  // goal – next level
  const g = current.goal;
  if (
    player.x < g.x + g.w &&
    player.x + player.w > g.x &&
    player.y + player.h > g.y &&
    player.y < g.y + g.h
  ) {
    if (level < maxLevel) {
      const next = level + 1;
      gameRunning = false;
      showMessage(
        "Level " + level + " Complete!",
        "നന്നായി! ഇനി അടുത്ത ലെവലിലേക്ക് പോകാം.",
        () => {
          level = next;
          resetPlayer();
          updateUI();
          gameRunning = true;
          loop();
        }
      );
    } else {
      gameRunning = false;
      showMessage(
        "Game Finished!",
        "വളരെ നന്നായി കളിച്ചു! ⭐ Stars: " + score,
        () => {
          resetGame();
          gameRunning = true;
          loop();
        }
      );
    }
  }

  // fell down
  if (player.y > canvas.height + 100) {
    handleHit();
  }
}

function handleHit() {
  lives -= 1;
  updateUI();
  if (lives <= 0) {
    gameRunning = false;
    showMessage(
      "Game Over",
      "ഒന്നുകൂടി ശ്രമിക്കാമോ?",
      () => {
        resetGame();
        gameRunning = true;
        loop();
      }
    );
  } else {
    resetPlayer();
  }
}

// drawing – nature, platforms, girl, obstacles
function draw() {
  // sky gradient already in CSS; here draw extra nature elements
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // far mountains
  ctx.fillStyle = "#9ad0ff";
  ctx.beginPath();
  ctx.moveTo(0, 320);
  ctx.lineTo(150, 220);
  ctx.lineTo(300, 320);
  ctx.lineTo(450, 210);
  ctx.lineTo(600, 320);
  ctx.lineTo(750, 230);
  ctx.lineTo(900, 320);
  ctx.lineTo(900, 500);
  ctx.lineTo(0, 500);
  ctx.closePath();
  ctx.fill();

  // forest ground
  ctx.fillStyle = "#5ba94f";
  ctx.fillRect(0, 380, 900, 120);

  // some simple trees
  for (let i = 50; i < 900; i += 180) {
    drawTree(i, 340);
  }

  const current = levels[level];

  // platforms
  current.platforms.forEach(p => {
    ctx.fillStyle = "#4c8c3f";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#3a6b30";
    ctx.fillRect(p.x, p.y + p.h - 6, p.w, 6);
  });

  // spikes
  current.spikes.forEach(s => {
    drawSpikes(s.x, s.y, s.w, s.h);
  });

  // stars
  current.stars.forEach(s => {
    if (!s.collected) drawStar(s.x, s.y, s.r, "#ffe066");
  });

  // goal – glowing flower gate
  const g = current.goal;
  ctx.fillStyle = "#ffe066";
  ctx.beginPath();
  ctx.ellipse(g.x + g.w / 2, g.y + g.h, 26, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffd43b";
  ctx.lineWidth = 4;
  ctx.stroke();

  // player (girl)
  drawGirl(player.x, player.y, player.w, player.h, player.color);
}

function drawTree(x, groundY) {
  ctx.fillStyle = "#8d5a46";
  ctx.fillRect(x - 6, groundY - 40, 12, 40);
  ctx.fillStyle = "#3c8f3b";
  ctx.beginPath();
  ctx.arc(x, groundY - 50, 22, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpikes(x, y, w, h) {
  const count = Math.floor(w / 12);
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < count; i++) {
    const sx = x + i * 12;
    ctx.beginPath();
    ctx.moveTo(sx, y + h);
    ctx.lineTo(sx + 6, y);
    ctx.lineTo(sx + 12, y + h);
    ctx.closePath();
    ctx.fill();
  }
}

function drawStar(cx, cy, r, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.beginPath();
  const spikes = 5;
  let rot = Math.PI / 2 * 3;
  let x = 0;
  let y = 0;
  const step = Math.PI / spikes;

  for (let i = 0; i < spikes; i++) {
    x = Math.cos(rot) * r;
    y = Math.sin(rot) * r;
    ctx.lineTo(x, y);
    rot += step;

    x = Math.cos(rot) * (r / 2);
    y = Math.sin(rot) * (r / 2);
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGirl(x, y, w, h, color) {
  // body
  ctx.fillStyle = color;
  ctx.fillRect(x, y + h * 0.3, w, h * 0.7);

  // head
  ctx.fillStyle = "#ffd8a8";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.2, w * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // hair
  ctx.fillStyle = "#5f3dc4";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.2, w * 0.38, Math.PI * 0.1, Math.PI * 0.9);
  ctx.fill();

  // simple feet
  ctx.fillStyle = "#343a40";
  ctx.fillRect(x + 4, y + h - 6, w / 2 - 4, 6);
  ctx.fillRect(x + w / 2, y + h - 6, w / 2 - 4, 6);
}
