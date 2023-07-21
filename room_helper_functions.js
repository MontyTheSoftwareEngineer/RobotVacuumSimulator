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
    maxIndex,
    newR,
    newG,
    newB
  );
  room.fillCells();

  rooms.push(room);
  return;
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
    let cell = grid[firstRoom.cells[cellIndex]];

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
    //console.log("Root room check: ", rooms[roomCount].roomIndex);
    let roomEdges = rooms[roomCount].getRimCells();
    //console.log("This room edges: ", roomEdges);
    let neighboringCells = [];
    for (let edgeCount = 0; edgeCount < roomEdges.length; edgeCount++) {
      neighboringCells = neighboringCells.concat(
        getNeighboringCellIndexes(roomEdges[edgeCount])
      );
    }

    //console.log("Neighbor cells: ", neighboringCells);

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
      console.log("Teleporting room");
      if (roomCount !== 0) {
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

    console.log("Checking room: ", currentCheckingRoom);
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
          console.log("Found neighbor: ", otherRoomCount);
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
    currentState = "centerRooms";
  }
}

/**
 * @brief Centers the map onto screen
 *
 */
function centerMap() {
  let leftMost = 10000;
  let rightMost = 0;
  let topMost = 10000;
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
    //TODO: resize canvas width
    return;
  }

  //calculate where the topb most *should* start
  if (mapHeight < rows) {
    nominalYStart = Math.floor((rows - mapHeight) / 2);
    console.log("nominalYStart: ", nominalYStart);
  } else {
    //TODO: resize canvas Height
    return;
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
  currentState = "createWallsAndDoors";
}

/**
 * @brief Creates walls and doors for the map
 *
 */
function createWallsAndDoors() {
  let found = false;

  for (let roomCount = 0; roomCount < rooms.length; roomCount++) {
    console.log("RoomCount:", roomCount);
    let room = rooms[roomCount];
    //top
    let topEdge = room.getTopEdge();
    let neighboringTop = [];
    topEdge.forEach((cell) => {
      grid[cell].walls[0] = true;
      neighboringTop = neighboringTop.concat(getNeighboringCellIndexes(cell));
    });

    //right
    let rightEdge = room.getRightEdge();
    let neighboringRight = [];
    rightEdge.forEach((cell) => {
      grid[cell].walls[1] = true;
      neighboringRight = neighboringRight.concat(
        getNeighboringCellIndexes(cell)
      );
    });

    //bottom
    let bottomEdge = room.getBottomEdge();
    let neighboringBottom = [];
    bottomEdge.forEach((cell) => {
      grid[cell].walls[2] = true;
      neighboringBottom = neighboringBottom.concat(
        getNeighboringCellIndexes(cell)
      );
    });

    //left
    let leftEdge = room.getLeftEdge();
    let neighboringLeft = [];
    leftEdge.forEach((cell) => {
      grid[cell].walls[3] = true;
      neighborineighboringLeftngTop = neighboringLeft.concat(
        getNeighboringCellIndexes(cell)
      );
    });

    console.log("Current Room: ", room.roomIndex);

    let sharedCells = [];
    let sharedDir;
    for (
      let otherRoomCount = 0;
      otherRoomCount < rooms.length;
      otherRoomCount++
    ) {
      if (rooms[otherRoomCount].roomIndex !== room.roomIndex) {
        let otherRoom = rooms[otherRoomCount];
        console.log("Checking with room: ", otherRoom.roomIndex);
        let otherRoomTop = otherRoom.getTopEdge();
        otherRoomTop.forEach((cell) => {
          if (neighboringTop.includes(cell)) {
            sharedCells.push(cell);
            sharedDir = "top";
            console.log("TOP");
          } else if (neighboringRight.includes(cell)) {
            sharedCells.push(cell);
            sharedDir = "right";
            console.log("RIGHT");
          } else if (neighboringBottom.includes(cell)) {
            sharedCells.push(cell);
            sharedDir = "bottom";
            console.log("BOTTOM");
          } else if (neighboringLeft.includes(cell)) {
            sharedCells.push(cell);
            sharedDir = "left";
            console.log("LEFT");
          }
        });

        if (sharedCells.length > 0) {
          console.log("SharedDir:", sharedDir);
          sharedCells.forEach((cell) => {
            grid[cell].setRGB(0, 0, 0);
          });
          found = true;
          //const doorWay = Math.floor(Math.random() * sharedCells.length);
          //grid[sharedCells[doorWay]].setRGB(0, 0, 0);
          //grid[sharedCells[doorWay] + cols].walls = [true, true, true, true];

          currentState = "t";
          return;
        }
      }
    }

    // rooms.forEach((otherRoom) => {
    //   if (otherRoom.roomIndex !== room.roomIndex) {

    //     if (sharedCells.length > 0) {
    //       const doorWay = Math.floor(Math.random() * sharedCells.length);
    //       grid[sharedCells[doorWay]].setRGB(0, 0, 0);
    //       //grid[sharedCells[doorWay] + cols].walls = [true, true, true, true];

    //       currentState = "t";
    //       return;
    //     }
    //   }
    // });

    //console.log("Shared:", sharedCells);

    // if (sharedCells.length > 0) {
    //   const doorWay = Math.floor(Math.random() * sharedCells.length);
    //   grid[sharedCells[doorWay]].walls = [true, true, true, true];
    // }
  } //for roomCount
}
