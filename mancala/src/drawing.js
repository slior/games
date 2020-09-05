const {fabric} = require("fabric")
const {range,dbg, ERR, maybe,None} = require("./util.js")


let CELL_SIZE = 50;

let TOP_LEFT = { x : 50, y : 50};
let stoneUIElement = [];


function initCanvas(canvasEl)
{
  let ret = canvasEl && (new fabric.Canvas(canvasEl));
  if (ret)
  {
    ret.line = (x1,y1,x2,y2,c) => drawLineOn(ret,x1,y1,x2,y2,c);
  }
  return ret;
}

function initDrawingElements(cellCount) 
{
  range(1,cellCount).forEach( _ => stoneUIElement.push(None));
}

function rememberUIObj(boardCell,el) { stoneUIElement[boardCell] = maybe(el); }
function forgetUIObj(boardCell) { stoneUIElement[boardCell] = None; }
function uiObjAt(boardCell) { return stoneUIElement[boardCell]; }

function drawLineOn(cnvs,x1,y1,x2,y2,color)
{
  let l = new fabric.Line([x1,y1,x2,y2], {
    stroke: color || 'black',
    strokeWidth: 1,
    selectable: false
  });
  cnvs.add(l);

}

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
  let MARGIN = 5
  board.forAllCells(boardCell => {
    let stonesInCell = board.stonesIn(boardCell);
    switch (true)
    {
      case board.isPlayer1Home(boardCell) : drawOrRemove(boardCell,stonesInCell,(_,stoneCount) => { drawPlayer1Home(stoneCount); }); break;
      case board.isPlayer2Home(boardCell) : drawOrRemove(boardCell,stonesInCell,(_,stoneCount) => { drawPlayer2Home(stoneCount); }); break;
      case board.isPlayer1Cell(boardCell) || board.isPlayer2Cell(boardCell): 
        drawOrRemove(boardCell,stonesInCell,(boardCell,stoneCount) => { drawCell(boardCell,stoneCount); }); 
        break;
      default : ERR ("Invalid board cell when drawing state: " + boardCell); break;
    }
  })

  function drawPlayer1Home(stoneCount)
  {
    dbg("drawing player 1 home: " + stoneCount)
    rememberUIObj(board.player1Home(),
                  drawStones(stoneCount,
                              TOP_LEFT.x + CELL_SIZE / 2 - FONT_SIZE/2-MARGIN,
                              TOP_LEFT.y + CELL_SIZE * 1.5 - FONT_SIZE/2-MARGIN));
  }

  function drawPlayer2Home(stoneCount)
  {
    dbg("drawing player 2 home: " + stoneCount)
    rememberUIObj(board.player2Home(), 
                  drawStones(stoneCount,
                    /* left = */TOP_LEFT.x + boardWidthInCells(board.totalCellCount()) * CELL_SIZE - CELL_SIZE/2 - FONT_SIZE/2-MARGIN, 
                    /* top = */TOP_LEFT.y + CELL_SIZE*1.5-FONT_SIZE/2-MARGIN));

  }

  function drawCell(boardCell,stoneCount)
  {
    var left = 0;
    var top = 0;
    switch (true)
    {
      case board.isPlayer1Cell(boardCell) : 
        top = CELL_SIZE /2 - FONT_SIZE/2 - MARGIN; 
        left = boardCell * CELL_SIZE + CELL_SIZE/2 - FONT_SIZE/2 - MARGIN;
        break;
      case board.isPlayer2Cell(boardCell) : 
        top = CELL_SIZE * 2.5 - FONT_SIZE/2 - MARGIN;
        left = (board.totalCellCount() - boardCell) * CELL_SIZE + CELL_SIZE/2 - FONT_SIZE/2 - MARGIN;
        break;
      default : ERR("Invalid board cell: must be either player 1 or player 2 cell");
    }
    rememberUIObj(boardCell,drawStones(stoneCount,TOP_LEFT.x + left,TOP_LEFT.y + top));
  }

  function drawOrRemove(boardCell,stoneCount,drawFunc)
  {
    if (stoneCount > 0)
    {
      drawFunc(boardCell,stoneCount);
      uiObjAt(boardCell).ifPresent(uiObj => {uiObj.on('mousedown', _ => {dbg('Clicked cell: ' + boardCell + '!')})})

    }
    else removeDrawingAt(boardCell);
  }

  function removeDrawingAt(boardCell) 
  {
    uiObjAt(boardCell).ifPresent(uiObj => {
      cnvs.remove(uiObj);
      forgetUIObj(boardCell);
    });
  }

  function drawStones(stoneCount,left,top)
  {
    let c = new fabric.Circle({originX : 'center',originY : 'center', radius : FONT_SIZE/2+MARGIN, fill : 'white',stroke : 'blue'})
    let t = new fabric.Text(stoneCount+'',{fontSize : FONT_SIZE, originX : 'center',originY : 'center', selectable : false});
    let g = new fabric.Group([c,t], {left : left, top : top, selectable : false,hoverCursor : 'pointer'});
    cnvs.add(g);
    return g;
  }

}

module.exports = {
    drawLineOn : drawLineOn
    , drawBoard : drawBoard
    , initCanvas : initCanvas
    , drawBoardState : drawBoardState
    , initDrawingElements : initDrawingElements
  }