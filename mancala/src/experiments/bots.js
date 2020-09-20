
const {program} = require("commander")
const {dbg,range} = require('../util.js')
const {MancalaGame} = require("../game.js");
const fs = require('fs')

function gameMsg(s) { if (s.trim()) dbg(`( ${s})`) }


program
  .version('0.0.1')
  .usage("Mancala Bot War: Run Mancala AI Experiment")
  .option('-p1, --player1 <AI 1 type>', "The bot to use for player 1")
  .option('-p2, --player2 <AI 2 type>', "The bot to use for player 2")
  .option('-r, --rounds <rnds>', "Number of games to play")
  .option('-o, --out <dir>', "output file")
  .parse(process.argv)

dbg(`Player 1 type: ${program.player1}`)
dbg(`Player 2 type: ${program.player2}`)
dbg(`Rounds: ${program.rounds}`)
dbg(`Output to: ${program.out}`)



range(1,program.rounds*1).forEach(round => {
    dbg(`Round ${round}`)
    let game = new MancalaGame(14,'',_ => {},gameMsg,{p1 : program.player1, p2:program.player2},results => {
        dbg (`Round ${round} Results: ${results}`)
        let line = []
        line.push(results.player1StoneCount)
        line.push(results.player2StoneCount)
        line.push(results.winner || 0) //write the player who one or 0 for draw
        fs.appendFileSync(program.out,line.join(',') + "\n",{flag :'a'})
    })
    game.start();

})

// dbg(`Writing results to ${program.out}...`)

// fs.writeFile(program.out, output.join('\n'), function (err) {
//     if (err) throw err;
//   });


  dbg('Done.')
