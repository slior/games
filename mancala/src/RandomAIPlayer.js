
const {dbg,requires} = require("./util.js");

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

/**
 * An AI player that simply randomizes a cell selection
 */
class RandomAIPlayer
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
        let availableCells = []
        switch (side)
        {
            case 1 : board.forAllPlayer1Cells(c => { if (board.stonesIn(c) > 0) availableCells.push(c) })
            case 2 : board.forAllPlayer2Cells(c => { if (board.stonesIn(c) > 0) availableCells.push(c) })
        }

        let chosen = randomInteger(0,availableCells.length-1);

        dbg("Playing cell: " + availableCells[chosen] + " with " + board.stonesIn(availableCells[chosen]) + " for player " + side);
        return availableCells[chosen];
    }

    toString() { return "RandomAIPlayer"; }
}

module.exports = {
    RandomAIPlayer
  }