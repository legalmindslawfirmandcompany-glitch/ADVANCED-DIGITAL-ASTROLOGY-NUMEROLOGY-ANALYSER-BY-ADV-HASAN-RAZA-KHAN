// Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 5;
const PLAYER_SIZE = 40;
const PLAYER_FIRE_RATE = 200; // milliseconds
const BULLET_SPEED = 7;
const BULLET_SIZE = 5;
const ENEMY_SPEED = 2;
const ENEMY_SPAWN_INTERVAL = 1500; // milliseconds
const ENEMY_MIN_SIZE = 20;
const ENEMY_MAX_SIZE = 50;
const SCORE_PER_ENEMY = 10;
const LIVES_START = 3;

// Game State
let gameRunning = false;
let lastPlayerShotTime = 0;
let lastEnemySpawnTime = 0;
let score = 0;
let lives = LIVES_START;
let player, bullets, enemies;
const keys = {};

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const scoreDisplay = document.getElementById('scoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');

// Set up the canvas dimensions
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Define game objects
class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 50;
        this.width = PLAYER_SIZE;
        this.height = PLAYER_SIZE;
        this.color = '#38bdf8'; // Cyan
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        if (keys['ArrowLeft'] || keys['a']) {
            this.x -= PLAYER_SPEED;
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.x += PLAYER_SPEED;
        }
        // Keep player within canvas bounds
        if (this.x < this.width / 2) this.x = this.width / 2;
        if (this.x > canvas.width - this.width / 2) this.x = canvas.width - this.width / 2;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = BULLET_SIZE;
        this.color = '#fde047'; // Yellow
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.y -= BULLET_SPEED;
    }
}

class Enemy {
    constructor() {
        this.size = Math.floor(Math.random() * (ENEMY_MAX_SIZE - ENEMY_MIN_SIZE + 1)) + ENEMY_MIN_SIZE;
        this.x = Math.random() * (canvas.width - this.size);
        this.y = -this.size; // Start off-screen
        this.speed = ENEMY_SPEED + (Math.random() * 1.5); // Slight speed variation
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = ['#f87171', '#fbbf24', '#a78bfa', '#ec4899'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
        this.y += this.speed;
    }
}

// Event Listeners
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

startButton.addEventListener('click', startGame);

// Game Functions
function startGame() {
    gameRunning = true;
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300); // Wait for the fade-out to complete

    score = 0;
    lives = LIVES_START;
    player = new Player();
    bullets = [];
    enemies = [];

    updateDisplays();
    gameLoop();
}

function endGame() {
    gameRunning = false;
    overlayTitle.textContent = 'Game Over';
    overlayMessage.textContent = `You survived a total of ${score} points! Try again to beat your score.`;
    startButton.textContent = 'Play Again';
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);
}

function updateDisplays() {
    scoreDisplay.textContent = `Score: ${score}`;
    livesDisplay.textContent = `Lives: ${lives}`;
}

function handleInput() {
    // Handle shooting
    const currentTime = Date.now();
    if (keys[' '] && currentTime - lastPlayerShotTime > PLAYER_FIRE_RATE) {
        bullets.push(new Bullet(player.x, player.y));
        lastPlayerShotTime = currentTime;
    }
}

function spawnEnemies() {
    const currentTime = Date.now();
    if (currentTime - lastEnemySpawnTime > ENEMY_SPAWN_INTERVAL) {
        enemies.push(new Enemy());
        lastEnemySpawnTime = currentTime;
    }
}

function updateGameObjects() {
    // Update player
    player.update();

    // Update bullets and filter out old ones
    bullets.forEach(bullet => bullet.update());
    bullets = bullets.filter(bullet => bullet.y > -BULLET_SIZE);

    // Update enemies and handle collision with bullets or player
    enemies.forEach(enemy => enemy.update());

    // Check for collisions
    bullets.forEach(bullet => {
        enemies.forEach(enemy => {
            if (
                bullet.x > enemy.x &&
                bullet.x < enemy.x + enemy.size &&
                bullet.y > enemy.y &&
                bullet.y < enemy.y + enemy.size
            ) {
                // Collision detected!
                // Increment score
                score += SCORE_PER_ENEMY;
                updateDisplays();
                // Remove bullet and enemy
                bullets.splice(bullets.indexOf(bullet), 1);
                enemies.splice(enemies.indexOf(enemy), 1);
            }
        });
    });

    // Handle enemies reaching the bottom of the screen
    enemies.forEach(enemy => {
        if (enemy.y + enemy.size > canvas.height) {
            // Enemy reached the bottom
            lives--;
            updateDisplays();
            enemies.splice(enemies.indexOf(enemy), 1);
            if (lives <= 0) {
                endGame();
            }
        }
    });
}

function drawGameObjects() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    bullets.forEach(bullet => bullet.draw());
    enemies.forEach(enemy => enemy.draw());
}

function gameLoop() {
    if (!gameRunning) return;

    handleInput();
    spawnEnemies();
    updateGameObjects();
    drawGameObjects();

    requestAnimationFrame(gameLoop);
}
