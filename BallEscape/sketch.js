let balls = [];
let ring;
let holeSize = 60;  // Size of the hole in the ring
let stopTime = 4000;
let lastBallTime = 0;
let dustParticles = [];
let collisionCount = 0;  // Count the number of collisions

function setup() {
  createCanvas(1000, 1000);
  
  ring = new Ring(width / 2, height / 2, 150, holeSize);
  spawnBall();

  startTime = millis();
  getAudioContext().resume();  // Start audio context
}

function draw() {
  background('#323232');
  
  // Draw ring with a hole
  ring.display();

  let anyOutside = false;
  
  // Update and display all balls, check collisions
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    
    // Check if the ball should stop moving after 4 seconds
    if (millis() - ball.spawnTime < stopTime) {
      ball.update();
    } else {
      ball.vx = 0;
      ball.vy = 0;
    }
    
    ball.display();
    
    // Check collision with the ring
    ring.checkCollision(ball);

    if (ball.outside) {
      anyOutside = true;
    }
    
    // Check collision with other balls
    for (let j = 0; j < balls.length; j++) {
      if (i !== j) {
        checkBallCollision(ball, balls[j]);
      }
    }
  }

  // If any ball is outside, remove all balls and create dust particles
  if (anyOutside) {
    for (let i = 0; i < random(5, 15); i++) {  // Create dust particles
      let angle = random(TWO_PI);  // Random angle
      let speed = random(1, 3);  // Random speed
      dustParticles.push(new DustParticle(width / 2, height / 2, angle, speed));  // Spawn from the center
    }
    balls = [];  // Clear all balls
  }

  // Update and display dust particles
  for (let i = dustParticles.length - 1; i >= 0; i--) {
    dustParticles[i].update();
    dustParticles[i].display();
    
    if (dustParticles[i].isFinished()) {
      dustParticles.splice(i, 1);
    }
  }
  
  // Every 4 seconds, generate a new ball
  if (millis() - lastBallTime > stopTime) {
    spawnBall();
    lastBallTime = millis();
  }
}

class Ball {
  constructor(x, y, vx, vy, r) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.r = r;
    this.spawnTime = millis();
    this.outside = false;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  
  display() {
    fill(255);
    noStroke();
    // Glowing effect
    drawingContext.shadowColor = color(255, 255, 255, 150);
    drawingContext.shadowBlur = 20;
    ellipse(this.x, this.y, this.r * 2);
    drawingContext.shadowBlur = 0;  // Reset shadow
  }
}

class Ring {
  constructor(x, y, radius, holeSize) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.holeSize = holeSize;
  }
  
  display() {
    stroke(255);
    noFill();
    strokeWeight(5);
    drawingContext.shadowColor = color(255, 255, 255, 150);
    drawingContext.shadowBlur = 20;
    ellipse(this.x, this.y, this.radius * 2);
    drawingContext.shadowBlur = 0;  // Reset shadow
    
    // Draw the hole in the ring with the color #323232
    let angle = PI / 1;
    let holeX = this.x + cos(angle) * this.radius;
    let holeY = this.y + sin(angle) * this.radius;
    fill('#323232');
    noStroke();
    ellipse(holeX, holeY, this.holeSize);
  }
  
  checkCollision(ball) {
    let distToCenter = dist(ball.x, ball.y, this.x, this.y);
    
    // Check if ball is inside the ring but not in the hole
    let holeAngle = PI / 1;
    let holeX = this.x + cos(holeAngle) * this.radius;
    let holeY = this.y + sin(holeAngle) * this.radius;
    let distToHole = dist(ball.x, ball.y, holeX, holeY);
    
    if (distToCenter > this.radius - (ball.r)) {
      // Prevent the ball from entering the hole
      if (ball.outside) {
        return;
      }
      if (distToHole < this.holeSize / 3) {
        ball.outside = true;
        return;
      }

      // Calculate angle from the center of the ring to the ball
      let angleToBall = atan2(ball.y - this.y, ball.x - this.x);

      // Set the velocity to push the ball away from the center of the ring
      let speed = sqrt(ball.vx * ball.vx + ball.vy * ball.vy);  // Keep the same speed
      ball.vx = -cos(angleToBall) * speed;
      ball.vy = -sin(angleToBall) * speed;
      
      // Correct ball's position to ensure it stays outside the ring's boundary
      let overlap = distToCenter - (this.radius - ball.r);
      ball.x -= cos(angleToBall) * overlap;
      ball.y -= sin(angleToBall) * overlap;

      // Increase collision count and play sound
      collisionCount++;
      playCollisionSound(collisionCount);
    }
  }
}

// Check if two balls are colliding and bounce them off each other
function checkBallCollision(ball1, ball2) {
  let distBetweenBalls = dist(ball1.x, ball1.y, ball2.x, ball2.y);
  let minDist = ball1.r + ball2.r;
  
  if (distBetweenBalls < minDist) {
    // Calculate the angle between the two balls
    let angle = atan2(ball1.y - ball2.y, ball1.x - ball2.x);
    
    // Reverse velocities to bounce them apart
    let speed1 = sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
    let speed2 = sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);
    
    ball1.vx = cos(angle) * speed1;
    ball1.vy = sin(angle) * speed1;
    
    ball2.vx = -cos(angle) * speed2;
    ball2.vy = -sin(angle) * speed2;
    
    // Adjust positions to avoid overlap
    let overlap = minDist - distBetweenBalls;
    ball1.x += cos(angle) * overlap / 2;
    ball1.y += sin(angle) * overlap / 2;
    
    ball2.x -= cos(angle) * overlap / 2;
    ball2.y -= sin(angle) * overlap / 2;

    // Increase collision count and play sound
    collisionCount++;
    playCollisionSound(collisionCount);
  }
}

// Function to spawn a new ball at a random position inside the ring
function spawnBall() {
  // Randomly generate a position inside the ring, avoiding the hole
  let angle = random(TWO_PI);
  let radius = random(0, ring.radius - holeSize / 2); // Ensure the ball is outside the hole
  
  // Calculate ball's position based on random angle and radius
  let x = ring.x + cos(angle) * radius;
  let y = ring.y + sin(angle) * radius;

  // Randomize the ball's velocity
  let speed = 5;
  let vx = random(-speed, speed);
  let vy = random(-speed, speed);

  // Create and add the ball at the new position
  let ball = new Ball(x, y, vx, vy, 10);
  balls.push(ball);
}

// DustParticle class to create dust particles on collision
class DustParticle {
  constructor(x, y, angle, speed) {
      this.x = x;
      this.y = y;
      this.size = random(5, 10);
      this.lifespan = 100;  // Lifespan of the particle in frames
      this.alpha = 255;
      this.vx = cos(angle) * speed;  // Velocity in x-direction
      this.vy = sin(angle) * speed;  // Velocity in y-direction
  }

  update() {
      this.x += this.vx;
      this.y += this.vy;
      this.lifespan -= 2;  // Decrease lifespan
      this.alpha = map(this.lifespan, 0, 100, 0, 255);  // Fade out
  }

  display() {
      fill(255, this.alpha);
      noStroke();
      ellipse(this.x, this.y, this.size);
  }

  isFinished() {
      return this.lifespan <= 0;
  }
}

// Sound setup
let oscillator;

function playCollisionSound(count) {
  // Check if the oscillator exists, create if it doesn't
  if (!oscillator) {
    oscillator = new p5.Oscillator('sine');  // Sine wave oscillator
    oscillator.start();  // Start the oscillator
  }
  
  let frequency = 440 + count * 20;  // Increase frequency with collision count
  oscillator.freq(frequency);  // Set oscillator frequency

  // Play the sound for a brief moment
  oscillator.amp(0.5, 0.05);  // Set volume to 0.5
  setTimeout(() => {
    oscillator.amp(0, 0.5);  // Fade out
  }, 100);  // Duration of the sound
}
