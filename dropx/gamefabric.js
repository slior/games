
var CELL_SIZE = 50;
var CELL_MARGIN = 4;


var GameUI = Class.create({
	initialize : function (_canvas,_boardSize) {
		//TODO: validate input
		this.game = new DropXGame(_boardSize);
		_canvas.width = this.game.size() * CELL_SIZE;
		_canvas.height = (this.game.size() + 1) * CELL_SIZE;
		this.canvas = new fabric.StaticCanvas(_canvas);
	},
	
	draw : function() {
		this.drawGrid();
	},
	
	newInputDisc : function(disc) {
		this.game.newInputDisc(disc);
		this.drawInputDisc();
	},
	
	inputDiscRight : function() {
		this.game.moveInputDiscRight();
	},
	
	inputDiscLeft : function() {
		this.game.moveInputDiscLeft();
	},
	
	eraseInputDisc : function() {
		var canvasPos = {x : this.boardXToCanvasX(this.game.inputDiscPos().col), y : this.boardYToCanvasY(this.game.inputDiscPos().row)};
		this.context.clearRect(canvasPos.x+CELL_MARGIN/2,canvasPos.y+CELL_MARGIN/2,this.discSize-1,this.discSize-1);
	},
	drawInputDisc : function() {
		var canvasPos = this.cellToCanvas(this.game.inputDiscPos());
		this.game.inputDisc().drawAt(canvasPos,this.canvas);
	},

	
	createUIFor : function(disc) { return new DiscUI(disc,this.context,this.discSize); },
	
	boardXToCanvasX : function (brdX) {
		return brdX * CONFIG.CELL_SIZE;
	},
	
	boardYToCanvasY : function (brdY) {
		return brdY * CONFIG.CELL_SIZE;
	},
	drawGrid : function() {
		var cell = 1;
		var gridHeight = this.game.size() * CONFIG.CELL_SIZE;
		var gridWidth = this.game.size() * CONFIG.CELL_SIZE;
		$R(0,this.game.size()).each(function() {
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
	
	init : function() {
		this.game.cellChangeListener = this;
		this.game.initializeGame();
		this.newInputDisc(this.game.randomizeDisc());
	},
	
	cellChanged : function(row,col) {
		var disc = this.game.board.discAt(row,col);
		if (disc != null)
		{
			var canvasPos = this.cellToCanvas({row : row, col : col});
			if (disc.isDrawn())
				disc.moveTo(canvasPos);
			else
				disc.drawAt(canvasPos,this.canvas);
			this.canvas.renderAll();
		}
	},
	refreshCell : function(cell) {
		var disc = this.game.board.discAtCell(cell);
		var canvasPos = this.cellToCanvas({row : row, col : col});
		if (disc != null)
		{
			if (disc.isDrawn())
				disc.moveTo(canvasPos);
			else
				disc.drawAt(canvasPos,this.canvas);
			this.canvas.renderAll();
		}
		
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
				
				//RAISE(new NewDiscInBoard(nextCell,inpDisc,this.game.board,this));
				
				lastPos = nextCell;
				nextCell = this.game.board.cellBelow(lastPos);
				canProceedToLowerCell = nextCell != null && this.game.board.discAtCell(nextCell) == null;
			}
			
			this.blowDiscsIfNecessary(lastPos);
			
			this.newInputDisc(this.game.randomizeDisc());
		}
		
	},
	
	blowDiscsIfNecessary : function (lastPos) {
			var columnsToBlow = this.game.board.findDiscsToBlowInRow(lastPos.row);
			columnsToBlow.each(function (col) { RAISE(new BlowDiscEvent({row:lastPos.row, col : col}, this)); },this);
			var rowsToBlow = this.game.board.findDiscsToBlowInColumn(lastPos.col);
			rowsToBlow.each(function (row) { RAISE(new BlowDiscEvent({row : row, col : lastPos.col},this)); },this);
	},
	
	highlightCell : function(cell) {
		var disc = this.game.board.discAtCell(cell);
		if (disc != null)
		{
			disc.highlight(CONFIG.HIGHLIGHT_PERIOD_MILLIS,this.canvas);
		}
	}
});