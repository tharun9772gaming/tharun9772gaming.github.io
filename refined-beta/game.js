let currentGame = null;
let ctx = document.getElementById("gameCanvas").getContext("2d");
let interval;
let keys = {};
const sounds = {
  click: new Audio("https://freesound.org/data/previews/256/256113_3263906-lq.mp3"),
  jump: new Audio("https://freesound.org/data/previews/331/331912_3248244-lq.mp3"),
  coin: new Audio("https://freesound.org/data/previews/269/269973_5121236-lq.mp3"),
  hit: new Audio("https://freesound.org/data/previews/82/82330_1022655-lq.mp3"),
  dice: new Audio("https://freesound.org/data/previews/216/216090_3938518-lq.mp3")
};

function startGame(name) {
  document.getElementById("menu").style.display = "none";
  document.getElementById("gameContainer").style.display = "flex";
  currentGame = name; keys = {};
  initGame(name);
}

function backToMenu() {
  document.getElementById("menu").style.display = "grid";
  document.getElementById("gameContainer").style.display = "none";
  ctx.clearRect(0, 0, 600, 400);
  document.getElementById("gameUI").innerHTML = "";
  clearInterval(interval);
  currentGame = null;
}

function restartGame() { if (currentGame) initGame(currentGame); }

document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function initGame(name) {
  ctx.clearRect(0, 0, 600, 400);
  document.getElementById("gameUI").innerHTML = "";
  clearInterval(interval);
  switch (name) {
    case 'clicker': runClicker(); break;
    case 'maze': runMaze(); break;
    case 'tictactoe': runTicTacToe(); break;
    case 'snake': runSnake(); break;
    case 'pong': runPong(); break;
    case 'brick': runBrick(); break;
    case 'alien': runAlien(); break;
    case 'memory': runMemory(); break;
    case 'coin': runCoin(); break;
    case 'runner': runRunner(); break;
    case 'roller': runRoller(); break;
  }
}

function runClicker() {
  let score = 0, auto = 0;
  const ui = document.getElementById("gameUI");
  ui.innerHTML = `<p class='text-xl mb-4'>Score: <span id='score'>0</span></p>
  <div class="flex justify-center gap-4">
    <button id='clickBtn' class='menu-btn bg-green-500 hover:bg-green-600 p-6 text-3xl'>🍏 Click!</button>
    <button id='autoBtn' class='menu-btn bg-blue-500 hover:bg-blue-600 p-6 text-2xl'>Auto +1/sec</button>
  </div>`;
  document.getElementById('clickBtn').onclick = () => {
    score++;
    const scoreEl = document.getElementById('score');
    scoreEl.innerText = score;
    scoreEl.style.transform = 'scale(1.5)';
    setTimeout(() => scoreEl.style.transform = 'scale(1)', 150);
    sounds.click.play();
  };
  document.getElementById('autoBtn').onclick = () => { auto = 1; sounds.coin.play(); };
  interval = setInterval(() => {
    if (auto > 0) {
      score += auto;
      document.getElementById('score').innerText = score;
    }
  }, 1000);
}

function runMaze() {
  let size = 20, x = 0, y = 0, goalX = 580, goalY = 380, timer = 0;
  function draw() {
    ctx.clearRect(0, 0, 600, 400);
    ctx.fillStyle = 'lime'; ctx.fillRect(x, y, size, size);
    ctx.fillStyle = 'red'; ctx.fillRect(goalX, goalY, size, size);
    ctx.fillStyle = 'white'; ctx.font = '16px Inter'; ctx.fillText('Time: ' + timer.toFixed(1) + 's', 10, 20);
  }
  function moveMaze() {
    if (keys['ArrowUp'] && y > 0) y -= size;
    if (keys['ArrowDown'] && y < 380) y += size;
    if (keys['ArrowLeft'] && x > 0) x -= size;
    if (keys['ArrowRight'] && x < 580) x += size;
    timer += 0.1;
    draw();
    if (x === goalX && y === goalY) { alert('You Win! Time: ' + timer.toFixed(1) + 's'); sounds.coin.play(); clearInterval(interval); }
  }
  draw();
  interval = setInterval(moveMaze, 100);
}

function runTicTacToe() {
  const ui = document.getElementById('gameUI');
  ui.innerHTML = '<div id="board" class="grid grid-cols-3 gap-2 mx-auto w-60"></div><p id="status" class="mt-4"></p>';
  const board = document.getElementById('board');
  let cells = Array(9).fill(null), turn = 'X';
  function checkWin() { const combos = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]; return combos.some(c => cells[c[0]] && cells[c[0]] === cells[c[1]] && cells[c[1]] === cells[c[2]]); }
  for (let i = 0; i < 9; i++) {
    let btn = document.createElement('button');
    btn.className = 'menu-btn bg-gray-700 hover:bg-gray-600 h-20 text-3xl';
    btn.onclick = () => {
      if (!cells[i]) {
        cells[i] = turn; btn.innerText = turn; sounds.click.play();
        if (checkWin()) {
          document.getElementById('status').innerText = turn + ' Wins!';
          board.querySelectorAll('button').forEach(b => b.disabled = true); sounds.coin.play(); return;
        }
        turn = (turn === 'X') ? 'O' : 'X';
        document.getElementById('status').innerText = 'Turn: ' + turn;
      }
    };
    board.appendChild(btn);
  }
  document.getElementById('status').innerText = 'Turn: X';
}

function runSnake() {
  let size = 20, snake = [{ x: 200, y: 200 }], dx = 20, dy = 0, food = { x: 300, y: 200 }, score = 0, highScore = 0;
  function draw() {
    ctx.clearRect(0, 0, 600, 400);
    ctx.strokeStyle = 'white'; ctx.strokeRect(0, 0, 600, 400);
    ctx.fillStyle = 'lime'; snake.forEach(s => ctx.fillRect(s.x, s.y, size, size));
    ctx.fillStyle = 'red'; ctx.fillRect(food.x, food.y, size, size);
    ctx.fillStyle = 'white'; ctx.font = '20px Inter'; ctx.fillText('Score: ' + score + ' | High: ' + highScore, 10, 20);
    let head = { x: snake[0].x + dx, y: snake[0].y + dy };
    if (head.x === food.x && head.y === food.y) { snake.unshift(head); score++; if (score > highScore) highScore = score; placeFood(); sounds.coin.play(); return; }
    snake.pop();
    if (head.x < 0 || head.y < 0 || head.x >= 600 || head.y >= 400 || snake.some(s => s.x === head.x && s.y === head.y)) { alert('Game Over!'); clearInterval(interval); return; }
    snake.unshift(head);
  }
  function placeFood() { food = { x: Math.floor(Math.random() * 30) * 20, y: Math.floor(Math.random() * 20) * 20 }; }
  interval = setInterval(draw, 100);
  setInterval(() => {
    if (keys['ArrowUp'] && dy === 0) { dx = 0; dy = -20; sounds.jump.play(); }
    if (keys['ArrowDown'] && dy === 0) { dx = 0; dy = 20; sounds.jump.play(); }
    if (keys['ArrowLeft'] && dx === 0) { dx = -20; dy = 0; sounds.jump.play(); }
    if (keys['ArrowRight'] && dx === 0) { dx = 20; dy = 0; sounds.jump.play(); }
  }, 50);
}

function runPong() {
  let paddleHeight = 80, paddleWidth = 10, ballSize = 10;
  let player = { x: 10, y: 160, score: 0 };
  let ai = { x: 580 - 10, y: 160, score: 0 };
  let ball = { x: 300, y: 200, dx: 4, dy: 4 };
  ctx.font = '20px Inter';
  function draw() {
    ctx.clearRect(0, 0, 600, 400);
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, paddleWidth, paddleHeight);
    ctx.fillRect(ai.x, ai.y, paddleWidth, paddleHeight);
    ctx.fillRect(ball.x, ball.y, ballSize, ballSize);
    ctx.fillText(`${player.score} - ${ai.score}`, 260, 20);
  }
  function update() {
    if (keys['w'] && player.y > 0) player.y -= 6;
    if (keys['s'] && player.y < 320) player.y += 6;
    ai.y += ((ball.y - ai.y - 40) / 20);
    ball.x += ball.dx; ball.y += ball.dy;
    if (ball.y < 0 || ball.y > 390) ball.dy *= -1;
    if (ball.x < player.x + paddleWidth && ball.y > player.y && ball.y < player.y + paddleHeight) ball.dx *= -1;
    if (ball.x > ai.x - paddleWidth && ball.y > ai.y && ball.y < ai.y + paddleHeight) ball.dx *= -1;
    if (ball.x < 0) { ai.score++; resetBall(); }
    if (ball.x > 590) { player.score++; resetBall(); }
  }
  function resetBall() { ball.x = 300; ball.y = 200; ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1); ball.dy = 4 * (Math.random() > 0.5 ? 1 : -1); }
  interval = setInterval(() => { update(); draw(); }, 20);
}

function runBrick() {
  let paddle = { x: 250, y: 380, width: 100, height: 10 }, ball = { x: 300, y: 300, dx: 4, dy: -4, r: 10 }, bricks = [];
  let rows = 4, cols = 7, score = 0, lives = 3;
  for (let r = 0; r < rows; r++) { bricks[r] = []; for (let c = 0; c < cols; c++) { bricks[r][c] = { x: c * 85 + 10, y: r * 25 + 30, hit: true }; } }
  function draw() {
    ctx.clearRect(0, 0, 600, 400);
    ctx.fillStyle = 'white'; ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = 'red'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
    for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { if (bricks[r][c].hit) { ctx.fillStyle = 'blue'; ctx.fillRect(bricks[r][c].x, bricks[r][c].y, 75, 20); } } }
    ctx.fillStyle = 'white'; ctx.font = '20px Inter'; ctx.fillText('Score: ' + score + ' | Lives: ' + lives, 10, 20);
  }
  function update() {
    if (keys['ArrowLeft'] && paddle.x > 0) paddle.x -= 6;
    if (keys['ArrowRight'] && paddle.x < 500) paddle.x += 6;
    ball.x += ball.dx; ball.y += ball.dy;
    if (ball.x < 0 || ball.x > 600) ball.dx *= -1;
    if (ball.y < 0) ball.dy *= -1;
    if (ball.y > 390) { lives--; if (lives <= 0) { alert('Game Over'); clearInterval(interval); return; } resetBall(); }
    if (ball.y + ball.r > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) ball.dy *= -1;
    for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { let b = bricks[r][c]; if (b.hit && ball.x > b.x && ball.x < b.x + 75 && ball.y > b.y && ball.y < b.y + 20) { ball.dy *= -1; b.hit = false; score++; sounds.coin.play(); } } }
    draw();
  }
  function resetBall() { ball.x = 300; ball.y = 300; ball.dx = 4; ball.dy = -4; }
  interval = setInterval(update, 20);
}

function runAlien() {
  let player = { x: 280, y: 350, width: 40, height: 20 }, bullets = [], aliens = [];
  for (let i = 0; i < 5; i++) { for (let j = 0; j < 6; j++) { aliens.push({ x: 50 + i * 100, y: 50 + j * 40, width: 40, height: 20, alive: true }); } }
  function draw() {
    ctx.clearRect(0, 0, 600, 400);
    ctx.fillStyle = 'green'; ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = 'red'; bullets.forEach(b => ctx.fillRect(b.x, b.y, 5, 10));
    aliens.forEach(a => { if (a.alive) ctx.fillRect(a.x, a.y, a.width, a.height); });
  }
  function update() {
    if (keys['ArrowLeft'] && player.x > 0) player.x -= 5;
    if (keys['ArrowRight'] && player.x < 560) player.x += 5;
    bullets.forEach((b, i) => {
      b.y -= 8;
      if (b.y < 0) bullets.splice(i, 1);
      aliens.forEach(a => { if (a.alive && b.x > a.x && b.x < a.x + a.width && b.y > a.y && b.y < a.y + a.height) { a.alive = false; bullets.splice(i, 1); sounds.hit.play(); } });
    });
    draw();
    if (aliens.every(a => !a.alive)) { alert('You Win!'); clearInterval(interval); }
  }
  document.addEventListener('keydown', e => { if (e.key === ' ') bullets.push({ x: player.x + 18, y: player.y - 10 }); });
  interval = setInterval(update, 30);
}

function runMemory() {
  const ui = document.getElementById('gameUI');
  ui.innerHTML = '<div id="memboard" class="grid grid-cols-4 gap-2 mx-auto w-64"></div><p id="status" class="mt-4"></p>';
  let cards = ['🍎', '🍌', '🍇', '🍒', '🍎', '🍌', '🍇', '🍒'], first = null, second = null, score = 0;
  cards.sort(() => Math.random() - 0.5);
  const board = document.getElementById('memboard');
  cards.forEach((c, i) => {
    let btn = document.createElement('button'); btn.className = 'menu-btn h-16 text-2xl'; btn.innerText = '❓';
    btn.onclick = () => {
      if (!first) { first = { btn, value: c }; btn.innerText = c; return; }
      if (!second) { second = { btn, value: c }; btn.innerText = c;
        if (first.value === second.value) { score++; first = null; second = null; sounds.coin.play(); }
        else setTimeout(() => { first.btn.innerText = '❓'; second.btn.innerText = '❓'; first = null; second = null; }, 500);
      }
      document.getElementById('status').innerText = 'Score: ' + score;
    };
    board.appendChild(btn);
  });
}

function runCoin() {
  const ui = document.getElementById('gameUI');
  ui.innerHTML = '<button id="flipBtn" class="menu-btn bg-yellow-500 hover:bg-yellow-600 p-6 text-2xl rounded-xl">Flip Coin</button><p id="result" class="mt-4 text-xl"></p>';
  document.getElementById('flipBtn').onclick = () => {
    let res = Math.random() < 0.5 ? 'Heads' : 'Tails';
    document.getElementById('result').innerText = res;
    sounds.dice.play();
  };
}

function runRunner() {
  let player = { x: 50, y: 300, width: 30, height: 30, vy: 0 }, gravity = 0.8, obstacles = [], score = 0;
  function spawn() { obstacles.push({ x: 600, y: 320, width: 20, height: Math.random() * 50 + 20 }); }
  function draw() {
    ctx.clearRect(0, 0, 600, 400);
    ctx.fillStyle = 'lime'; ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = 'red'; obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));
    ctx.fillStyle = 'white'; ctx.font = '20px Inter'; ctx.fillText('Score: ' + score, 10, 20);
  }
  function update() {
    player.vy += gravity; player.y += player.vy;
    if (player.y > 370) { player.y = 370; player.vy = 0; }
    obstacles.forEach((o, i) => {
      o.x -= 5; if (o.x + o.width < 0) { obstacles.splice(i, 1); score++; sounds.coin.play(); }
      if (player.x < o.x + o.width && player.x + player.width > o.x && player.y < o.y + o.height && player.y + player.height > o.y) { alert('Game Over!'); clearInterval(interval); }
    });
    if (Math.random() < 0.02) spawn();
    draw();
  }
  document.addEventListener('keydown', e => { if (e.key === ' ' && player.y >= 370) { player.vy = -12; sounds.jump.play(); } });
  interval = setInterval(update, 20);
}

function runRoller() {
  const ui = document.getElementById('gameUI');
  ui.innerHTML = '<button id="rollBtn" class="menu-btn bg-gray-600 hover:bg-gray-700 p-6 text-2xl rounded-xl">Roll Dice</button><p id="rollResult" class="mt-4 text-xl"></p>';
  document.getElementById('rollBtn').onclick = () => {
    let value = Math.floor(Math.random() * 6) + 1;
    document.getElementById('rollResult').innerText = 'You rolled: ' + value;
    sounds.dice.play();
  };
}
