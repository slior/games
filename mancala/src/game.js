

const {initCanvas,drawBoard,drawBoardState,initDrawingElements} = require("./drawing.js")
const {Board} = require("./board.js")

const CELL_COUNT = 14;

let board = new Board(CELL_COUNT)

function initGame(cnvsELID)
{
  let cnvs = initCanvas(cnvsELID);
  initDrawingElements(board.totalCellCount());
  drawBoard(cnvs,CELL_COUNT);
  drawBoardState(cnvs,board);
}

module.exports = {
  initGame : initGame
}