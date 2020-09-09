

const {initCanvas,drawBoard,drawBoardState,initDrawingElements} = require("./drawing.js")
const {Board} = require("./board.js")
const {maybe,requires,range} = require("./util.js")

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
    this.showMsg(" ")
    if (!this.isValidMove(boardCell))
      this.showMsg("Invalid Move")
    else 
    {
      let lastCell = this.playCell(boardCell);
      let lastCellIsHomeOfCurrentPlayer = this.player1Playing(this.board.isPlayer1Home(lastCell)) ||
                                          this.player2Playing(this.board.isPlayer2Home(lastCell))
      if (!lastCellIsHomeOfCurrentPlayer)
        this.updatePlayerCallback(this.togglePlayer());
      else 
        this.showMsg("Extra Turn")
      
      this.canvas.ifPresent(cnvs => {
        drawBoardState(cnvs,this.board,this)
      })
      
    }
  }

  player1Playing(andAlso) 
  { 
    return this.player == PLAYER.one && (typeof(andAlso) == undefined ? true : andAlso);
  }

  player2Playing(andAlso)
  { 
    return this.player == PLAYER.two && (typeof(andAlso) == undefined ? true : andAlso);
  }
  

  playCell(boardCell)
  {
    let _ = this.board;
    let targetCells =  range(1,_.stonesIn(boardCell)).map(steps => _.cellFrom(boardCell,steps))
    let lastCell = targetCells[targetCells.length-1];
    let isLastCellEmpty = _.stonesIn(lastCell) == 0;
    let isLastCellAHomeCell = _.isPlayer1Home(lastCell) || _.isPlayer2Home(lastCell);
    let lastCellBelongsToCurrentPlayer = this.player1Playing(_.isPlayer1Cell(lastCell)) || 
                                         this.player2Playing(_.isPlayer2Cell(lastCell))
    
    targetCells.forEach(c => _.addStoneTo(c));

    if (isLastCellEmpty && !isLastCellAHomeCell && lastCellBelongsToCurrentPlayer)
    { //capture the stones from the other player
      let acrossCell = _.totalCellCount() - lastCell;
      _.setCellStoneCount(lastCell,_.stonesIn(lastCell) + _.stonesIn(acrossCell));
      _.setCellStoneCount(acrossCell,0);
    }

    _.setCellStoneCount(boardCell,0);

    return lastCell;

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