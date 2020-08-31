

const {initCanvas,drawBoard} = require("./drawing.js")


function initGame(cnvsELID)
{

  drawBoard(initCanvas(cnvsELID));
}

module.exports = {
  initGame : initGame
}