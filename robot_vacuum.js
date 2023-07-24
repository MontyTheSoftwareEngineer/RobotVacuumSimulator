class RobotVacuum {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.robotImg;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.speed = 0;
    this.width = 20;
    this.placed = false;
  }

  setImage(image) {
    this.robotImg = image;
  }

  setYVelocity(val) {
    console.log("Setting velocity", val);
    this.yVelocity = val;
  }

  setRotation(speed) {
    this.rotationSpeed = speed;
  }

  setSpeed(newSpeed) {
    this.speed = newSpeed;
  }

  updatePosition() {
    const deltaX = this.speed * Math.cos(this.rotation);
    const deltaY = this.speed * Math.sin(this.rotation);

    this.x += deltaX;
    this.y += deltaY;
  }

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
