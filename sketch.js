let canvas;
let ground;
let player;
let enemies = [];
let resetButton;
let resetDelay = 0;
let dies = 0;
let killed = 0;
let projectiles = [];

const gravity = 1;
const jump = 25;
const groundY = 653;
const projectileDelay = 30;

function preload() {
  playerImage = loadImage('img/box.png');
  enemyImage = loadImage('img/enemy.png');
  ground = loadImage('img/ground.png');
  resetButton = loadImage('img/reset.png'); 
  projectileImage = loadImage('img/projektil.png');
}

class Entity {
  constructor(x, y, image, width = 30, height = 30) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.image = image;
    this.width = width;
    this.height = height;
  }

  draw() {
    image(this.image, this.x, this.y, this.width, this.height);
  }

  applyGravity() {
    if (this.y + this.height < groundY) {
      this.vy += gravity;
    } else {
      this.vy = 0;
      this.y = groundY - this.height;
    }
  }

  updatePosition() {
    this.x += this.vx;
    this.y += this.vy;
  }

  collidesWith(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}

class Player extends Entity {
  constructor(x, y, image) {
    super(x, y, image, 30, 30);
    this.isJumping = false;
    this.shootingCooldown = 0;
  }

  handleInput() {
    if (keyIsDown(LEFT_ARROW) && this.x > 0) {
      this.vx = -10;
    } else if (keyIsDown(RIGHT_ARROW) && this.x + this.width < width) {
      this.vx = 10;
    } else if (keyIsDown(65) && this.x > 0) {
      this.vx = -10;
    } else if (keyIsDown(68) && this.x + this.width < width) {
        this.vx = 10;
    } else {
      this.vx = 0;
    }
    if (keyIsDown(32) && !this.isJumping) {
      this.vy = -jump;
      this.isJumping = true;
    }
    if (keyIsDown(32) && this.shootingCooldown <= 0) {
      this.shoot();
      this.shootingCooldown = projectileDelay;
    }
  }

  shoot() {
    let projectile = new Projectile(this.x + this.width / 2 - 5, this.y - 10, projectileImage, 10, 20);
    projectiles.push(projectile);
  }

  update() {
    if (this.shootingCooldown > 0) {
      this.shootingCooldown--;
    }
  }
}

class Enemy extends Entity {
  constructor(x, y, image) {
    super(x, y, image, 80, 80);
    this.vx = random([-5, 5]);
    this.jumpTimer = random(30, 100);
  }

  bounceOffWalls() {
    if (this.x <= 0 || this.x + this.width >= width) {
      this.vx *= -1;
    }
  }

  periodicJump() {
    if (this.jumpTimer <= 0) {
      this.vy = -jump;
      this.jumpTimer = random(30, 100);
    } else {
      this.jumpTimer--;
    }
  }

  update() {
    this.updatePosition();
    this.bounceOffWalls();
    this.applyGravity();
    this.periodicJump();
  }
}

class Projectile extends Entity {
  constructor(x, y, image, width = 10, height = 20) {
    super(x, y, image, width, height);
    this.vy = -10;
  }

  update() {
    this.updatePosition();
    if (this.y < 0) {
      let index = projectiles.indexOf(this);
      if (index > -1) {
        projectiles.splice(index, 1);
      }
    }

    for (let i = 0; i < enemies.length; i++) {
      if (this.collidesWith(enemies[i])) {
        enemies.splice(i, 1);
        projectiles.splice(projectiles.indexOf(this), 1);
        killed++;
        spawnNewEnemy();
        break;
      }
    }
  }
}

function setup() {
  canvas = createCanvas(windowWidth / 2, windowHeight);
  canvas.position(windowWidth / 4, 0);
  initializeGame();
}

function draw() {
  background(50);
  ground.resize(320, 50);
  for (let i = 0; i < width; i += 320) {
    image(ground, i, windowHeight - 50);
  }
  if (player) {
    player.handleInput();
    player.applyGravity();
    player.updatePosition();
    player.update();
    player.draw();
    for (let enemy of enemies) {
      if (player.collidesWith(enemy)) {
        player = null; 
        dies++;
        break; 
      }
    }
  }
  for (let enemy of enemies) {
    enemy.update();
    enemy.draw();
  }
  for (let projectile of projectiles) {
    projectile.update();
    projectile.draw();
  }
  image(resetButton, 10, 10, 50, 50);

  if (mouseIsPressed && mouseX >= 10 && mouseX <= 60 && mouseY >= 10 && mouseY <= 60 && resetDelay <= 0) {
    initializeGame(); 
    resetDelay = 10; 
  }
  if (resetDelay > 0) {
    resetDelay--;
  }
  fill(255);
  text(`Died: ${dies} times`, 10, 80);
  text(`Kills: ${killed}`, 10, 100);
}
function initializeGame() {
  player = new Player(450, groundY - 50, playerImage);
  enemies = [];
  for (let i = 0; i < 2; i++) {
    let enemy = new Enemy(random(0, width - 50), 100, enemyImage);
    enemies.push(enemy);
  }
  resetDelay = 0;
}
function spawnNewEnemy() {
  let newEnemy = new Enemy(random(0, width - 50), 100, enemyImage);
  enemies.push(newEnemy);
}
