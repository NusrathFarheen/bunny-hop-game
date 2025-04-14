let obstacleInterval;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

// Bunny image
const bunnyImg = new Image();
bunnyImg.src = "bunny.png";

// Sound effects
const jumpSound = new Audio('jump.wav');
const passSound = new Audio('pass.wav');
const gameOverSound = new Audio('gameover.wav');

let isSoundOn = true;

// Toggle sound button logic
document.getElementById("toggle-sound").addEventListener("click", function () {
    isSoundOn = !isSoundOn;
    this.textContent = isSoundOn ? "🔊 Sound: ON" : "🔇 Sound: OFF";
});

// Bunny
const bunny = {
    x: 50,
    y: 300,
    width: 50,
    height: 50,
    velocityY: 0,
    gravity: 0.5,
    jumpPower: -10,
    isJumping: false
};

// Obstacles
let obstacles = [];

function createObstacle() {
    const height = 30;
    const width = 30;
    const y = 320;
    const speed = 5 + Math.random() * 3;
    obstacles.push({
        x: canvas.width + Math.random() * 200,
        y: y,
        width: width,
        height: height,
        speed: speed,
        passed: false
    });
}

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameOver = false;

document.getElementById("highScore").innerText = highScore;

// Handle jump
document.addEventListener("keydown", function(event) {
    if ((event.code === "Space" || event.code === "ArrowUp") && !bunny.isJumping && !gameOver) {
        bunny.velocityY = bunny.jumpPower;
        bunny.isJumping = true;
        if (isSoundOn) {
            jumpSound.currentTime = 0;
            jumpSound.play();
        }
    }
});

// Game loop
function updateGame() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gravity
    bunny.velocityY += bunny.gravity;
    bunny.y += bunny.velocityY;

    if (bunny.y >= 300) {
        bunny.y = 300;
        bunny.isJumping = false;
    }

    // Obstacles
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.x -= obs.speed;

        ctx.fillStyle = "red";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Pass detection
        if (!obs.passed && obs.x + obs.width < bunny.x) {
            score++;
            obs.passed = true;
            document.getElementById("score").innerText = score;

            if (isSoundOn) {
                passSound.currentTime = 0;
                passSound.play();
            }

            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
                document.getElementById("highScore").innerText = highScore;
            }
        }

        // Collision detection
        if (
            bunny.x < obs.x + obs.width &&
            bunny.x + bunny.width > obs.x &&
            bunny.y < obs.y + obs.height &&
            bunny.y + bunny.height > obs.y
        ) {
            gameOver = true;
            if (isSoundOn) {
                gameOverSound.currentTime = 0;
                gameOverSound.play();
            }
            document.getElementById("restartBtn").style.display = "block";
            return;
        }
    }

    // Clean up old obstacles
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

    // Draw bunny
    ctx.drawImage(bunnyImg, bunny.x, bunny.y, bunny.width, bunny.height);

    requestAnimationFrame(updateGame);
}

// Create new obstacles
setInterval(() => {
    if (!gameOver) createObstacle();
}, 1500);

function restartGame() {
    bunny.y = 300;
    bunny.velocityY = 0;
    bunny.isJumping = false;

    obstacles = [];
    score = 0;
    gameOver = false;

    document.getElementById("score").innerText = score;
    document.getElementById("highScore").innerText = highScore;
    document.getElementById("restartBtn").style.display = "none";

    updateGame();
}

updateGame();
