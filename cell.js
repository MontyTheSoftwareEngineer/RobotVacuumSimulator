/**
 * @file Cell.js
 * @brief A class representing a single cell in a grid.
 *
 * The Cell class encapsulates properties and methods for managing a cell's position,
 * dimensions, walls, and color.
 * @author Hai Pham
 * @author Marvin Kilp
 */

class Cell {
  /**
   * @brief Constructs a new Cell object with the given parameters.
   *
   * @param i The row index of the cell.
   * @param j The column index of the cell.
   * @param cellWidth The width of the cell.
   */
  constructor(i, j, cellWidth) {
    this.i = i;
    this.j = j;
    this.cellWidth = cellWidth;
    this.inRoom = false; //use this for a light stroke for squares in a room
    this.walls = [false, false, false, false]; //top,right,bot,left
    this.r = 22;
    this.g = 22;
    this.b = 22;
    this.text = ""; //for debugging
  }

  /**
   * @brief Sets the RGB values of the cell's color.
   *
   * @param r The red component of the RGB color.
   * @param g The green component of the RGB color.
   * @param b The blue component of the RGB color.
   */
  setRGB(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  /**
   * @brief Sets the presence of walls around the cell.
   *
   * @param hasWalls A boolean value indicating whether the cell should have walls or not.
   */
  setWalls(hasWalls) {
    this.walls[0] = hasWalls;
    this.walls[1] = hasWalls;
    this.walls[2] = hasWalls;
    this.walls[3] = hasWalls;
  }

  /**
   * @brief Draws the walls (if any) and fills the cell with a colored rectangle on the
   * canvas based on the cell's position, dimensions, and color values.
   */
  display() {
    let x = this.i * this.cellWidth - cameraMan.x;
    let y = this.j * this.cellWidth - cameraMan.y;

    stroke(1);
    strokeWeight(0.5);
    if (this.inRoom) {
      line(x, y, x + this.cellWidth, y);
      line(x + this.cellWidth, y, x + this.cellWidth, y + this.cellWidth);
      line(x + this.cellWidth, y + this.cellWidth, x, y + this.cellWidth);
      line(x, y + this.cellWidth, x, y);
    }

    strokeWeight(4);
    if (this.walls[0]) {
      line(x, y, x + this.cellWidth, y);
    }
    if (this.walls[1]) {
      line(x + this.cellWidth, y, x + this.cellWidth, y + this.cellWidth);
    }
    if (this.walls[2]) {
      line(x + this.cellWidth, y + this.cellWidth, x, y + this.cellWidth);
    }
    if (this.walls[3]) {
      line(x, y + this.cellWidth, x, y);
    }

    noStroke();
    if (this.inRoom) {
      fill(this.r, this.g, this.b, 100);
      rect(x, y, this.cellWidth, this.cellWidth);
    }

    fill(0, 0, 0, 255);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(this.text, x + this.cellWidth / 2, y + this.cellWidth / 2);
  }
}
