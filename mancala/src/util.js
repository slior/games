
function range(start,finish) 
{ // TODO: validate 'target'
  let ret = [start]
  for (var i = start+1; i <= finish; i++) ret.push(i)
  return ret;
}

module.exports = {
    range : range
  }