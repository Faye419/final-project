/**
 * Gesture Control Spacecraft
 * In this thrilling game, you will take control of a spacecraft and navigate through a treacherous asteroid field. 
 * But here's the catch - you'll be using your hand gestures to control the spacecraft! 
 * Dodge and weave through the asteroids by swiping left and right. 
 * !!! Reference: https://openprocessing.org/sketch/1772196
 **/

var bgPG;
var stars = []; // Array for storing stars
var asteroids = []; 
var numAsteroids; // Number of asteroids
var gameLevel;  //levels in the game
var spacecraft; 
var asteroidColors = ["#FF9F1C", "#E71D36", "#2EC4B6"];
var handpose;
var video;  // The camera
var hands = [];
var scale;  // Enlarge the camera image to the canvas
var direction = 0;

function setup() {
  createCanvas(1280, 800);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  bgPG = createGraphics(width, height);
  video = createCapture(VIDEO, 640, 480);
  handpose = ml5.handpose(video, modelReady);
  scale = max(width / 640, height / 480);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  handpose.on("hand", results => {
    hands = results;
  });

  video.hide();

  // Initialize the array of stars.
  for (var i = 0; i < 800; i++) {
    stars[i] = new Star();
  }

  let button = createButton('Impossible? Click Me');
  button.position(width - 280, height - 42);
  button.mousePressed(restart);
  restart();
}
function draw() {
  drawStarryBG();

  // Display all asteroids and detect collisions.
  for (let i = 0; i < asteroids.length; i++) {
    asteroids[i].display();
    asteroids[i].checkForCollisions();
  }

  // Control the movement of the aircraft and display it.
  spacecraft.moveUp();
  spacecraft.display();
  drawArrow();
  showBoundaries();
  showLevel();
}
function modelReady() {
  console.log("Model ready!");
}

//Draw the pointing arrow. 
function drawArrow() {
  if (hands.length > 0) {
    const hand = hands[0];
    const keypoint = hand.landmarks[8]; // The tip of the index finger
    const keypoint1 = hand.landmarks[5];  // The root of the index finger
    push();
    noStroke();
    let x1 = 640 * scale - keypoint[0] * scale;
    let y1 = 640 * scale - keypoint[1] * scale;
    let x2 = 640 * scale - keypoint1[0] * scale;
    let y2 = 640 * scale - keypoint1[1] * scale;

    // Adjustment direction
    direction = atan((y1 - y2) / (x1 - x2));

    if (keypoint1[0] <= keypoint[0]) {
      direction += PI / 2;
    } else {
      direction -= PI / 2;
    }
    direction = - direction;

    // Draw the pointing arrow
    translate(640 * scale - keypoint[0] * scale, keypoint[1] * scale);
    rotate(direction);
    fill("#ff006e");
    triangle(-15, 0, 0, -30, 15, 0);
    rect(-7, 0, 14, 70);
    pop();
    if (!spacecraft.autoMove) {
      spacecraft.autoMove = true;
    }
    spacecraft.angle = direction;
  }
}

//Draw background. 
function drawStarryBG() {
  bgPG.background(0, 30);
  bgPG.push();
  bgPG.translate(width / 2, height / 2);
  for (let i = 0; i < stars.length; i++) {
    stars[i].display();
  }
  bgPG.pop();
  image(bgPG, 0, 0, width, height);
}

//Restart
function restart() {
  loop();
  numAsteroids = 6;
  gameLevel = 1;
  spacecraft = new Spacecraft(width / 2, height - 80);
  generateAsteroids();
}

// Generating some random asteroids. 
function generateAsteroids() {
  spacecraft.reset();
  for (let i = 0; i < numAsteroids; i++) {
    asteroids[i] = new Asteroid(random(50, width - 50), i * (height - 200) / numAsteroids);
  }
}

//boundaries. 
function showBoundaries() {
  push();
  noStroke();
  fill(221, 67, 24);
  rect(0, 0, 10, height);
  rect(width - 10, 0, 10, height);
  rect(0, height - 10, width, 10);
  pop();
}

//Game level to be displayed. 
function showLevel() {
  push();
  fill(0, 0, 100);
  textAlign(RIGHT, CENTER);
  textSize(24);
  text("LEVEL: " + gameLevel, width - 30, height - 30);
  pop();
}

function showLoseText() {
  push();
  textAlign(CENTER, CENTER);
  textSize(48);
  noStroke();
  fill(359, 76, 90);
  text("U LOST", width / 2, height / 2);
  pop();
}

class Star {
  constructor() {
    // The position of this star
    this.x = random(-width / 2, width / 2);
    this.y = random(-height / 2, height / 2);
    this.z = random(width);

    this.speed = random(2, 10);  // The speed 
    this.col = color(0, 0, 100, random(50, 100));   // The color
  }
  update() {
    this.z -= this.speed;
    if (this.z < 1) {
      this.z = width;
      this.x = random(-width / 2, width / 2);
      this.y = random(-height / 2, height / 2);
    }
  }
  display() {
    this.update();
    bgPG.noStroke();
    bgPG.fill(this.col);
    let sx = map(this.x / this.z, 0, 1, 0, width);
    let sy = map(this.y / this.z, 0, 1, 0, height);
    let r = map(this.z, 0, width, 6, 0);
    bgPG.circle(sx, sy, r);
  }
}

//About spacecraft: Reference: https://openprocessing.org/sketch/1772196
class Spacecraft {
  constructor(sx, sy) {
    this.startX = sx;
    this.startY = sy;
    this.maxSpeed = 10;
    this.autoMove = false;
    this.reset();
  }
  
  reset() {
    this.y = this.startY;
    this.speed = 0;
    if (this.autoMove) this.speed = this.maxSpeed;
    this.angle = 0; 
    this.updateHitbox(this.startX, this.startY);
  }
  display() {
    fill(37, 93, 99);
    translate(this.x, this.y);
    rotate(this.angle);
    translate(-492, -720);
    noStroke();
    triangle(492, 707, 542, 731, 442, 731);
    ellipse(492, 720, 15, 60);
    triangle(492, 743, 505, 752, 478, 752);
    resetMatrix();
    strokeWeight(4);
    stroke(221, 67, 24);
    for (let i = 0; i < 4; i++) {
      point(this.hitbox[i].x, this.hitbox[i].y);
    }
  }

  // Update collision detection box. 
  updateHitbox(newX, newY) {
    this.x = newX;
    this.y = newY;
    this.location = createVector(this.x, this.y);
    this.nose = createVector(0, -30);
    this.tail = createVector(0, 30);
    this.leftWing = createVector(-50, 11);
    this.rightWing = createVector(50, 11);
    this.hitbox = [this.nose, this.tail, this.leftWing, this.rightWing];

    for (let vect of this.hitbox) {
      vect.rotate(this.angle);
      vect.add(this.location);
    }
  }
  moveUp() {
    if (this.autoMove) {
      this.speed = this.maxSpeed;
    } else {
      this.speed = 0;
    }
    let testX = this.x + this.speed * sin(this.angle);
    let testY = this.y - this.speed * cos(this.angle);

    //Reference: https://openprocessing.org/sketch/1772196
    this.updateHitbox(testX, testY);
    this.checkForWalls();
    if (this.y < 0) {
      if (gameLevel == 3) {
        textAlign(CENTER, CENTER);
        textSize(48);
        noStroke();
        fill(174, 77, 77);
        text("You Win!!!", width / 2, height / 2);
        noLoop();
      } else {
        this.reset();
        numAsteroids += 2;
        generateAsteroids();
        gameLevel++;
      }
    }
  }
   // Use the p5.collide2D library
  checkForWalls() {
    for (let vect of this.hitbox) {
      if (vect.x < 0 || vect.x > width || vect.y > height) {
        showLoseText();
        noLoop();
        break;
      }
    }
  }
}
  //Reference: https://openprocessing.org/sketch/1772196
class Asteroid {
  constructor(sx, sy) {
    this.x = sx;
    this.y = sy;
    this.col = random(asteroidColors);

    this.diameter = random(60, 120);
    this.numHoles = random(10, 25);
    this.holeR = [];
    this.holeD = [];
    this.holeAngle = [];
    this.holeCol = [];

    for (let i = 0; i < this.numHoles; i++) {
      this.holeD[i] = random(0, 8);
      this.holeR[i] = random(this.holeD[i], (this.diameter - this.holeD[i]) / 2);
      this.holeAngle[i] = map(i, 0, this.numHoles, 0, 360);
      this.holeCol[i] = color(100, 1, 100, map(this.holeD[i], 0, 8, 40, 100));
    }
  }

  display() {
    noStroke();
    fill(this.col);
    circle(this.x, this.y, this.diameter);
    fill(100, 1, 100);
    for (let i = 0; i < this.numHoles; i++) {
      fill(this.holeCol[i]);
      circle(this.x + this.holeR[i] * cos(this.holeAngle[i]), this.y + this.holeR[i] * sin(this.holeAngle[i]), this.holeD[i]);
    }
  }
  checkForCollisions() {
    for (let vect of spacecraft.hitbox) {
      let hit = collidePointCircle(vect.x, vect.y, this.x, this.y, this.diameter);
      if (hit) {
        showLoseText();
        noLoop();
        this.speed = 0;
        break;
      }
    }
  }
}

