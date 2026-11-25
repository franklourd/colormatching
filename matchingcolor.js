const board = document.getElementById('gameBoard');
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');
const bestEl = document.getElementById('best');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const progressBar = document.getElementById('progressBar');
const winModal = document.getElementById('winModal');
const winSummary = document.getElementById('winSummary');

let firstTile = null;
let secondTile = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let elapsedSeconds = 0;
let timerId = null;
let gameStarted = false;

const palette = [
  '#7667E8', '#F2768B', '#43BDA9', '#F2A65A',
  '#4A90E2', '#A56CC1', '#E9CB57', '#58B96B'
];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function getBest() {
  const value = Number(localStorage.getItem('colorMatchBestMoves'));
  return value > 0 ? value : null;
}

function updateBestDisplay() {
  const best = getBest();
  bestEl.textContent = best ? String(best) : '--';
}

function updateProgress() {
  const percent = Math.round((matchedPairs / palette.length) * 100);
  progressText.textContent = `${matchedPairs} of ${palette.length} pairs`;
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
}

function startTimer() {
  if (gameStarted) return;
  gameStarted = true;
  timerId = setInterval(() => {
    elapsedSeconds++;
    timerEl.textContent = formatTime(elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function startGame() {
  stopTimer();
  firstTile = null;
  secondTile = null;
  lockBoard = false;
  moves = 0;
  matchedPairs = 0;
  elapsedSeconds = 0;
  gameStarted = false;

  movesEl.textContent = '0';
  timerEl.textContent = '0:00';
  winModal.hidden = true;
  updateProgress();
  updateBestDisplay();

  const colors = shuffle([...palette, ...palette]);
  board.innerHTML = '';

  colors.forEach((color, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';
    tile.dataset.color = color;
    tile.setAttribute('aria-label', `Hidden card ${index + 1}`);

    const back = document.createElement('span');
    back.className = 'tile-face tile-back';
    back.setAttribute('aria-hidden', 'true');

    const front = document.createElement('span');
    front.className = 'tile-face tile-front';
    front.style.background = color;
    front.setAttribute('aria-hidden', 'true');

    tile.append(back, front);
    tile.addEventListener('click', () => handleTileClick(tile));
    board.appendChild(tile);
  });
}

function handleTileClick(tile) {
  if (lockBoard || tile === firstTile || tile.classList.contains('matched')) return;

  startTimer();
  tile.classList.add('flipped');
  tile.setAttribute('aria-label', 'Revealed card');

  if (!firstTile) {
    firstTile = tile;
    return;
  }

  secondTile = tile;
  moves++;
  movesEl.textContent = String(moves);
  lockBoard = true;

  if (firstTile.dataset.color === secondTile.dataset.color) {
    window.setTimeout(() => {
      firstTile.classList.remove('flipped');
      secondTile.classList.remove('flipped');
      firstTile.classList.add('matched');
      secondTile.classList.add('matched');
      firstTile.setAttribute('aria-label', 'Matched card');
      secondTile.setAttribute('aria-label', 'Matched card');
      matchedPairs++;
      updateProgress();
      resetSelection();

      if (matchedPairs === palette.length) finishGame();
    }, 350);
  } else {
    window.setTimeout(() => {
      firstTile.classList.remove('flipped');
      secondTile.classList.remove('flipped');
      firstTile.setAttribute('aria-label', 'Hidden card');
      secondTile.setAttribute('aria-label', 'Hidden card');
      resetSelection();
    }, 780);
  }
}

function resetSelection() {
  firstTile = null;
  secondTile = null;
  lockBoard = false;
}

function finishGame() {
  stopTimer();
  const previousBest = getBest();
  if (!previousBest || moves < previousBest) {
    localStorage.setItem('colorMatchBestMoves', String(moves));
  }
  updateBestDisplay();
  winSummary.textContent = `Completed in ${moves} moves and ${formatTime(elapsedSeconds)}.`;
  window.setTimeout(() => {
    winModal.hidden = false;
    document.getElementById('playAgainBtn').focus();
  }, 450);
}

document.getElementById('newGameBtn').addEventListener('click', startGame);
document.getElementById('bottomNewGameBtn').addEventListener('click', startGame);
document.getElementById('playAgainBtn').addEventListener('click', startGame);

startGame();
