require("should")

const {ImmutableBoard} = require("../src/ImmutableBoard.js")

const TEST_CELL_COUNT = 10;

let board = new ImmutableBoard([],TEST_CELL_COUNT)

describe("Immutable Mancala Board", function() {
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

    describe("setCellStoneCount",function() {
        it ("should not change the original board it was invoked on",function() {
            let testCell = 2;
            let initialCount = board.stonesIn(testCell);
            board._setCellStoneCount(testCell,initialCount+1);
            board.stonesIn(testCell).should.equal(initialCount)
        })

        it("should create a new board with the change requested",function() {
            let testCell = 3;
            let initialCount = board.stonesIn(testCell);
            let newBoard = board._setCellStoneCount(testCell,initialCount+1);
            newBoard.stonesIn(testCell).should.equal(initialCount+1)
        })
    })

    describe("cellFrom",function() {
        it ("should return the correct cell, without going through Mancala", function() {
            board.cellFrom(3,1).should.equal(2)
            board.cellFrom(4,2).should.equal(2)
            board.cellFrom(9,3).should.equal(6)
        })

        it ("should throw an error when given an invalid cell",function() {
            (() => board.cellFrom(TEST_CELL_COUNT,1)).should.throw(/Invalid cell/)
        })

        it ("should cycle through the cells, when more steps than cell count is required", function() {
            board.cellFrom(1,TEST_CELL_COUNT+2).should.equal(9)
            board.cellFrom(7,TEST_CELL_COUNT+4).should.equal(3)
        })
    })

})