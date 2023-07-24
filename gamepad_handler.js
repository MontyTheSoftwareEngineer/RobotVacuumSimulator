function checkGamePad() {
  var gamepads = navigator.getGamepads();
  for (let i in controllers) {
    let controller = gamepads[i];

    if (controller.axes) {
      let axes = controller.axes;
      for (let axis = 0; axis < axes.length; axis++) {
        let val = controller.axes[axis];
        if (axis === 0 && nf(val, 0, 2) < -0.65)
          gameStateManager.robotVacuum.setRotation(-0.1);
        else if (axis === 0 && nf(val, 0, 2) > 0.65)
          gameStateManager.robotVacuum.setRotation(0.1);
        else if (axis === 0 && nf(val, 0, 2) < 0.5 && nf(val, 0, 2) > -0.5)
          gameStateManager.robotVacuum.setRotation(0);
        if (axis === 1 && nf(val, 0, 2) < -0.65)
          gameStateManager.robotVacuum.setSpeed(-1);
        if (axis === 1 && nf(val, 0, 2) > 0.65)
          gameStateManager.robotVacuum.setSpeed(1);
        else if (axis === 1 && nf(val, 0, 2) < 0.5 && nf(val, 0, 2) > -0.5)
          gameStateManager.robotVacuum.setSpeed(0);

        if (axis === 2 && nf(val, 0, 2) < -0.65)
          gameStateManager.cameraMan.startMoving(Direction.LEFT);
        else if (axis === 2 && nf(val, 0, 2) > 0.65)
          gameStateManager.cameraMan.startMoving(Direction.RIGHT);
        else if (axis === 2 && nf(val, 0, 2) < 0.5 && nf(val, 0, 2) > -0.5)
          gameStateManager.cameraMan.stopMoving(Direction.RIGHT);
        if (axis === 3 && nf(val, 0, 2) < -0.65)
          gameStateManager.cameraMan.startMoving(Direction.UP);
        if (axis === 3 && nf(val, 0, 2) > 0.65)
          gameStateManager.cameraMan.startMoving(Direction.DOWN);
        else if (axis === 3 && nf(val, 0, 2) < 0.5 && nf(val, 0, 2) > -0.5)
          gameStateManager.cameraMan.stopMoving(Direction.UP);
      }
    }
  }
}
