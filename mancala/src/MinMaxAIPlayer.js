const {dbg,requires} = require("./util.js");

class MinMaxAIPlayer
{
    constructor(game,strength,_evalFunc = defaultEvalFunc)
    {
        requires(game != null,"Game can't be null when initializing MinMaxPlayer")
        requires(strength >= 1 && strength <= 10,"MinMax player strength must be between 1 and 10 (inclusive)")

        this.game = game;
        this.startingDepth = strength;
        this.evalFunc = _evalFunc || defaultEvalFunc;
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
        let searchResult = this._minMaxSearch({board : board},this.startingDepth,true,side);
        dbg(`MinMax's result: ${JSON.stringify(searchResult)}`)
        return searchResult.cellToMove || searchResult.cell;
    }

    toString()
    {
        return `MinMax AI Player(${this.startingDepth})`
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
    _minMaxSearch(searchFromNode,depth,maximizingPlayer,currentPlayer)
    {
        if (depth == 0 || this._isTerminal(searchFromNode.board,currentPlayer))
        {
            searchFromNode.score = this._evaluate(searchFromNode.board,currentPlayer) * (maximizingPlayer ? 1 : -1);
            return searchFromNode;
        }
        
        if (maximizingPlayer)
        {
            var maxSubnode = {score:Number.NEGATIVE_INFINITY}
            this._childBoardsOf(searchFromNode.board,currentPlayer).forEach(searchNode => {
                let childNode = this._minMaxSearch(searchNode,depth-1,!maximizingPlayer,currentPlayer == 1 ? 2 : 1);
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
                let childNode = this._minMaxSearch(searchNode,depth-1,!maximizingPlayer,currentPlayer == 1 ? 2 : 1);
                if (childNode.score < minSubnode.score)
                {
                    childNode.cellToMove = searchNode.cell;
                    minSubnode = childNode
                }
            })
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
        return this.evalFunc(board,player)
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


/**
 * 
 * @param {ImmutableBoard} board The board to evaluate
 * @param {number (1|2)} player The number representing the current player. Either 1 or 2.
 * @returns a number evaluating how good the board is for the current player (higher number - better board)
 */
function defaultEvalFunc(board,player)
{
    return player == 1 ? board.player1StoneCount() : board.player2StoneCount()
}

function stoneCountDiffEval(board,player)
{
    let player1Stones = board.player1StoneCount()
    let player2Stones = board.player2StoneCount();

    return player == 1 ? (player1Stones - player2Stones) : (player2Stones - player1Stones);
}


const EvaluationFunctions = {
    "count_diff" : stoneCountDiffEval
}

module.exports = {
    MinMaxAIPlayer
    , EvaluationFunctions
}