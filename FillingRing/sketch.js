let imgDeadpool;
let ball;
let maskLayer;
let canvasWidth = 1000;
let canvasHeight = 1000;
let ballRadius = 10;

function preload() {
  imgDeadpool = loadImage('deadpool.png');
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  ball = new Ball(width / 2, height / 2, ballRadius);
  maskLayer = createGraphics(canvasWidth, canvasHeight);
}

function draw() {
  background(50);

  // Draw the ring (ellipse) that fits the canvas
  noFill();
  stroke(255);
  strokeWeight(7);
  ellipse(width / 2, height / 2, width - 50, height - 50);

  // Clear the mask layer and draw the ball's trail
  maskLayer.clear();
  maskLayer.fill(255);
  maskLayer.ellipse(ball.pos.x, ball.pos.y, ballRadius * 2);

  // Apply the mask to a new image
  let maskedImage = createImage(imgDeadpool.width, imgDeadpool.height);
  maskedImage.copy(imgDeadpool, 0, 0, imgDeadpool.width, imgDeadpool.height, 0, 0, imgDeadpool.width, imgDeadpool.height);
  maskedImage.mask(maskLayer);

  // Draw the masked image on the canvas
  imageMode(CENTER);
  image(maskedImage, width / 2, height / 2, width, height);

  // Update and draw the ball
  ball.update();
  ball.display();
}

class Ball {
  constructor(x, y, ballRadius) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(2); // Initial random direction
    this.ballRadius = ballRadius;
  }

  update() {
    this.pos.add(this.vel);

    // Calculate the distance from the ball's center to the canvas center
    let distFromCenter = dist(this.pos.x, this.pos.y, width / 2, height / 2);
    let ringRadius = min(width, height) / 2 - 25; // The ring radius based on canvas dimensions

    if (distFromCenter > ringRadius - this.ballRadius) {
      // Calculate the normal vector at the point of collision
      let normal = p5.Vector.sub(this.pos, createVector(width / 2, height / 2)).normalize();

      // Calculate the distance the ball is outside the ring
      let excess = distFromCenter - (ringRadius - this.ballRadius);
      
      // Move the ball back inside the ring
      this.pos = p5.Vector.sub(this.pos, normal.mult(excess + 1)); // Slightly move it inside to ensure it's not stuck

      // Reflect the ball's velocity
      this.vel.reflect(normal);
    }
  }

  display() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.ballRadius * 2);
  }
}
