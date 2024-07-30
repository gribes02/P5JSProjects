let ring;
let balls = [];
let ballSpawnInterval = 4000; // 4 seconds
let lastSpawnTime = 0;
let disintegrating = false;
let particles = [];

function setup() {
  createCanvas(600, 600);
  ring = new Ring(width / 2, height / 2, 200, PI / 6); // Small opening of 30 degrees
}

function draw() {
  background(51);

  if (disintegrating) {
    updateParticles();
    showParticles();
  } else {
    // Draw and update the ring
    ring.update();
    ring.show();

    // Update and show balls
    for (let ball of balls) {
      ball.update();
      ball.show();
      ring.checkCollision(ball);
    }

    // Spawn a new ball if the interval has passed
    if (millis() - lastSpawnTime > ballSpawnInterval) {
      spawnNewBall();
      lastSpawnTime = millis();
    }

    // Check for escaping balls and freeze them
    for (let ball of balls) {
      if (ring.isEscaped(ball)) {
        ring.disintegrate();
        disintegrating = true;
        break;
      } else if (millis() - ball.spawnTime > ballSpawnInterval) {
        ball.freeze();
      }
    }
  }
}

function spawnNewBall() {
  let newBall = new Ball(width / 2, height / 2);
  balls.push(newBall);
}

function updateParticles() {
  for (let particle of particles) {
    particle.update();
  }
}

function showParticles() {
  for (let particle of particles) {
    particle.show();
  }
}

class Ring {
  constructor(x, y, r, openingAngle) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.openingAngle = openingAngle;
    this.angle = 0;
  }

  update() {
    this.angle += 0.02;
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    stroke(255);
    strokeWeight(4);
    noFill();
    let startAngle = this.openingAngle / 2;
    let endAngle = TWO_PI - this.openingAngle / 2;
    arc(0, 0, this.r * 2, this.r * 2, startAngle, endAngle);
    pop();
  }

  isEscaped(ball) {
    let d = dist(this.x, this.y, ball.pos.x, ball.pos.y);
    if (d > this.r) {
      return true;
    }
    return false;
  }

  checkCollision(ball) {
    let distance = dist(this.x, this.y, ball.pos.x, ball.pos.y);
    if (distance > this.r - ball.r && distance < this.r + ball.r) {
      let angleBetween = atan2(ball.pos.y - this.y, ball.pos.x - this.x) - this.angle;
      angleBetween = (angleBetween + TWO_PI) % TWO_PI; // Normalize angle

      let halfOpenAngle = this.openingAngle / 2;
      // if (angleBetween < TWO_PI - halfOpenAngle && angleBetween > halfOpenAngle) {
      if (angleBetween < TWO_PI && angleBetween > halfOpenAngle) {

        // Collision detected, reflect the ball
        let normal = createVector(ball.pos.x - this.x, ball.pos.y - this.y).normalize();
        ball.vel.reflect(normal);
        ball.pos.add(ball.vel);
      }
    }
  }

  disintegrate() {
    // Create particles for disintegration effect
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle(this.x, this.y, this.r));
    }
    console.log("Ring disintegrates!");
  }
}

class Ball {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-2, 2), random(-2, 2));
    this.acc = createVector(0, 0.1); // Gravity
    this.r = 10;
    this.spawnTime = millis();
    this.frozen = false;
  }

  update() {
    if (!this.frozen) {
      this.vel.add(this.acc);
      this.pos.add(this.vel);

      // Bounce off the walls
      if (this.pos.x < this.r || this.pos.x > width - this.r) {
        this.vel.x *= -1;
      }
      if (this.pos.y < this.r || this.pos.y > height - this.r) {
        this.vel.y *= -1;
      }
    }
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }

  freeze() {
    this.frozen = true;
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 5));
    this.lifetime = 255;
  }

  update() {
    this.pos.add(this.vel);
    this.lifetime -= 5;
  }

  show() {
    noStroke();
    fill(255, this.lifetime);
    ellipse(this.pos.x, this.pos.y, 5);
  }
}
