/**
 * @file room_helper_functions.js
 *
 * @brief Various helper functions for rooms
 *
 * @author Hai Pham
 */

/**
 * @brief Helper function that creates a random room and adds it to rooms array.
 * We return at the end of this in order to give the game a more step-through animation look.
 */
function MakeRandomRoom() {
  let roomWidth = Math.floor(random(12, 20));
  let roomHeight = Math.floor(random(12, 20));

  let roomX = Math.floor(cols / 2);
  let roomY = Math.floor(rows / 2);

  let newR = Math.floor(random(0, 255));
  let newB = Math.floor(random(0, 255));
  let newG = Math.floor(random(0, 255));

  let room = new Room(
    rooms.length + 1,
    roomX,
    roomY,
    roomWidth,
    roomHeight,
    cellWidth,
    newR,
    newG,
    newB
  );
  room.fillCells();

  rooms.push(room);
  return;
}

/**
 * @brief Determine how the cols/rows need to be resized depending on
 * theoretical max rows/max cols.
 */
function reSizeGrid() {
  let maxCols, maxRows;

  rooms.forEach((room) => {
    maxCols += room.width;
    maxRows += room.rows;
  });

  //how much to increase X
  let xPansion = maxCols - cols;
  let newCanvasWidth = cols * cellWidth;
  //how much to increase y
  let yPansion = maxRows - rows;
  let newCanvasHeight = rows * cellWidth;

  changeCanvasSize(newCanvasWidth, newCanvasHeight);

  currentState = "findCollidingRooms";
}

/**
 * @brief Call each rooms label function in order to draw their labels.
 */
function labelRooms() {
  for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
    rooms[roomIndex].labelRoom();
  }
}

/**
 * @brief Helper function that checks if two rooms collide.
 *
 * @param firstRoom The first room object to check for collision.
 * @param secondRoom The second room object to check for collision.
 * @return Returns true if there is a collision between the two rooms, else returns false.
 */
function checkRoomCollision(firstRoom, secondRoom) {
  for (let cellIndex = 0; cellIndex < firstRoom.cells.length; cellIndex++) {
    if (secondRoom.checkHasCell(firstRoom.cells[cellIndex])) {
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
  for (let roomIndex = 0; roomIndex < rooms.length - 1; roomIndex++) {
    roomA = rooms[roomIndex];
    for (
      let nextRoomIndex = roomIndex + 1;
      nextRoomIndex < rooms.length;
      nextRoomIndex++
    ) {
      roomB = rooms[nextRoomIndex];
      if (checkRoomCollision(roomA, roomB)) {
        currentState = "separatingRooms";
        return;
      }
    }
  }

  currentState = "checkOrphanedRooms";
}

/**
 * @brief Check if there's any rooms that are isolated and have no neighboring rooms. If so teleport that room
 * back into another room and set state back to separating
 */
function checkOrphanedRooms() {
  for (let roomCount = 0; roomCount < rooms.length; roomCount++) {
    let roomEdges = rooms[roomCount].getRimCells();
    let neighboringCells = [];
    for (let edgeCount = 0; edgeCount < roomEdges.length; edgeCount++) {
      neighboringCells = neighboringCells.concat(
        getNeighboringCellIndexes(roomEdges[edgeCount])
      );
    }

    let hasNeighbor = false;
    for (
      let otherRoomCount = 0;
      otherRoomCount < rooms.length;
      otherRoomCount++
    ) {
      //console.log("Checking against: ", rooms[otherRoomCount].roomIndex);
      if (otherRoomCount !== roomCount && rooms[otherRoomCount]) {
        let otherRoomEdges = rooms[otherRoomCount].getRimCells();
        hasNeighbor = neighboringCells.some((element) =>
          otherRoomEdges.includes(element)
        );

        if (hasNeighbor) {
          break;
        }
      }
    }

    if (!hasNeighbor) {
      console.log("Found orphaned room: ", rooms[roomCount].roomIndex);
      if (rooms[roomCount].roomIndex !== 1) {
        rooms[roomCount].teleportRoom(rooms[0].x, rooms[0].y);
      } else {
        rooms[roomCount].teleportRoom(rooms[1].x, rooms[1].y);
      }
      currentState = "separatingRooms";
      return;
    }
  }

  console.log("No orphaned rooms!");
  currentState = "checkIslands";
}

/**
 * @brief Check if there are any separated island clusters.
 *
 * This is essentially a BFS algorithm to determine whether there are any island "clusters".
 * We want all the rooms to be connected, so by starting at room index 0, if we keep visiting all neighbor nodes
 * and their subsequent neighbor nodes, all rooms in the game map should be visited. If at the end of traversing through
 * node room index 0 we have any rooms left in "unvisited" rooms, then those unvisited rooms are in an unconnected cluster.
 */
function checkIslands() {
  let unvisitedRooms = []; // array to track which rooms we've seen so far
  let nextRoomsToCheck = []; // stack/array to track next nodes

  for (let roomCount = 0; roomCount < rooms.length; roomCount++) {
    unvisitedRooms.push(roomCount);
  }
  console.log("Checking for islands, rooms in map: ", unvisitedRooms);

  //start at node room index 0
  nextRoomsToCheck.push(0);

  //keep going until the nextRoomsToCheck stack is empty
  while (nextRoomsToCheck.length > 0) {
    let currentCheckingRoom = nextRoomsToCheck[0];

    console.log("Checking room: ", rooms[currentCheckingRoom].roomIndex);

    unvisitedRooms.splice(unvisitedRooms.indexOf(currentCheckingRoom), 1);
    nextRoomsToCheck.splice(0, 1);
    console.log("rooms left:", unvisitedRooms);
    console.log("rooms in check queue:", nextRoomsToCheck);

    //get all edges of current room and then populate neighboringCells with all cells
    //that would be considered neighbors based off the edges.
    let roomEdges = rooms[currentCheckingRoom].getRimCells();
    let neighboringCells = [];
    for (let edgeCount = 0; edgeCount < roomEdges.length; edgeCount++) {
      neighboringCells = neighboringCells.concat(
        getNeighboringCellIndexes(roomEdges[edgeCount])
      );
    }

    let hasNeighbor = false;
    //search all rooms in room map to see if they're a neighbor
    for (
      let otherRoomCount = 0;
      otherRoomCount < rooms.length;
      otherRoomCount++
    ) {
      if (
        otherRoomCount !== currentCheckingRoom && //don't check the current room to see if it's a neighbor of itself
        unvisitedRooms.includes(otherRoomCount) //don't check rooms if it's already been seen before
      ) {
        let otherRoomEdges = rooms[otherRoomCount].getRimCells();
        hasNeighbor = neighboringCells.some((element) =>
          otherRoomEdges.includes(element)
        );

        if (
          hasNeighbor && //this check room is considered a neighbor of current room
          !nextRoomsToCheck.includes(otherRoomCount) && //don't need to put the room onto checkStack if it's already there
          unvisitedRooms.includes(otherRoomCount) //don't need to add room onto checkStack if we've already visited the room
        ) {
          console.log("Found neighbor: ", rooms[otherRoomCount].roomIndex);
          nextRoomsToCheck.push(otherRoomCount);
          console.log("Next rooms to check: ", nextRoomsToCheck);
        }
      }
    }
  }

  //Any rooms left here are island clusters. Teleport them and go back to separating rooms.
  if (unvisitedRooms.length > 0) {
    for (let roomCount = 0; roomCount < unvisitedRooms.length; roomCount++) {
      //we should be able to teleport island cluster rooms to room 0 coords since
      //room 0 is our starting check room and should always be considered "safe"
      rooms[unvisitedRooms[roomCount]].teleportRoom(rooms[0].x, rooms[0].y);

      currentState = "separatingRooms";
    }
  } else {
    console.log("No island clusters found!");
    //currentState = "pause";
    currentState = "centerRooms";
  }
}

function changeCanvasSize(newCanvasWidth, newCanvasHeight) {
  //resizeCanvas(newCanvasWidth, newCanvasHeight);
  cols = Math.floor(newCanvasWidth / cellWidth);
  rows = Math.floor(newCanvasHeight / cellWidth);
  currentCanvasHeight = newCanvasHeight;
  currentCanvasWidth = newCanvasWidth;

  rooms.forEach((room) => {
    room.clearCells();
    room.fillCells();
  });
}

/**
 * @brief Centers the map onto screen
 *
 */
function centerMap() {
  let leftMost = Infinity;
  let rightMost = 0;
  let topMost = Infinity;
  let bottMost = 0;

  //find left,right, top, bot bounds of map
  for (let roomCount = 0; roomCount < rooms.length; roomCount++) {
    if (rooms[roomCount].x < leftMost) leftMost = rooms[roomCount].x;

    if (rooms[roomCount].x + rooms[roomCount].width > rightMost)
      rightMost = rooms[roomCount].x + rooms[roomCount].width;

    if (rooms[roomCount].y + rooms[roomCount].height > bottMost)
      bottMost = rooms[roomCount].y + rooms[roomCount].height;

    if (rooms[roomCount].y < topMost) topMost = rooms[roomCount].y;
  }

  console.log("Canvas:", cols, rows);
  console.log("Centering map", leftMost, rightMost, topMost, bottMost);

  let mapWidth = rightMost - leftMost;
  console.log("Map width: ", mapWidth);
  let mapHeight = bottMost - topMost;
  console.log("Map Height: ", mapHeight);
  let nominalXStart, nominalYStart;

  //calculate where the left most *should* start
  if (mapWidth < cols) {
    nominalXStart = Math.floor((cols - mapWidth) / 2);
    console.log("nominalXStart: ", nominalXStart);
  } else {
    nominalXStart = 0;
    let xPansion = mapWidth - cols;
    cols += xPansion;
    let newCanvasWidth = cols * cellWidth;
    changeCanvasSize(newCanvasWidth, currentCanvasHeight);
  }

  //calculate where the topb most *should* start
  if (mapHeight < rows) {
    nominalYStart = Math.floor((rows - mapHeight) / 2);
    console.log("nominalYStart: ", nominalYStart);
  } else {
    nominalYStart = 0;
    let xPansion = mapHeight - rows;
    rows += xPansion;
    let newCanvasHeight = rows * cellWidth;
    changeCanvasSize(currentCanvasWidth, newCanvasHeight);
  }

  //how much we should move the X by (absolute)
  let xShiftFactor = Math.abs(leftMost - nominalXStart);

  //how much we should move the y by (absolute)
  let yShiftFactor = Math.abs(topMost - nominalYStart);

  //if we should be shifting left/right
  //if our leftMost pos is greater than xStart, we should shift left
  if (leftMost > nominalXStart) xShiftFactor = -xShiftFactor;

  //if we should be shifting up/down
  //if our topMost pos is greater than yStart, we should shift up
  if (topMost > nominalYStart) yShiftFactor = -yShiftFactor;

  console.log("X Shift Factor: ", xShiftFactor);
  console.log("Y Shift Factor: ", yShiftFactor);

  console.log("Moving X " + (xShiftFactor > 0 ? "Right" : "Left"));
  console.log("Moving Y " + (yShiftFactor > 0 ? "Down" : "Up"));

  rooms.forEach((room) => {
    room.teleportRoom(room.x + xShiftFactor, room.y + yShiftFactor);
  });
  rooms.forEach((room) => {
    room.fillCells();
  });

  //currentState = "TODO";
  currentState = "createWallsAndDoors";
}

/**
 * @brief Closes corners of rooms if it leads out to empty world
 *
 */
function closeCorners(roomIndex) {
  console.log("Closing corners on roomIndex: ", roomIndex);
  let currentRoom = rooms[roomIndex];
  let roomCorners = currentRoom.getRimCells();

  // //add topLeft Corner
  // roomCorners.push(index(currentRoom.x, currentRoom.y));

  // // //add topRightCorner
  // roomCorners.push(
  //   index(currentRoom.x, currentRoom.y) + (currentRoom.width - 1)
  // );

  // //add bottomRightCorner
  // roomCorners.push(
  //   index(
  //     currentRoom.x + currentRoom.width - 1,
  //     currentRoom.y + currentRoom.height - 1
  //   )
  // );

  // //add bottomLeft Corner
  // roomCorners.push(
  //   index(currentRoom.x, currentRoom.y + currentRoom.height - 1)
  // );

  roomCorners.forEach((cell) => {
    //gameMap.grid.get(cell).walls = [true, true, true, true];
    //console.log("Next Corner");
    for (let dir = 0; dir < 4; dir++) {
      //console.log("Checking dir: ", dir);
      let checkCell;
      switch (dir) {
        case 0:
          checkCell = cell - cols;
          break;
        case 1:
          checkCell = cell + 1;
          break;
        case 2:
          checkCell = cell + cols;
          break;
        case 3:
          checkCell = cell - 1;
          break;
      }

      let emptyCell = true;
      rooms.forEach((room) => {
        if (room.checkHasCell(checkCell) && room.roomIndex) emptyCell = false;
      });

      if (emptyCell) {
        gameMap.grid.get(cell).walls[dir] = true;
        //debug
        // let newCellCoords = getCoordinates(checkCell);
        // console.log("empty cell coords:", newCellCoords[0], newCellCoords[1]);
        // let newCell = new Cell(newCellCoords[0], newCellCoords[1], cellWidth);
        // newCell.setRGB(255, 255, 255, 255);
        // newCell.walls = [true, true, true, true];
        // newCell.inRoom = true;
        // gameMap.addCellIndex(checkCell, newCell);
      }
    }
  });
}

/**
 * @brief Re-usable function required by createWallsAndDoors.
 *
 * Takes an input array of shared cells, creates a random door, then creates walls for all non-door shared cells.
 *
 * @param sharedCells input array of shared cells between two rooms.
 * @param wallDir direction walls should be created. 1 = top, 2 = right, 3 = bottom, 4 = left
 * @param visited array of cells already visited and created entry points for to prevent creating walls on previously created doors.
 * @param roomA roomIndex of the current room.
 * @param roomB roomIndex of the current room we're checking against.
 * @param roomConnectionsCompleted Array containing pairs of rooms (low, high) so that we only create 1 entry point per room pair.
 *
 * @note Visited and roomConnectionsCompleted are arrays that we expect to be passed by reference
 * so that we can directly modify the contents.
 *
 */
function createEntryFromShared(
  sharedCells,
  wallDir,
  visited,
  roomA,
  roomB,
  roomConnectionsCompleted
) {
  if (sharedCells.length > 0) {
    //make sure there are actually shared cells.
    let randomDoor =
      sharedCells[Math.floor(Math.random() * sharedCells.length)]; //Pick a random cell amongst shared cells and choose it as the door

    let entryPairCell;

    //depending on the direction the walls are being created, we need to ensure that the
    //other side of the entry point we create does not get a wall created on it.
    switch (wallDir) {
      case 0: //top
        entryPairCell = randomDoor - cols;
        break;
      case 1:
        entryPairCell = randomDoor + 1;
        break;
      case 2:
        entryPairCell = randomDoor + cols;
        break;
      case 3:
        entryPairCell = randomDoor - 1;
        break;
    }

    //this check is to make sure the other side of a create entry
    //is actually within a room. For corner cases, sometimes doors are made
    //that lead outside of the map, so we want to ensure the entry pair cell
    //is actually valid (inside map)
    let isValidEntryPair = false;
    rooms.forEach((room) => {
      if (room.getRimCells().includes(entryPairCell)) isValidEntryPair = true;
    });

    if (isValidEntryPair) {
      //track which room pairs we've created entries for so that we limit the number
      //of entries to 1
      let lowerRoomNum = roomA < roomB ? roomA : roomB;
      let upperRoomNum = roomA < roomB ? roomB : roomA;
      roomConnectionsCompleted.push([lowerRoomNum, upperRoomNum]);
      // let r = Math.floor(Math.random() * 255);
      // let g = Math.floor(Math.random() * 255);
      // let b = Math.floor(Math.random() * 255);

      visited.push(randomDoor);
      visited.push(entryPairCell);

      gameMap.grid.get(entryPairCell).walls = [false, false, false, false];

      //debug
      // gameMap.grid.get(randomDoor).setRGB(r, g, b);
      // gameMap.grid.get(randomDoor).text = roomA + 1;
      // gameMap.grid.get(entryPairCell).setRGB(r, g, b);
      // gameMap.grid.get(entryPairCell).text = roomB + 1;

      sharedCells.forEach((targetCell) => {
        if (targetCell !== randomDoor && !visited.includes(targetCell)) {
          gameMap.grid.get(targetCell).walls[wallDir] = true;
        }
      });
    }
  }
}

/**
 * @brief Creates walls and doors for the map
 *
 */
function createWallsAndDoors() {
  let found = false;

  let visited = [];
  let roomConnectionsCompleted = [];
  for (let currentRoom = 0; currentRoom < rooms.length; currentRoom++) {
    let room = rooms[currentRoom];
    //top
    let neighborCells = [];
    let topEdge = room.getTopEdge();
    let neighboringTop = [];
    topEdge.forEach((cell) => {
      if (!visited.includes(cell)) gameMap.grid.get(cell).walls[0] = true;
      neighborCells = neighborCells.concat(getNeighboringCellIndexes(cell));
    });

    //right
    let rightEdge = room.getRightEdge();
    let neighboringRight = [];
    rightEdge.forEach((cell) => {
      if (!visited.includes(cell)) gameMap.grid.get(cell).walls[1] = true;
      neighborCells = neighborCells.concat(getNeighboringCellIndexes(cell));
    });

    //bottom
    let bottomEdge = room.getBottomEdge();
    let neighboringBottom = [];
    bottomEdge.forEach((cell) => {
      if (!visited.includes(cell)) gameMap.grid.get(cell).walls[2] = true;
      neighborCells = neighborCells.concat(getNeighboringCellIndexes(cell));
    });

    //left
    let leftEdge = room.getLeftEdge();
    let neighboringLeft = [];
    leftEdge.forEach((cell) => {
      if (!visited.includes(cell)) gameMap.grid.get(cell).walls[3] = true;
      neighborCells = neighborCells.concat(getNeighboringCellIndexes(cell));
    });

    for (let roomCount = 0; roomCount < rooms.length; roomCount++) {
      if (rooms[roomCount].roomIndex !== room.roomIndex) {
        let lowerCheckRoomNum =
          currentRoom < roomCount ? currentRoom : roomCount;
        let upperCheckRoomNum =
          currentRoom < roomCount ? roomCount : currentRoom;

        if (
          roomConnectionsCompleted.some(
            (arr) =>
              JSON.stringify(arr) ===
              JSON.stringify([lowerCheckRoomNum, upperCheckRoomNum])
          )
        ) {
          continue;
        }

        let sharedCells = [];
        let otherRoom = rooms[roomCount];
        let otherRoomTop = otherRoom.getTopEdge();
        let otherRoomRight = otherRoom.getRightEdge();
        let otherRoomLeft = otherRoom.getLeftEdge();
        let otherRoomBottom = otherRoom.getBottomEdge();

        otherRoomTop.forEach((cell) => {
          if (neighborCells.includes(cell)) sharedCells.push(cell);
        });
        createEntryFromShared(
          sharedCells,
          0,
          visited,
          currentRoom,
          roomCount,
          roomConnectionsCompleted
        );
        sharedCells = [];

        otherRoomRight.forEach((cell) => {
          if (neighborCells.includes(cell)) sharedCells.push(cell);
        });
        createEntryFromShared(
          sharedCells,
          1,
          visited,
          currentRoom,
          roomCount,
          roomConnectionsCompleted
        );
        sharedCells = [];

        otherRoomBottom.forEach((cell) => {
          if (neighborCells.includes(cell)) sharedCells.push(cell);
        });
        createEntryFromShared(
          sharedCells,
          2,
          visited,
          currentRoom,
          roomCount,
          roomConnectionsCompleted
        );
        sharedCells = [];

        otherRoomLeft.forEach((cell) => {
          if (neighborCells.includes(cell)) sharedCells.push(cell);
        });
        createEntryFromShared(
          sharedCells,
          3,
          visited,
          currentRoom,
          roomCount,
          roomConnectionsCompleted
        );
        sharedCells = [];
      }
    }
  }

  for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
    closeCorners(roomIndex);
  }

  currentState = "test";
}
