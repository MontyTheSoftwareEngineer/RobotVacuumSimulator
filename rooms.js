/**
 * @file rooms.js
 *
 * @brief This is the header file for the Room class.
 *
 * This file contains the declaration of the Room class, which represents a room
 * in a game. A room has various properties such as its index, coordinates, size,
 * color, and cell configuration.
 *
 * @author Hai Pham
 * @author Marvin Kilp
 */

class Room {
  /**
   * @brief Constructor for creating a new room object.
   *
   * @param roomIndex The index of the room, used for labeling purposes only.
   * @param x The x-coordinate of the room start.
   * @param y The y-coordinate of the room start.
   * @param width The width of the room.
   * @param height The height of the room.
   * @param cellWidth The width of each individual cell in the room.
   * @param maxIndex The maximum index value for the canvas, used to detect when
   * an index is out of range of board so we don't try to fill its color if it doesn't exist.
   * @param r The red component of the room's color.
   * @param g The green component of the room's color.
   * @param b The blue component of the room's color.
   */
  constructor(roomIndex, x, y, width, height, cellWidth, maxIndex, r, g, b) {
    this.roomIndex = roomIndex;
    this.cells = [];
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.r = r;
    this.g = g;
    this.b = b;
    this.cellWidth = cellWidth;
    this.maxIndex = maxIndex;
    this.shiftDirection = -1;
  }

  /**
   * @brief Adds a cell to the room's cell array tracker.
   *
   * @param index The index of the cell to be added.
   */
  addCell(index) {
    this.cells.push(index);
  }

  /**
   * @brief Returns an array of cells in the room.
   *
   * @return array of cells associated with this room.
   */
  cells() {
    return this.cells;
  }

  /**
   * @brief Check if the index (cell) exists within this room's cell array. Used
   * for example in collision detection.
   *
   * @param index The index of the cell to check.
   * @return True if the index is present, false otherwise.
   */
  checkHasCell(index) {
    return this.cells.includes(index);
  }

  /**
   * @brief Checks to see if a particular cell index is a corner of this room
   *
   * @param index The index of the cell in interest
   *
   * @returns true if a corner, otherwise false.
   */
  checkIsCorner(index) {
    let corners = [];
    //topleft
    corners.push(index(this.x, this.y));

    //topRight
    corners.push(index(this.x, this.y) + (this.width - 1));

    //bottomRight
    corners.push(index(this.x + this.width - 1, this.y + this.height - 1));

    //bottomLeft:
    corners.push(index(this.x, this.y + this.height - 1));

    return corners.includes(index);
  }

  /**
   * @brief Returns an array of cells that form the top of the room
   */
  getTopEdge() {
    let ret = [];

    for (let i = 0; i < this.width; i++) {
      ret.push(index(this.x, this.y) + i);
    }

    return ret;
  }

  /**
   * @brief Returns an array of cells that form the left of the room
   */
  getLeftEdge() {
    let ret = [];

    for (let i = 0; i < this.height; i++) {
      ret.push(index(this.x, this.y) + i * cols);
    }

    return ret;
  }

  /**
   * @brief Returns an array of cells that form the right of the room
   */
  getRightEdge() {
    let ret = [];

    for (let i = 0; i < this.height; i++) {
      ret.push(index(this.x, this.y) + i * cols + (this.width - 1));
    }

    return ret;
  }

  /**
   * @brief Returns an array of cells that form the bottom of the room
   */
  getBottomEdge() {
    let ret = [];

    for (let i = 0; i < this.width; i++) {
      ret.push(index(this.x, this.y) + i + (this.height - 1) * cols);
    }

    return ret;
  }

  /**
   * @brief Returns an array of cells that are on the outer rim of the room.
   *
   * @return Array of cells that are on the outer rim.
   */
  getRimCells() {
    let rimCells = [];
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        let cellIndex = index(this.x + i, this.y + j);
        // If the cell index is within range, and it is on one of the boundaries
        if (
          cellIndex > 0 &&
          cellIndex < this.maxIndex &&
          (i === 0 || i === this.width - 1 || j === 0 || j === this.height - 1)
        ) {
          rimCells.push(cellIndex);
        }
      }
    }
    return rimCells;
  }

  /**
   * @brief Used to essentially reset all cells in this room back to initial unassociated state.
   * Mainly used for clearing color/association prior to shifting room.
   */
  clearCells() {
    for (let i = 0; i < this.cells.length; i++) {
      grid[this.cells[i]].setRGB(22, 22, 22);
      grid[this.cells[i]].inRoom = false;
    }

    this.cells = [];
  }

  /**
   * @brief Print a "Room #" label in the middle of the room.
   */
  labelRoom() {
    // Calculate the position to draw the text centered in the room
    let textX = Math.floor((this.x + this.width / 2) * cellWidth);
    let textY = Math.floor((this.y + this.height / 2) * cellWidth);

    fill(0);
    textSize(25);
    textAlign(CENTER, CENTER);
    text("Room " + parseInt(this.roomIndex), textX, textY);
  }

  /**
   * @brief Colors all cells associated with this room to the room's rgb colors.
   * Also sets the walls.
   */
  fillCells() {
    this.cells = [];
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        let cellIndex = index(this.x + i, this.y + j);
        if (cellIndex > 0 && cellIndex < this.maxIndex) {
          let cell = grid[cellIndex];
          this.cells.push(cellIndex);
          cell.setRGB(this.r, this.g, this.b, 255);
          cell.inRoom = true;
        }
      }
    }
    this.labelRoom();
  }

  /**
   * @brief Moves room to a specified x,y location.
   */
  teleportRoom(x, y) {
    this.x = x;
    this.y = y;
    this.clearCells();
    this.fillCells();
  }

  /**
   * @brief Sets shiftDirection back to uninitiailized, since shiftDirection is a memory/hold
   * of this rooms direction to shift during a separateRoom game state.
   */
  finishShift() {
    this.shiftDirection = -1;
  }

  /**
   * @brief Randomly determines which direction to shift the room. Direction is stored in
   * this.shiftDirection in order to keep shifting the room in the same direction until
   * shifting has finished.
   */
  shift() {
    if (this.shiftDirection === -1) {
      this.shiftDirection = Math.floor(Math.random() * 4);
      console.log("Created new direction: ", this.shiftDirection);
    }
    switch (this.shiftDirection) {
      case 0: {
        this.shiftDirection = 0;
        this.x -= 1;
        break;
      }
      case 1: {
        this.shiftDirection = 1;
        this.x += 1;
        break;
      }
      case 2: {
        this.shiftDirection = 2;
        this.y += 1;
        break;
      }
      case 3: {
        this.shiftDirection = 3;
        this.y -= 1;
        break;
      }
    }
    this.clearCells();
    this.fillCells();
  }
}
