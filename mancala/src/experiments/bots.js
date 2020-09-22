
const {program} = require("commander")
const {range,requires} = require('../util.js')
const {MancalaGame} = require("../game.js");
const fs = require('fs')


const DEFAULT_ROUND_COUNT = 50;
const DEFAULT_GAME_SIZE = 14;

function gameMsg(s) { }
console.debug = s => { }

program
  .version('0.0.1')
  .usage("Mancala Bot War: Run Mancala AI Experiment")
  .option('-p1, --player1 <AI 1 type>', "The bot to use for player 1")
  .option('-p2, --player2 <AI 2 type>', "The bot to use for player 2")
  .option('-r, --rounds <rnds>', `Number of games to play. Defaults to ${DEFAULT_ROUND_COUNT}`)
  .option('-o, --out <dir>', "Output filename. Optional; if not specified one will be generated.")
  .option('-s, --size <number>',`Size of the mancala game to play. An even integer number in the range of 6-30. Optional with a default of ${DEFAULT_GAME_SIZE}.`)
  .parse(process.argv)

requires(program.player1,"Player 1 bot must be specified")
requires(program.player2,"Player 2 bot must be specified")

let roundsToRun = (program.rounds || DEFAULT_ROUND_COUNT)*1;
let gameSize = (program.size || DEFAULT_GAME_SIZE)*1;
let outputFilename = program.out || `size-${gameSize}__p1-${program.player1.toLowerCase()}__p2-${program.player2.toLowerCase()}__${roundsToRun}.csv`

say(`Player 1 type: ${program.player1}`)
say(`Player 2 type: ${program.player2}`)
say(`Rounds: ${roundsToRun}`)
say(`Game size: ${gameSize}`)
say(`Output to: ${outputFilename}`)



range(1,roundsToRun).forEach(round => {
    dbg(`Round ${round}`)
    let startTime = Date.now();
    let game = new MancalaGame(gameSize,'',_ => {},gameMsg,{p1 : program.player1, p2:program.player2},results => {
        let endTime = Date.now();
        dbg (`Round ${round} Results: ${JSON.stringify(results)} Time: ${endTime-startTime}`)
        let line = []
        line.push(results.player1StoneCount)
        line.push(results.player2StoneCount)
        line.push(results.winner || 0) //write the player who one or 0 for draw
        line.push(endTime-startTime) //the time in ms
        fs.appendFileSync(outputFilename,line.join(',') + "\n",{flag :'a'})
    })
    game.start();

})


say('Done.')

function say (s) { console.info(s) }
function dbg (s) { console.log(s)}
  