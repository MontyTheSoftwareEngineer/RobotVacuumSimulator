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

function checkIslands() {
  console.log("Checking for islands");
  let unvisitedRooms = [];
  let nextRoomsToCheck = [];

  for (let roomCount = 0; roomCount < rooms.length; roomCount++) {
    unvisitedRooms.push(roomCount);
  }
  nextRoomsToCheck.push(0);

  while (nextRoomsToCheck.length > 0) {
    let currentCheckingRoom = nextRoomsToCheck[0];
    console.log("Checking room: ", currentCheckingRoom + 1);
    unvisitedRooms.splice(unvisitedRooms.indexOf(currentCheckingRoom), 1);
    nextRoomsToCheck.splice(0, 1);
    console.log("rooms left:", unvisitedRooms);
    console.log("rooms in check queue:", nextRoomsToCheck);

    let roomEdges = rooms[0].getRimCells();
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
      if (
        otherRoomCount !== currentCheckingRoom &&
        unvisitedRooms.includes(otherRoomCount)
      ) {
        let otherRoomEdges = rooms[otherRoomCount].getRimCells();
        hasNeighbor = neighboringCells.some((element) =>
          otherRoomEdges.includes(element)
        );

        if (
          hasNeighbor &&
          !nextRoomsToCheck.includes(otherRoomCount) &&
          unvisitedRooms.includes(otherRoomCount)
        ) {
          console.log("Found neighbor: ", otherRoomCount + 1);
          nextRoomsToCheck.push(otherRoomCount);
          console.log("Next rooms to check: ", nextRoomsToCheck);
        }
      }
    }
  }

  console.log("Islands: ", unvisitedRooms);
  currentState = "s";
}
