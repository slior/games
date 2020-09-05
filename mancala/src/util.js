
function range(start,finish) 
{ // TODO: validate 'target'
  let ret = [start]
  for (var i = start+1; i <= finish; i++) ret.push(i)
  return ret;
}

function ERR(msg) { throw new Error(msg); }

function dbg(msg) { console.log(msg || 'MISSING DBG MSG') }

let None = {}
None.map = f => None;
None.ifPresent = f => {} //do nothing

class Some
{
  constructor(v)
  {
    this.value = v;
  }

  map(f) 
  { 
    if (f) 
    {
      let r = f(this.value);
      return r ? new Some(r) : None;
    }
    else return None;
  }

  ifPresent(f)
  {
    this.map(f); //same as map, but don't care about the result;
  }
}

function maybe(o) 
{
  return o !== undefined && o !== null ? new Some(o) : None;
}

module.exports = {
    range : range
    , ERR : ERR
    , dbg : dbg
    , maybe : maybe
    , None : None
  }
  