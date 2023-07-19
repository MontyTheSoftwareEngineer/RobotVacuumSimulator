let cols,rows, maxIndex;
const cellWidth = 12;
let grid = [];
let rooms = []

let currentState = "creatingRooms"
let roomA, roomB;

/**
 * @brief Helper function that calculates the index of a 2D array element based 
 * on its row and column position.
 *
 * @param i The row index of the element (starting from 0).
 * @param j The column index of the element (starting from 0).
 * @return The index of the element if i and j are within valid bounds, otherwise -1.
 */
function index(i, j) {
  if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
    return -1;
  }
  return i + j * cols;
}

function setup() {

  //setup canvas to fill screen
  createCanvas(windowWidth, windowHeight );

  //cols and rows depend on canvas size
  cols = floor(width/cellWidth);
  rows = floor(height/cellWidth);

  //create all cell objects representing game map
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let cell = new Cell(i, j, cellWidth);
      grid.push(cell);
    }
  }

  //calculates max index a cell can be. Anything outside of this is outside the game map.
  maxIndex = rows*cols
}


//for future use
function mouseClicked() {

  // Calculate the cell coordinates based on the mouse position
  let cellX = Math.floor(mouseX / cellWidth);
  let cellY = Math.floor(mouseY / cellWidth);
  
  // Get the index of the clicked cell in the grid
  let cellIndex = index(cellX, cellY);
  
  // Access the cell object from the grid array
  let clickedCell = grid[cellIndex];

  
  let newR = Math.floor( random( 0, 255 ) )
  let newB = Math.floor( random( 0, 255 ) )
  let newG = Math.floor( random( 0, 255 ) )

  clickedCell.setRGB( newR, newG, newB)

}

/**
 * @brief Helper function that creates a random room and adds it to rooms array.
 * We return at the end of this in order to give the game a more step-through animation look.
 */
function MakeRandomRoom() {
  let roomWidth = Math.floor( random( 12, 20 ) );
  let roomHeight = Math.floor( random( 12, 20 ) );

  let roomX = Math.floor( cols / 2 );
  let roomY = Math.floor( rows / 2 );

  
  let newR = Math.floor( random( 0, 255 ) )
  let newB = Math.floor( random( 0, 255 ) )
  let newG = Math.floor( random( 0, 255 ) )

  let room = new Room( rooms.length + 1, roomX, roomY, roomWidth, roomHeight, cellWidth, maxIndex, newR, newG, newB );
  room.fillCells()

  rooms.push( room );
  return;
}

/**
 * @brief Helper function that checks if two rooms collide.
 * 
 * @param firstRoom The first room object to check for collision.
 * @param secondRoom The second room object to check for collision.
 * @return Returns true if there is a collision between the two rooms, else returns false.
 */
function checkRoomCollision( firstRoom, secondRoom ) {
  for ( let cellIndex = 0; cellIndex < firstRoom.cells.length; cellIndex++ ) {

    let cell = grid[ firstRoom.cells[ cellIndex ] ]

    if ( secondRoom.checkHasCell( firstRoom.cells[cellIndex] ) ) {
      return true;
    }
  }

  return false;
}

/**
 * @brief Separates the rooms to ensure they do not collide with each other.
 * We return at the end of this in order to give the game a more step-through animation look.
 * 
 * @note if no rooms collide, set the state machine to the next state, which is labeling the rooms.
 */
function separateRooms() {
  for ( let roomIndex = 0; roomIndex < rooms.length - 1; roomIndex++ ) {
    roomA = rooms[roomIndex];
    for ( let nextRoomIndex = roomIndex + 1; nextRoomIndex < rooms.length; nextRoomIndex++ )
    {
      roomB = rooms[nextRoomIndex];
      if ( checkRoomCollision( roomA, roomB ) )
      {
        currentState = "separatingRooms"
        return;
      }
    }
  }

  currentState = "labelRooms";
}

/**
 * @brief Call each rooms label function in order to draw their labels.
 */
function labelRooms() {
  for( let roomIndex = 0; roomIndex < rooms.length; roomIndex++ )
  {
    rooms[roomIndex].labelRoom()
  }
}


function draw() {
  background(220);
  frameRate(15)

  //draw all cells in the game.
  for ( let cell = 0; cell < grid.length; cell++ ) {
    grid[cell].display();
  }

  //state machine
  switch( currentState ) {
    case "creatingRooms":
    {
      MakeRandomRoom();
      if ( rooms.length >= 4 )
        currentState = "findCollidingRooms"
        
      break;
    }
    case "findCollidingRooms": {
      separateRooms();
      break;
    }
    case "separatingRooms": {

      roomA.shift()
      for( let roomCount = 0; roomCount < rooms.length; roomCount++ )
      {
        rooms[roomCount].fillCells()
      }
      if ( !checkRoomCollision( roomA, roomB ) ) {
        roomA.finishShift()
        roomA = null;
        roomB = null;
        currentState = "findCollidingRooms"
      }

      break;
    }
    case "labelRooms": {
      labelRooms();
    }

  }


}