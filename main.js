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
    //renderBoard();
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
//renderBoard(); コメントアウト

// ===== ここからThree.jsの追加 =====

//シーン
const scene = new THREE.Scene();

//カメラ
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, 1000
);

//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//キューブ生成
function createCell3D(x, y) {
    const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa});
    const cube = new THREE.Mesh(geometry, material);

    cube.position.x = x - 1; // -1, 0, 1の位置に配置
    cube.position.y = 1 - y; // 1, 0, -1の位置に配置
    
    // 👇これ超重要
    cube.userData = { x: x, y: y, cube: cube };

    scene.add(cube);
}

//配置
for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
        createCell3D(x, y);
    }
}

renderer.domElement.addEventListener("pointerdown", (event) => {

const rect = renderer.domElement.getBoundingClientRect();

mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const cube = intersects[0].object;

        cube.material.color.set(0xff0000); //クリックしたキューブを赤くする

        const { x, y } = cube.userData;

        //ここで既存のクリック処理を呼び出す
        handleClick(x, y);
    }
});

//描画
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();