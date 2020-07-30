
//Assumes prototype.js,config.js is loaded

var MAX_INITIAL_GAME_HEIGHT = 2;
var MIN_DISC_NUMBER = 1;
// var DISCS_TO_LINE_RISE = 

var DropXGame = Class.create({
	initialize : function (_boardSize,_canvas,_countDownCallback,_gameOverCallback,_scoreNotificationCallback) {
		//TODO: validate input
		this.board = new Board(_boardSize);
		this.currentInputDisc = null;

		_canvas.width = this.size() * CONFIG.CELL_SIZE;
		_canvas.height = (this.size() + 1) * CONFIG.CELL_SIZE;
		this.canvas = new fabric.StaticCanvas(_canvas);
		this.blownCells = [];
		this.discsToLineRise = CONFIG.MAX_DISCS_TO_NEW_LINE || _boardSize; //default of board size in case no value is given in configuration
		this.discsToDropUntilLineRise = this.discsToLineRise;
		this.newLineCountdownCallback = _countDownCallback;
		this.gameOver = false;
		this.gameOverCallback = _gameOverCallback;
		this.scoreNotificationCallback = _scoreNotificationCallback;
	},

	shouldInsertLine : function() {
		return this.discsToDropUntilLineRise <= 0;
	}

	, countDiscDropped : function() { this.discsToDropUntilLineRise--; }

	, resetNewLineCounter : function() { 
		this.discsToLineRise = Math.max(1,this.discsToLineRise-1); //reduce the time to a new line every time, to a minimum of 1.
		this.discsToDropUntilLineRise = this.discsToLineRise;
	}

	, draw : function() {
		this.drawGrid();
	},

	drawGrid : function() {
		var cell = 1;
		var gridHeight = this.size() * CONFIG.CELL_SIZE;
		var gridWidth = this.size() * CONFIG.CELL_SIZE;
		$R(0,this.size()).each(function() {
			var lineY = cell * CONFIG.CELL_SIZE;
			this.drawLine(0,lineY,gridWidth,lineY);

			var lineX = cell * CONFIG.CELL_SIZE;
			this.drawLine(lineX,CONFIG.CELL_SIZE,lineX,CONFIG.CELL_SIZE + gridHeight);

			cell++;
		},this);
	},

	drawLine : function(x1,y1,x2,y2) {
		var l = new fabric.Line([x1,y1,x2,y2], {
					fill: CONFIG.GRID_LINE_COLOR,
					strokeWidth: CONFIG.GRID_LINE_WIDTH,
					selectable: false
				  });
		this.canvas.add(l);
	},

	newInputDisc : function(disc) {
		this.newInputDisc(disc);
		this.drawInputDisc();
	},

	drawInputDisc : function() {
		var canvasPos = this.cellToCanvas(this.inputDiscPos());
		if (this.inputDisc() != null) this.inputDisc().drawAt(canvasPos,this.canvas);
	},

	cellToCanvas : function (cell) { return {x : this.boardXToCanvasX(cell.col) + CONFIG.CELL_MARGIN/2, y : this.boardYToCanvasY(cell.row) + CONFIG.CELL_MARGIN/2 }; },

	boardXToCanvasX : function (brdX) { return brdX * CONFIG.CELL_SIZE; },

	boardYToCanvasY : function (brdY) { return brdY * CONFIG.CELL_SIZE; },

	inputDiscRight : function() { this.moveInputDiscRight(); },

	inputDiscLeft : function() { this.moveInputDiscLeft(); },

	dropInputDisc : function() {
		var inpDisc = this.inputDisc();

		let postStabilizationSequence = function() {
			if (!this.isOver())
			{
				this.newInputDisc(this.randomizeDisc());
				this.countDiscDropped();
				if (this.shouldInsertLine())
				{
					this.newBottomLine();
					this.resetNewLineCounter();
				}
				this.newLineCountdownCallback(this.discsToDropUntilLineRise);
			}
		}

		if (inpDisc)
			this.dropDiscAndStabilize(inpDisc,this.inputDiscPos(),postStabilizationSequence.bind(this));

	},

	dropDisc : function (disc, lastPos) {
		if (disc)
		{
			var newPos = this.board.firstVacantCellBelow(lastPos);
			if (newPos.row > lastPos.row) //not the same cell
			{
				this.board.removeDiscAt(lastPos);
				this.board.setDiscAt(disc,newPos);
			}
		}
	},

	dropDiscAndStabilize : function (disc,lastPos, postStabilizationCallback) {
		this.dropDisc(disc,lastPos);
		this.redrawBoard();
		this.stabilizeBoard(postStabilizationCallback);
		
	}

	, stabilizeBoard : function(postStabilizationCallback,skipScoreUpdate) {
		var cellsToBlow = this.board.findAllCellsToBlow();
		let phasedCellBlownCount = [];

		var boardStabilizationSequence =
				highlightCellsToBlow.bind(this)
				.thenWaitAndInvoke(
					CONFIG.HIGHLIGHT_PERIOD_MILLIS/1000,
					turnOffCells.bind(this)
					.thenInvoke(calcNextBoard.bind(this))
					.thenInvoke(redraw.bind(this))
					.thenInvoke(calcNextToBlowAndScheduleAnotherCycle.bind(this)));


		cycle.bind(this).call();

		function cycle()
		{
			this.board.mark();
			cellsToBlow.each( function (cell) { var disc = this.board.discAtCell(cell); if (disc) disc.toBlow = true; }, this);
			phasedCellBlownCount.push(cellsToBlow.length);
			boardStabilizationSequence();
		}

		function highlightCellsToBlow()
		{
			cellsToBlow.each(function (cell) { var d = this.board.discAtCell(cell); if (d) d.highlightOn(); },this);
			this.canvas.renderAll();
		}

		function turnOffCells() { cellsToBlow.each(function (cell) { var d = this.board.discAtCell(cell); if (d) d.highlightOff(); },this); }

		function calcNextBoard()
		{
			cellsToBlow.each(function (cell) {
						this.blowDiscAt(cell);
						var cellsWithDiscToDrop = this.board.nonVacantCellsAbove(cell);
						cellsWithDiscToDrop.each(function (c) {
								var discToDrop = this.board.discAtCell(c);
								if (discToDrop && !discToDrop.toBlow)
									this.dropDisc(discToDrop,c);
							}, this);
					},this);
		}

		function redraw() { this.redrawBoard(); }

		function calcNextToBlowAndScheduleAnotherCycle()
		{
			cellsToBlow = this.board.findAllCellsToBlow();
			if (cellsToBlow.length > 0) 
				ENQ(cycle,this);	//repeat until done
			else //we're done.
			{
				if (!skipScoreUpdate) this.calculateScore(phasedCellBlownCount)
				if (postStabilizationCallback)
					postStabilizationCallback();
			}
		}

	}
	
	, calculateScore : function(phasedCellCount) {
		var total = 0;
		for (i = 0; i < phasedCellCount.length; i++)
			total += CONFIG.SCORE_MULTIPLIER * (i+1) * Math.max(phasedCellCount[i],0)
		this.scoreNotificationCallback(total);
	}



	, redrawBoard : function()
	{
		var cells = this.board.modifiedCellsSinceLastMark();
		cells.each (function (cell) {
			var d = this.board.discAtCell(cell);
			if (d != null)
				d.redrawAt(this.cellToCanvas({row : cell.row, col : cell.col}), this.canvas);
		}, this);
	},

	blowDiscAt : function (cell) {
		var disc = this.board.discAtCell(cell);
		if (disc)
		{
			disc.remove(this.canvas);
			this.board.removeDiscAt(cell);

			var nearbyCells = this.board.cellsNear(cell);
			nearbyCells.each(function(c) {
				var adjacentDisc = this.board.discAtCell(c);
				if (adjacentDisc && !adjacentDisc.toBlow)
				{
					adjacentDisc.degrade();
					this.board.changedCell(c);
				}
			}, this);

		}
	},

	init : function() {
		this.draw();
		this.initializeGame();
		this.stabilizeBoard(null,true); //TODO: this parameter passing is ugly, fix this.
		this.newInputDisc(this.randomizeDisc());
		this.newLineCountdownCallback(this.discsToDropUntilLineRise);
	},

	size : function() { return this.board.size; },

	newInputDisc : function (disc) {
		this.currentInputDisc = disc;
		this.inputDiscPosition = {col : Math.floor(this.size() / 2.0),row : 0};
		this.drawInputDisc();
	},

	inputDisc : function() { return this.currentInputDisc; },

	inputDiscPos : function() { return this.inputDiscPosition; },

	moveInputDiscRight : function()
	{
		if (this.inputDisc() != null )
		{
			this.inputDiscPosition.col = Math.min(this.size()-1,this.inputDiscPosition.col + 1);
			this.board.setDisc(this.currentInputDisc,this.inputDiscPosition.row,this.inputDiscPosition.col);
			RAISE(new CellChangeEvent(this.inputDiscPosition,this));
		}
	},

	moveInputDiscLeft : function()
	{
		if (this.inputDisc() != null )
		{
			this.inputDiscPosition.col = Math.max(0,this.inputDiscPos().col - 1);
			this.board.setDisc(this.currentInputDisc,this.inputDiscPosition.row,this.inputDiscPosition.col);
			RAISE(new CellChangeEvent(this.inputDiscPosition,this));
		}
	},

	initializeGame : function()
	{
		//Randomize initial discs
		var maxInitialDiscCount = MAX_INITIAL_GAME_HEIGHT * this.size();
		var initialDiscCount = randomBetween(1,maxInitialDiscCount);
		var col = 0;
		var row = this.size(); //bottom row
		$R(0,initialDiscCount).each(function() {
			var newDisc = this.randomizeDisc();
			this.board.setDisc(newDisc,row,col);
			col++;
			if (col >= this.size())
			{
				row--;
				col = 0;
			}
		},this);
		this.redrawBoard();

	},

	randomizeDisc : function() {
		var num = randomBetween(Math.min(MIN_DISC_NUMBER,this.size()-1),this.size());
		var state = randomBetween(DISC_STATE.VISIBLE,DISC_STATE.HARD); //the size (and values) of DISC_STATES
		var disc = new Disc(num,state);
		return disc;
	}

	, newBottomLine : function() {
		//check that top line is empty
		if (this.hasDiscsAtTopRow())
			this.setGameOver();
		else
		{
			//create discs
			let discs = [];
			$R(0,this.size()-1).each(function() {
				discs.push(this.randomizeDisc());
			},this);
			this.board.insertDiscsFromBottom(discs);
			this.redrawBoard();
			this.stabilizeBoard();
		}
	}

	, hasDiscsAtTopRow : function() {
		return this.board.row(1).length > 0; //!isEmpty ?
	}

	, setGameOver : function() {
		this.gameOver = true;
		this.currentInputDisc = null;
		this.gameOverCallback();
	}

	, isOver : function() { return this.gameOver; }

});
