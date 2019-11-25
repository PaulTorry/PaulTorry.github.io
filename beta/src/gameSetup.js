"use strict"

/* global Hex, Map, Vec, makeNewViewMask, randomName     */
/* eslint-disable no-unused-vars */


let preturn = true;

let state = {};

let sel = {state:0, attacks:[], menu:[], moves:[]}

state = setup(5, 9, 2, false)

function setup(numPlayers, boardSize = 8, numHumans = numPlayers, playersTogether = false, gameName = "noName" ){
  let tiles = new Map();
  let playerData = [];
  let baseArray = [];
  let shipArray = [];
  let randomPicker = Hex.getRandomPicker(boardSize-1);


  for(let hex of Hex.findWithin(boardSize)){
    let buildingHex = {hex: hex, terrain:"space", station:null, resource:null};
    if(Math.random()<0.1){buildingHex.terrain = "nebula"; buildingHex.resource = "hydrogen" }
    else if(Math.random()<0.1){buildingHex.terrain = "nebula"}
    else if(Math.random()<0.05){buildingHex.terrain = "protostar"}
    else if(Math.random()<0.15){buildingHex.terrain = "asteroids"}
    else if(Math.random()<0.15){buildingHex.terrain = "asteroids"; buildingHex.resource = "icyAsteroids"}
    else if(Math.random()<0.05){buildingHex.terrain = "gasGiant"}



    //  else if(Math.random()<0.1){buildingHex.terrain = "planet"}
    //   if(Math.random()<0.05){buildingHex.terrain = "star"}
    //   if(Math.random()<0.05){buildingHex.terrain = "blackHole"}

    tiles.set(hex.id, buildingHex);
  }
  // console.log(randomPicker(0.5));
  // console.log(Hex.arrayToID(randomPicker(0.5)));
  // console.log(tiles.get(Hex.arrayToID(randomPicker(0.5))).terrain);




  // let blackHoleLoc = tiles.get(Hex.arrayToID(randomPicker(0.5)));
  // blackHoleLoc.terrain = "blackHole";
  // blackHoleLoc.resource = null;
  // console.log(tiles.get(Hex.arrayToID(randomPicker(0.5))).terrain);

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

  for(let i = 0; i < numPlayers; i++){
    let angle = 2*Math.PI*i/numPlayers

    let hexloc = Hex.getUnitHexFromXY(new Vec(Math.sin(angle), Math.cos(angle)).scale(boardSize/1)).randomNeighbour

    baseArray.push({type:"planet", owner:i, hex: hexloc, territory:hexloc.secondNeighboursInclusive});
    playerData.push({type: playerlist[i], money:5, income:1, tech:{}, capital:hexloc, viewMask:makeNewViewMask(tiles)})
    shipArray.push({"type":"scoutShip","hull":2,"shield":3,"moved":false,"attacked":false, hex:hexloc, "owner":i,
      "attack":2,"retaliate":1, view:2, "maxMove":4, range:1})
    tiles.set(hexloc.id, {hex: hexloc, terrain:"planet", station:null, navBeacon:{owner: i}});

    let hexStar = hexloc.randomNeighbour;
    tiles.set(hexStar.id, {hex: hexStar, terrain:"star", station:null});

  }

  for(let i = 0; i < 100; i ++){

    let t = tiles.get(Hex.arrayToID(randomPicker(Math.random())));

    if(!t.hex.secondNeighboursInclusive.filter(n => n.mag <= boardSize).find(tt => tiles.get(tt.id).terrain === "planet" ) ){
      t.terrain = "planet"; t.resource = null;
      if(!t.hex.secondNeighboursInclusive.filter(n => n.mag <= boardSize).find(tt => tiles.get(tt.id).terrain === "star" ) ){
        let starMaybe = t.hex.neighbours.filter(n => n.mag <= boardSize).filter(n => n.mag < boardSize && tiles.get(n.id).terrain === "space")
        if (starMaybe[0]) tiles.get(starMaybe[0].id).terrain  = "star";
      }
    }
  }

  let blackHoleLoc = tiles.get(Hex.arrayToID(randomPicker(0.5)));
  blackHoleLoc.terrain = "blackHole";
  blackHoleLoc.resource = null;
  blackHoleLoc.hex.neighbours.forEach(s => {
    tiles.get(s.id).terrain  = "space";
    tiles.get(s.id).resource  = null;
  })
  // for (let i = 0; i < 100; i++){
  //
  // }

  return {gameName:randomName(), boardSize:boardSize, numPlayers:numPlayers, playerTurn:0, turnNumber:1, shipArray:shipArray, tiles:tiles, playerData:playerData, baseArray:baseArray, alliesGrid:alliesGrid, history:[[],[]], log:[]}
}

function subTurn(){
  return state.numPlayers * (state.turnNumber -1) + state.playerTurn;
}
