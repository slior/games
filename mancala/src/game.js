

const {initCanvas,drawBoard,drawBoardState,initDrawingElements} = require("./drawing.js")
const {Board} = require("./board.js")
const {dbg, None,maybe} = require("./util.js")

const CELL_COUNT = 14;

let board = new Board(CELL_COUNT)
var canvas = None;

function initGame(cnvsELID)
{
  canvas = maybe(initCanvas(cnvsELID));
  canvas.ifPresent(cnvs => {
    initDrawingElements(board.totalCellCount());
    drawBoard(cnvs,CELL_COUNT);
    drawBoardState(cnvs,board,boardClickHandler);
  })
}

function boardClickHandler(boardCell)
{
  board.playCell(boardCell);
  canvas.ifPresent(cnvs => {
    drawBoardState(cnvs,board,boardClickHandler)
  })

}

module.exports = {
  initGame : initGame
}