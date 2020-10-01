const {dbg,requires} = require("./util.js");
const {createBoard} = require("./board.js")

class MinMaxAIPlayer
{
    constructor(game)
    {
        this.game = game;
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
        let searchResult = this._minMaxSearch({board : board},10,side == 1);
        dbg(`MinMax's result: ${JSON.stringify(searchResult)}`)
        return searchResult.cellToMove || searchResult.cell;
    }

    /*
    function minimax(node, depth, maximizingPlayer) is  
        if depth ==0 or node is a terminal node then  
            return static evaluation of node  
    
        if MaximizingPlayer then      // for Maximizer Player  
            maxEva= -infinity            
            for each child of node do  
                eva= minimax(child, depth-1, false)  
                maxEva= max(maxEva,eva)        //gives Maximum of the values  
            return maxEva  
        else                         // for Minimizer player  
            minEva= +infinity   
            for each child of node do  
                eva= minimax(child, depth-1, true)  
                minEva= min(minEva, eva)         //gives minimum of the values  
            return minEva  
     */
    _minMaxSearch(searchFromNode,depth,maximizingPlayer)
    {
        let currentPlayer = maximizingPlayer ? 1 : 2;
        if (depth == 0 || this._isTerminal(searchFromNode.board,currentPlayer))
        {
            searchFromNode.score = this._evaluate(searchFromNode.board,currentPlayer);
            return searchFromNode;
        }
        
        if (maximizingPlayer)
        {
            var maxSubnode = {score:Number.NEGATIVE_INFINITY}
            this._childBoardsOf(searchFromNode.board,currentPlayer).forEach(searchNode => {
                let childNode = this._minMaxSearch(searchNode,depth-1,!maximizingPlayer);
                if (childNode.score > maxSubnode.score)
                {
                    childNode.cellToMove = searchNode.cell;
                    maxSubnode = childNode
                }
            });
            return maxSubnode;
        }
        else //it's a minimizing player
        {
            var minSubnode = { score : Number.POSITIVE_INFINITY };
            this._childBoardsOf(searchFromNode.board,currentPlayer).forEach(searchNode => {
                let childNode = this._minMaxSearch(searchNode,depth-1,!maximizingPlayer);
                if (childNode.score < minSubnode.score)
                {
                    childNode.cellToMove = searchNode.cell;
                    minSubnode = childNode
                }
            })
            dbg(`Minimizing player returning: ${JSON.stringify(minSubnode)}`)
            return minSubnode;
        }

    }

    _isTerminal(board,player)
    {
        return (player == 1 && board.allPlayer1Cells(c => board.stonesIn(c) <= 0)) ||
               (player == 2 && board.allPlayer2Cells(c => board.stonesIn(c) <= 0))
    }

    _evaluate(board,player)
    {
        return player == 1 ? board.player1StoneCount() : board.player2StoneCount()
    }

    _childBoardsOf(board,player)
    {
        let playingCells = player == 1 ? board.player1Cells() : board.player2Cells();
        let childrenBoards = playingCells.filter(c => board.stonesIn(c) > 0)
                                          .map(_cell => {
                                            this.game.makeMoveOnBoard(board,player,_cell);
                                            let ret = {cell : _cell,board : this.game.theBoard()}
                                            this.game.revertBoard();
                                            return ret;
                                          })
        return childrenBoards;
    }
}

module.exports = {
    MinMaxAIPlayer
}