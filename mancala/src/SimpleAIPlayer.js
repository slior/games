
const {dbg,requires} = require("./util.js");


class SimpleAIPlayer
{
    constructor()
    {

    }

    /**
     * Given a board and side to play, return the cell to play
     * @param {Board} board The current board to play
     * @param {number} side The side to player, either 1 or 2
     * 
     * @returns The board cell to play
     */
    nextMove(board,side)
    {
        requires(board != null, "Board can't be null for calculating next move")
        requires(side == 1 || side == 2,"Side must be either 1 or 2")

        //Simple heuristic: choose the cell with the largest number of stones.
        var maxStoneCell = side == 1 ? 1 : board.totalCellCount()-1;
        switch (side)
        {
            case 1 : board.forAllPlayer1Cells(c => { if (board.stonesIn(c) > board.stonesIn(maxStoneCell)) maxStoneCell = c })
            case 2 : board.forAllPlayer2Cells(c => { if (board.stonesIn(c) > board.stonesIn(maxStoneCell)) maxStoneCell = c })
        }
        dbg("Playing cell: " + maxStoneCell + " with " + board.stonesIn(maxStoneCell) + " for player " + side);
        return maxStoneCell;
    }
}

module.exports = {
    SimpleAIPlayer
  }