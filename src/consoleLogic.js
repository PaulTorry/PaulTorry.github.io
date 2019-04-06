"use strict"

/*global
Hex, Map
state:true
drawScreen,
debug:true,
interactiveConsole
*/

/* eslint-disable no-unused-vars */

function interactiveConsole (){

  var ans = prompt("\n1. Save, \n2: Load, \n3: Cheat, \n4: Toggle Debug", "");

  if(ans === "1"){
    saveAs(prompt("Type Save Name"))
  }
  if(ans === "2"){
    load(prompt("Type Save Name"))
  }
  if(ans === "3"){
    state.playerData[0].money = 1000;
  }
  if(ans === "4"){
    debug = !debug;
  }

  drawScreen();
}


function saveAs(savename = "quicksave"){
  let savestate = state.clone();
  savestate.tiles = [...state.tiles]
  console.log(JSON.stringify(savestate));
  localStorage.setItem(savename, JSON.stringify(savestate));
}

function load(savename = "quicksave"){
  let newState = JSON.parse(localStorage.getItem(savename));
  newState.tiles = new Map(newState.tiles);
  newState.shipArray = newState.shipArray.map(x => {
    x.hex = Hex.getFromPQR(x.hex);
    return x;
  })

  newState.baseArray = newState.baseArray.map(x => {
    x.hex = Hex.getFromPQR(x.hex);
    x.territory = x.territory.map(Hex.getFromPQR)
    return x;
  })

  console.log(newState.tiles);
  for (let [k,v] of newState.tiles){
    v.hex = Hex.getFromPQR(v.hex);
    newState.tiles.set(k,v)
  }

  state = newState;
}
