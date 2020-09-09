

const {initCanvas,drawBoard,drawBoardState,initDrawingElements} = require("./drawing.js")
const {Board} = require("./board.js")
const {maybe,requires} = require("./util.js")

const CELL_COUNT = 14;

const PLAYER = { 
  one : {
    toString : () => "ONE"
    , theOtherOne : () => PLAYER.two
  }
  , two : {
    toString : () => "TWO"
    , theOtherOne : () => PLAYER.one
  } }

class MancalaGame
{
  constructor(cnvsELID,_updatePlayerCallback,_showMsgCallback)
  {
    requires(_updatePlayerCallback != null,"Must have a player update callback")
    requires(_showMsgCallback != null,"Must have a callback to show messages")

    this.board = new Board(CELL_COUNT);
    this.player = PLAYER.one;
    this.updatePlayerCallback = _updatePlayerCallback;
    this.updatePlayerCallback(this.player);

    this.showMsg = _showMsgCallback;
    
    this.canvas = maybe(initCanvas(cnvsELID));
    this.canvas.ifPresent(cnvs => {
      initDrawingElements(this.board.totalCellCount());
      drawBoard(cnvs,CELL_COUNT);
      drawBoardState(cnvs,this.board,this);
    })
  }

  handleCellClick(boardCell)
  {
    if (!this.isValidMove(boardCell))
      this.showMsg("Invalid Move")
    else 
    {
      this.showMsg(" ")
      this.board.playCell(boardCell);
      this.updatePlayerCallback(this.togglePlayer());
      
      this.canvas.ifPresent(cnvs => {
        drawBoardState(cnvs,this.board,this)
      })
      
    }
  }

  isValidMove(boardCell)
  {
    let isValidPlayer1Move = this.player == PLAYER.one && this.board.isPlayer1Cell(boardCell);
    let isValidPlayer2Move = this.player == PLAYER.two && this.board.isPlayer2Cell(boardCell);
    return isValidPlayer1Move || isValidPlayer2Move;
  }

  togglePlayer()
  {
    this.player = this.player.theOtherOne();
    return this.player;
  }
}

module.exports = {
  MancalaGame
}