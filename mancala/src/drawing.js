const {fabric} = require("fabric")
const {range} = require("./util.js")

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

function drawBoard(cnvs)
{
    let CELL_SIZE = 50;
    let CELL_COUNT = 14;

    let TOP_LEFT = { x : 50, y : 50};

    let playerCellCount = CELL_COUNT/2-1;
    let boardWidthInCells = playerCellCount+2 //for the side cells (player homes)
    let boardHeightInCells = 3;

    //frame
    horizLine(TOP_LEFT.x,TOP_LEFT.y,boardWidthInCells * CELL_SIZE); //top left to top right
    verticalLine(TOP_LEFT.x,TOP_LEFT.y,CELL_SIZE*boardHeightInCells); //top left to bottom left
    horizLine(TOP_LEFT.x,TOP_LEFT.y + CELL_SIZE*boardHeightInCells,boardWidthInCells * CELL_SIZE); // bottom left to bottom right
    verticalLine(TOP_LEFT.x + boardWidthInCells * CELL_SIZE,TOP_LEFT.y,CELL_SIZE * boardHeightInCells); //top right to bottom right

    //home cells
    verticalLine(TOP_LEFT.x + CELL_SIZE,TOP_LEFT.y,CELL_SIZE*boardHeightInCells)
    verticalLine(TOP_LEFT.x + CELL_SIZE*(boardWidthInCells-1),TOP_LEFT.y,CELL_SIZE*boardHeightInCells)

    //cell horizontal lines
    let upperCellY = TOP_LEFT.y + CELL_SIZE;
    let lowerCellY = TOP_LEFT.y + CELL_SIZE*2;
    let lineLen = (boardWidthInCells-2)*CELL_SIZE;

    horizLine(TOP_LEFT.x + CELL_SIZE,upperCellY,lineLen)
    horizLine(TOP_LEFT.x + CELL_SIZE,lowerCellY,lineLen)
    
    //cell borders
    range(2,CELL_COUNT/2).map(cellNum => { 
        verticalLine(TOP_LEFT.x + cellNum*CELL_SIZE,TOP_LEFT.y,CELL_SIZE)
        verticalLine(TOP_LEFT.x + cellNum*CELL_SIZE,TOP_LEFT.y+CELL_SIZE*(boardHeightInCells-1),CELL_SIZE)
      } )

    function verticalLine(x,y,len) { cnvs.line(x,y,x,y+len); }

    function horizLine(x,y,len) { cnvs.line(x,y,x+len,y); } 

}

module.exports = {
    drawLineOn : drawLineOn
    , drawBoard : drawBoard
    , initCanvas : initCanvas
  }