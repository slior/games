
function randomBetween(min,max)
{
	return Math.floor((Math.random() * max) + min);
}

function findAllConsecutiveDiscRanges(cells)
{
	var nextInd = 0;
	var ret = [];
	var boundary = cells.length;
	while (nextInd < boundary)
	{
		var r = findConsecutiveDiscRange(nextInd,cells);
		if (r != null) 
		{
			ret.push(r);
			nextInd = r.end+1;
		}
		else break;
	}
	return ret;
}

function findConsecutiveDiscRange(from, cells)
{
	var s = from;
	var boundary = cells.length;
	while (cells[s] == null && s < boundary) s++;
	if (s == boundary) return null;
	var e = s;
	while (cells[e] != null && e < boundary) e++;
	return { start : s, end : (Math.min(e-1,boundary-1)) };
}

//game rows are 1-based, from 1 to game size
function rowAbove(row) { return row <= 1 ? 1 : row - 1; }
function rowBelow(row,size) { return row >= size ? size : row + 1; } 

//game columns are 0-based, from 0 to size-1
function leftOf(col) { return col <= 0 ? 0 : col - 1; }
function rightOf(col,size) { return col >= (size - 1) ? size - 1 : col + 1; }

function ENQ(f,_this)
{
	if (_this)
		f = f.bind(_this);
	var args =  Array.prototype.slice.call(arguments,2);
	f.defer.apply(f,args);
}

function dbg(msg)
{
	if (!CONFIG.DEV_MODE) return;
	var t = new Date();
	msg = '[' + t.getTime() + ']\t' + (msg || '');
	$('txtDbg').value += msg + '\n';
}

//-------------------------- Function extensions

//Chain another function call to this function
Object.extend(Function.prototype, {
	thenInvoke : function(f) {
					var thiz = this;
					return function () { 
						thiz(); 
						if (f)  f.call(); 
					};
	},

	thenWaitAndInvoke : function(d,f) {
					var thiz = this;
					return function () { 
						thiz(); 
						if (f) f.delay(d); 
					};
	}
});
