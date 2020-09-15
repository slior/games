const {fabric} = require("fabric")
const {range, ERR, maybe,None,requires} = require("./util.js")


let CELL_SIZE = 50;

let TOP_LEFT = { x : 50, y : 50};
let FONT_SIZE = 20;
let MARGIN = 5

/**
 * The class dealing with the drawing of the game board in a browser.
 */
class BoardUI
{
  constructor(canvasEl,cellCount,controller)
  {
    this.canvas = this._initCanvas(canvasEl);
    this.cellCount = cellCount
    this.controller = controller;
    this.p1Highlight = null;
    this.p2Highlight = null;
    this.stoneUIElement = [];
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
    let drawP1Home = this._drawPlayer1Home
    let drawP2Home = this._drawPlayer2Home
    let drawCell = this._drawCell

    board.forAllCells(boardCell => {
      let stonesInCell = board.stonesIn(boardCell);
      switch (true)
      {
        case board.isPlayer1Home(boardCell) : this._drawOrRemove(boardCell,stonesInCell,(_,stoneCount) => { drawP1Home(this,board,stoneCount); },false,controller); break;
        case board.isPlayer2Home(boardCell) : this._drawOrRemove(boardCell,stonesInCell,(_,stoneCount) => { drawP2Home(this,board,stoneCount); },false,controller); break;
        case board.isPlayer1Cell(boardCell) || board.isPlayer2Cell(boardCell): 
          this._drawOrRemove(boardCell,stonesInCell,(bc,stoneCount) => { drawCell(this,board,bc,stoneCount); },true,controller);
          break;
        default : ERR ("Invalid board cell when drawing state: " + boardCell); break;
      }
    })
  
  } //end of drawBoardState

  _drawStones(stoneCount,left,top,isClickable)
  {
    let c = new fabric.Circle({originX : 'center',originY : 'center', radius : FONT_SIZE/2+MARGIN, fill : 'white',stroke : 'blue'})
    let t = new fabric.Text(stoneCount+'',{fontSize : FONT_SIZE, originX : 'center',originY : 'center', selectable : false});
    let g = new fabric.Group([c,t], {left : left, top : top, selectable : false,hoverCursor : isClickable ? 'pointer' : 'default'});
    this.canvas.add(g);
    return g;
  }


  _drawPlayer1Home(thiz,board,stoneCount)
  {
    thiz._rememberUIObj(board.player1Home(),
                      thiz._drawStones(stoneCount,
                      /* left = */ TOP_LEFT.x + CELL_SIZE / 2 - FONT_SIZE/2-MARGIN,
                      /* top = */  TOP_LEFT.y + CELL_SIZE * 1.5 - FONT_SIZE/2-MARGIN,
                      /* clickable = */ false));
  }

  _drawPlayer2Home(thiz,board,stoneCount)
  {
    thiz._rememberUIObj(board.player2Home(), 
                       thiz._drawStones(stoneCount,
                    /* left = */TOP_LEFT.x + thiz._boardWidthInCells() * CELL_SIZE - CELL_SIZE/2 - FONT_SIZE/2-MARGIN, 
                    /* top = */TOP_LEFT.y + CELL_SIZE*1.5-FONT_SIZE/2-MARGIN,
                    /* clickable = */ false));
  }


  _drawCell(thiz,board,boardCell,stoneCount)
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
    thiz._rememberUIObj(boardCell,thiz._drawStones(stoneCount,TOP_LEFT.x + left,TOP_LEFT.y + top,true));
  }

  _drawOrRemove(boardCell,stoneCount,drawFunc,drawClickable,controller)
  {
    if (stoneCount > 0)
    { 
      this._removeDrawingAt(boardCell);
      drawFunc(boardCell,stoneCount,drawClickable);
      if (drawClickable) this._uiObjAt(boardCell).ifPresent(uiObj => {uiObj.on('mousedown', _ => { controller.handleCellClick(boardCell); })})

    }
    else this._removeDrawingAt(boardCell);
  }

  _removeDrawingAt(boardCell) 
  {
    this._uiObjAt(boardCell).ifPresent(uiObj => {
      this.canvas.remove(uiObj);
      this._forgetUIObj(boardCell);
    });
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
        this.canvas.add(this.p1Highlight); 
        this.canvas.remove(this.p2Highlight);
        break;
      case 2 : 
        this.canvas.add(this.p2Highlight);
        this.canvas.remove(this.p1Highlight);
        break;
    }
  }

  _initDrawingElements() 
  {
    range(1,this.cellCount).forEach( _ => this.stoneUIElement.push(None));
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
    this.p1Highlight = new fabric.Line([l,t,l+w,t],{selectable:false,stroke:'red',strokeWidth:3})
    this.p2Highlight = new fabric.Line([l,t+(boardHeightInCells*CELL_SIZE),l+w,t+(boardHeightInCells*CELL_SIZE)],{selectable:false,stroke:'red',strokeWidth:3})
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

  _rememberUIObj(boardCell,el) { this.stoneUIElement[boardCell] = maybe(el); }
  _forgetUIObj(boardCell) { this.stoneUIElement[boardCell] = None; }
  _uiObjAt(boardCell) { 
    return this.stoneUIElement[boardCell];  
  }

} //end of class BoardUI

function drawLineOn(cnvs,x1,y1,x2,y2,color)
{
  let l = new fabric.Line([x1,y1,x2,y2], {
    stroke: color || 'black',
    strokeWidth: 1,
    selectable: false
  });
  cnvs.add(l);
}

module.exports = {
    BoardUI
}