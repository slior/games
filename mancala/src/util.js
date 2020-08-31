
function range(start,finish) 
{ // TODO: validate 'target'
  let ret = [start]
  for (var i = start+1; i <= finish; i++) ret.push(i)
  return ret;
}

function ERR(msg) { throw new Error(msg); }

function dbg(msg) { console.log(msg || 'MISSING DBG MSG') }

module.exports = {
    range : range
    , ERR : ERR
    , dbg : dbg
  }