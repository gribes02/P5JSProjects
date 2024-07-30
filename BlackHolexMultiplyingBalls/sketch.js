let balls = [];
let particles = [];
let ringRadius;
let bounceFactor = 1; // No speed loss on bounce
let osc;
let gravity; // Gravity vector
let started = false; // To track if audio has started
let segmentDuration = 0.2; // Duration of each segment in seconds
let blackHole;
let blackHoleSpawned = false; // To track if the black hole has been spawned
let timer = 50; 

// Notes in Hz
let notes = [
  // ^E ^E ^E
  659.25, 659.25, 659.25, 
  // ^C ^E ^G G
  523.25, 659.25, 783.99, 783.99, 
  // ^C G E
  523.25, 392.00, 329.63, 
  // A B Bb A
  440.00, 493.88, 466.16, 440.00, 
  // G ^E ^G ^A
  392.00, 659.25, 783.99, 880.00, 
  // ^F ^G ^E ^C ^D B
  698.46, 783.99, 659.25, 523.25, 587.33, 493.88, 
  // ^C G E
  523.25, 392.00, 329.63, 
  // A B Bb A
  440.00, 493.88, 466.16, 440.00, 
  // G ^E ^G ^A
  392.00, 659.25, 783.99, 880.00, 
  // ^F ^G ^E ^C ^D B
  698.46, 783.99, 659.25, 523.25, 587.33, 493.88, 
  // ^G ^F# ^F ^D ^E
  783.99, 739.99, 698.46, 587.33, 659.25, 
  // G A ^C
  392.00, 440.00, 1046.50, 
  // A ^C ^D
  440.00, 1046.50, 587.33, 
  // ^G ^F# ^F ^D ^E
  783.99, 739.99, 698.46, 587.33, 659.25, 
  // *C *C *C
  261.63, 261.63, 261.63, 
  // ^G ^F# ^F ^D ^E
  783.99, 739.99, 698.46, 587.33, 659.25, 
  // G A ^C
  392.00, 440.00, 1046.50, 
  // A ^C ^D
  440.00, 1046.50, 587.33, 
  // ^D# ^D ^C
  622.25, 587.33, 523.25, 
  // ^C ^C ^C
  523.25, 523.25, 523.25, 
  // ^C ^D ^E ^C A G
  523.25, 587.33, 659.25, 523.25, 440.00, 392.00, 
  // ^C ^C ^C
  523.25, 523.25, 523.25, 
  // ^C ^D ^E
  523.25, 587.33, 659.25, 
  // ^C ^C ^C
  523.25, 523.25, 523.25, 
  // ^C ^D ^E ^C A G
  523.25, 587.33, 659.25, 523.25, 440.00, 392.00, 
  // ^E ^E ^E
  659.25, 659.25, 659.25, 
  // ^C ^E ^G
  523.25, 659.25, 783.99, 
  // G
  392.00, 
  // ^C G E
  523.25, 392.00, 329.63, 
  // A B Bb A
  440.00, 493.88, 466.16, 440.00, 
  // G ^E ^G ^A
  392.00, 659.25, 783.99, 880.00, 
  // ^F ^G ^E ^C ^D B
  698.46, 783.99, 659.25, 523.25, 587.33, 493.88, 
  // ^C G E
  523.25, 392.00, 329.63, 
  // A B Bb A
  440.00, 493.88, 466.16, 440.00, 
  // G ^E ^G ^A
  392.00, 659.25, 783.99, 880.00, 
  // ^F ^G ^E ^C ^D B
  698.46, 783.99, 659.25, 523.25, 587.33, 493.88, 
  // ^E-^C G
  659.25, 523.25, 392.00, 
  // G A ^F ^F A
  392.00, 440.00, 698.46, 698.46, 440.00, 
  // B ^A ^A ^A ^G ^F
  493.88, 880.00, 880.00, 880.00, 783.99, 698.46, 
  // ^E ^C A G
  659.25, 523.25, 440.00, 392.00, 
  // ^E-^C G
  659.25, 523.25, 392.00, 
  // G A ^F ^F A
  392.00, 440.00, 698.46, 698.46, 440.00, 
  // B ^F ^F ^F ^E ^D ^C
  493.88, 698.46, 698.46, 698.46, 659.25, 587.33, 523.25, 
  // G E C
  392.00, 329.63, 261.63, 
  // ^C G E
  523.25, 392.00, 329.63, 
  // A B A
  440.00, 493.88, 440.00, 
  // G# Bb G#
  415.30, 466.16, 415.30, 
  // G-F#-G
  392.00, 369.99, 392.00
];


let noteIndex = 0; // Current note index

function setup() {
  createCanvas(1200, 1200);
  ringRadius = width / 3;

  // Create the oscillator
  osc = new p5.Oscillator('sine');
  osc.start();
  osc.amp(0); // Start with zero amplitude

  // Initialize gravity
  gravity = createVector(0, 0.1); // Adjust gravity strength as needed

  // Create the initial ball
  createBall(width / 2, height / 2);

  // Create a black hole after 2 seconds
  setTimeout(createBlackHole, 2000);
}

function draw() {
  background(50); // Dark grey background

  // Update timer
  if (frameCount % 60 == 0 && timer > 0) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
    timer--;
  }
  // Draw the timer with transparency
  textSize(64);
  fill(255, 255, 255, 150); // White color with opacity
  textAlign(CENTER, CENTER);
  text(nf(timer, 2), width / 2, height / 2);

  // Stop animation if timer reaches 0
  if (timer <= 0) {
    noLoop(); // Stop the draw loop
    osc.amp(0, 0.1); // Fade out the 
  }

  // Draw the ring with glow
  noFill();
  stroke(255);
  strokeWeight(7);
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = color(255, 255, 0);
  ellipse(width / 2, height / 2, ringRadius * 2);

  // Update and draw balls
  drawingContext.shadowBlur = 15;
  for (let i = balls.length - 1; i >= 0; i--) {
    let ball = balls[i];
    
    // Update the ball's position
    ball.speed.add(gravity); // Apply gravity
    ball.position.add(ball.speed);

    // Draw the ball with glow
    fill(ball.color);
    noStroke();
    // drawingContext.shadowColor = ball.color;
    ellipse(ball.position.x, ball.position.y, ball.radius * 2);

    // Check for collisions with the walls and bounce
    if (ball.position.x - ball.radius < 0 || ball.position.x + ball.radius > width) {
      ball.speed.x *= -bounceFactor;
      ball.position.x = constrain(ball.position.x, ball.radius, width - ball.radius);
    }
    if (ball.position.y - ball.radius < 0 || ball.position.y + ball.radius > height) {
      ball.speed.y *= -bounceFactor;
      ball.position.y = constrain(ball.position.y, ball.radius, height - ball.radius);
    }

    // Check if the ball collides with the ring
    let distanceToCenter = dist(ball.position.x, ball.position.y, width / 2, height / 2);
    if (distanceToCenter + ball.radius >= ringRadius) {
      // Calculate the direction of the reflection
      let direction = p5.Vector.sub(ball.position, createVector(width / 2, height / 2)).normalize();
      let incidence = ball.speed.copy().normalize();
      let normal = direction.copy().normalize();
      let dotProduct = incidence.dot(normal);
      let reflection = p5.Vector.sub(incidence, p5.Vector.mult(normal, 2 * dotProduct));
      ball.speed = reflection.mult(ball.speed.mag());

      // Play the next note in the sequence
      playNextNote();

      // Adjust the ball's position to just outside the ring to prevent sticking
      let overlap = (distanceToCenter + ball.radius) - ringRadius;
      ball.position.add(direction.mult(-overlap));
      
      // Create a new ball upon collision with the ring
      createBall(ball.position.x, ball.position.y);

      // Create burst effect at the collision point
      createBurst(ball.position.x, ball.position.y);
    }

    // Check if the ball collides with the black hole
    if (blackHoleSpawned && dist(ball.position.x, ball.position.y, blackHole.position.x, blackHole.position.y) < ball.radius + blackHole.radius) {
      balls.splice(i, 1); // Remove the ball
      continue; // Skip the rest of the loop
    }
  }

  // Update and draw black hole if spawned
  if (blackHoleSpawned) {
    blackHole.speed.add(gravity); // Apply gravity
    blackHole.position.add(blackHole.speed);

    // Check for collisions with the walls and bounce
    if (blackHole.position.x - blackHole.radius < 0 || blackHole.position.x + blackHole.radius > width) {
      blackHole.speed.x *= -bounceFactor;
      blackHole.position.x = constrain(blackHole.position.x, blackHole.radius, width - blackHole.radius);
    }
    if (blackHole.position.y - blackHole.radius < 0 || blackHole.position.y + blackHole.radius > height) {
      blackHole.speed.y *= -bounceFactor;
      blackHole.position.y = constrain(blackHole.position.y, blackHole.radius, height - blackHole.radius);
    }

    // Check if the black hole collides with the ring
    let distanceToCenter = dist(blackHole.position.x, blackHole.position.y, width / 2, height / 2);
    if (distanceToCenter + blackHole.radius >= ringRadius) {
      // Calculate the direction of the reflection
      let direction = p5.Vector.sub(blackHole.position, createVector(width / 2, height / 2)).normalize();
      let incidence = blackHole.speed.copy().normalize();
      let normal = direction.copy().normalize();
      let dotProduct = incidence.dot(normal);
      let reflection = p5.Vector.sub(incidence, p5.Vector.mult(normal, 2 * dotProduct));
      blackHole.speed = reflection.mult(blackHole.speed.mag());
      blackHole.radius *= 1.1; // Increase the ball size upon collision

      // Play the next note in the sequence
      playNextNote();

      // Adjust the black hole's position to just outside the ring to prevent sticking
      let overlap = (distanceToCenter + blackHole.radius) - ringRadius;
      blackHole.position.add(direction.mult(-overlap));

      // Create burst effect at the collision point
      createBurst(blackHole.position.x, blackHole.position.y);
    }

    // Draw the black hole with glow
    noFill();
    stroke(255); // White stroke color for border
    strokeWeight(7); // Border thickness
    drawingContext.shadowBlur = 20; // Glow effect
    drawingContext.shadowColor = color(255, 255, 255); // White glow color
    ellipse(blackHole.position.x, blackHole.position.y, blackHole.radius * 2);

    fill(0);
    noStroke();
    drawingContext.shadowColor = color(0);
    ellipse(blackHole.position.x, blackHole.position.y, blackHole.radius * 2);
  }

  // Update and draw particles
  drawingContext.shadowBlur = 0;
  for (let i = particles.length - 1; i >= 0; i--) {
    let particle = particles[i];
    particle.update();
    particle.show();
    if (particle.isFinished()) {
      particles.splice(i, 1);
    }
  }
}

function createBall(pos_x, pos_y) {
  let ball = {
    position: createVector(width / 2, height / 2),
    speed: p5.Vector.random2D().mult(5),
    radius: random(10, 30), // Random size between 10 and 30
    color: color(random(255), random(255), random(255)) // Random color
  };
  balls.push(ball);
}

function createBlackHole() {
  blackHole = {
    position: createVector(width / 2, height / 2),
    speed: p5.Vector.random2D().mult(2),
    radius: 30
  };
  blackHoleSpawned = true;
}

function createBurst(x, y) {
  let numParticles = 10; // Fewer particles for the burst effect
  for (let i = 0; i < numParticles; i++) {
    let particle = new Particle(x, y);
    particles.push(particle);
  }
}

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(2, 5));
    this.lifespan = 255;
  }

  update() {
    this.position.add(this.velocity);
    this.lifespan -= 10;
  }

  show() {
    noStroke();
    fill(255, this.lifespan);
    ellipse(this.position.x, this.position.y, 2);
  }

  isFinished() {
    return this.lifespan < 0;
  }
}

function playNextNote() {
  if (noteIndex >= notes.length) {
    noteIndex = 0; // Restart from the beginning if we reach the end of the notes
  }

  let frequency = notes[noteIndex];
  osc.freq(frequency);
  osc.amp(0.5, 0.05); // Ramp up amplitude
  setTimeout(() => {
    osc.amp(0, 0.1); // Ramp down amplitude after 0.2 seconds
  }, segmentDuration * 1000);

  noteIndex++;
}

function mousePressed() {
  if (!started) {
    osc.start();
    started = true;
  }
}
