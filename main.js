const board = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () =>
        Array(3).fill("")
    )
);

let currentPlayer = 'O';
let gameOver = false;
let currentLayer = 1; // 0, 1, 2のいずれかを指定して、現在操作している層を管理
let winningLine = null; // 勝利ラインを保存する変数

let displayLayer = currentLayer; // 表示用の変数（勝利ライン表示のために分ける）

const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");
const layerText = document.getElementById("layerText");

const resetBtn = document.getElementById("resetBtn");
const layerUpBtn = document.getElementById("layerUp");
const layerDownBtn = document.getElementById("layerDown");

layerUpBtn.addEventListener("click", () => {
    currentLayer = Math.min(2, currentLayer + 1);
    updateLayerVisual();
});
layerDownBtn.addEventListener("click", () => {
    currentLayer = Math.max(0, currentLayer - 1);
    updateLayerVisual();
});

resetBtn.addEventListener("click", resetGame);

function resetGame() {
    winningLine = null; // 勝利ラインリセット

    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);


    // ボード初期化
    for (let z = 0; z < 3; z++) {
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                board[z][y][x] = "";
            }
        }
    }

    // O/X削除
    scene.children.forEach(group => {
        if (group.userData) {
            for (let i = group.children.length - 1; i >= 0; i--) {
                const child = group.children[i];
                if (child !== group.userData.cube) {
                    group.remove(child);
                }
            }

            const cube = group.userData.cube;

            // 色と透明度リセット
            cube.material.color.set(0xaaaaaa);

            // emissive使ってた場合
            if (cube.material.emissive) {
                cube.material.emissive.set(0x000000);
            }

        }
    });

    // 状態リセット
    currentPlayer = 'O';
    gameOver = false;
    currentLayer = 1;
    statusText.textContent = currentPlayer + "'s turn";

    updateLayerVisual();
}

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
        statusText.textContent = winner.player + " wins!";
        gameOver = true;

        winningLine = winner.line; // 勝利ラインを保存
        highlightLine(winner.line);
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

function highlightLine(line) {
    line.forEach(([x, y, z]) => {

        scene.children.forEach(group => {
            if (!group.userData) return;

            const data = group.userData;

            if (data.x === x && data.y === y && data.z === z) {
                const cube = data.cube;

                cube.material.color.set(0xffee00); // 黄色✨
                cube.material.opacity = 0.8;
            }
        });

    });
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
            return { player: v1, line };
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
const controls = new THREE.OrbitControls(camera, renderer.domElement);

controls.enableDamping = true; // ぬるっと動く
controls.dampingFactor = 0.05;

controls.screenSpacePanning = false;

controls.minDistance = 3;
controls.maxDistance = 10;


camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//キューブ生成
function createCell3D(x, y, z) {
   
    const group = new THREE.Group();
    group.position.set(x - 1, z - 1, 1 - y); // x, y, z座標を設定

    group.userData = { x, y, z };

    const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const material = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: z === currentLayer ? 0.5 : 0.4 // クリック可能なセルを半透明にする
    });

    const cube = new THREE.Mesh(geometry, material);
    group.add(cube);

    group.userData.cube = cube;

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

updateLayerVisual(); // ←ここ✨

/*renderer.domElement.addEventListener("wheel", (event) => { // ホイールで層移動　（PC向けの操作なので、モバイルではボタンで切り替える方式に変更）
    event.preventDefault();

    if (event.deltaY < 0) {
        currentLayer++;
    } else {
        currentLayer--;
    }
    currentLayer = Math.max(0, Math.min(2, currentLayer)); // 0〜2の範囲に制限

    updateLayerVisual();
}, { passive: false });*/

renderer.domElement.addEventListener("pointerdown", (event) => {

    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let hit of intersects) {
        let obj = hit.object;

        // 親をたどってgroupを見つける
        while (obj.parent && obj.userData.x === undefined) {
            obj = obj.parent;
        }

        const { x, y, z } = obj.userData;

        // 今の層だけ許可
        if (z === currentLayer) {
            handleClick(x, y, z, obj);
            break; // ← ここ超重要🔥
        }
    }
});

//描画
function animate() {
    const speed = winningLine ? 0.2 : 0.1; // 勝利ライン表示中はゆっくり移動

    requestAnimationFrame(animate);

    displayLayer += (currentLayer - displayLayer) * speed; // なめらかに移動

    updateLayerVisualSmooth(displayLayer); // なめらか表示用の更新関数

    renderer.render(scene, camera);
}
animate();

function updateLayerVisualSmooth(layer) {
    scene.children.forEach(group => {
        if (!group.userData) return;

        const { x, y, z, cube } = group.userData;
        if (!cube) return;

        // 勝利ライン優先✨
        if (winningLine && winningLine.some(([lx, ly, lz]) =>
            lx === x && ly === y && lz === z
        )) {
            cube.material.color.set(0xffee00);
            cube.material.opacity = 0.9;
            return;
        }

        // 🌊 距離ベースでなめらか表示
        const diff = Math.abs(z - layer);

        // 近いほど濃く、遠いほど薄く
        const opacity = 0.7 - diff * 0.4;

        cube.material.opacity = Math.max(0.1, opacity);

        // 色も少し変えると見やすい✨
        if (diff < 0.3) {
            cube.material.color.set(0xffffff);
        } else {
            cube.material.color.set(0x777777);
        }
    });
}

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

function updateLayerVisual() {
    scene.children.forEach(group => {
        if (!group.userData) return;

        const { x, y, z, cube } = group.userData;
        if (!cube) return;

        // 勝利ライン優先✨
        if (winningLine && winningLine.some(([lx, ly, lz]) =>
            lx === x && ly === y && lz === z
        )) {
            cube.material.color.set(0xffee00);
            cube.material.opacity = 0.9;
            return;
        }

        // 通常表示
        if (z === currentLayer) {
            cube.material.opacity = 0.7;
            cube.material.color.set(0xffffff);
        } else {
            cube.material.opacity = 0.25;
            cube.material.color.set(0x777777);
        }
    });

    // 層表示もここで更新🔥
    layerText.textContent = "Layer: " + (currentLayer + 1);
}

