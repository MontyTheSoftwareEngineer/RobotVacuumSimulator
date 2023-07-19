let cols,rows, maxIndex;
const cellWidth = 12;
let grid = [];
let rooms = []

let currentState = "creatingRooms"
let roomA, roomB;

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

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let cell = new Cell(i, j, cellWidth);
      grid.push(cell);
    }
  }

  maxIndex = rows*cols
}

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


function mrr() {
  let roomWidth = Math.floor( random( 12, 20 ) );
  let roomHeight = Math.floor( random( 12, 20 ) );

  let roomX = Math.floor( cols / 2 );
  let roomY = Math.floor( rows / 2 );

  
  let newR = Math.floor( random( 0, 255 ) )
  let newB = Math.floor( random( 0, 255 ) )
  let newG = Math.floor( random( 0, 255 ) )

  let room = new Room( roomX, roomY, roomWidth, roomHeight, maxIndex, newR, newG, newB );
  room.fillCells()

  rooms.push( room );
  return;
}

function checkRoomCollision( firstRoom, secondRoom ) {
  for ( let cellIndex = 0; cellIndex < firstRoom.cells.length; cellIndex++ ) {

    let cell = grid[ firstRoom.cells[ cellIndex ] ]

    if ( secondRoom.checkHasCell( firstRoom.cells[cellIndex] ) ) {
      return true;
    }
  }

  return false;
}

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
}


function draw() {
  background(220);
  frameRate(15)

  switch( currentState ) {
    case "creatingRooms":
    {
      mrr();
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
        currentState = "findCollidingRooms"
      }

      break;
    }

  }

  for ( let cell = 0; cell < grid.length; cell++ ) {
    grid[cell].display();
  }
}