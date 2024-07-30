let balls = [];
let ballRadius = 10;
let ringRadius;
let maxBalls = 30; // Maximum number of balls allowed
let mergeRadiusIncrease = 2; // Amount by which the radius increases on merging

let ringCollisionOsc;
let mergeOsc;

let particles = [];

function setup() {
  createCanvas(1000, 1000);
  ringRadius = width / 3;
  
  // Create initial balls
  for (let i = 0; i < 4; i++) {
    balls.push(createBall());
  }
  
  // Initialize oscillators for sound effects
  ringCollisionOsc = new p5.Oscillator('sine');
  ringCollisionOsc.freq(880); // Frequency for ring collision
  ringCollisionOsc.amp(0);
  ringCollisionOsc.start();
  
  mergeOsc = new p5.Oscillator('triangle');
  mergeOsc.freq(440); // Frequency for ball merge
  mergeOsc.amp(0);
  mergeOsc.start();
}

function draw() {
  background(50);

  // Draw the ring with glow effect
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
  noFill();
  stroke(255); // White color
  strokeWeight(10); // Increased thickness
  ellipse(width / 2, height / 2, ringRadius * 2);
  drawingContext.shadowBlur = 0; // Reset shadowBlur

  let newBalls = [];

  for (let i = balls.length - 1; i >= 0; i--) {
    let ball = balls[i];
    
    // Update the ball's position
    ball.position.add(ball.speed);

    // Draw the ball with glow effect
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
    fill(255); // White color
    noStroke();
    ellipse(ball.position.x, ball.position.y, ball.radius * 2);
    drawingContext.shadowBlur = 0; // Reset shadowBlur

    // Check if the ball collides with the ring
    let distanceToCenter = dist(ball.position.x, ball.position.y, width / 2, height / 2);
    if (distanceToCenter + ball.radius >= ringRadius) {
      // Play ring collision sound
      // ringCollisionOsc.amp(0.5, 0.05);
      // ringCollisionOsc.amp(0, 0.2);

      // Reflect the ball's speed
      let direction = p5.Vector.sub(ball.position, createVector(width / 2, height / 2)).normalize();
      let incidence = ball.speed.copy().normalize();
      let normal = direction.copy().normalize();
      let dotProduct = incidence.dot(normal);
      let reflection = p5.Vector.sub(incidence, p5.Vector.mult(normal, 2 * dotProduct));
      ball.speed = reflection.mult(ball.speed.mag() * 1.01);

      // Adjust the ball's position to just inside the ring to prevent sticking
      let overlap = (distanceToCenter + ball.radius) - ringRadius;
      ball.position.sub(direction.mult(overlap));

      // Spawn a new ball if below the maxBalls limit
      if (balls.length < maxBalls) {
        newBalls.push(createBall());
      }

      // Create particles
      createParticles(ball.position.x, ball.position.y);
    }

    // Check for collisions with other balls
    for (let j = i - 1; j >= 0; j--) {
      let otherBall = balls[j];
      let distance = dist(ball.position.x, ball.position.y, otherBall.position.x, otherBall.position.y);
      if (distance < ball.radius + otherBall.radius) {
        // Play merge sound
        mergeOsc.amp(0.5, 0.05);
        mergeOsc.amp(0, 0.2);

        if (ball.radius >= otherBall.radius) {
          // The larger ball absorbs the smaller one
          ball.radius += mergeRadiusIncrease;
          // Remove the smaller ball
          balls.splice(j, 1);
        } else {
          // The smaller ball is absorbed by the larger one
          otherBall.radius += mergeRadiusIncrease;
          // Remove the current ball
          balls.splice(i, 1);
          break;
        }
      }
    }
  }

  // Add new balls created during the update loop
  balls = balls.concat(newBalls);

  // Safeguard to prevent the sketch from stopping
  if (balls.length < 4) {
    while (balls.length < 4) {
      balls.push(createBall());
    }
  }

  // Remove excess balls to maintain performance
  if (balls.length > maxBalls) {
    balls.splice(0, balls.length - maxBalls);
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();
    if (p.isFinished()) {
      particles.splice(i, 1);
    }
  }
}

function createBall() {
  let angle = random(TWO_PI);
  let r = random(ringRadius - ballRadius);
  let x = width / 2 + r * cos(angle);
  let y = height / 2 + r * sin(angle);
  
  let ball = {
    position: createVector(x, y),
    speed: p5.Vector.random2D().mult(2),
    radius: ballRadius
  };
  return ball;
}

function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(x, y));
  }
}

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(1, 3));
    this.lifespan = 255;
  }

  update() {
    this.position.add(this.velocity);
    this.lifespan -= 5;
  }

  display() {
    noStroke();
    fill(255, this.lifespan);
    ellipse(this.position.x, this.position.y, 5);
  }

  isFinished() {
    return this.lifespan < 0;
  }
}
