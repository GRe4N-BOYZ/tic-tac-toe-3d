const board = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () =>
        Array(3).fill("")
    )
);

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

function handleClick(x, y, z, group) {
    if (board[z][y][x] !== "" || gameOver) return;
    
    board[z][y][x] = currentPlayer;

    const piece = currentPlayer === 'O' ? createO() : createX();
    
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
    const lines = [];

    // ===== 横・縦（各層） =====
    for (let z = 0; z < 3; z++) {
        for (let i = 0; i < 3; i++) {
            // 横
            lines.push([[0,i,z],[1,i,z],[2,i,z]]);
            // 縦
            lines.push([[i,0,z],[i,1,z],[i,2,z]]);
        }

        // 斜め
        lines.push([[0,0,z],[1,1,z],[2,2,z]]);
        lines.push([[2,0,z],[1,1,z],[0,2,z]]);
    }

    // ===== 奥行き方向 =====
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            lines.push([[x,y,0],[x,y,1],[x,y,2]]);
        }
    }

    // ===== 縦方向の斜め =====
    for (let i = 0; i < 3; i++) {
        lines.push([[0,i,0],[1,i,1],[2,i,2]]);
        lines.push([[2,i,0],[1,i,1],[0,i,2]]);

        lines.push([[i,0,0],[i,1,1],[i,2,2]]);
        lines.push([[i,2,0],[i,1,1],[i,0,2]]);
    }

    // ===== 完全な立体対角線 =====
    lines.push([[0,0,0],[1,1,1],[2,2,2]]);
    lines.push([[2,0,0],[1,1,1],[0,2,2]]);
    lines.push([[0,2,0],[1,1,1],[2,0,2]]);
    lines.push([[2,2,0],[1,1,1],[0,0,2]]);

    // ===== 判定 =====
    for (let line of lines) {
        const [[x1,y1,z1],[x2,y2,z2],[x3,y3,z3]] = line;

        const v1 = board[z1][y1][x1];
        const v2 = board[z2][y2][x2];
        const v3 = board[z3][y3][x3];

        if (v1 && v1 === v2 && v1 === v3) {
            return v1;
        }
    }

    return null;
}

function isDraw() {
    return board.flat(2).every(cell => cell !== "");
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
renderer.setClearColor(0x222222);

//コントローラー
/*const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true; // ぬるっと動く
controls.dampingFactor = 0.05;

controls.screenSpacePanning = false;

controls.minDistance = 3;
controls.maxDistance = 10;*/


camera.position.set(4, 4, 6);
camera.lookAt(0, 0, 0);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//キューブ生成
function createCell3D(x, y, z) {
   
    const group = new THREE.Group();
    group.position.x = x - 1;
    group.position.y = 1 - y;
    group.position.z = z - 1; // z座標も追加;

    group.userData = { x, y, z };

    const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const material = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.2 // クリック可能なセルを半透明にする
    });

    const cube = new THREE.Mesh(geometry, material);
    group.add(cube);

    scene.add(group);
}

//配置
for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
            createCell3D(x, y, z);
        }
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
        let obj = intersects[intersects.length - 1].object;

        //親をたどってgroupを見つける
        while (obj.parent && obj.userData.x === undefined) {
            obj = obj.parent;
        }
        const group = obj;

        const { x, y, z } = group.userData;

        //ここで既存のクリック処理を呼び出す
        handleClick(x, y, z, group);
    }
});

//描画
function animate() {
    requestAnimationFrame(animate);

    //controls.update();

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