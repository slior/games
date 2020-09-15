const {fabric} = require("fabric")
const {range,dbg, ERR, maybe,None,requires} = require("./util.js")


let CELL_SIZE = 50;

let TOP_LEFT = { x : 50, y : 50};
let stoneUIElement = [];


class BoardUI
{
  constructor(canvasEl,cellCount,controller)
  {
    this.canvas = this._initCanvas(canvasEl);
    this.cellCount = cellCount
    this.controller = controller;
  }

  initializeBoardDrawing()
  {
    this._initDrawingElements();
    this._drawBoard();
    this.drawBoardState(this.controller.theBoard(),this.controller);
    this.toggleHighlights(1) //start w/ player 1 highlighted
  }

  drawBoardState(board,controller)
  {
    let FONT_SIZE = 20;
    let MARGIN = 5
    let cnvs = this.canvas;
    let _boardWCells = this._boardWidthInCells()
    board.forAllCells(boardCell => {
      let stonesInCell = board.stonesIn(boardCell);
      switch (true)
      {
        case board.isPlayer1Home(boardCell) : drawOrRemove(boardCell,stonesInCell,(_,stoneCount) => { drawPlayer1Home(stoneCount); },false); break;
        case board.isPlayer2Home(boardCell) : drawOrRemove(boardCell,stonesInCell,(_,stoneCount) => { drawPlayer2Home(stoneCount); },false); break;
        case board.isPlayer1Cell(boardCell) || board.isPlayer2Cell(boardCell): 
          drawOrRemove(boardCell,stonesInCell,(bc,stoneCount) => { drawCell(bc,stoneCount); },true);
          break;
        default : ERR ("Invalid board cell when drawing state: " + boardCell); break;
      }
    })
  
    function drawPlayer1Home(stoneCount)
    {
      rememberUIObj(board.player1Home(),
                    drawStones(stoneCount,
                        /* left = */ TOP_LEFT.x + CELL_SIZE / 2 - FONT_SIZE/2-MARGIN,
                        /* top = */  TOP_LEFT.y + CELL_SIZE * 1.5 - FONT_SIZE/2-MARGIN,
                        /* clickable = */ false));
    }
  
    function drawPlayer2Home(stoneCount)
    {
      rememberUIObj(board.player2Home(), 
                    drawStones(stoneCount,
                      /* left = */TOP_LEFT.x + _boardWCells * CELL_SIZE - CELL_SIZE/2 - FONT_SIZE/2-MARGIN, 
                      /* top = */TOP_LEFT.y + CELL_SIZE*1.5-FONT_SIZE/2-MARGIN,
                      /* clickable = */ false));
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
      rememberUIObj(boardCell,drawStones(stoneCount,TOP_LEFT.x + left,TOP_LEFT.y + top,true));
    }
  
    function drawOrRemove(boardCell,stoneCount,drawFunc,drawClickable)
    {
      if (stoneCount > 0)
      { 
        removeDrawingAt(boardCell);
        drawFunc(boardCell,stoneCount,drawClickable);
        if (drawClickable) uiObjAt(boardCell).ifPresent(uiObj => {uiObj.on('mousedown', _ => { controller.handleCellClick(boardCell); })})
  
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
  
    function drawStones(stoneCount,left,top,isClickable)
    {
      let c = new fabric.Circle({originX : 'center',originY : 'center', radius : FONT_SIZE/2+MARGIN, fill : 'white',stroke : 'blue'})
      let t = new fabric.Text(stoneCount+'',{fontSize : FONT_SIZE, originX : 'center',originY : 'center', selectable : false});
      let g = new fabric.Group([c,t], {left : left, top : top, selectable : false,hoverCursor : isClickable ? 'pointer' : 'default'});
      cnvs.add(g);
      return g;
    }
  }

  /**
   * Toggle the highlight of the current player to play.
   * @param {number} player The number of the player to highlight, either 1 or 2.
   */
  toggleHighlights(player)
  {
    requires(player == 1 || player == 2,"Invalid player when switching highlights")
    switch (player)
    {
      case 1 : 
        this.canvas.add(p1Highlight); 
        this.canvas.remove(p2Highlight);
        break;
      case 2 : 
        this.canvas.add(p2Highlight);
        this.canvas.remove(p1Highlight);
        break;
    }
  }

  _initDrawingElements() 
  {
    range(1,this.cellCount).forEach( _ => stoneUIElement.push(None));
    this._createHighlights(this.cellCount);
  }

  _drawBoard()
  {
    let cnvs = this.canvas;
    let _boardWidthInCells = this._boardWidthInCells(this.cellCount)
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
      range(2,this.cellCount/2).map(cellNum => { 
          verticalLine(TOP_LEFT.x + cellNum*CELL_SIZE,TOP_LEFT.y,CELL_SIZE)
          verticalLine(TOP_LEFT.x + cellNum*CELL_SIZE,TOP_LEFT.y+CELL_SIZE*(boardHeightInCells-1),CELL_SIZE)
        } )

      function verticalLine(x,y,len) { cnvs.line(x,y,x,y+len); }

      function horizLine(x,y,len) { cnvs.line(x,y,x+len,y); } 
  }

  _createHighlights()
  {
    let _boardWidthInCells = this._boardWidthInCells();
    let w = (_boardWidthInCells -2)* CELL_SIZE;
    let t = TOP_LEFT.y;
    let l = TOP_LEFT.x + CELL_SIZE; 
    let boardHeightInCells = 3;
    p1Highlight = new fabric.Line([l,t,l+w,t],{selectable:false,stroke:'red',strokeWidth:3})
    p2Highlight = new fabric.Line([l,t+(boardHeightInCells*CELL_SIZE),l+w,t+(boardHeightInCells*CELL_SIZE)],{selectable:false,stroke:'red',strokeWidth:3})
  }

  _boardWidthInCells() { 
    let playerCellCount = this.cellCount/2-1;
    return playerCellCount+2; // +2 for player home cells
  } 

  _initCanvas(canvasEl)
  {
    let ret = canvasEl && (new fabric.Canvas(canvasEl));
    if (ret)
    {
      ret.line = (x1,y1,x2,y2,c) => drawLineOn(ret,x1,y1,x2,y2,c);
    }
    else ERR("Invalid canvas element provided")
    return ret;
  }


} //end of class BoardUI

function rememberUIObj(boardCell,el) { stoneUIElement[boardCell] = maybe(el); }
function forgetUIObj(boardCell) { stoneUIElement[boardCell] = None; }
function uiObjAt(boardCell) { return stoneUIElement[boardCell];  }

function drawLineOn(cnvs,x1,y1,x2,y2,color)
{
  let l = new fabric.Line([x1,y1,x2,y2], {
    stroke: color || 'black',
    strokeWidth: 1,
    selectable: false
  });
  cnvs.add(l);
}

var p1Highlight = null;
var p2Highlight = null;


module.exports = {
    BoardUI
}