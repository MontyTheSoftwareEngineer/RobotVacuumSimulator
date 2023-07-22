/**
 * @file game_map.js
 * @author Hai Pham
 * @summary Defines the GameMap class, which represents a map in a game.
 */

class GameMap {
  /**
   * @brief Creates a new instance of GameMap.
   */
  constructor() {
    this.grid = new Map();
  }

  /**
   * @brief Adds a cell to the game map.
   *
   * @param {Object} cell - The cell object to add to the map.
   */
  addCell(cell) {
    let cellIndex = index(cell.i, cell.j);
    this.grid.set(cellIndex, cell);
  }

  addCellIndex(cellIndex, cell) {
    this.grid.set(cellIndex, cell);
  }

  /**
   * @brief Removes a cell from the game map.
   *
   * @param {number} cellIndex - The index of the cell to remove.
   */
  removeCell(cellIndex) {
    this.grid.delete(cellIndex);
  }

  /**
   * @brief Returns the map grid.
   *
   * @returns {Map} The game map grid.
   */
  getMap() {
    return this.grid;
  }

  /**
   * @brief Displays the cells in the game map.
   */
  showMap() {
    for (const [index, cell] of this.grid.entries()) {
      cell.display();
    }
  }
}
