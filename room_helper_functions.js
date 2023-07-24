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

  let roomX = Math.floor(gameStateManager.cols / 2);
  let roomY = Math.floor(gameStateManager.rows / 2);

  let newR = Math.floor(random(0, 255));
  let newB = Math.floor(random(0, 255));
  let newG = Math.floor(random(0, 255));

  let room = new Room(
    gameStateManager.rooms.length + 1,
    roomX,
    roomY,
    roomWidth,
    roomHeight,
    gameStateManager.cellWidth,
    newR,
    newG,
    newB
  );
  room.fillCells();
  console.log("Made random room!");

  gameStateManager.rooms.push(room);
  return;
}

/**
 * @brief Determine how the cols/rows need to be resized depending on
 * theoretical max rows/max cols.
 */
function reSizeGrid() {
  let maxCols, maxRows;

  gameStateManager.rooms.forEach((room) => {
    maxCols += room.width;
    maxRows += room.rows;
  });

  //how much to increase X
  let xPansion = maxCols - gameStateManager.cols;
  let newCanvasWidth = gameStateManager.cols * gameStateManager.cellWidth;
  //how much to increase y
  let yPansion = maxRows - gameStateManager.rows;
  let newCanvasHeight = gameStateManager.rows * gameStateManager.cellWidth;

  gameStateManager.changeCanvasSize(newCanvasWidth, newCanvasHeight);

  gameStateManager.gameState = "findCollidingRooms";
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
  for (
    let roomIndex = 0;
    roomIndex < gameStateManager.rooms.length - 1;
    roomIndex++
  ) {
    gameStateManager.roomA = gameStateManager.rooms[roomIndex];
    for (
      let nextRoomIndex = roomIndex + 1;
      nextRoomIndex < gameStateManager.rooms.length;
      nextRoomIndex++
    ) {
      gameStateManager.roomB = gameStateManager.rooms[nextRoomIndex];
      if (checkRoomCollision(gameStateManager.roomA, gameStateManager.roomB)) {
        gameStateManager.gameState = "separatingRooms";
        return;
      }
    }
  }

  gameStateManager.gameState = "checkOrphanedRooms";
}

/**
 * @brief Check if there's any rooms that are isolated and have no neighboring rooms. If so teleport that room
 * back into another room and set state back to separating
 */
function checkOrphanedRooms() {
  for (
    let roomCount = 0;
    roomCount < gameStateManager.rooms.length;
    roomCount++
  ) {
    let roomEdges = gameStateManager.rooms[roomCount].getRimCells();
    let neighboringCells = [];
    for (let edgeCount = 0; edgeCount < roomEdges.length; edgeCount++) {
      neighboringCells = neighboringCells.concat(
        getNeighboringCellIndexes(roomEdges[edgeCount])
      );
    }

    let hasNeighbor = false;
    for (
      let otherRoomCount = 0;
      otherRoomCount < gameStateManager.rooms.length;
      otherRoomCount++
    ) {
      //console.log("Checking against: ", gameStateManager.rooms[otherRoomCount].roomIndex);
      if (
        otherRoomCount !== roomCount &&
        gameStateManager.rooms[otherRoomCount]
      ) {
        let otherRoomEdges =
          gameStateManager.rooms[otherRoomCount].getRimCells();
        hasNeighbor = neighboringCells.some((element) =>
          otherRoomEdges.includes(element)
        );

        if (hasNeighbor) {
          break;
        }
      }
    }

    if (!hasNeighbor) {
      console.log(
        "Found orphaned room: ",
        gameStateManager.rooms[roomCount].roomIndex
      );
      if (gameStateManager.rooms[roomCount].roomIndex !== 1) {
        gameStateManager.rooms[roomCount].teleportRoom(
          gameStateManager.rooms[0].x,
          gameStateManager.rooms[0].y
        );
      } else {
        gameStateManager.rooms[roomCount].teleportRoom(
          gameStateManager.rooms[1].x,
          gameStateManager.rooms[1].y
        );
      }
      gameStateManager.gameState = "separatingRooms";
      return;
    }
  }

  console.log("No orphaned rooms!");
  gameStateManager.gameState = "checkIslands";
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

  for (
    let roomCount = 0;
    roomCount < gameStateManager.rooms.length;
    roomCount++
  ) {
    unvisitedRooms.push(roomCount);
  }
  console.log("Checking for islands, rooms in map: ", unvisitedRooms);

  //start at node room index 0
  nextRoomsToCheck.push(0);

  //keep going until the nextRoomsToCheck stack is empty
  while (nextRoomsToCheck.length > 0) {
    let currentCheckingRoom = nextRoomsToCheck[0];

    console.log(
      "Checking room: ",
      gameStateManager.rooms[currentCheckingRoom].roomIndex
    );

    unvisitedRooms.splice(unvisitedRooms.indexOf(currentCheckingRoom), 1);
    nextRoomsToCheck.splice(0, 1);
    console.log("rooms left:", unvisitedRooms);
    console.log("rooms in check queue:", nextRoomsToCheck);

    //get all edges of current room and then populate neighboringCells with all cells
    //that would be considered neighbors based off the edges.
    let roomEdges = gameStateManager.rooms[currentCheckingRoom].getRimCells();
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
      otherRoomCount < gameStateManager.rooms.length;
      otherRoomCount++
    ) {
      if (
        otherRoomCount !== currentCheckingRoom && //don't check the current room to see if it's a neighbor of itself
        unvisitedRooms.includes(otherRoomCount) //don't check rooms if it's already been seen before
      ) {
        let otherRoomEdges =
          gameStateManager.rooms[otherRoomCount].getRimCells();
        hasNeighbor = neighboringCells.some((element) =>
          otherRoomEdges.includes(element)
        );

        if (
          hasNeighbor && //this check room is considered a neighbor of current room
          !nextRoomsToCheck.includes(otherRoomCount) && //don't need to put the room onto checkStack if it's already there
          unvisitedRooms.includes(otherRoomCount) //don't need to add room onto checkStack if we've already visited the room
        ) {
          console.log(
            "Found neighbor: ",
            gameStateManager.rooms[otherRoomCount].roomIndex
          );
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
      gameStateManager.rooms[unvisitedRooms[roomCount]].teleportRoom(
        gameStateManager.rooms[0].x,
        gameStateManager.rooms[0].y
      );

      gameStateManager.gameState = "separatingRooms";
    }
  } else {
    console.log("No island clusters found!");
    //currentState = "pause";
    gameStateManager.gameState = "centerRooms";
  }
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
  for (
    let roomCount = 0;
    roomCount < gameStateManager.rooms.length;
    roomCount++
  ) {
    if (gameStateManager.rooms[roomCount].x < leftMost)
      leftMost = gameStateManager.rooms[roomCount].x;

    if (
      gameStateManager.rooms[roomCount].x +
        gameStateManager.rooms[roomCount].width >
      rightMost
    )
      rightMost =
        gameStateManager.rooms[roomCount].x +
        gameStateManager.rooms[roomCount].width;

    if (
      gameStateManager.rooms[roomCount].y +
        gameStateManager.rooms[roomCount].height >
      bottMost
    )
      bottMost =
        gameStateManager.rooms[roomCount].y +
        gameStateManager.rooms[roomCount].height;

    if (gameStateManager.rooms[roomCount].y < topMost)
      topMost = gameStateManager.rooms[roomCount].y;
  }

  console.log("Canvas:", gameStateManager.cols, gameStateManager.rows);
  console.log("Centering map", leftMost, rightMost, topMost, bottMost);

  let mapWidth = rightMost - leftMost;
  console.log("Map width: ", mapWidth);
  let mapHeight = bottMost - topMost;
  console.log("Map Height: ", mapHeight);
  let nominalXStart, nominalYStart;

  //calculate where the left most *should* start
  if (mapWidth < gameStateManager.cols) {
    nominalXStart = Math.floor((gameStateManager.cols - mapWidth) / 2);
    console.log("nominalXStart: ", nominalXStart);
  } else {
    nominalXStart = 0;
    let xPansion = mapWidth - gameStateManager.cols;
    gameStateManager.cols += xPansion;
    let newCanvasWidth = gameStateManager.cols * gameStateManager.cellWidth;
    gameStateManager.changeCanvasSize(
      newCanvasWidth,
      gameStateManager.currentCanvasHeight
    );
  }

  //calculate where the topb most *should* start
  if (mapHeight < gameStateManager.rows) {
    nominalYStart = Math.floor((gameStateManager.rows - mapHeight) / 2);
    console.log("nominalYStart: ", nominalYStart);
  } else {
    nominalYStart = 0;
    let xPansion = mapHeight - gameStateManager.rows;
    gameStateManager.rows += xPansion;
    let newCanvasHeight = gameStateManager.rows * gameStateManager.cellWidth;
    gameStateManager.changeCanvasSize(
      gameStateManager.currentCanvasWidth,
      newCanvasHeight
    );
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

  gameStateManager.rooms.forEach((room) => {
    room.teleportRoom(room.x + xShiftFactor, room.y + yShiftFactor);
  });
  gameStateManager.rooms.forEach((room) => {
    room.fillCells();
  });

  gameStateManager.gameState = "createWallsAndDoors";
}

/**
 * @brief Closes corners of rooms if it leads out to empty world
 *
 */
function closeEdges(roomIndex) {
  console.log("Closing corners on roomIndex: ", roomIndex);
  let currentRoom = gameStateManager.rooms[roomIndex];
  let roomEdges = currentRoom.getRimCells();

  roomEdges.forEach((cell) => {
    //gameMap.grid.get(cell).walls = [true, true, true, true];
    //console.log("Next Corner");
    for (let dir = 0; dir < 4; dir++) {
      //console.log("Checking dir: ", dir);
      let checkCell;
      switch (dir) {
        case 0:
          checkCell = cell - gameStateManager.cols;
          break;
        case 1:
          checkCell = cell + 1;
          break;
        case 2:
          checkCell = cell + gameStateManager.cols;
          break;
        case 3:
          checkCell = cell - 1;
          break;
      }

      let emptyCell = true;
      gameStateManager.rooms.forEach((room) => {
        if (room.checkHasCell(checkCell) && room.roomIndex) emptyCell = false;
      });

      if (emptyCell) {
        gameStateManager.gameMap.grid.get(cell).walls[dir] = true;
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
        entryPairCell = randomDoor - gameStateManager.cols;
        break;
      case 1:
        entryPairCell = randomDoor + 1;
        break;
      case 2:
        entryPairCell = randomDoor + gameStateManager.cols;
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
    gameStateManager.rooms.forEach((room) => {
      if (room.getRimCells().includes(entryPairCell)) isValidEntryPair = true;
    });

    if (isValidEntryPair) {
      //track which room pairs we've created entries for so that we limit the number
      //of entries to 1
      let lowerRoomNum =
        gameStateManager.roomA < gameStateManager.roomB
          ? gameStateManager.roomA
          : gameStateManager.roomB;
      let upperRoomNum =
        roomA < gameStateManager.roomB
          ? gameStateManager.roomB
          : gameStateManager.roomA;
      roomConnectionsCompleted.push([lowerRoomNum, upperRoomNum]);
      // let r = Math.floor(Math.random() * 255);
      // let g = Math.floor(Math.random() * 255);
      // let b = Math.floor(Math.random() * 255);

      visited.push(randomDoor);
      visited.push(entryPairCell);

      gameStateManager.gameMap.grid.get(entryPairCell).walls = [
        false,
        false,
        false,
        false,
      ];

      //debug
      // gameMap.grid.get(randomDoor).setRGB(r, g, b);
      // gameMap.grid.get(randomDoor).text = roomA + 1;
      // gameMap.grid.get(entryPairCell).setRGB(r, g, b);
      // gameMap.grid.get(entryPairCell).text = roomB + 1;

      sharedCells.forEach((targetCell) => {
        if (targetCell !== randomDoor && !visited.includes(targetCell)) {
          gameStateManager.gameMap.grid.get(targetCell).walls[wallDir] = true;
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
  for (
    let currentRoom = 0;
    currentRoom < gameStateManager.rooms.length;
    currentRoom++
  ) {
    let room = gameStateManager.rooms[currentRoom];
    //top
    let neighborCells = [];
    let topEdge = room.getTopEdge();
    topEdge.forEach((cell) => {
      if (!visited.includes(cell))
        gameStateManager.gameMap.grid.get(cell).walls[0] = true;
      neighborCells = neighborCells.concat(getNeighboringCellIndexes(cell));
    });

    //right
    let rightEdge = room.getRightEdge();
    rightEdge.forEach((cell) => {
      if (!visited.includes(cell))
        gameStateManager.gameMap.grid.get(cell).walls[1] = true;
      neighborCells = neighborCells.concat(getNeighboringCellIndexes(cell));
    });

    //bottom
    let bottomEdge = room.getBottomEdge();
    bottomEdge.forEach((cell) => {
      if (!visited.includes(cell))
        gameStateManager.gameMap.grid.get(cell).walls[2] = true;
      neighborCells = neighborCells.concat(getNeighboringCellIndexes(cell));
    });

    //left
    let leftEdge = room.getLeftEdge();
    leftEdge.forEach((cell) => {
      if (!visited.includes(cell))
        gameStateManager.gameMap.grid.get(cell).walls[3] = true;
      neighborCells = neighborCells.concat(getNeighboringCellIndexes(cell));
    });

    for (
      let roomCount = 0;
      roomCount < gameStateManager.rooms.length;
      roomCount++
    ) {
      if (gameStateManager.rooms[roomCount].roomIndex !== room.roomIndex) {
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
        let otherRoom = gameStateManager.rooms[roomCount];
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

  for (
    let roomIndex = 0;
    roomIndex < gameStateManager.rooms.length;
    roomIndex++
  ) {
    closeEdges(roomIndex);
  }

  gameStateManager.gameState = "createCollisionWalls";
}
