
require("should")
const {CaptureGreedyAIPlayer} = require("../src/CaptureGreedyAIPlayer.js")
const {createBoard} = require("../src/board.js")

let player = new CaptureGreedyAIPlayer();

describe("Capture Greedy Player",function() {
    describe("#nextMove",function() {
        it("should return the cell with highest stone count when no capture is available",function() {
            let board = createBoard([0,2,3,4,5,0,4,3,2,1])
            let chosenCell = player.nextMove(board,1);
            chosenCell.should.equal(4); //cell #4 - the right most cell for player 1.
        })

        it("should choose the single available capture when available",function() {
                                   /*0 1 2 3 4 5 6 7 8 9*/
            let board = createBoard([0,0,2,2,2,0,4,3,2,1])
            let chosenCell = player.nextMove(board,1);
            chosenCell.should.equal(3); //cell #3
        })

        it ("should choose the one with the most to capture if more than one capture is possible", function() {
                                   /*0  1 2 3 4  5  6 7 8 9*/
            let board = createBoard([0, 0,0,2,2, 0, 4,3,4,8])
            let chosenCell = player.nextMove(board,1);
            chosenCell.should.equal(3); //cell #3 because it will capture the 8 stones from player 2
        })
    })
})

