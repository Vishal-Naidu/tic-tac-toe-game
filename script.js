const board = document.getElementById('board');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const gameModeSelect = document.getElementById('gameMode');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreTieEl = document.getElementById('scoreTie');

let scores = {
    PvP: { X: 0, O: 0, Ties: 0 },
    PvAI: { X: 0, O: 0, Ties: 0 }
};

let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let gameMode = gameModeSelect.value;

const clickSound = new Audio("music/click.mp3");
const winSound = new Audio("music/win.mp3");

gameModeSelect.addEventListener('change', () => {
    gameMode = gameModeSelect.value;
    resetGame(true); // Reset everything when changing mode
    updateGameModeText(); // Ensure correct text is displayed
});

function updateScoreboard() {
    scoreXEl.textContent = scores[gameMode].X;
    scoreOEl.textContent = scores[gameMode].O;
    scoreTieEl.textContent = scores[gameMode].Ties;
}

function createBoard() {
    board.innerHTML = '';
    gameBoard.forEach((_, index) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = index;
        cell.addEventListener('click', handleMove);
        board.appendChild(cell);
    });
}

function handleMove(event) {
    const index = event.target.dataset.index;
    if (gameBoard[index] === '' && gameActive) {
        gameBoard[index] = currentPlayer;
        event.target.textContent = currentPlayer;
        event.target.classList.add('taken');
        clickSound.play();
        checkWinner();
        if (gameActive) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateGameModeText();
            if (gameMode === 'PvAI' && currentPlayer === 'O') {
                setTimeout(aiMove, 500);
            }
        }
    }
}

function aiMove() {
    let bestMove = minimax(gameBoard, 'O').index;
    gameBoard[bestMove] = 'O';
    let cell = board.children[bestMove];
    cell.textContent = 'O';
    cell.classList.add('taken');
    clickSound.play();
    checkWinner();
    if (gameActive) {
        currentPlayer = 'X';
        updateGameModeText();
    }
}

function minimax(board, player) {
    let emptyCells = board.map((val, idx) => (val === '' ? idx : null)).filter(idx => idx !== null);
    if (checkWin(board, 'X')) return { score: -10 };
    if (checkWin(board, 'O')) return { score: 10 };
    if (emptyCells.length === 0) return { score: 0 };

    let moves = [];
    for (let i of emptyCells) {
        let newBoard = [...board];
        newBoard[i] = player;
        let score = minimax(newBoard, player === 'O' ? 'X' : 'O').score;
        moves.push({ index: i, score });
    }
    return moves.reduce((best, move) => (player === 'O' ? move.score > best.score : move.score < best.score) ? move : best);
}

function checkWin(board, player) {
    return [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]]
        .some(pattern => pattern.every(i => board[i] === player));
}

function checkWinner() {
    const winningPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (let pattern of winningPatterns) {
        if (pattern.every(index => gameBoard[index] === 'X')) {
            status.innerHTML = `Player <span class="win-text">X</span> Wins!`;
            gameActive = false;
            scores[gameMode].X++;
            pattern.forEach(index => board.children[index].classList.add('winning-cell'));
            winSound.play();
            updateScoreboard();
            return;
        } 
        if (pattern.every(index => gameBoard[index] === 'O')) {
            status.innerHTML = `Player <span class="win-text">O</span> Wins!`;
            gameActive = false;
            scores[gameMode].O++;
            pattern.forEach(index => board.children[index].classList.add('winning-cell'));
            winSound.play();
            updateScoreboard();
            return;
        }
    }

    if (!gameBoard.includes('')) {
        status.innerHTML = `It's a <span class="tie-text">Tie!</span>`;
        scores[gameMode].Ties++;
        gameActive = false;
    }
    updateScoreboard();
}

function resetGame(fullReset = false) {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    createBoard();
    updateGameModeText();
    if (fullReset) {
        scores[gameMode] = { X: 0, O: 0, Ties: 0 };
        updateScoreboard();
    }
}

function updateGameModeText() {
    let modeText = gameMode === 'PvP' ? "(Player vs Player)" : "(Player vs AI)";
    status.innerHTML = `Player <span class="win-text">${currentPlayer}</span>'s Turn ${modeText}`;
}

resetBtn.addEventListener('click', () => resetGame());

createBoard();
updateScoreboard();
