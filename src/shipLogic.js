'use strict'

/* global
getUpdatedViewMask, state, data
*/

/* eslint-disable no-unused-vars */

function buildShip (type, owner, hex, acted = true) {
  const base = data.shipHulls[type]
  return ({
    type: base.type,
    hulltype: base,
    hull: base.hull,
    shield: base.shield,
    actionsRemaining: acted ? [] : base.actionList,
    hex: hex,
    owner: owner
  })
}

function getShipOnHex (hex) {
  return state.shipArray.find(e => e.hex.compare(hex))
}

function shipState (hex) {
  if (getShipOnHex(hex) === undefined) { return 1 } else if (getShipOnHex(hex).owner === state.playerTurn) { return 2 } else return 0
}

function findPossibleAttacks (center, range = 1) {
  const viewMask = getUpdatedViewMask(state)
  const possibleAttacksInt = []
  for (const hex of center.within(range)) {
    const ship = getShipOnHex(hex)
    if (viewMask[hex.id] === 2 && ship && !state.alliesGrid[ship.owner][state.playerTurn]) {
      possibleAttacksInt.push(hex)
    }
  }
  return possibleAttacksInt
}

function findPossibleMoves (center, moveLeft) {
  if (!moveLeft) return []
  const terrainFunc = getTerrainMapFunction(makeTerrainCostMap())

  function findPossibleMovesFunctional (frontier, visited, terrainFunc) {
    if (!frontier.length) return visited
    let [current, ...newfrontier] = frontier
    visited[current.loc.id] = current

    if (current.cost > 0) {
      newfrontier = current.loc.neighbours
        .filter(n => n.mag <= state.boardSize)
        .map(n => { return { loc: n, cost: current.cost - terrainFunc(current.loc.id, n.id), from: [current.loc, ...current.from] } })
        .filter(({ loc: hex, cost, from }) => {
          return (hex.mag <= state.boardSize) && !(visited[hex.id] && cost < visited[hex.id].cost) && cost >= -30
        })
        .concat(newfrontier)
        .sort((a, b) => a.cost - b.cost)
    }
    return findPossibleMovesFunctional(newfrontier, visited, terrainFunc)
  }

  const temp = findPossibleMovesFunctional([{ loc: center, cost: moveLeft, from: [] }], [], terrainFunc)

  return Object.values(temp).map(v => { return [v.loc, ...v.from] })
    .filter(h => { return (h[0].mag <= state.boardSize) && !getShipOnHex(h[0]) })
}

function getTerrainMapFunction (terrainCostMap) {
  return function (off, on) {
    return terrainCostMap[off].moveOff + terrainCostMap[on].moveOn
  }
}

function makeTerrainCostMap () {
  const terrainCostMap = {}
  const viewMask = getUpdatedViewMask(state)
  for (const [, tile] of state.tiles) {
    let moveOff = data.terrainInfo[tile.terrain].moveCost / 2
    let moveOn = data.terrainInfo[tile.terrain].moveCost / 2
    if (tile.navBeacon && state.alliesGrid[tile.navBeacon.owner][state.playerTurn]) { moveOff = 0.25; moveOn = 0.25 }

    for (const hex2 of tile.hex.neighbours) {
      const ship = getShipOnHex(hex2)
      if (ship && (!state.alliesGrid[ship.owner][state.playerTurn])) { moveOff = 9 }
    }

    const moveTech = data.terrainInfo[tile.terrain].moveTech
    if (moveTech && !state.playerData[state.playerTurn].tech[moveTech]) {
      moveOff += 77; moveOn += 77
    }

    if (viewMask[tile.hex.id] !== 2) { moveOff += 77; moveOn += 77 }

    terrainCostMap[tile.hex.id] = { hex: tile.hex, moveOff: moveOff, moveOn: moveOn }
  }
  return terrainCostMap
}

//
// function findPossibleMoves(center, moveLeft = 2){
//   let terrainFunc = getTerrainMapFunction(makeTerrainCostMap());
//
//   function findPossibleMovesFunctional(frontier, visited, terrainFunc){
//
//     if (!frontier.length) return visited;
//     let [current, ...newfrontier] = frontier;
//     visited[current.loc.id] = current;
//
//     newfrontier = current.loc.neighbours
//       .filter(n => n.mag <= state.boardSize)
//       .map(n => {return{loc:n, cost:current.cost - terrainFunc(current.loc.id, n.id), from:[current.loc, ...current.from]}})
//       .filter(({loc:hex, cost, from} ) => {
//         return hex.mag <= state.boardSize && !(visited[hex.id] && cost < visited[hex.id].cost) && cost >= 0
//       })
//       .concat(newfrontier)
//       .sort((a,b) => a.cost - b.cost)
//
//     return findPossibleMovesFunctional(newfrontier, visited, terrainFunc)
//   }
//
//   let temp =  findPossibleMovesFunctional([{loc:center, cost:moveLeft, from:[]}], //{}
//     // []
//     center.neighbours
//       .filter(n => n.mag <= state.boardSize && terrainFunc(center.id, n.id) < 20)
//       .map(n => {return{loc:n, cost:0, from:[center]}})
//       .reduce((acc, c) => {acc[c.loc.id] = c; return acc}, {})
//     ,terrainFunc
//   );
//
//   let temp2 = Object.values(temp).map(v => {
//     return [v.loc, ...v.from]
//   })
//
//   return temp2.filter(h => {
//     return  (h[0].mag <= state.boardSize) && !getShipOnHex(h[0])
//   });
// }
//
//
// function getTerrainMapFunction(terrainCostMap){
//   return function(off,on){
//     return terrainCostMap[off].moveOff + terrainCostMap[on].moveOn;
//   }
// }
//
//
//
// function makeTerrainCostMap(){
//   let terrainCostMap = {};
//   let viewMask = getUpdatedViewMask(state)
//   for(let [ ,tile] of state.tiles){
//
//     let moveOff = data.terrainInfo[tile.terrain].moveCost / 2;
//     let moveOn = data.terrainInfo[tile.terrain].moveCost / 2;
//     if(tile.navBeacon && state.alliesGrid[tile.navBeacon.owner][state.playerTurn]){moveOff = 0.25, moveOn = 0.25}
//
//     for(let hex2 of tile.hex.neighbours){
//       let ship = getShipOnHex(hex2)
//       if(ship && (!state.alliesGrid[ship.owner][state.playerTurn])) { moveOff = 9; }
//     }
//
//     let moveTech = data.terrainInfo[tile.terrain].moveTech;
//     if(moveTech && !state.playerData[state.playerTurn].tech[moveTech]){
//       moveOff += 77; moveOn += 77;
//     }
//
//     if(viewMask[tile.hex.id] !== 2 ){moveOff += 77; moveOn += 77;}
//
//     terrainCostMap[tile.hex.id]={hex:tile.hex, "moveOff": moveOff, "moveOn": moveOn};
//   }
//   return terrainCostMap;
// }
