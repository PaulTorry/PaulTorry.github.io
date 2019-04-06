"use strict"

/* global Hex, Map, Vec, makeNewViewMask     */
/* eslint-disable no-unused-vars */

const boardSize = 9;
let preturn = true;

let state = {};

let sel = {state:0, attacks:[], menu:[], moves:[]}

state = setup(5, boardSize, 2, false)

function setup(numPlayers, boardSize = 8, numHumans = numPlayers, playersTogether = false){
  let tiles = new Map();
  let playerData = [];
  let baseArray = [];
  let shipArray = [];

  for(let hex of Hex.findWithin(boardSize)){
    let buildingHex = {hex: hex, terrain:"space", station:null};
    if(Math.random()<0.3){buildingHex.terrain = "nebula"}
    if(Math.random()<0.1){buildingHex.terrain = "planet"}
    if(Math.random()<0.1){buildingHex.terrain = "protostar"}
    if(Math.random()<0.35){buildingHex.terrain = "asteroids"}
    if(Math.random()<0.05){buildingHex.terrain = "gasGiant"}

    tiles.set(hex.id, buildingHex);
  }

  let playerlist = []

  // TODO Fix this

  for(let i = 0; i < numPlayers; i++){  playerlist.push("AI")  }
  if(playersTogether){
    for(let i = 0; i < numHumans; i++){ playerlist[i] = "human";  }
  } else {
    for(let i = 0; i < numHumans; i++){ playerlist[Math.floor(i*numPlayers/numHumans)] = "human";  }
  }

  let alliesGrid = []

  for(let i = 0; i < numPlayers; i++){
    if(playersTogether){
      alliesGrid[i] = [];
      for(let j = 0; j < numPlayers; j++){ alliesGrid[i][j] = playerlist[i] === playerlist[j] }
    } else {
      alliesGrid[i] = [];
      for(let j = 0; j < numPlayers; j++){ alliesGrid[i][j] = i === j }
    }
  }

  console.log(alliesGrid);

  for(let i = 0; i < numPlayers; i++){
    let angle = 2*Math.PI*i/numPlayers

    let hexloc = Hex.getUnitHexFromXY(new Vec(Math.sin(angle), Math.cos(angle)).scale(boardSize/1))

    baseArray.push({type:"planet", owner:i, hex: hexloc, territory:hexloc.secondNeighboursInclusive});
    playerData.push({type: playerlist[i], money:5, tech:{}, capital:hexloc, viewMask:makeNewViewMask(tiles)})
    shipArray.push({"type":"scoutShip","hull":2,"shield":3,"moved":false,"attacked":false, hex:hexloc, "owner":i,
      "attack":2,"retaliate":1, view:2, "maxMove":4, range:1})
    tiles.set(hexloc.id, {hex: hexloc, terrain:"planet", station:null});
  }

  return {numPlayers:numPlayers, playerTurn:0, shipArray:shipArray, tiles:tiles, playerData:playerData, baseArray:baseArray, alliesGrid:alliesGrid,}
}
