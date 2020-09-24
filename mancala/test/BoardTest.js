require("should")

const {Board} = require("../src/board.js")

const TEST_CELL_COUNT = 10;

let board = new Board(TEST_CELL_COUNT)

describe("Mancala Board", function() {
    it ("should have the cell count as it was initialized with", function() {
        board.totalCellCount().should.equal(TEST_CELL_COUNT)
    })

    it ("should be initialized with 4 stones in each player cell",function() {
        let testResult = board.allPlayer1Cells(c => board.stonesIn(c) == 4) &&
                         board.allPlayer2Cells(c => board.stonesIn(c) == 4)
        testResult.should.be.true()
    })

    it ("should have 0 stones each of the mancalas (home cell)",function() {
        board.stonesIn(board.player1Home()).should.equal(0)
        board.stonesIn(board.player2Home()).should.equal(0)
    })

    describe("stonesIn",function() {
        it ("should throw an error when given an invalid cell (<0)",function() {
            (() => board.stonesIn(-1)).should.throw(/Board cell must be between 0/)
        })

        it ("should throw an error when given an invalid cell (cell count)",function() { 
            (() => board.stonesIn(TEST_CELL_COUNT)).should.throw(/Board cell must be between 0/)
        })

        it ("should return the number of stones in a valid cell", function() {
            board.stonesIn(1).should.equal(4) //the initial number
        })
    })

})