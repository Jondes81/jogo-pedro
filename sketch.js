let player;
let playerBullets = [];
let alienBullets = [];
let aliens = [];
let playerScore = 0;
let gameState = 'playing';
let waveNumber = 1;
let bossFight = false;
let playerHealth = 200;
let bossMoveSpeed = 1;
let bossBaseHealth = 100;
let bossHealth = bossBaseHealth;
let bossDamage = 25;
let bossRoundCounter = 0;
let roundTimer = 0;
let alienHealth = 1 // Vida do alien
let alienShotInterval = 1500;
let alienSpeedIncrease = 0.01;
let alienInitialSpeed = 0.09;
let playerDamage = 15; // Dano inicial do jogador
let autoShooter = false; // Flag para atirador automático
let autoShooterInterval = 1000; // Intervalo de 1 segundo para o atirador automático
let lastAutoShot = 0; // Timer para controlar o atirador automático
let playerSpeed = 5; // Velocidade inicial do jogador
let areaShot = false; // Flag para tiro em área

let laserSound; // Variável para armazenar o som do laser
let stars = []; // Array para armazenar as estrelas

function preload() {
  soundFormats('mp3', 'wav'); // Garantir a compatibilidade de formatos de som
  laserSound = loadSound('assets/laser.mp3', soundLoaded, soundLoadError); // Carrega o som do laser
}

function soundLoaded() {
  laserSound.setVolume(0.5); // Definir o volume do som do laser
}

function soundLoadError(err) {
  console.error('Erro ao carregar o som:', err);
}

function setup() {
  createCanvas(600, 450);
  player = new Player(width / 2, height - 50);
  createStars(); // Cria as estrelas do fundo
  createAliens();
}

function draw() {
  background(0);

  // Desenha e move as estrelas
  for (let star of stars) {
    star.show();
  }

  if (gameState === 'playing') {
    player.update();
    player.show();
    player.showHealth();

    updateBullets(playerBullets, -1);
    updateBullets(alienBullets, 1);

    updateAliens();

    checkForNewWave();

    if (autoShooter && millis() - lastAutoShot > autoShooterInterval) {
      playerBullets.push(new Bullet(player.x + player.width / 2, player.y, -1));
      if (laserSound && laserSound.isLoaded()) {
        laserSound.play(); // Toca o som do laser
      }
      lastAutoShot = millis();
    }

    displayScoreAndWave();

  } else if (gameState === 'gameOver') {
    displayGameOver();
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW && gameState === 'playing') {
    playerBullets.push(new Bullet(player.x + player.width / 2, player.y, -1));
    if (laserSound && laserSound.isLoaded()) {
      laserSound.play(); // Toca o som do laser
    }
  }

  if (keyCode === ENTER && gameState === 'gameOver') {
    resetGame();
  }
}

function displayScoreAndWave() {
  fill(255);
  textSize(16);
  text('Score: ' + playerScore, width - 100, 30);
  text('Wave: ' + waveNumber, width - 100, 50);
}

function displayGameOver() {
  fill(255, 0, 0);
  textSize(32);
  textAlign(CENTER);
  text('GAME OVER', width / 2, height / 2);
  textSize(16);
  text('Press ENTER to Restart', width / 2, height / 2 + 30);
}

function updateAliens() {
  for (let i = aliens.length - 1; i >= 0; i--) {
    let alien = aliens[i];
    alien.update();
    alien.show();

    // Lógica para aliens atirarem
    if (random(1) < 0.002) { // Ajuste a taxa de disparo conforme necessário
      alienBullets.push(new Bullet(alien.x + alien.width / 2, alien.y + alien.height, 1));
    }

    if (alien.hits(player)) {
      playerHealth -= alien.damage;
      if (playerHealth <= 0) {
        gameState = 'gameOver';
      }
      aliens.splice(i, 1); // Remove o alien que colidiu
    }
  }
}

function checkForNewWave() {
  if (aliens.length === 0) {
    if (bossFight) {
      bossFight = false;
      bossRoundCounter++;
      waveNumber++;
      createAliens();
    } else {
      waveNumber++;
      if (waveNumber % 5 === 0) {
        createBoss();
        bossFight = true;
      } else {
        createAliens();
      }
    }
  }
}

function createAliens() {
  let rows = 3;
  let cols = 7;
  let spacing = 50;
  let alienWidth = 30;
  let alienHeight = 20;
  let startX = 50;
  let startY = 50;
  let speed = alienInitialSpeed + waveNumber * alienSpeedIncrease;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let x = startX + j * (spacing + alienWidth);
      let y = startY + i * (spacing + alienHeight);
      let alien = new Alien(x, y, alienWidth, alienHeight, 10 + waveNumber, speed);
      aliens.push(alien);
    }
  }
}

function createBoss() {
  let boss = new Boss(width / 2 - 40, 0, 80, 40, bossHealth + bossRoundCounter * 50, bossMoveSpeed + bossRoundCounter * 0.2);
  aliens.push(boss);
}

function resetGame() {
  player = new Player(width / 2, height - 50);
  playerBullets = [];
  alienBullets = [];
  aliens = [];
  playerScore = 0;
  gameState = 'playing';
  waveNumber = 1;
  bossFight = false;
  playerHealth = 200;
  bossHealth = bossBaseHealth;
  bossRoundCounter = 0;
  roundTimer = 0;
  alienShotInterval = 1500;
  playerDamage = 10;
  autoShooter = false;
  playerSpeed = 8;
  areaShot = false;
  lastAutoShot = 0; // Redefinindo o temporizador do atirador automático
  createAliens();
  alienHealth = 1;
}

function updateBullets(bullets, direction) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();

    // Lógica para colisão de balas com o jogador
    if (direction === 1 && bullets[i].hits(player)) {
      playerHealth -= 10;
      bullets.splice(i, 1);
      if (playerHealth <= 0) {
        gameState = 'gameOver';
      }
    }

    // Lógica para colisão de balas com os aliens
    if (direction === -1) {
      for (let j = aliens.length - 1; j >= 0; j--) {
        if (bullets[i].hits(aliens[j])) {
          aliens[j].health -= playerDamage;
          if (aliens[j].health <= 1) {
            playerScore += 2; // Aumenta 2 na pontuação ao derrotar um alien normal
            aliens.splice(j, 1);
          }
          bullets.splice(i, 1);
          break;
        }
      }
    }
  }
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 20;
  }

  update() {
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= playerSpeed;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += playerSpeed;
    }
    this.x = constrain(this.x, 0, width - this.width);
  }

  show() {
    fill(0, 255, 0);
    beginShape();
    vertex(this.x, this.y);
    vertex(this.x + this.width / 2, this.y - this.height);
    vertex(this.x + this.width, this.y);
    vertex(this.x + this.width / 2, this.y + this.height);
    endShape(CLOSE);
  }

  showHealth() {
    fill(0, 255, 0);
    rect(10, 10, 100, 10);
    fill(255, 0, 0);
    let healthWidth = map(playerHealth, 0, 200, 0, 100);
    rect(10, 10, healthWidth, 10);
  }
}

class Bullet {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.width = 5;
    this.height = 10;
    this.speed = 5;
  }

  update() {
    this.y += this.speed * this.direction;
  }

  show() {
    fill(255);
    rect(this.x, this.y, this.width, this.height);
  }

  hits(target) {
    return (
      this.x > target.x &&
      this.x < target.x + target.width &&
      this.y > target.y &&
      this.y < target.y + target.height
    );
  }
}

class Alien {
  constructor(x, y, width, height, health, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.health = health;
    this.speed = speed;
    this.damage = 10; // Dano que o alienígena causa ao jogador
  }

  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = 0;
      this.x = random(width - this.width);
    }
  }

  show() {
    fill(255, 0, 0);
    rect(this.x, this.y, this.width, this.height);
  }

  hits(target) {
    return (
      this.x > target.x &&
      this.x < target.x + target.width &&
      this.y > target.y &&
      this.y < target.y + target.height
    );
  }
}

class Boss extends Alien {
  constructor(x, y, width, height, health, speed) {
    super(x, y, width, height, health, speed);
    this.damage = bossDamage; // Dano que o boss causa ao jogador
  }

  update() {
    this.y += this.speed;
    this.x += random(-3, 3); // Movimento lateral aleatório do boss
    if (this.y > height) {
      this.y = 0;
      this.x = random(width - this.width);
    }
  }

  show() {
    fill(255, 0, 0);
    rect(this.x, this.y, this.width, this.height);
  }
}

function createStars() {
  for (let i = 0; i < 100; i++) {
    stars.push(new Star(random(width), random(height)));
  }
}

class Star {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(1, 3);
  }

  show() {
    noStroke();
    fill(255);
    ellipse(this.x, this.y, this.size, this.size);
  }
}
