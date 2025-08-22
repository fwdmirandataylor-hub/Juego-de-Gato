const board = document.getElementById('board');
const cells = Array.from(document.getElementsByClassName('cell'));
const message = document.getElementById('message');
const restartBtn = document.getElementById('restart');
let score = +localStorage.getItem('gatoScore') || 0; // Recupera el puntaje actual
let highScore = +localStorage.getItem('gatoHighScore') || 0;
let boardState = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];
const resetScoresBtn = document.getElementById('reset-scores'); // Unifica el nombre

function updateScore() {
  const s = document.getElementById('score');
  if (s) s.textContent = `Puntos: ${score} | Récord: ${highScore}`;
  localStorage.setItem('gatoScore', score);
}

function resetScores() {
  score = 0;
  highScore = 0;
  localStorage.setItem('gatoHighScore', 0);
  localStorage.setItem('gatoScore', 0);
  updateScore();
}

if (resetScoresBtn) {
  resetScoresBtn.addEventListener('click', resetScores);
}

function renderBoard() {
  cells.forEach((cell, i) => {
    cell.innerHTML = '';
    ['left','right'].forEach(side => {
      let div = cell.querySelector('.side.'+side) || document.createElement('div');
      div.className = 'side ' + side;
      cell.appendChild(div);
    });
    if (boardState[i]) {
      const span = document.createElement('span');
      span.textContent = boardState[i];
      cell.appendChild(span);
    }
    cell.setAttribute('aria-label', boardState[i] || `Celda ${i+1}`);
  });
}

function checkWinner(p) {
  return winCombos.some(c => c.every(i => boardState[i] === p));
}
function checkDraw() {
  return boardState.every(cell => cell);
}

function handleCellClick(e) {
  const idx = +e.currentTarget.dataset.index; // Cambiado para que siempre sea la celda
  if (!gameActive || boardState[idx]) return;
  boardState[idx] = currentPlayer;
  renderBoard();
  if (checkWinner(currentPlayer)) {
    message.textContent = `¡${currentPlayer} gana!`;
    gameActive = false;
    if (currentPlayer === 'X') {
      score += 100;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('gatoHighScore', highScore);
      }
      updateScore();
    }
    return;
  }
  if (checkDraw()) {
    message.textContent = '¡Empate!';
    gameActive = false;
    return;
  }
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  if (currentPlayer === 'O') {
    message.textContent = 'Turno de la CPU';
    setTimeout(cpuMove, 400);
  } else {
    message.textContent = 'Tu turno';
  }
}

function cpuMove() {
  if (boardState.every(cell => cell)) return;
  let bestScore = -Infinity, moves = [];
  for (let i = 0; i < 9; i++) {
    if (!boardState[i]) {
      boardState[i] = 'O';
      let score = minimax(boardState, 0, false);
      boardState[i] = '';
      if (score > bestScore) {
        bestScore = score;
        moves = [i];
      } else if (score === bestScore) {
        moves.push(i);
      }
    }
  }
  
  const move = moves[Math.floor(Math.random() * moves.length)];
  boardState[move] = 'O';
  renderBoard();
  if (checkWinner('O')) {
    message.textContent = '¡CPU gana!';
    gameActive = false;
    return;
  }
  if (checkDraw()) {
    message.textContent = '¡Empate!';
    gameActive = false;
    return;
  }
  currentPlayer = 'X';
  message.textContent = 'Tu turno';
}

function minimax(state, depth, isMax) {
  if (checkWinner('O')) return 10 - depth;
  if (checkWinner('X')) return depth - 10;
  if (state.every(cell => cell)) return 0;
  let best = isMax ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (!state[i]) {
      state[i] = isMax ? 'O' : 'X';
      let score = minimax(state, depth + 1, !isMax);
      state[i] = '';
      best = isMax ? Math.max(score, best) : Math.min(score, best);
    }
  }
  return best;
}

function restartGame() {
  boardState = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  message.textContent = 'Tu turno';
  renderBoard();
  updateScore();
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
cells.forEach(cell => cell.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && gameActive) cell.click();
}));

renderBoard();
message.textContent = 'Tu turno';