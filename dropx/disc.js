
//Assumes prototype.js is loaded

var DISC_STATE = {VISIBLE : 1, HARD : 2, WEAK : 3}

var Disc = Class.create ({
	initialize : function(_number,_state)
	{
		//TODO: validate input
		this.number = _number;
		this.state = _state;
		
		this.discSize = CONFIG.CELL_SIZE - CONFIG.CELL_MARGIN;
	},
	
	drawAt : function (canvasPos,canvas)
	{
		var radius = (this.discSize - CONFIG.CELL_MARGIN ) / 2;
		var center = this.cellCenterFrom(canvasPos);
		this.circle = new fabric.Circle({ 	top:  center.y, 
											left: center.x, 
											radius: radius,
											fill: this.discFill() });
		canvas.add(this.circle);
		var textLoc = this.textLocationFrom(canvasPos);
		this.text = new fabric.Text(this.number,{	top : textLoc.y, left : textLoc.x,
										fontFamily : 'CA_BND_Web_Bold_700', fontSize : 25, 
										textAlign:'center', fill:'black'});
		if (this.state == DISC_STATE.VISIBLE)
			canvas.add(this.text);
	},
	remove : function(canvas) {
		if (canvas && this.isDrawn())
		{
			canvas.remove(this.circle);
			if (this.text != null)
				canvas.remove(this.text);
		}
		this.circle = null;
	},
	isDrawn : function () { return this.circle ? true : false; },
	
	putAt : function(canvasPos,canvas) {
		if (this.isDrawn())
			this.moveTo(canvasPos);
		else
			this.drawAt(canvasPos,canvas);
	},
	
	redrawAt : function(canvasPos,canvas) {
		this.remove(canvas);
		this.drawAt(canvasPos,canvas);
	},
	
	cellCenterFrom : function(canvasPos) {
		var radius = (this.discSize - CONFIG.CELL_MARGIN ) / 2;
		return {x : canvasPos.x + radius + (CONFIG.CELL_MARGIN ), y : canvasPos.y + radius + (CONFIG.CELL_MARGIN ) };
	},
	textLocationFrom : function(canvasPos) {
		var ret = this.cellCenterFrom(canvasPos);
		return {x : ret.x + 4, y : ret.y};
	},
	discFill : function() {
		if (this.state == DISC_STATE.HARD)
			return 'gray';
		else if (this.state == DISC_STATE.WEAK)
			return 'lightgray';
		else 
		{
			var colors = ['lightgreen','yellow','orange','red','purple','cyan','lightblue'];
			var chosenColor = colors[(this.number-1) % colors.length];
			return chosenColor;
		}
	},
	moveTo : function(canvasPos){
		if (!this.isDrawn())
			throw 'Disc is not drawn on the canvas - can\'t move it';
		var center = this.cellCenterFrom(canvasPos);
		this.circle.setTop(center.y);
		this.circle.setLeft(center.x);
		var textLoc = this.textLocationFrom(canvasPos);
		this.text.setTop(textLoc.y);
		this.text.setLeft(textLoc.x);
	},
	
	highlightOn : function() {
		if (this.isDrawn())
		{
			var c = this.circle;
			c.strokeWidth = CONFIG.HIGHLIGHT_STROKE_WIDTH;
			c.stroke = CONFIG.HIGHLIGHT_STROKE;
		}
	},
	
	highlightOff : function() {
		if (this.isDrawn())
		{
			var c = this.circle;
			c.strokeWidth = CONFIG.HIGHLIGHT_STROKE_WIDTH;
			c.stroke = '';
		}
	},
	
	degrade : function()
	{
		if (this.state == DISC_STATE.HARD)
			this.state = DISC_STATE.WEAK;
		else this.state = DISC_STATE.VISIBLE;
	}
});

function newDiscWithValue(v)
{
	if (isNaN(v)) throw "Illegal disc value: " + v;

	return new Disc(v*1,DISC_STATE.VISIBLE);

}