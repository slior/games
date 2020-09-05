// The data structure representing the board

const {range,ERR,dbg} = require("./util.js");

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
}


module.exports = {
    Board
  }