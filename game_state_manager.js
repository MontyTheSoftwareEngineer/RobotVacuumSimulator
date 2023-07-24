/**
 * @file game_state_manager.js
 *
 * @brief Manages the state of the game.
 *
 * @author Hai Pham
 */

class GameStateManager {
  constructor() {
    console.log("Game state manager init...");
    this.robotVacuum = new RobotVacuum();
    this.gameMap = new GameMap();
    this.cameraMan = new CameraMan();
    this.cellWidth = 30;
    this.roomCount = 4;
    this.rooms = [];

    this.currentCanvasWidth = window.innerWidth;
    this.currentCanvasHeight = window.innerHeight;
    //createCanvas(this.currentCanvasWidth, this.currentCanvasHeight);

    this.cols = Math.floor(this.currentCanvasWidth / this.cellWidth);
    this.rows = Math.floor(this.currentCanvasHeight / this.cellWidth);

    this.roomA, this.roomB;

    this.gameState = "creatingRooms";

    console.log(
      "Game state manager init DONE. Cols: ",
      this.cols,
      " Rows: ",
      this.rows
    );
  }

  /**
   * @brief Changes the size of the canvas.
   * @param {number} newCanvasWidth - The new width of the canvas.
   * @param {number} newCanvasHeight - The new height of the canvas.
   */
  changeCanvasSize(newCanvasWidth, newCanvasHeight) {
    //resizeCanvas(newCanvasWidth, newCanvasHeight);
    this.cols = Math.floor(newCanvasWidth / this.cellWidth);
    this.rows = Math.floor(newCanvasHeight / this.cellWidth);
    this.currentCanvasHeight = newCanvasHeight;
    this.currentCanvasWidth = newCanvasWidth;

    this.rooms.forEach((room) => {
      room.clearCells();
      room.fillCells();
    });
  }

  /**
   * @brief Performs a new game tick. Updates the game state based on the current state.
   */
  newGameTick() {
    //draw all cells in the game.
    this.gameMap.showMap();

    this.rooms.forEach((room) => {
      room.labelRoom();
    });

    this.cameraMan.newGameTick();

    console.log("Current State:", this.gameState);
    //state machine
    switch (this.gameState) {
      case "creatingRooms": {
        console.log("Creating room, Rooms made: ", this.rooms.length);
        MakeRandomRoom();
        if (this.rooms.length >= this.roomCount) this.gameState = "resizeGrid";
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
        while (checkRoomCollision(this.roomA, this.roomB)) {
          console.log("Here");
          this.roomA.shift();
        }
        for (let roomCount = 0; roomCount < this.rooms.length; roomCount++) {
          this.rooms[roomCount].fillCells();
        }
        if (!checkRoomCollision(this.roomA, this.roomB)) {
          this.roomA.finishShift();
          this.roomA = null;
          this.roomB = null;
          this.gameState = "findCollidingRooms";
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
      case "createCollisionWalls": {
        this.rooms.forEach((room) => {
          room.createCollisionWalls();
        });

        this.gameState = "cameraControl";
        break;
      }
      case "cameraControl": {
        this.rooms[1].createCollisionWalls();
        this.robotVacuum.display();
      }
    }
  }
}
