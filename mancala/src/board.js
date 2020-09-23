// The data structure representing the board

const {range,ERR,dbg,requires} = require("./util.js");

const INITIAL_STONE_COUNT = 4; //per player cell

/*
    the whole board is simply an array on integers.
    Each cell in the array represents a cell on the board. The value of board[i] is the number of stones in cell i.
    i = 0 => player 1 home
    i = CELL_COUNT/2 => player 2 home
    i = 1,2,.., CELL_COUNT/2 - 1 => player 1 cells (the top row)
    i = CELL_COUNT / 2+1, ... CELL_COUNT-1 => player 2 cells (bottom row)
 */


class Board
{
    constructor(_cellCount)
    {
        this.cellCount = _cellCount;
        this.board = [];
        range(1,this.cellCount).forEach(_ => this.board.push(0))
        this.forAllPlayer1Cells(cellInd => this.setCellStoneCount(cellInd,INITIAL_STONE_COUNT))
        this.forAllPlayer2Cells(cellInd => this.setCellStoneCount(cellInd,INITIAL_STONE_COUNT))
        dbg("Board initialized")
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

    setCellStoneCount(boardCell,cnt) { this.board[boardCell] = cnt }
    stonesIn(boardCell) { return this.board[boardCell]}

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
     * @param {number} currentPlayer The current playing player, either 1 or 2.
     */
    cellFrom(cell,steps,currentPlayer)
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

    addStoneTo(cell)
    {
        this.setCellStoneCount(cell,this.stonesIn(cell)+1)
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

function createBoard(cellArr)
{
    let ret = new Board(cellArr.length)
    range(0,cellArr.length-1).forEach(cell => ret.setCellStoneCount(cell,cellArr[cell]))
    return ret;
}

module.exports = {
    Board
    , createBoard
  }