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

function handleClick(x, y, group) {
    if (board[y][x] !== "" || gameOver) return;
    board[y][x] = currentPlayer;

    let piece;
    if (currentPlayer === 'O') {
        piece = createO();
    } else {
        piece = createX();
    }

    group.add(piece);

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
   
    const group = new THREE.Group();
    group.position.x = x - 1;
    group.position.y = 1 - y;

    group.userData = { x: x, y: y};

    const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const material = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.3 // クリック可能なセルを半透明にする
    });

    const cube = new THREE.Mesh(geometry, material);
    group.add(cube);

    scene.add(group);
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
    console.log(intersects);

    if (intersects.length > 0) {
        let obj = intersects[0].object;

        //親をたどってgroupを見つける
        while (obj.parent && obj.userData.x === undefined) {
            obj = obj.parent;
        }
        const group = obj;

        const { x, y } = group.userData;

        //ここで既存のクリック処理を呼び出す
        handleClick(x, y, group);
    }
});

//描画
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

function createO() {
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    return new THREE.Mesh(geometry, material);  
}

function createX() {
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.1), material);
    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.1), material);

    bar1.rotation.z = Math.PI / 4;
    bar2.rotation.z = -Math.PI / 4;

    const group = new THREE.Group();
    group.add(bar1);
    group.add(bar2);

    return group;
}