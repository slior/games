// The data structure representing the board - an immutable version of it.

const {range,ERR,dbg,requires} = require("./util.js");

const INITIAL_STONE_COUNT = 4; //per player cell
const MIN_CELL_COUNT = 6;

/*
    the whole board is simply an array on integers.
    Each cell in the array represents a cell on the board. The value of board[i] is the number of stones in cell i.
    i = 0 => player 1 home
    i = CELL_COUNT/2 => player 2 home
    i = 1,2,.., CELL_COUNT/2 - 1 => player 1 cells (the top row)
    i = CELL_COUNT / 2+1, ... CELL_COUNT-1 => player 2 cells (bottom row)
 */

 class ImmutableBoard
{
    /**
     * The c'tor receives the array of stones in each cell - the state of the board.
     * If the received state is empty, a clean state is initialized.
     * If an empty array is given, the board will be initialized to the given number in cellCount
     * @param {integer[]} cellArr An array of numbers representing the stones in each cell. 
     * @param {integer} cellCount The number of cells to initialize the array in case an empty array is given
     */
    constructor(cellArr = [], cellCount = 0)
    {
        requires(cellArr != null || cellCount > 0,"Cell array can't be null if no cell count is given")

        if (cellArr.length == 0)
        {
            requires(cellCount >= MIN_CELL_COUNT,`Requested cell count must be at least ${MIN_CELL_COUNT}`)
            requires(cellCount % 2 == 0,"Requested cell count must be even")

            this.cellCount = cellCount;
            this.board = this._initialState(cellCount)
            dbg("Immutable board initialized to initial state")
        }
        else 
        {
            requires(cellArr.length % 2 == 0, "Number of cells must be even if no cell count is given")
            requires(cellArr.length >= MIN_CELL_COUNT,`Given cell state must have at least ${MIN_CELL_COUNT} cells`)
  
            this.cellCount = cellArr.length;
            this.board = Array.from(cellArr,v => Math.max(v,0));
        }
        
    }

    _initialState(cellCount)
    {
        let ret = [];
        range(1,cellCount).forEach(_ => ret.push(0))
        this.forAllPlayer1Cells(cellInd => ret[cellInd] = INITIAL_STONE_COUNT)
        this.forAllPlayer2Cells(cellInd => ret[cellInd] = INITIAL_STONE_COUNT)
        return ret;
    }

    forAllPlayer2Cells(f)
    {
        if (f)
            range(this.cellCount/2+1,this.cellCount-1).forEach(f)
        else ERR("Invalid function for player 2 cells")
    }

    forAllPlayer1Cells(f)
    {
        if (f)
            range(1,this.cellCount/2-1).forEach(f);
        else
            ERR("Invalid function for player 1 cells")
    }

    /**
     * Return all the cell numbers for player 1.
     */
    player1Cells() { return range(1,this.cellCount/2-1); }

    /**
     * Return all the cell numbers for player 2
     */
    player2Cells() { return range(this.cellCount/2+1,this.cellCount-1) }

    _setCellStoneCount(boardCell,cnt) { 
        requires(boardCell >= 0 && boardCell < this.totalCellCount(),`Board cell must be between 0 (inclusive) and ${this.cellCount} (exclusive)`)
        let newState = Array.from(this.board);
        newState[boardCell] = cnt 
        return new ImmutableBoard(newState);
    }

    stonesIn(boardCell) { 
        requires(boardCell >= 0 && boardCell < this.totalCellCount(),`Board cell must be between 0 (inclusive) and ${this.cellCount} (exclusive)`)
        return this.board[boardCell]
    }

    forAllCells(f)
    {
        if (f) range(0,this.cellCount-1).forEach(boardCell => f(boardCell))
        else ERR("Invalid function for all cells")
    }

    isPlayer1Cell(boardCell) { return boardCell >= 1 && boardCell <= this.cellCount/2-1; }
    isPlayer2Cell(boardCell) { return boardCell >= this.cellCount/2+1 && boardCell <= this.cellCount-1; }

    isPlayer1Home(boardCell) { return boardCell == this.player1Home(); }
    isPlayer2Home(boardCell) { return boardCell == this.player2Home(); }

    player1Home() { return 0; }
    player2Home() { return this.cellCount/2; }

    totalCellCount() { return this.cellCount; }

    /**
     * Calculate a target cell, given a new cell, walking counter-clockwise a number of steps as given
     * @param {number} cell The cell we're starting from
     * @param {number} steps The number of steps to take from this cell, counter-clockwise, to reach the new cell
     */
    cellFrom(cell,steps)
    {
        //walk backwards (counter-clockwise), and if we pass cell 0, add the number of cells again.
        var ret = cell-steps;
        if (ret < 0) ret += this.totalCellCount();
        return ret;
    }

    /**
     * Retrieve the cell number for the home (Mancala) of the given player.
     * @param {numer} player The number of the player whose Mancala we're seeking (1 or 2)
     * @returns The cell number for the given player's Mancala ( either 0 or totalCellCount/2)
     */
    homeOf(player)
    {
        requires(player == 1 || player == 2,"Player number can be either 1 or 2");
        return player == 1 ? this.player1Home() : this.player2Home();
    }

    /**
     * Create a new board by adding a store to the given cell.
     * @param {integer} cell The cell number
     * @returns The new board
     */
    addStoneTo(cell)
    {
        return this._setCellStoneCount(cell,this.stonesIn(cell)+1)
    }

    /**
     * Add one stone to the list of given cells.
     * @param {integer[]} cells list of cells to add one stone to.
     */
    addStoneToEachOf(cells)
    {
        let newArr = Array.from(this.board)
        cells.forEach(cell => newArr[cell] += 1)
        return new ImmutableBoard(newArr);
    }


    allPlayer1Cells(predicate)
    {
        var ret = true;
        this.forAllPlayer1Cells(c => { ret = ret && predicate(c)})
        return ret;
    }

    allPlayer2Cells(predicate)
    {
        var ret = true;
        this.forAllPlayer2Cells(c => { ret = ret && predicate(c)})
        return ret;
    }

    player1StoneCount()
    {
        var ret = this.stonesIn(this.player1Home());
        this.forAllPlayer1Cells(c => { ret += this.stonesIn(c)})
        return ret;
    }

    player2StoneCount()
    {
        var ret = this.stonesIn(this.player2Home())
        this.forAllPlayer2Cells(c => { ret += this.stonesIn(c)})
        return ret;
    }
}

function createCleanBoard(size)
{
    this.board = [];
    range(1,this.cellCount).forEach(_ => this.board.push(0))
    this.forAllPlayer1Cells(cellInd => this.setCellStoneCount(cellInd,INITIAL_STONE_COUNT))
    this.forAllPlayer2Cells(cellInd => this.setCellStoneCount(cellInd,INITIAL_STONE_COUNT))
}


module.exports = {
    ImmutableBoard
  }