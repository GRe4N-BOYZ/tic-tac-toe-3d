const board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];

let currentPlayer = 'O';
let gameOver = false;

const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");

function renderBoard() {
    boardDiv.innerHTML = '';

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.textContent = board[y][x];

            cell.addEventListener("click", () => handleClick(x, y));
            boardDiv.appendChild(cell);
        }
    }
}

function handleClick(x, y) {
    if (board[y][x] !== "" || gameOver) return;
    board[y][x] = currentPlayer;
    const winner = checkWinner();
    if (winner) {
        statusText.textContent = winner + " wins!";
        gameOver = true;
    }
    else if (isDraw()) {
        statusText.textContent = "It's a draw!";
        gameOver = true;
    }
    else {
        currentPlayer = currentPlayer === 'O' ? 'X' : 'O';
        statusText.textContent = currentPlayer + "'s turn";
    }
    renderBoard();
}

function checkWinner() {
    const lines = [
        // 横
        [[0,0],[1,0],[2,0]],
        [[0,1],[1,1],[2,1]],
        [[0,2],[1,2],[2,2]],
        // 縦
        [[0,0],[0,1],[0,2]],
        [[1,0],[1,1],[1,2]],
        [[2,0],[2,1],[2,2]],
        // 斜め
        [[0,0],[1,1],[2,2]],
        [[2,0],[1,1],[0,2]],
    ];
        
    for (let line of lines) {
        const [a, b, c] = line;
        if (
            board[a[1]][a[0]] &&
            board[a[1]][a[0]] === board[b[1]][b[0]] &&
            board[a[1]][a[0]] === board[c[1]][c[0]]
        ) {
            return board[a[1]][a[0]];
        }
    }
    return null;
}

function isDraw() {
    return board.flat().every(cell => cell !== "");
}

// 初期化
statusText.textContent = currentPlayer + "'s turn";
renderBoard();