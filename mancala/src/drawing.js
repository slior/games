const {fabric} = require("fabric")
const {range,dbg, ERR} = require("./util.js")

function initCanvas(canvasEl)
{
  let ret = canvasEl && (new fabric.Canvas(canvasEl));
  if (ret)
  {
    ret.line = (x1,y1,x2,y2,c) => drawLineOn(ret,x1,y1,x2,y2,c);
  }
  return ret;
}

function drawLineOn(cnvs,x1,y1,x2,y2,color)
{
  let l = new fabric.Line([x1,y1,x2,y2], {
    stroke: color || 'black',
    strokeWidth: 1,
    selectable: false
  });
  cnvs.add(l);

}

let CELL_SIZE = 50;

let TOP_LEFT = { x : 50, y : 50};

function boardWidthInCells(cellCount) { 
  let playerCellCount = cellCount/2-1;
  return playerCellCount+2; // +2 for player home cells
} 


/**
 * 
 * @param {fabric.Canvas} cnvs The canvas to draw on, as returned from { initCanvas }
 */
function drawBoard(cnvs,cellCount)
{
  let _boardWidthInCells = boardWidthInCells(cellCount)
  let boardHeightInCells = 3;

    //frame
    horizLine(TOP_LEFT.x,TOP_LEFT.y,_boardWidthInCells * CELL_SIZE); //top left to top right
    verticalLine(TOP_LEFT.x,TOP_LEFT.y,CELL_SIZE*boardHeightInCells); //top left to bottom left
    horizLine(TOP_LEFT.x,TOP_LEFT.y + CELL_SIZE*boardHeightInCells,_boardWidthInCells * CELL_SIZE); // bottom left to bottom right
    verticalLine(TOP_LEFT.x + _boardWidthInCells * CELL_SIZE,TOP_LEFT.y,CELL_SIZE * boardHeightInCells); //top right to bottom right

    //home cells
    verticalLine(TOP_LEFT.x + CELL_SIZE,TOP_LEFT.y,CELL_SIZE*boardHeightInCells)
    verticalLine(TOP_LEFT.x + CELL_SIZE*(_boardWidthInCells-1),TOP_LEFT.y,CELL_SIZE*boardHeightInCells)

    //cell horizontal lines
    let upperCellY = TOP_LEFT.y + CELL_SIZE;
    let lowerCellY = TOP_LEFT.y + CELL_SIZE*2;
    let lineLen = (_boardWidthInCells-2)*CELL_SIZE;

    horizLine(TOP_LEFT.x + CELL_SIZE,upperCellY,lineLen)
    horizLine(TOP_LEFT.x + CELL_SIZE,lowerCellY,lineLen)
    
    //cell borders
    range(2,cellCount/2).map(cellNum => { 
        verticalLine(TOP_LEFT.x + cellNum*CELL_SIZE,TOP_LEFT.y,CELL_SIZE)
        verticalLine(TOP_LEFT.x + cellNum*CELL_SIZE,TOP_LEFT.y+CELL_SIZE*(boardHeightInCells-1),CELL_SIZE)
      } )

    function verticalLine(x,y,len) { cnvs.line(x,y,x,y+len); }

    function horizLine(x,y,len) { cnvs.line(x,y,x+len,y); } 

}

function drawBoardState(cnvs,board)
{
  dbg("drawing board state")
  let FONT_SIZE = 20;
  board.forAllCells(boardCell => {
    let stonesInCell = board.stonesIn(boardCell);
    switch (true)
    {
      case board.isPlayer1Home(boardCell) : drawPlayer1Home(stonesInCell); break;
      case board.isPlayer2Home(boardCell) : drawPlayer2Home(stonesInCell); break;
      case board.isPlayer1Cell(boardCell) || board.isPlayer2Cell(boardCell): drawCell(boardCell,stonesInCell); break;
      default : ERR ("Invalid board cell when drawing state: " + boardCell); break;
    }
  })

  function drawPlayer1Home(stoneCount)
  {
    dbg("drawing player 1 home: " + stoneCount)
    drawText(stoneCount,TOP_LEFT.x + CELL_SIZE / 2 - FONT_SIZE/2,TOP_LEFT.y + CELL_SIZE * 1.5 - FONT_SIZE/2)
  }

  function drawPlayer2Home(stoneCount)
  {
    dbg("drawing player 2 home: " + stoneCount)
    drawText(stoneCount,TOP_LEFT.x + boardWidthInCells(board.totalCellCount()) * CELL_SIZE - CELL_SIZE/2 - FONT_SIZE/2,TOP_LEFT.y + CELL_SIZE*1.5-FONT_SIZE/2)
  }

  function drawCell(boardCell,stoneCount)
  {
    var left = 0;
    var top = 0;
    switch (true)
    {
      case board.isPlayer1Cell(boardCell) : 
        top = CELL_SIZE /2 - FONT_SIZE/2; 
        left = boardCell * CELL_SIZE + CELL_SIZE/2 - FONT_SIZE/2;
        break;
      case board.isPlayer2Cell(boardCell) : 
        top = CELL_SIZE * 2.5 - FONT_SIZE/2;
        left = (board.totalCellCount() - boardCell) * CELL_SIZE + CELL_SIZE/2 - FONT_SIZE/2;
        break;
      default : ERR("Invalid board cell: must be either player 1 or player 2 cell");
    }
    drawText(stoneCount,TOP_LEFT.x + left,TOP_LEFT.y + top);
  }

  function drawText(txt,left,top)
  {
    dbg("drawing " + txt + " at " + top + "," + left);
    cnvs.add(new fabric.Text(txt+'',{fontSize : FONT_SIZE, left : left, top : top, selectable : false}))
  }
}

module.exports = {
    drawLineOn : drawLineOn
    , drawBoard : drawBoard
    , initCanvas : initCanvas
    , drawBoardState : drawBoardState
  }