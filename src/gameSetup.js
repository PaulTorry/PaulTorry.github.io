'use strict'

/* global Hex, Map, Vec, makeNewViewMask, generateID, buildShip
setlocalGameInfo, changeCanvas, drawScreen,
makePlayerListConsole, makeAlliesGridConsole
*/
/* eslint-disable no-unused-vars */

let preturn = true

let state = {}

let sel = { state: 0, actions: { attacks: [], menu: [] }, moves: [] } // eslint-disable-line prefer-const

// replaceState( setup(5, 9, 2, false, "default", generateID(20)))

function setup (numPlayersP, boardSizeP = 8, numHumansP = numPlayersP, playersTogetherP = false, gameNameP = 'noName', meta = { online: false }) {
  const config = {}
  config.numPlayers = numPlayersP
  config.numHumans = numHumansP
  config.boardSize = boardSizeP
  config.allied = playersTogetherP
  config.gameName = gameNameP
  config.playerlist = makePlayerListConsole(config)
  config.alliesGrid = makeAlliesGridConsole(config)

  return setupNew(config, meta)
}

// function makePlayerListConsole(config){
//   let playerlist = []
//   for(let i = 0; i < config.numPlayers; i++){  playerlist.push("AI")  }
//   for(let i = 0; i < config.numHumans; i++){ playerlist[i] = "Human";  }
//   return playerlist;
// }
//
// function makeAlliesGridConsole(config, playerlist){
//   let alliesGrid = []
//   for(let i = 0; i < config.numPlayers; i++){
//     if(config.allied){
//       alliesGrid[i] = [];
//       for(let j = 0; j < config.numPlayers; j++){ alliesGrid[i][j] = playerlist[i] === playerlist[j] }
//     } else {
//       alliesGrid[i] = [];
//       for(let j = 0; j < config.numPlayers; j++){ alliesGrid[i][j] = i === j }
//     }
//   }
//   return alliesGrid;
// }

function replaceState (newState) {
  console.log('replaceState', newState)
  state = newState
  if (state.meta.online) setlocalGameInfo() // localGameInfo = setlocalGameInfo();
  preturn = true
  changeCanvas('nextTurnView')
  drawScreen()
}

function setupNew (config, meta = { online: false }) {
  // playerlist = makePlayerListConsole(config), alliesGrid = makeAlliesGridConsole(config, playerlist )){
  const gameID = generateID(20)
  console.log(config)
  if (gameID.length < 15) console.log('check game id length')
  const tiles = new Map()
  const playerData = []
  const baseArray = []
  const shipArray = []
  const randomPicker = Hex.getRandomPicker(config.boardSize - 1)

  for (const hex of Hex.findWithin(config.boardSize)) {
    const buildingHex = { hex: hex, terrain: 'space', station: null, resource: null }
    if (Math.random() < 0.1) { buildingHex.terrain = 'nebula'; buildingHex.resource = 'hydrogen' } else if (Math.random() < 0.1) { buildingHex.terrain = 'nebula' } else if (Math.random() < 0.05) { buildingHex.terrain = 'protostar' } else if (Math.random() < 0.15) { buildingHex.terrain = 'asteroids' } else if (Math.random() < 0.15) { buildingHex.terrain = 'asteroids'; buildingHex.resource = 'icyAsteroids' } else if (Math.random() < 0.05) { buildingHex.terrain = 'gasGiant' }

    tiles.set(hex.id, buildingHex)
  }

  for (let i = 0; i < config.numPlayers; i++) {
    const angle = 2 * Math.PI * i / config.numPlayers
    const hexloc = Hex.getUnitHexFromXY(new Vec(Math.sin(angle), Math.cos(angle)).scale(config.boardSize / 1)).randomNeighbour

    baseArray.push({ type: 'planet', owner: i, hex: hexloc, territory: hexloc.secondNeighboursInclusive })
    playerData.push({ type: config.playerlist[i], money: 5, income: 1, tech: {}, capital: hexloc, viewMask: makeNewViewMask(tiles, 0) })
    shipArray.push(buildShip('scoutShip', i, hexloc, false))
    //console.log(shipArray)
    tiles.set(hexloc.id, { hex: hexloc, terrain: 'planet', station: null, navBeacon: { owner: i } })

    const hexStar = hexloc.randomNeighbour
    tiles.set(hexStar.id, { hex: hexStar, terrain: 'star', station: null })
  }

  for (let i = 0; i < 100; i++) {
    const t = tiles.get(Hex.arrayToID(randomPicker(Math.random())))

    if (!t.hex.secondNeighboursInclusive.filter(n => n.mag <= config.boardSize).find(tt => tiles.get(tt.id).terrain === 'planet')) {
      t.terrain = 'planet'; t.resource = null
      if (!t.hex.secondNeighboursInclusive.filter(n => n.mag <= config.boardSize).find(tt => tiles.get(tt.id).terrain === 'star')) {
        const starMaybe = t.hex.neighbours.filter(n => n.mag <= config.boardSize).filter(n => n.mag < config.boardSize && tiles.get(n.id).terrain === 'space')
        if (starMaybe[0]) tiles.get(starMaybe[0].id).terrain = 'star'
      }
    }
  }

  const blackHoleLoc = tiles.get(Hex.arrayToID(randomPicker(0.5)))
  blackHoleLoc.terrain = 'blackHole'
  blackHoleLoc.resource = null
  blackHoleLoc.hex.neighbours.forEach(s => {
    tiles.get(s.id).terrain = 'space'
    tiles.get(s.id).resource = null
  })

  tiles.forEach((_v, k) => { tiles.get(k).variant = Math.random() })

  return {
    meta: meta,
    gameID: gameID,
    gameName: config.gameName,
    boardSize: config.boardSize,
    numPlayers: config.numPlayers,
    playerTurn: 0,
    turnNumber: 1,
    shipArray: shipArray,
    tiles: tiles,
    playerData: playerData,
    baseArray: baseArray,
    alliesGrid: config.alliesGrid,
    history: [[]],
    log: []
  }
}

function subTurn () {
  return state.numPlayers * (state.turnNumber - 1) + state.playerTurn
}
