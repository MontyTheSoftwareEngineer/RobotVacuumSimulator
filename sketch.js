let roboImg;
const gameStateManager = new GameStateManager();

function preload() {
  roboImg = loadImage("assets/robo.png");
}

function setup() {
  gameStateManager.robotVacuum.setImage(roboImg);
  //setup canvas to fill screen
  createCanvas(
    gameStateManager.currentCanvasWidth,
    gameStateManager.currentCanvasHeight
  );
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    gameStateManager.cameraMan.startMoving(Direction.UP);
  } else if (keyCode === LEFT_ARROW) {
    gameStateManager.cameraMan.startMoving(Direction.LEFT);
  } else if (keyCode === DOWN_ARROW) {
    gameStateManager.cameraMan.startMoving(Direction.DOWN);
  } else if (keyCode === RIGHT_ARROW) {
    gameStateManager.cameraMan.startMoving(Direction.RIGHT);
  }

  if (gameStateManager.robotVacuum.placed) {
    if (key === "w") {
      gameStateManager.robotVacuum.setSpeed(-1);
    }
    if (key === "s") {
      gameStateManager.robotVacuum.setSpeed(1);
    }
    if (key === "a") {
      gameStateManager.robotVacuum.setRotation(-0.1);
    }
    if (key === "d") {
      gameStateManager.robotVacuum.setRotation(0.1);
    }
  }
}

function keyReleased() {
  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    gameStateManager.cameraMan.stopMoving(Direction.UP);
  }
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    gameStateManager.cameraMan.stopMoving(Direction.RIGHT);
  }

  if (gameStateManager.robotVacuum.placed) {
    if (key === "w" || key === "s") {
      gameStateManager.robotVacuum.setSpeed(0);
    }

    if (key === "a" || key === "d") {
      gameStateManager.robotVacuum.setRotation(0);
    }
  }
}

// //for future use
function mouseClicked() {
  console.log("MOUSE CLICK");
  // Calculate the cell coordinates based on the mouse position
  let cellX = Math.floor(
    ((mouseX + gameStateManager.cameraMan.x) / gameStateManager.cellWidth) *
      gameStateManager.cellWidth
  );
  let cellY = Math.floor(
    ((mouseY + gameStateManager.cameraMan.y) / gameStateManager.cellWidth) *
      gameStateManager.cellWidth
  );
  gameStateManager.robotVacuum.x = cellX;
  gameStateManager.robotVacuum.y = cellY;
  gameStateManager.robotVacuum.placed = true;
}

function draw() {
  clear();
  background(100, 100, 100, 100);
  frameRate(30);
  gameStateManager.newGameTick();
}
