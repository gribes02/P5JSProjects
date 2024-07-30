let ball;
let ringRadius;
let ringSides = 15;
let ballIsSquare = false;
let trailLength = 50;
let particles = [];
let colors;

let noteFrequencies = {
  'C': 523.25,
  'Db': 554.37,
  'D': 587.33,
  'E': 659.25,
  'F': 698.46,
  'G': 783.99,
  'A': 440.00
};

let notes = [
  'F', 'D', 'A', 'D', 'F', 'D', 'A', 'D', 
  'F', 'C', 'A', 'C', 'F', 'C', 'A', 'C', 
  'E', 'Db', 'A', 'Db', 'E', 'Db', 'A', 'Db', 
  'E', 'Db', 'A', 'Db', 'E', 'Db', 'A', 'D', 
  'E', 'F', 'A', 'G', 'A', 'C', 'D', 'E', 
  'F', 'E', 'G', 'A', 'G', 'F'
];

let currentNoteIndex = 0;
let osc;

function setup() {
  createCanvas(800, 800);
  ringRadius = width / 3;
  ball = {
    position: createVector(width / 2 + ringRadius / 2, height / 2),
    speed: createVector(3, 3),
    radius: 10,
    isSquare: false,
    trail: []
  };

  colors = [
    color(255, 0, 0),
    color(255, 127, 0),
    color(255, 255, 0),
    color(0, 255, 0),
    color(0, 0, 255),
    color(75, 0, 130),
    color(148, 0, 211)
  ];
  
  osc = new p5.Oscillator('sine');
  osc.start();
  osc.amp(0);
}

function draw() {
  background(50);

  // Draw the transforming ring with glow
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = color(255);
  noFill();
  stroke(255);
  strokeWeight(4);
  drawPolygon(width / 2, height / 2, ringRadius, ringSides);
  drawingContext.shadowBlur = 0;

  // Update the ball's position
  ball.position.add(ball.speed);

  // Store the current position in the trail array
  ball.trail.push(ball.position.copy());
  if (ball.trail.length > trailLength) {
    ball.trail.shift(); // Keep the trail at a fixed length
  }

  // Draw the ball's trail with rainbow gradient
  for (let j = 0; j < ball.trail.length; j++) {
    let pos = ball.trail[j];
    let t = j / ball.trail.length;
    let trailColor = lerpColor(color(255, 0, 0), color(0, 0, 255), t); // Rainbow gradient
    fill(trailColor);
    noStroke();
    ellipse(pos.x, pos.y, ball.radius);
  }

  // Draw the transforming ball with glow
  fill(255);
  noStroke();
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = color(255);
  if (ball.isSquare) {
    rectMode(CENTER);
    rect(ball.position.x, ball.position.y, ball.radius * 2, ball.radius * 2);
  } else {
    ellipse(ball.position.x, ball.position.y, ball.radius * 2);
  }
  drawingContext.shadowBlur = 0;

  // Check collision with the ring
  if (ringSides > 4) {
    // Circle collision logic
    let distanceToCenter = dist(ball.position.x, ball.position.y, width / 2, height / 2);
    if (distanceToCenter + ball.radius >= ringRadius) {
      // Reflect the ball's speed
      let direction = p5.Vector.sub(ball.position, createVector(width / 2, height / 2)).normalize();
      ball.speed.reflect(direction);

      // Adjust the ball's position to just inside the ring to prevent sticking
      let overlap = (distanceToCenter + ball.radius) - ringRadius;
      ball.position.sub(direction.mult(overlap));

      // Transform the ring closer to a square
      ringSides--;

      // Play the current note
      playCurrentNote();

      // Create particles
      createParticles(ball.position);
    }
  } else {
    // Square collision logic
    let halfSide = ringRadius / sqrt(2);
    if (ball.position.x - ball.radius < width / 2 - halfSide || ball.position.x + ball.radius > width / 2 + halfSide) {
      ball.speed.x *= -1;
      ball.position.x = constrain(ball.position.x, width / 2 - halfSide + ball.radius, width / 2 + halfSide - ball.radius);
      // Increase the ball size on collision
      ball.radius += 1;

      // Play the current note
      playCurrentNote();

      // Create particles
      createParticles(ball.position);
    }
    if (ball.position.y - ball.radius < height / 2 - halfSide || ball.position.y + ball.radius > height / 2 + halfSide) {
      ball.speed.y *= -1;
      ball.position.y = constrain(ball.position.y, height / 2 - halfSide + ball.radius, height / 2 + halfSide - ball.radius);
      // Increase the ball size on collision
      ball.radius += 1;

      // Play the current note
      playCurrentNote();

      // Create particles
      createParticles(ball.position);
    }

    // Transform the ball closer to a square
    ball.isSquare = true;
  }

  // Draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();
    if (p.isFinished()) {
      particles.splice(i, 1);
    }
  }
}

// Function to draw a polygon with a given number of sides
function drawPolygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  let startAngle = npoints % 4 == 0 ? PI / 4 : 0; // Rotate to correct orientation for a square
  beginShape();
  for (let a = startAngle; a < TWO_PI + startAngle; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// Particle system
function createParticles(position) {
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(position.x, position.y));
  }
}

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(1, 3));
    this.lifespan = 255;
    this.color = colors[int(random(colors.length))];
  }

  update() {
    this.position.add(this.velocity);
    this.lifespan -= 5;
  }

  display() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.lifespan);
    ellipse(this.position.x, this.position.y, 8);
  }

  isFinished() {
    return this.lifespan < 0;
  }
}

// Function to play the current note
function playCurrentNote() {
  let note = notes[currentNoteIndex];
  let freq = noteFrequencies[note];
  osc.freq(freq);
  osc.amp(0.5, 0.05);
  osc.amp(0, 0.2);
  
  currentNoteIndex = (currentNoteIndex + 1) % notes.length;
}
