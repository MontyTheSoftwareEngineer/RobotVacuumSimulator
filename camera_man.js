/**
 * @file camera_man.js
 * @brief CameraMan class representing a camera entity that can move in different directions.
 *
 * @author Hai Pham
 */

/**
 * @enum {string}
 * Enum representing directions. Use these constants to specify direction.
 */
const Direction = {
  UP: "up",
  LEFT: "left",
  RIGHT: "right",
  DOWN: "down",
};

class CameraMan {
  /**
   * @brief default constructor, sets default params.
   */
  constructor() {
    this.x = 0;
    this.y = 0;
    this.moveSpeed = 2;
    this.yVelocity = 0;
    this.xVelocity = 0;
  }

  /**
   * @brief Start moving the CameraMan in the specified direction.
   *
   * @param direction - The direction to move the CameraMan.
   */
  startMoving(direction) {
    switch (direction) {
      case Direction.UP:
        this.yVelocity = -this.moveSpeed;
        break;
      case Direction.DOWN:
        this.yVelocity = this.moveSpeed;
        break;
      case Direction.RIGHT:
        this.xVelocity = this.moveSpeed;
        break;
      case Direction.LEFT:
        this.xVelocity = -this.moveSpeed;
        break;
    }
  }

  /**
   * @brief Stop moving the CameraMan in the specified direction.
   *
   * @param direction - The direction to stop moving the CameraMan.
   */
  stopMoving(direction) {
    switch (direction) {
      case Direction.UP:
        this.yVelocity = 0;
        break;
      case Direction.DOWN:
        this.yVelocity = 0;
        break;
      case Direction.RIGHT:
        this.xVelocity = 0;
        break;
      case Direction.LEFT:
        this.xVelocity = 0;
        break;
    }
  }
  /**
   * @brief Update the position of the CameraMan to have robot in the center of the screen
   */
  newGameTick() {
    // Calculate the translation needed to center the robot on the screen
    const canvasCenterX = window.innerWidth / 2;
    const canvasCenterY = window.innerHeight / 2;
    const robotCenterX = robotVacuum.x;
    const robotCenterY = robotVacuum.y;
    const translateX = canvasCenterX - robotCenterX;
    const translateY = canvasCenterY - robotCenterY;

    // Set cameraMan's position to follow the robot
    cameraMan.x = robotCenterX;
    cameraMan.y = robotCenterY;

    // Translate the drawing to center the robot on the screen
    translate(translateX, translateY);
  }
}
