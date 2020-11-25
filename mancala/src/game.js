


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
const {MinMaxAIPlayer,EvaluationFunctions} = require("./MinMaxAIPlayer.js")

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
  /**
   * 
   * @param {Number} gameSize The size of the board to play. Must be an even positive integer
   * @param {String} cnvsELID The element id of the canvas element showing the board
   * @param {PLAYER => void} _updatePlayerCallback A callback for updating the current player
   * @param {String => void} _showMsgCallback A callback for showing messages to the player
   * @param {Object} requestedAIPlayers An object with keys 'p1','p2' with string values denoting AI players to play. Can't be null.
   * @param {Object => void} _gameOverCallback A callback for notifying the game is ever; receives an object with keys for the 'winner' and player1/2 stone counts + whether the result is a draw.
   */
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

  /**
   * Retrieve the last board played.
   * @returns the last board played in this game
   */
  _currentBoard()
  {
    return this.boards[this.boards.length-1]
  }

  _setupAIPlayersIfRequested(requestedAIPlayers)
  {
    dbg("Setting AI Players...");
    PLAYER.one._aiPlayer = maybe(determineAIPlayer(requestedAIPlayers.p1,this))
    PLAYER.two._aiPlayer = maybe(determineAIPlayer(requestedAIPlayers.p2,this))

    dbg("AI Players: P1: " + PLAYER.one._aiPlayer + ", P2: " + PLAYER.two._aiPlayer);

    function determineAIPlayer(requestedAI,thisGame)
    {
      var ret = null;
      let aiType = (requestedAI || "").toLowerCase()
      switch (true)
      {
        case aiType == "simple" : ret = new SimpleAIPlayer(); break;
        case aiType == "random" : ret = new RandomAIPlayer(); break;
        case aiType == "capturegreedy" : ret = new CaptureGreedyAIPlayer(); break;
        case aiType.startsWith('minmax') : 
          let a = aiType.split('-')
          requires(a.length == 3,"MinMax AI player type not formatted correctly, must specify strength: 'minmax-<evalfunc>-<strength>'")
          let strength = a[2];
          let evalFunc = EvaluationFunctions[a[1]]
          ret = new MinMaxAIPlayer(thisGame,strength,evalFunc); 
          break;
        default : ret = null;
      }
      return ret;
    }
  }

  /**
   * Return whether the game is being played with a UI or not (=headless).
   * @returns true if it's a headless (no UI) game.
   */
  _isHeadless()
  {
    return this.boardUI == None
  }

  /**
   * Start the game.
   * Useful when the 1st player is an AI player.
   */
  start()
  {
    this._makeNextMoveIfCurrentPlayerIsAI();
  }

  /**
   * Handle UI input - a single cell choice by a player. Essentially make the move played (if valid).
   * @param {number} boardCell The cell board that was clicked.
   */
  handleCellClick(boardCell)
  {
    if (!this.gameDone)
    {
      this._resetGameMessagePanel();
      if (this._isValidMove(boardCell))
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
        setTimeout(() => { this._makeMove(aiMove)}, this._isHeadless() ? 0 : 200) //artifical wait, so we can "see" the ai playing
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

  /**
   * Set the game state to be over
   */
  setGameOver() { this.gameDone = true; }

  /**
   * Test whether the current (or given) player is player 1 + combines it with another test.
   * @param {boolean} andAlso The result of another predicate tested to conjoin with whether the 1st player is playing. Optional, defaults to true (i.e. doesn't affect the result)
   * @param {PLAYER} p A different player to test, not the current game player. Optional
   * @returns TRUE iff the current or given player is PLAYER.one and the given parameter is true (if given).
   */
  player1Playing(andAlso,p)
  { 
    return this._testCurrentPlayer(1,andAlso,p);
  }

  /**
   * Test whether the current (or given) player is player 2 + combines it with another test.
   * @param {boolean} andAlso The result of another predicate tested to conjoin with whether the 2nd player is playing. Optional, defaults to true (i.e. doesn't affect the result)
   * @param {PLAYER} p A different player to test, not the current game player. Optional
   * @returns TRUE iff the current or given player is PLAYER.one and the given parameter is true (if given).
   */
  player2Playing(andAlso,p)
  { 
    return this._testCurrentPlayer(2,andAlso,p);
  }

  _testCurrentPlayer(sideToTest,andAlso,p)
  {
    requires(sideToTest == 1 || sideToTest == 2,"Side must be either 1 or 2")

    let pl = p || this.player;
    return (sideToTest == 1 ? pl == PLAYER.one : pl == PLAYER.two) &&
            (typeof(andAlso) === 'undefined' ? true : andAlso)
  }
  
  /**
   * Return the current game board.
   */
  theBoard() { return this._currentBoard(); }

  /**
   * Revert the last board play, as if the last move didn't occur.
   * @throws an error if there's only one board (the initial one)
   */
  revertBoard() 
  {
    if (this.boards.length <= 1) throw new Error("Can't revert initial state")
    this.boards.pop();
  }

  /**
   * Given a board a side and cell to play - make the move on the board.
   * @param {ImmutableMancalaBoard} board The board on which to play
   * @param {number (1|2)} forPlayer The side to play for, either 1 or 2.
   * @param {number} cell The cell to play
   */
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
    requires(_.stonesIn(boardCell) > 0,`Can't play cell ${boardCell} for board: ${JSON.stringify(_)} - it has no stones`)
    
    let targetCells = this._calculateTargetCellsForMove(boardCell,b,p);
    let lastCell = targetCells[targetCells.length-1];
    let lastCellWasEmpty = _.stonesIn(lastCell) == 0;

    let newBoard = _.addStoneToEachOf(targetCells)
                  ._setCellStoneCount(boardCell,0)

    this._checkAndCaptureIfNecessary(lastCell,lastCellWasEmpty,newBoard,p); //will also push the board to the board stack

    return lastCell;
  }

  _calculateTargetCellsForMove(fromCell,b,p)
  {
    let _ = b || this._currentBoard();
    let pl = p || this.player
    let stepCount = _.stonesIn(fromCell);
    let targetCells =  range(1,stepCount)
                        .map(steps => _.cellFrom(fromCell,steps,pl.number))
                        .filter(c => c != _.homeOf(pl.theOtherOne().number)) //remove, if applicable, the cell of the other player's mancala
    while (targetCells.length < stepCount) //add any cells, until we reach a situation where we have enough cells to fill (per the stone count in the played cell)
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
      let boardAfterCapture = _._setCellStoneCount(targetHome,_.stonesIn(targetHome) + totalCapturedStones)
                               ._setCellStoneCount(acrossCell,0)
                               ._setCellStoneCount(lastCell,0);
      this._pushNewBoard(boardAfterCapture);
    }
    else
      this._pushNewBoard(_);
  }

  _isValidMove(boardCell)
  {
    let isValidPlayer1Move = this.player == PLAYER.one && this._currentBoard().isPlayer1Cell(boardCell);
    let isValidPlayer2Move = this.player == PLAYER.two && this._currentBoard().isPlayer2Cell(boardCell);
    return isValidPlayer1Move || isValidPlayer2Move;
  }

  /**
   * Toggle the current player to the other one
   */
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