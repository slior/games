
//Assumes prototype.js is loaded and boardui.js

var CELL_SIZE = 50;
var CELL_MARGIN = 4;
var GameUI = Class.create({
	initialize : function (_canvas,_boardSize) {
		//TODO: validate input
		this.canvas = _canvas;
		this.fabric = new fabric.StaticCanvas(this.canvas);
		this.context = this.canvas.getContext('2d');
		this.game = new DropXGame(_boardSize);
		
		this.canvas.width = this.game.size() * CELL_SIZE;
		this.canvas.height = (this.game.size() + 1) * CELL_SIZE;
		this.cellDim = {height : CELL_SIZE, width : CELL_SIZE};
		this.discSize = Math.min(this.cellDim.height,this.cellDim.width) - CELL_MARGIN;
	},
	
	draw : function() {
		this.drawGrid();
	},
	
	newInputDisc : function(disc) {
		this.currentInputDiscUI = null;
		this.game.newInputDisc(disc);
		this.drawInputDisc();
	},
	
	inputDiscRight : function() {
		this.eraseInputDisc();
		this.game.moveInputDiscRight();
		this.drawInputDisc();
	},
	
	inputDiscLeft : function() {
		this.eraseInputDisc();
		this.game.moveInputDiscLeft();
		this.drawInputDisc();
	},
	
	eraseInputDisc : function() {
		var canvasPos = {x : this.boardXToCanvasX(this.game.inputDiscPos().col), y : this.boardYToCanvasY(this.game.inputDiscPos().row)};
		this.context.clearRect(canvasPos.x+CELL_MARGIN/2,canvasPos.y+CELL_MARGIN/2,this.discSize-1,this.discSize-1);
	},
	drawInputDisc : function() {
		var pos = {row : this.game.inputDiscPos().row, col : this.game.inputDiscPos().col};
		var canvasPos = this.cellToCanvas(pos);
		this.inputDiscUI().drawAt(canvasPos.x,canvasPos.y);
	},

	inputDiscUI : function() { 
		if (!this.currentInputDiscUI)
			this.currentInputDiscUI = this.createUIFor(this.game.inputDisc());
		return this.currentInputDiscUI;
	},
	
	createUIFor : function(disc) { return new DiscUI(disc,this.context,this.discSize); },
	
	boardXToCanvasX : function (brdX) {
		return brdX * this.cellDim.width;
	},
	
	boardYToCanvasY : function (brdY) {
		return brdY * this.cellDim.height;
	},
	drawGrid : function() {
		var cell = 1;
		var gridHeight = this.game.size() * CELL_SIZE;
		var gridWidth = this.game.size() * CELL_SIZE;
		$R(0,this.game.size()).each(function() {
			var lineY = cell * this.cellDim.height; 
			this.drawLine(0,lineY,gridWidth,lineY);
		
			var lineX = cell * this.cellDim.width;
			this.drawLine(lineX,this.cellDim.height,lineX,this.cellDim.height + gridHeight);
			
			cell++;
		},this);
	},
	drawLine : function(x1,y1,x2,y2) {
		this.context.beginPath();
		this.context.moveTo(x1,y1);
		this.context.lineTo(x2,y2);
		this.context.stroke();
		this.context.closePath();
	},
	
	init : function() {
		this.game.cellChangeListener = this;
		this.game.initializeGame();
		this.newInputDisc(this.game.randomizeDisc());
	},
	
	cellChanged : function(row,col) {
		var disc = this.game.board.discAt(row,col);
		if (disc == null)
			this.eraseCell(row,col);
		else
		{
			var discUI = this.createUIFor(disc);
			var canvasPos = this.cellToCanvas({row : row, col : col});
			discUI.drawAt(canvasPos.x,canvasPos.y);
		}
	},
	eraseCell : function(row,col)
	{
		var canvasPos = this.cellToCanvas({row : row, col : col});
		this.context.clearRect(canvasPos.x,canvasPos.y,this.discSize-1,this.discSize-1);
	},
	
	cellToCanvas : function (cell) { return {x : this.boardXToCanvasX(cell.col) + CELL_MARGIN/2, y : this.boardYToCanvasY(cell.row) + CELL_MARGIN/2 }; },
	
	dropInputDisc : function() {
		var inpDisc = this.game.inputDisc();
		if (inpDisc)
		{
			var lastPos = this.game.inputDiscPos();
			var nextCell = this.game.board.cellBelow(lastPos);
			var canProceedToLowerCell = nextCell != null && (this.game.board.discAtCell(nextCell) == null);
			while (canProceedToLowerCell)
			{
				this.game.board.setDisc(null,lastPos.row,lastPos.col);
				this.game.notifyCellChange(lastPos.row,lastPos.col);
				this.game.board.setDisc(inpDisc,nextCell.row,nextCell.col);
				this.game.notifyCellChange(nextCell.row,nextCell.col);
				
				lastPos = nextCell;
				nextCell = this.game.board.cellBelow(lastPos);
				canProceedToLowerCell = nextCell != null && this.game.board.discAtCell(nextCell) == null;
			}
			
			var columnsToBlow = this.game.board.findDiscsToBlowInRow(lastPos.row);
			columnsToBlow.each(function (col) { this.highlightCell({row:lastPos.row, col : col}); }, this);
			
			
			this.newInputDisc(this.game.randomizeDisc());
		}
		
	},
	
	highlightCell : function(cell) {
		var ctxt = this.context;
		var canvasPos = this.cellToCanvas(cell);
		//TODO: need to get the shape function from the discUI class
		//var discShapeFunc = function() { ctxt.arc(
		//shortHighlight(ctxt,shapeFunc,delay,onStrokeStyle,offStrokeStyle,lineWidth);
	}
});