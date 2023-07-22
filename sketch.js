let cols, rows, maxIndex;
const cellWidth = 15;
const roomCount = 4;
const cameraMan = new CameraMan();
let grid = [];
let rooms = [];

let currentState = "creatingRooms";
let roomA, roomB;

let currentCanvasWidth, currentCanvasHeight;

function setup() {
  //setup canvas to fill screen
  createCanvas(windowWidth, windowHeight);
  currentCanvasWidth = windowWidth;
  currentCanvasHeight = windowHeight;

  //cols and rows depend on canvas size
  cols = floor(currentCanvasWidth / cellWidth);
  rows = floor(currentCanvasHeight / cellWidth);

  console.log("Cols: ", cols, " Rows: ", rows);

  //create all cell objects representing game map
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let cell = new Cell(i, j, cellWidth);
      grid.push(cell);
    }
  }

  //calculates max index a cell can be. Anything outside of this is outside the game map.
  maxIndex = rows * cols;
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
}

function keyReleased() {
  if (key === "w" || key === "s") cameraMan.stopMoving(Direction.UP);
  if (key === "a" || key === "d") cameraMan.stopMoving(Direction.RIGHT);
}

// //for future use
// function mouseClicked() {
//   // Calculate the cell coordinates based on the mouse position
//   let cellX = Math.floor(mouseX / cellWidth);
//   let cellY = Math.floor(mouseY / cellWidth);

//   // Get the index of the clicked cell in the grid
//   let cellIndex = index(cellX, cellY);

//   // Access the cell object from the grid array
//   let clickedCell = grid[cellIndex];

//   let newR = Math.floor(random(0, 255));
//   let newB = Math.floor(random(0, 255));
//   let newG = Math.floor(random(0, 255));

//   clickedCell.setRGB(newR, newG, newB);
// }

function draw() {
  background(100, 100, 100, 100);
  frameRate(30);

  cameraMan.newGameTick();

  //draw all cells in the game.
  grid.forEach((cell) => {
    cell.display();
  });

  //state machine
  switch (currentState) {
    case "creatingRooms": {
      MakeRandomRoom();
      if (rooms.length >= roomCount) currentState = "findCollidingRooms";
      break;
    }
    case "findCollidingRooms": {
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

  rooms.forEach((room) => {
    room.labelRoom();
  });
}
