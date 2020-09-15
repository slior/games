

const {BoardUI} = require("./drawing.js")
const {Board} = require("./board.js")
const {requires,range,dbg} = require("./util.js")

const PLAYER = { 
  one : {
    toString : () => "ONE"
    , theOtherOne : () => PLAYER.two
    , number : 1
  }
  , two : {
    toString : () => "TWO"
    , theOtherOne : () => PLAYER.one
    , number : 2
  } }


class MancalaGame
{
  constructor(gameSize,cnvsELID,_updatePlayerCallback,_showMsgCallback)
  {
    requires(_updatePlayerCallback != null,"Must have a player update callback")
    requires(_showMsgCallback != null,"Must have a callback to show messages")

    this.cellCount = gameSize;
    this.gameDone = false;
    this.board = new Board(this.cellCount);
    this.player = PLAYER.one;
    this.updatePlayerCallback = _updatePlayerCallback;
    this.updatePlayerCallback(this.player);

    this.showMsg = _showMsgCallback;
    
    this.boardUI = new BoardUI(cnvsELID,this.cellCount,this)
    this.boardUI.initializeBoardDrawing();
  }

  handleCellClick(boardCell)
  {
    if (!this.gameDone)
    {
      this._resetGameMessagePanel();
      if (this.isValidMove(boardCell))
        this._makeMove(boardCell)
      else 
        this.showMsg("Invalid Move")
    }
    else dbg("Game over, stop procrastinating")
  }

  _makeMove(boardCell)
  {
    let lastCell = this.playCell(boardCell);
    this._togglePlayerOrExtraTurn(lastCell)
    this._checkAndDeclareGameOverIfNecessary()
    this._redraw();
  }

  _resetGameMessagePanel()
  {
    this.showMsg(" ")
  }

  _togglePlayerOrExtraTurn(lastCell)
  {
    let lastCellIsHomeOfCurrentPlayer = this.player1Playing(this.board.isPlayer1Home(lastCell)) ||
                                        this.player2Playing(this.board.isPlayer2Home(lastCell))
    if (!lastCellIsHomeOfCurrentPlayer)
      this.updatePlayerCallback(this.togglePlayer());
    else 
      this.showMsg("Extra Turn")
  }

  _checkAndDeclareGameOverIfNecessary()
  {
    let currentPlayerHasNoMoreMoves = this.player1Playing(this.board.allPlayer1Cells(c => this.board.stonesIn(c) <= 0)) ||
                                      this.player2Playing(this.board.allPlayer2Cells(c => this.board.stonesIn(c) <= 0))
    if (currentPlayerHasNoMoreMoves)
      this._gameOver();
  }

  _redraw()
  {
    this.boardUI.drawBoardState(this.board,this);
  }

  _gameOver()
  {
    let player1StoneCount = this.board.player1StoneCount();
    let player2StoneCount = this.board.player2StoneCount();

    let a = ["Game Over","# Stones P1:" + player1StoneCount,"# Stones P2: " + player2StoneCount];
    switch (true)
    {
      case player1StoneCount > player2StoneCount : a.push("Player 1 Wins!"); break;
      case player2StoneCount > player1StoneCount : a.push("Player 2 Wins!"); break;
      default : a.push("Draw!"); break;
    }
    
    this.showMsg(a.join("<br/>"));
    this.setGameOver();
  }

  setGameOver() { this.gameDone = true; }

  player1Playing(andAlso) 
  { 
    return this.player == PLAYER.one && (typeof(andAlso) == undefined ? true : andAlso);
  }

  player2Playing(andAlso)
  { 
    return this.player == PLAYER.two && (typeof(andAlso) == undefined ? true : andAlso);
  }
  
  theBoard() { return this.board }

  playCell(boardCell)
  {
    let _ = this.board;
    let targetCells =  range(1,_.stonesIn(boardCell)).map(steps => _.cellFrom(boardCell,steps))
    let lastCell = targetCells[targetCells.length-1];
    let lastCellWasEmpty = _.stonesIn(lastCell) == 0;
    targetCells.forEach(c => _.addStoneTo(c));
    this._checkAndCaptureIfNecessary(lastCell,lastCellWasEmpty);
    
    _.setCellStoneCount(boardCell,0);

    return lastCell;
  }

  _checkAndCaptureIfNecessary(lastCell,lastCellWasEmpty)
  {
    let _ = this.board;
    let isLastCellAHomeCell = _.isPlayer1Home(lastCell) || _.isPlayer2Home(lastCell);
    let lastCellBelongsToCurrentPlayer = this.player1Playing(_.isPlayer1Cell(lastCell)) || 
                                         this.player2Playing(_.isPlayer2Cell(lastCell))

    if (lastCellWasEmpty && !isLastCellAHomeCell && lastCellBelongsToCurrentPlayer)
    { //capture the stones from the other player
      let acrossCell = _.totalCellCount() - lastCell;
      let targetHome = this.player == PLAYER.one ? _.player1Home() : _.player2Home();
      let totalCapturedStones = _.stonesIn(lastCell) + _.stonesIn(acrossCell);
      dbg("Capturing stones from " + acrossCell + " and " + lastCell + " to " + targetHome + ". Total: " + totalCapturedStones )
      _.setCellStoneCount(targetHome,_.stonesIn(targetHome) + totalCapturedStones);
      _.setCellStoneCount(acrossCell,0);
      _.setCellStoneCount(lastCell,0);
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
    this.boardUI.toggleHighlights(this.player.number);
    return this.player;
  }
}

module.exports = {
  MancalaGame
}