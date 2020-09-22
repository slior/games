
const {dbg,requires,range} = require("./util.js");
const { SimpleAIPlayer } = require ("./SimpleAIPlayer.js")


/**
 * An AI player that prefers capturing stones from the opponent
 * If there's no option to capture, it behaves using the simple strategy - playing with the cell with most stones
 */
class CaptureGreedyAIPlayer
{
    constructor()
    {
        this.simpleStrategy = new SimpleAIPlayer()
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

       let playerCells = side == 1 ? board.player1Cells() : board.player2Cells();
       let maxPlayerCellIndex = Math.max(...playerCells);
       let emptyCellsForPlayer = playerCells.filter(c => board.stonesIn(c) == 0)
       let cellThatCanReachEachEmpty = emptyCellsForPlayer.map(emptyCell => range(emptyCell+1,maxPlayerCellIndex)
                                                                            .filter(c => board.stonesIn(c) == maxPlayerCellIndex - emptyCell)
                                                            )
        dbg(`Cells taht can reach each empty: ${JSON.stringify(cellThatCanReachEachEmpty)}`)
        let chosenCellPerEmptyCell = cellThatCanReachEachEmpty.map(cells => cells.length > 0 ? cells[0] : -1)
        let potentials = chosenCellPerEmptyCell.filter(c => c > -1)

       if (potentials.length > 0) 
       { //sort by the one with most to capture
           potentials.sort((c1,c2) => {
               let cellAcrossC1 = board.totalCellCount() - c1;
               let cellAcrossC2 = board.totalCellCount() - c2;
               return board.stonesIn(cellAcrossC2) - board.stonesIn(cellAcrossC1);
            })
            dbg(`Greedy capture found potentials: ${JSON.stringify(potentials)}. Choosing ${potentials[potentials.length-1]}.`);
            return potentials[potentials.length-1]
        }
        else //no empty cells
            return this.simpleStrategy.nextMove(board,side);
    }

    toString() { return "CaptureGreedyAIPlayer"; }
}

module.exports = {
    CaptureGreedyAIPlayer
  }