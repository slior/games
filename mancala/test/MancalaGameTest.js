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

    describe("player1/2 is playing",function() {
        it("should return true when player 1 is playing and asked for player 1, false for player 2",function() {
            game.player1Playing().should.be.true
            game.player2Playing().should.be.false
        })

        it("should return false for player 1 and true for player 2 when player 2 is playing.", function() {
            game.playCell(2) //this also tests 'toggleplayer'
                game.player1Playing().should.be.false;
                game.player2Playing().should.be.true;
            game.revertBoard();
        })

        it ("should take into account the 'andAlso' parameter passed",function() {
            game.player1Playing(1 == 2).should.be.false;
            game.playCell(1)
                game.player2Playing(3 == 4).should.be.false;
            game.revertBoard()
        })
    })

    describe("isValid",function() {
        it("should return true when asked to play a valid cell",function() {
            game._isValidMove(1).should.be.true;
            game.playCell(1)
                game._isValidMove(TEST_CELL_COUNT-1).should.be.true //testing also for player 2
            game.revertBoard();
        })

        it("should return false for playing the mancalas (player homes)",function() {
            game._isValidMove(0).should.be.false
            game._isValidMove(TEST_CELL_COUNT/2).should.be.false
        })

        it("should return false when asked to make an invalid move",function() {
            game._isValidMove(TEST_CELL_COUNT-1).should.be.false;
            
            game.playCell(1)
                game._isValidMove(2).should.be.false;
            game.revertBoard();
        })
    })

})