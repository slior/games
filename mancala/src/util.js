
function range(start,finish) 
{ // TODO: validate 'target'
  if (start > finish) return [];
  let ret = [start]
  for (var i = start+1; i <= finish; i++) ret.push(i)
  return ret;
}

function ERR(msg) { throw new Error(msg); }

function dbg(msg) { console.debug(msg || 'MISSING DBG MSG') }

/**
 * Small syntactic sugar for coding assertions.
 * 
 * @param {Boolean} pred The result of evaluating the requirement
 * @param {String} msg The message to show as part of the error
 */
function requires(pred,msg)
{
  if (!pred) ERR(msg);
}

///--- Small Option implementation
let None = {}
None.map = f => None;
None.ifPresent = f => {} //do nothing
None.toString = () => "None"

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

  toString() { return "Some(" + this.value.toString() + ")"}
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
    , requires : requires
  }
  