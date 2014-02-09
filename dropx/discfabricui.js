var DISC_FILL_STYLES = {};
DISC_FILL_STYLES[DISC_STATE.VISIBLE] = 'white';
DISC_FILL_STYLES[DISC_STATE.WEAK] = 'lightgray';
DISC_FILL_STYLES[DISC_STATE.HARD] = 'gray';

var DiscUI = Class.create ({
	initialize : function(_disc,_discSize)
	{
		//TODO: validate input
		this.disc = _disc;
		//this.context = _context;
		this.discSize = _discSize;
		this.circle = null;
	},
	drawAt : function (x,y) {
		//this.context.clearRect(x,y,this.discSize,this.discSize);
		//this.context.fillStyle = 'rgba(0,200,0,1)';

		//var margin = 8;
		var margin = CONFIG.CELL_MARGIN;
		var radius = (this.discSize - margin ) / 2;
		//var center = {x : x + radius + (margin / 2), y : y + radius + (margin / 2)};
		this.circle = new fabric.Circle({ top: y, left: x, radius: radius, fill: 'rgba(0,200,0,1)' });
		/*
		this.context.beginPath();
		this.context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
		this.context.fillStyle = DISC_FILL_STYLES[this.disc.state];
		this.context.fill();
		*/
		if (this.disc.state == DISC_STATE.VISIBLE)
		{ //draw number
			
			/*var textPos = { x : center.x , y : center.y };
			this.context.font = '25pt Calibri';
			this.context.textAlign = 'center';
			this.context.textBaseline = 'middle';
			this.context.fillStyle = 'black';
			this.context.fillText(this.disc.number,textPos.x,textPos.y);
			*/
		}
		
		this.context.lineWidth = margin / 4;
		this.context.stroke();
		this.context.closePath();
	
	}
});