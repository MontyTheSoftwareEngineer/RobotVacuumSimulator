let cols, rows;
const cellWidth = 42;
const roomCount = 6;
const cameraMan = new CameraMan();
const gameMap = new GameMap();
let rooms = [];
let roboImg;
let currentState = "creatingRooms";
let roomA, roomB;
const robotVacuum = new RobotVacuum();

let currentCanvasWidth, currentCanvasHeight;

function preload() {
  roboImg = loadImage("assets/robo.png");
}

function setup() {
  robotVacuum.setImage(roboImg);
  //setup canvas to fill screen
  createCanvas(windowWidth, windowHeight);
  currentCanvasWidth = windowWidth;
  currentCanvasHeight = windowHeight;

  //cols and rows depend on canvas size
  cols = floor(currentCanvasWidth / cellWidth);
  rows = floor(currentCanvasHeight / cellWidth);

  console.log("Cols: ", cols, " Rows: ", rows);
}

function keyPressed() {
  if (key === "w") {
    cameraMan.startMoving(Direction.UP);
  } else if (key === "a") {
    cameraMan.startMoving(Direction.LEFT);
  } else if (key === "s") {
    cameraMan.startMoving(Direction.DOWN);
  } else if (key === "d") {
    cameraMan.startMoving(Direction.RIGHT);
  }

  if (keyCode === UP_ARROW) {
    robotVacuum.setSpeed(-2);
  }
  if (keyCode === DOWN_ARROW) {
    robotVacuum.setSpeed(2);
  }
  if (keyCode === LEFT_ARROW) {
    robotVacuum.setRotation(-0.1);
  }
  if (keyCode === RIGHT_ARROW) {
    robotVacuum.setRotation(0.1);
  }
}

function keyReleased() {
  if (key === "w" || key === "s") cameraMan.stopMoving(Direction.UP);
  if (key === "a" || key === "d") cameraMan.stopMoving(Direction.RIGHT);
  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    robotVacuum.setSpeed(0);
  }

  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    robotVacuum.setRotation(0);
  }
}

// //for future use
function mouseClicked() {
  // Calculate the cell coordinates based on the mouse position
  let cellX =
    Math.floor(((mouseX + cameraMan.x) / cellWidth) * cellWidth) -
    cellWidth / 2;
  let cellY =
    Math.floor(((mouseY + cameraMan.y) / cellWidth) * cellWidth) -
    cellWidth / 2;

  robotVacuum.x = cellX;
  robotVacuum.y = cellY;

  // let cellX = Math.floor((mouseX + cameraMan.x) / cellWidth);
  // let cellY = Math.floor((mouseY + cameraMan.y) / cellWidth);
  // // Get the index of the clicked cell in the grid
  // let cellIndex = index(cellX, cellY);

  // // Access the cell object from the grid array
  // let clickedCell = gameMap.grid.get(cellIndex);
  // if (clickedCell === undefined) return;

  // let newR = Math.floor(random(0, 255));
  // let newB = Math.floor(random(0, 255));
  // let newG = Math.floor(random(0, 255));

  // clickedCell.setRGB(newR, newG, newB);
}

function draw() {
  background(100, 100, 100, 100);
  frameRate(30);

  cameraMan.newGameTick();

  //draw all cells in the game.
  //gameMap.showMap();

  //state machine
  switch (currentState) {
    case "creatingRooms": {
      MakeRandomRoom();
      if (rooms.length >= roomCount) currentState = "resizeGrid";
      break;
    }
    case "resizeGrid": {
      reSizeGrid();
      break;
    }
    case "findCollidingRooms": {
      console.log("findColldingRooms");
      separateRooms();
      break;
    }
    case "separatingRooms": {
      while (checkRoomCollision(roomA, roomB)) {
        roomA.shift();
      }
      for (let roomCount = 0; roomCount < rooms.length; roomCount++) {
        rooms[roomCount].fillCells();
      }
      if (!checkRoomCollision(roomA, roomB)) {
        roomA.finishShift();
        roomA = null;
        roomB = null;
        currentState = "findCollidingRooms";
      }

      break;
    }
    case "checkOrphanedRooms": {
      checkOrphanedRooms();
      break;
    }
    case "checkIslands": {
      checkIslands();
      break;
    }
    case "centerRooms": {
      centerMap();
      break;
    }
    case "createWallsAndDoors": {
      createWallsAndDoors();
      break;
    }
  }
  //draw all cells in the game.
  gameMap.showMap();

  rooms.forEach((room) => {
    room.labelRoom();
  });

  robotVacuum.display();
}
