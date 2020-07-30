
//Assumes prototype.js is loaded

var Board = Class.create ({
	initialize : function(sz)
	{
		this.size = sz;
		this.cells = [];
		this.changedCells = [];
		$R(0,this.size).each(function() {
			var a = [];
			$R(0,this.size).each(function() { a.push(null); });
			this.cells.push(a);
		},this);

	},

	setDisc : function (disc,row,col) {
		this.cells[row][col] = disc || null;
		this.changedCell({row : row, col : col});
	},

	setDiscAt : function (disc, cell) {
		if (!cell) return;
		if (cell.row > this.size || cell.col >= this.size)
			throw 'Illegal cell to put disc in: ' + cell.row + ',' + cell.col;
		else
			this.setDisc(disc,cell.row,cell.col);
	},

	removeDiscAt : function(cell) {
		this.setDisc(null,cell.row,cell.col);
	},

	discAt : function(row,col) {
		return this.cells[row][col] || null;
	},

	discAtCell : function (cell) {
		if (!cell) return null;
		return this.discAt(cell.row,cell.col);
	},

	cellBelow : function (cellPos)
	{
		if (cellPos.row == this.size) return null;
		return {row : cellPos.row + 1, col : cellPos.col};
	},

	findDiscsToBlowInColumn : function(col) {
		var column = [];
		//rows are 1-based, so we start from 1
		$R(1,this.size).each(function(r) {
			column.push(this.cells[r][col]);
		},this);

		var ranges = findAllConsecutiveDiscRanges(column);
		var retRows = [];
		ranges.each(function(range) {
			var rangeSize = range.end - range.start + 1;
			//rows are 1-based, but the column variable is a 0-based array (which took the discs starting from row #1)
			var row = range.start;
			while (row < (range.end + 1))
			{
				var rowInBoard = row + 1; //converting back to row coordinates which are 1-based.
				var disc = this.discAt(rowInBoard,col);
				if (disc.state == DISC_STATE.VISIBLE && disc.number == rangeSize)
					retRows.push(rowInBoard);
				row++;
			}
		},this);

		return retRows;
	},
	findDiscsToBlowInRow : function (row) {

		var ranges = findAllConsecutiveDiscRanges(this.cells[row]);
		var retColumns = [];
		ranges.each(function (range) {
			var rangeSize = range.end - range.start + 1;
			var col = range.start;
			while (col < (range.end + 1))
			{
				var disc = this.discAt(row,col);
				if (disc.state == DISC_STATE.VISIBLE && disc.number == rangeSize)
					retColumns.push(col);
				col++;
			}
		},this);

		return retColumns;

	},

	cellsNear : function (cell) {
		return [
			{ row : rowAbove(cell.row), col : cell.col}, 			//cell above
			{ row : rowBelow(cell.row,this.size), col : cell.col} , //cell below
			{ row : cell.row, col : rightOf(cell.col,this.size) }, 	//cell to right
			{ row : cell.row, col : leftOf(cell.col,this.size) }	//cell to left
		];
	},

	firstVacantCellBelow : function(cell) {
		var c = this.cellBelow(cell), lastCell = cell;
		while (c != null)
		{
			if (this.discAtCell(c) != null)
				break;
			lastCell = c;
			c = this.cellBelow(lastCell);
		}
		return lastCell;
	},

	findAllCellsToBlow : function() {
		var retCells = []
		for (var row = 1; row <= this.size; row++)
		{
			var columns = this.findDiscsToBlowInRow(row);
			columns.each(function (col) { retCells.push({row : row, col : col}); });
		}

		for (var col = 0; col < this.size; col++)
		{
			var rows = this.findDiscsToBlowInColumn(col);
			rows.each(function (r) { retCells.push({row : r, col : col}); }); //TODO: might create duplicates here, must solve this
		}

		return retCells;
	},

	nonVacantCellsAbove : function (cell) {
		var retCells = [];
		var upperMostRow = 1;
		for (var row = cell.row - 1; row >= upperMostRow; row--)
		{
			var inspectedCell = {row : row, col : cell.col};
			var disc = this.discAtCell(inspectedCell);
			if (disc) retCells.push(inspectedCell);
		}
		return retCells;
	},

	mark : function() {
		this.changedCells = [];
	},

	changedCell : function (cell) {
		if (cell && this.changedCells)
			this.changedCells.push(cell);
	},

	modifiedCellsSinceLastMark : function() { return this.changedCells; }

	, insertDiscsFromBottom : function(discs) {
			$R(0,this.size-1).each(function(col) {
				$R(2,this.size).each(function(row) { //going top to bottom, move all discs up one row
					this.moveDiscOneCellUp({row : row,col : col}) //this takes care of empty cells as well.
				},this);

				this.setDisc(discs[col],this.size,col); //insert in this column, at the bottom row
			}, this);
	}

	, moveDiscOneCellUp : function(fromCell) {
		if (fromCell.row <= 1) return; //should actually signal this error condition somehow
		let disc = this.discAtCell(fromCell)
		if (disc != null)
		{
			let newCell = {row : fromCell.row - 1, col : fromCell.col}
			this.removeDiscAt(fromCell)
			this.setDiscAt(disc,newCell)

			this.changedCell(newCell);
		}
		
	}

	, row : function(rowInd) {
		let ret = []
		$R(0,this.size)
			.each(function(colInd) {
				let d = this.discAt(rowInd,colInd);
				if (d != null) ret.push(d);
			},this)
		return ret;
	}

});
