require("should")

const TEST_CELL_COUNT = 10;
const {MancalaGame} = require("../src/game.js")

let game = new MancalaGame(TEST_CELL_COUNT,null,_ => {},msg => { console.log(msg)},{},() => {})

describe("Mancala Game", function() {
    describe("revertBoard",function() {
        it ("should throw an error if the game is in initial state",function() {
            (() => game.revertBoard()).should.throw(/Can't revert initial state/)
        })

        it("should revert to previous board state after a play is made",function() {
            let testCell = 2;
            let originalCellStoneCount = game.theBoard().stonesIn(testCell);
            game.playCell(testCell);
            game.theBoard().stonesIn(testCell).should.equal(0);
            game.revertBoard();
            game.theBoard().stonesIn(testCell).should.equal(originalCellStoneCount)
        })

        it("should revert more than one board state if applicable",function() {
            let cell1 = 1;
            let cell2 = 8;
            let origCell1Count = game.theBoard().stonesIn(cell1);
            let origCell2Count = game.theBoard().stonesIn(cell2);
            game.playCell(cell1); //player 1 plays
            game.theBoard().stonesIn(cell1).should.equal(0);
            game.theBoard().stonesIn(cell2).should.equal(4+1); //1 stone from cell 1
            game.playCell(cell2); //player 2 plays
            game.theBoard().stonesIn(cell2).should.equal(0);
            game.revertBoard();
            game.theBoard().stonesIn(cell2).should.equal(4+1);
            game.revertBoard();
            game.theBoard().stonesIn(cell1).should.equal(origCell1Count);
            game.theBoard().stonesIn(cell2).should.equal(origCell2Count);
        })
    })
})