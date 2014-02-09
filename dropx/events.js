
function RAISE(evt,delay)
{
	if (evt.apply)
		setTimeout(function () { evt.apply(); },delay || CONFIG.DEFAULT_EVENT_DELAY);
}

var CellChangeEvent = Class.create({
	initialize : function(c,g) {
		this.cell = c;
		this.game = g;
	},
	
	apply : function() {
		var disc = this.game.board.discAtCell(this.cell);
		if (disc != null)
		{
			var canvasPos = this.game.cellToCanvas(this.cell);
			disc.putAt(canvasPos,this.game.canvas);
			this.game.canvas.renderAll();
		}
	}
});
