/**
 * @file robot_vacuum.js
 *
 * @brief Represents a robot vacuum cleaner.
 *
 * @author Hai Pham
 */

class RobotVacuum {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.robotImg;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.speed = 0;
    this.width = 20;
    this.placed = false;
  }

  /**
   * @brief Sets the image for the robot vacuum.
   * @param {Image} image - The image to be set.
   */
  setImage(image) {
    this.robotImg = image;
  }
  /**
   * @brief Sets the rotation speed of the robot vacuum.
   * @param {number} speed - The speed to set for rotation.
   */
  setRotation(speed) {
    this.rotationSpeed = speed;
  }

  /**
   * @brief Sets the speed of the robot vacuum.
   * @param {number} newSpeed - The speed to set for the robot vacuum.
   */
  setSpeed(newSpeed) {
    this.speed = newSpeed;
  }

  /**
   * @brief updates the position of the robot vacuum based on its speed and rotation.
   */
  updatePosition() {
    const deltaX = this.speed * Math.cos(this.rotation);
    const deltaY = this.speed * Math.sin(this.rotation);

    this.x += deltaX;
    this.y += deltaY;
  }

  /**
   * @brief Displays the robot vacuum on the screen.
   */
  display() {
    if (!this.placed) return;
    this.updatePosition();
    this.rotation += this.rotationSpeed;

    push();

    translate(
      this.x - gameStateManager.cameraMan.x,
      this.y - gameStateManager.cameraMan.y
    );

    rotate(this.rotation);

    image(
      this.robotImg,
      -this.width / 2,
      -this.width / 2,
      this.width,
      this.width
    );

    pop();
  }
}
