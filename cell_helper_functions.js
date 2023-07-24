/**
 * @file cell_helper_functions.js
 *
 * @brief Various helper functions for cells
 *
 * @author Hai Pham
 */

/**
 * @brief Helper function that calculates the index of a 2D array element based
 * on its row and column position.
 *
 * @param i The row index of the element (starting from 0).
 * @param j The column index of the element (starting from 0).
 * @return The 1D index representation of (i,j)
 */
function index(i, j) {
  return i + j * gameStateManager.cols;
}

function getCoordinates(index) {
  let i = index % gameStateManager.cols; // column index
  let j = Math.floor(index / gameStateManager.cols); // row index

  return [i, j];
}

/**
 * @brief Helper function that returns an array of neighboring cell indexes relative to an input cell
 *
 * @param inputCellIndex index of cell in interest
 * @return Array containing cell indexes that neighbor the input cell.
 */
function getNeighboringCellIndexes(inputCellIndex) {
  let neighboringCells = [];
  //left cell
  if (inputCellIndex > 0) neighboringCells.push(inputCellIndex - 1);

  //right cell
  neighboringCells.push(inputCellIndex + 1);

  //cell above
  let cellAbove = inputCellIndex - gameStateManager.cols;
  if (cellAbove > 0) neighboringCells.push(cellAbove);

  //cell above
  let cellBelow = inputCellIndex + gameStateManager.cols;
  neighboringCells.push(cellBelow);

  return neighboringCells;
}
