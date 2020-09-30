


/**
 * 
 * Rules: https://endlessgames.com/wp-content/uploads/Mancala_Instructions.pdf
 * 
 */


const {BoardUI} = require("./drawing.js")
const {ImmutableBoard} = require("./ImmutableBoard.js")
const {requires,range,dbg,None,maybe} = require("./util.js")
const {SimpleAIPlayer} = require("./SimpleAIPlayer.js")
const {RandomAIPlayer} = require("./RandomAIPlayer.js")
const {CaptureGreedyAIPlayer} = require("./CaptureGreedyAIPlayer.js")

const PLAYER = { 
  one : {
    toString : () => "ONE"
    , theOtherOne : () => PLAYER.two
    , number : 1
    , ai : () => PLAYER.one._aiPlayer
    , _aiPlayer : None

  }
  , two : {
    toString : () => "TWO"
    , theOtherOne : () => PLAYER.one
    , number : 2
    , ai : () => PLAYER.two._aiPlayer
    , _aiPlayer : None
  } }


class MancalaGame
{
  constructor(gameSize,cnvsELID,_updatePlayerCallback,_showMsgCallback,requestedAIPlayers,_gameOverCallback)
  {
    requires(_updatePlayerCallback != null,"Must have a player update callback")
    requires(_showMsgCallback != null,"Must have a callback to show messages")
    requires(_gameOverCallback != null,"Game over callback must be not null")

    this.cellCount = gameSize;
    this.gameDone = false;
    this.boards = [];
    this._pushNewBoard(new ImmutableBoard([],this.cellCount))
    this.gameOverCallback = _gameOverCallback


    this.player = PLAYER.one;
    this.updatePlayerCallback = _updatePlayerCallback;
    this.updatePlayerCallback(this.player);
    this._setupAIPlayersIfRequested(requestedAIPlayers);

    this.showMsg = _showMsgCallback;
    
    if (cnvsELID)
    {
      this.boardUI = maybe(new BoardUI(cnvsELID,this.cellCount,this))
      this.boardUI.ifPresent(bui => bui.initializeBoardDrawing());
    }
    else this.boardUI = None; //headless mode

  }

  /**
   * Push a new board to the stack of board states used in this game.
   * @param {ImmutableBoard} ib The board to push
   */
  _pushNewBoard(ib)
  {
    requires(ib != null,"Board can't be null when pushed in game")
    this.boards.push(ib)
  }

  _currentBoard()
  {
    return this.boards[this.boards.length-1]
  }

  _setupAIPlayersIfRequested(requestedAIPlayers)
  {
    dbg("Setting AI Players...");
    PLAYER.one._aiPlayer = maybe(determineAIPlayer(requestedAIPlayers.p1))
    PLAYER.two._aiPlayer = maybe(determineAIPlayer(requestedAIPlayers.p2))

    dbg("AI Players: P1: " + PLAYER.one._aiPlayer + ", P2: " + PLAYER.two._aiPlayer);

    function determineAIPlayer(requestedAI)
    {
      var ret = null;
      switch (requestedAI.toLowerCase())
      {
        case "simple" : ret = new SimpleAIPlayer(); break;
        case "random" : ret = new RandomAIPlayer(); break;
        case "capturegreedy" : ret = new CaptureGreedyAIPlayer(); break;
        default : ret = null;
      }
      return ret;
    }
  }

  start()
  {
    this._makeNextMoveIfCurrentPlayerIsAI();
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
    this._resetGameMessagePanel();
    let lastCell = this.playCell(boardCell);
    this._togglePlayerOrExtraTurn(lastCell)
    this._checkAndDeclareGameOverIfNecessary()
    this._redraw();

    this._makeNextMoveIfCurrentPlayerIsAI()
  }

  _makeNextMoveIfCurrentPlayerIsAI()
  {
    if (!this.gameDone)
    {
      this.player.ai().ifPresent(aiPlayer => {
        let aiMove = aiPlayer.nextMove(this._currentBoard(),this.player.number);
        setTimeout(() => { this._makeMove(aiMove)}, 200) //artifical wait, so we can "see" the ai playing
      })
    }
  }

  _resetGameMessagePanel()
  {
    this.showMsg(" ")
  }

  _togglePlayerOrExtraTurn(lastCell)
  {
    let lastCellIsHomeOfCurrentPlayer = this.player1Playing(this._currentBoard().isPlayer1Home(lastCell)) ||
                                        this.player2Playing(this._currentBoard().isPlayer2Home(lastCell))
    if (!lastCellIsHomeOfCurrentPlayer)
      this.updatePlayerCallback(this.togglePlayer());
    else 
      this.showMsg("Extra Turn")
  }

  _checkAndDeclareGameOverIfNecessary()
  {
    let currentPlayerHasNoMoreMoves = this.player1Playing(this._currentBoard().allPlayer1Cells(c => this._currentBoard().stonesIn(c) <= 0)) ||
                                      this.player2Playing(this._currentBoard().allPlayer2Cells(c => this._currentBoard().stonesIn(c) <= 0))
    if (currentPlayerHasNoMoreMoves)
      this._gameOver();
  }

  _redraw()
  {
    this.boardUI.ifPresent(_ => _.drawBoardState(this._currentBoard(),this));
  }

  _gameOver()
  {
    let player1StoneCount = this._currentBoard().player1StoneCount();
    let player2StoneCount = this._currentBoard().player2StoneCount();

    let results = { player1StoneCount : player1StoneCount, player2StoneCount : player2StoneCount}

    switch (true)
    {
      case player1StoneCount > player2StoneCount : results.winner = 1; break;
      case player2StoneCount > player1StoneCount : results.winner = 2; break;
      default : results.isDraw = true; break;
    }

    this.gameOverCallback(results);

    this.setGameOver();
  }

  setGameOver() { this.gameDone = true; }

  player1Playing(andAlso,p)
  { 
    let pl = p || this.player
    return pl == PLAYER.one && (typeof(andAlso) == undefined ? true : andAlso);
  }

  player2Playing(andAlso,p)
  { 
    let pl = p || this.player
    return pl == PLAYER.two && (typeof(andAlso) == undefined ? true : andAlso);
  }
  
  theBoard() { return this._currentBoard(); }

  makeMoveOnBoard(board,forPlayer,cell)
  { //TODO: this should be factored out of the class
    requires(board != null, "Board can't be null when calculating move on board")
    requires(forPlayer == 1 || forPlayer == 2,"for player must be either 1 or 2")

    let player = forPlayer == 1 ? PLAYER.one : PLAYER.two;

    return this.playCell(cell,board,player);
  }

  playCell(boardCell,b,p)
  {
    var _ = b || this._currentBoard();
    let targetCells = this._calculateTargetCellsForMove(boardCell,b,p);
    let lastCell = targetCells[targetCells.length-1];
    let lastCellWasEmpty = _.stonesIn(lastCell) == 0;
    this._pushNewBoard(_.addStoneToEachOf(targetCells)
                        ._setCellStoneCount(boardCell,0));

    this._checkAndCaptureIfNecessary(lastCell,lastCellWasEmpty,b,p);

    return lastCell;
  }

  _calculateTargetCellsForMove(fromCell,b,p)
  {
    let _ = b || this._currentBoard();
    let pl = p || this.player
    let stepCount = _.stonesIn(fromCell);
    dbg("Playing " + stepCount + " stones from cell " + fromCell)
    let targetCells =  range(1,stepCount)
                        .map(steps => _.cellFrom(fromCell,steps,pl.number))
                        .filter(c => c != _.homeOf(pl.theOtherOne().number)) //remove, if applicable, the cell of the other player's mancala
    while (targetCells.length < stepCount) //add any cells, until we reach a situation where we have enough holes to fill (per the stone count in the played cell)
    {
      let addedCell = _.cellFrom(targetCells[targetCells.length-1],1)
      if (addedCell == _.homeOf(pl.theOtherOne().number))
        targetCells.push(_.cellFrom(addedCell,1))
      else
        targetCells.push(addedCell)
    }
    return targetCells;
  }


  _checkAndCaptureIfNecessary(lastCell,lastCellWasEmpty,b,p)
  {
    let _ = b || this._currentBoard();
    let pl = p || this.player;
    let isLastCellAHomeCell = _.isPlayer1Home(lastCell) || _.isPlayer2Home(lastCell);
    let lastCellBelongsToCurrentPlayer = this.player1Playing(_.isPlayer1Cell(lastCell),pl) || 
                                         this.player2Playing(_.isPlayer2Cell(lastCell),pl)

    if (lastCellWasEmpty && !isLastCellAHomeCell && lastCellBelongsToCurrentPlayer)
    { //capture the stones from the other player
      let acrossCell = _.totalCellCount() - lastCell;
      let targetHome = pl == PLAYER.one ? _.player1Home() : _.player2Home();
      let totalCapturedStones = _.stonesIn(lastCell) + _.stonesIn(acrossCell);
      dbg("Capturing stones from " + acrossCell + " and " + lastCell + " to " + targetHome + ". Total: " + totalCapturedStones )
      let newBoard = _._setCellStoneCount(targetHome,_.stonesIn(targetHome) + totalCapturedStones)
                      ._setCellStoneCount(acrossCell,0)
                      ._setCellStoneCount(lastCell,0);
      this._pushNewBoard(newBoard);

    }
  }

  isValidMove(boardCell)
  {
    let isValidPlayer1Move = this.player == PLAYER.one && this._currentBoard().isPlayer1Cell(boardCell);
    let isValidPlayer2Move = this.player == PLAYER.two && this._currentBoard().isPlayer2Cell(boardCell);
    return isValidPlayer1Move || isValidPlayer2Move;
  }

  togglePlayer()
  {
    this.player = this.player.theOtherOne();
    this.boardUI.ifPresent(_ => _.toggleHighlights(this.player.number));
    return this.player;
  }
}

module.exports = {
  MancalaGame
}