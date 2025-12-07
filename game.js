// Canvas setup
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Game State: "start", "playing", "gameOver"
let gameState = "start";

// Player (आपण)
let player = {
    x: 300,
    y: 200,
    radius: 20,
    color: "yellow",
    speed: 3
};

// Keyboard keys
let keys = {};

// Score & Growth
let score = 0;
let lastDifficultyScore = 0; // difficulty वाढवायला

// Lives (नवीन)
let lives = 3;

// Food / Energy balls
let foods = [];

// Enemies / Danger balls
let enemies = [];

// ---------- SOUNDS ----------
let collectSound = new Audio("collect.mp3");
let hitSound = new Audio("hit.mp3");
let gameOverSound = new Audio("gameover.mp3");
let bgMusic = new Audio("bgm.mp3");
bgMusic.loop = true; // background music repeat

// ---------------- KEYBOARD EVENTS ----------------
window.addEventListener("keydown", function (e) {
    keys[e.key] = true;

    // Start screen → SPACE ने game सुरू
    if (gameState === "start" && e.key === " ") {
        gameState = "playing";
        bgMusic.currentTime = 0;
        bgMusic.play();
    }

    // Game over → Enter ने restart
    if (gameState === "gameOver" && e.key === "Enter") {
        resetGame();
        gameState = "playing";
        bgMusic.currentTime = 0;
        bgMusic.play();
    }
});

window.addEventListener("keyup", function (e) {
    keys[e.key] = false;
});

// ---------------- OBJECT CREATION ----------------
function createFood() {
    let food = {
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        radius: 8,
        color: "lime"
    };
    foods.push(food);
}

function createEnemy() {
    let enemy = {
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        radius: 15,
        color: "red",
        speedX: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1),
        speedY: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1)
    };
    enemies.push(enemy);
}

function initObjects() {
    foods = [];
    enemies = [];

    for (let i = 0; i < 5; i++) {
        createFood();
    }

    for (let i = 0; i < 3; i++) {
        createEnemy();
    }
}

// सुरुवातीला once call
initObjects();

// ---------------- UPDATE FUNCTIONS ----------------
function updatePlayer() {
    if (keys["ArrowLeft"]) {
        player.x -= player.speed;
    }
    if (keys["ArrowRight"]) {
        player.x += player.speed;
    }
    if (keys["ArrowUp"]) {
        player.y -= player.speed;
    }
    if (keys["ArrowDown"]) {
        player.y += player.speed;
    }

    // Boundary checks
    if (player.x - player.radius < 0) {
        player.x = player.radius;
    }
    if (player.x + player.radius > canvas.width) {
        player.x = canvas.width - player.radius;
    }
    if (player.y - player.radius < 0) {
        player.y = player.radius;
    }
    if (player.y + player.radius > canvas.height) {
        player.y = canvas.height - player.radius;
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.speedX;
        enemy.y += enemy.speedY;

        // Walls वरून bounce
        if (enemy.x - enemy.radius < 0 || enemy.x + enemy.radius > canvas.width) {
            enemy.speedX *= -1;
        }
        if (enemy.y - enemy.radius < 0 || enemy.y + enemy.radius > canvas.height) {
            enemy.speedY *= -1;
        }
    });
}

// ---------------- DRAW FUNCTIONS ----------------
function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.shadowColor = "yellow";
    ctx.shadowBlur = 15; // हलका glow effect
    ctx.fill();
    ctx.shadowBlur = 0; // reset
}

function drawFoods() {
    foods.forEach(food => {
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
        ctx.fillStyle = food.color;
        ctx.fill();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
    });
}

function drawHUD() {
    ctx.font = "18px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 10, 20);

    ctx.font = "14px Arial";
    ctx.fillText("Growth: Collect Green & Avoid Red", 10, 40);

    // Lives display (hearts)
    ctx.font = "18px Arial";
    let hearts = ".".repeat(lives);
    ctx.fillText("Lives: " + hearts, canvas.width - 150, 20);
}

function drawStartScreen() {
    ctx.font = "28px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("GROWING LIGHT", canvas.width / 2 - 120, canvas.height / 2 - 20);

    ctx.font = "16px Arial";
    ctx.fillText("Use Arrow Keys to Move", canvas.width / 2 - 110, canvas.height / 2 + 10);
    ctx.fillText("Collect Green to Grow", canvas.width / 2 - 110, canvas.height / 2 + 30);
    ctx.fillText("Avoid Red Enemies", canvas.width / 2 - 110, canvas.height / 2 + 50);
    ctx.fillText("Press SPACE to Start", canvas.width / 2 - 110, canvas.height / 2 + 80);
}

function drawGameOver() {
    ctx.font = "32px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2 - 10);

    ctx.font = "18px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Final Score: " + score, canvas.width / 2 - 70, canvas.height / 2 + 20);
    ctx.fillText("Press Enter to Restart", canvas.width / 2 - 110, canvas.height / 2 + 50);
}

// ---------------- COLLISIONS ----------------
function checkFoodCollisions() {
    for (let i = 0; i < foods.length; i++) {
        let food = foods[i];

        let dx = player.x - food.x;
        let dy = player.y - food.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + food.radius) {
            foods.splice(i, 1);
            createFood();
            score += 1;
            player.radius += 1;

            // Collect sound
            collectSound.currentTime = 0;
            collectSound.play();

            // Difficulty growth: दर 5 score ला नवीन enemy add
            if (score % 5 === 0 && score !== 0 && score !== lastDifficultyScore) {
                createEnemy();
                lastDifficultyScore = score;
            }
            break;
        }
    }
}

function checkEnemyCollisions() {
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + enemy.radius) {

            // Hit sound
            hitSound.currentTime = 0;
            hitSound.play();

            lives -= 1;

            if (lives <= 0) {
                gameState = "gameOver";
                bgMusic.pause();
                gameOverSound.currentTime = 0;
                gameOverSound.play();
            } else {
                // playerला मधोमध परत पाठवू, थोडा छोटा करू
                player.x = 300;
                player.y = 200;
                if (player.radius > 15) {
                    player.radius -= 3;
                }
            }

            break;
        }
    }
}

// ---------------- GAME RESET ----------------
function resetGame() {
    score = 0;
    lastDifficultyScore = 0;
    lives = 3;
    player.x = 300;
    player.y = 200;
    player.radius = 20;
    initObjects();
}

// ---------------- MAIN LOOP ----------------
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "playing") {
        updatePlayer();
        updateEnemies();
        checkFoodCollisions();
        checkEnemyCollisions();
    }

    // Objects नेहमी दिसतील
    drawFoods();
    drawEnemies();
    drawPlayer();
    drawHUD();

    if (gameState === "start") {
        drawStartScreen();
    }

    if (gameState === "gameOver") {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
