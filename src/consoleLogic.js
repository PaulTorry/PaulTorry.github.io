"use strict"

/*global
Hex, Map
state:true
drawScreen,
debug:true,
interactiveConsole,
setup
data,
screenSettings
*/

/* eslint-disable no-unused-vars */

function randomName(){
  let names = [
    ["Sol","Sirius", "Vega", "Cassiopeia", "Leo", "Taurus" ],
    ["Mercury","Venus","Earth","Mars","Jupiter","Saturn","Neptune"],
    ["Io", "Europa", "Titan", "Ganymede","Calisto"],
  ]
  return names[0][randomInt(names[0].length)] + names[1][randomInt(names[1].length)] + names[2][randomInt(names[2].length)]
}

function interactiveConsole (num = ""){
  console.log(num);
  let ans = prompt("\n0. New Game,\n1. Save, \n2: Load, \n3:  Money,\n4:  Tech, \n5: Toggle Debug, \n6: Show Trails", num);

  if(ans === "0"){
    let ans2 = Number(prompt("Number of players", 4));
    let ans3 = Number(prompt("Number of Humans ", 2));
    let ans4 = Number(prompt("Size of Board ", 8));
    let ans5 = prompt("Allied Humans y/n", "n")
    let ans6 = prompt("Game Name", randomName)
    state.boardSize = ans4;
    if(ans5 === "y") state = setup(ans2, state.boardSize, ans3, true, ans6);
    if(ans5 === "n") state = setup(ans2, state.boardSize, ans3, false, ans6);

  }

  if(ans === "1"){
    saveAs(prompt("Type Save Name", state.gameName))
  }
  if(ans === "2"){
    load(prompt("Type Save Name: (or \'a\' for autoSave or \'clear\')\n" + saveNames()))
  }
  if(ans === "3"){
    state.playerData[state.playerTurn].money = 99;
  }
  if(ans === "4"){
    data.techs.forEach(t => {
      state.playerData[state.playerTurn].tech[t.tech] = true;
    })

  }
  if(ans === "5"){
    debug = !debug;
  }
  if(ans === "6"){
    screenSettings.showTrails = !screenSettings.showTrails;
  }
  drawScreen();
}

function getTimestamp(){
  let d = new Date();
  return `${d.getMonth()}-${d.getDate()}:${d.getHours()}:${d.getMinutes()}`;
}

function getTurnstamp(){
  return `T:${state.turnNumber}-P:${state.playerTurn}}`;
}

function autoSave(){
  console.log("autosaving");
  saveAs("autoSave");
}

function saveAs(savename = "quicksave"){
  if (savename === "") savename = "autoSave";
  let savenames = JSON.parse(localStorage.getItem("#savenames"));
  if (!savenames.length) savenames = [];
  let savestate = state.clone();
  savestate.tiles = [...state.tiles]
  if (savename !== "autoSave") console.log(JSON.stringify(savestate));
  localStorage.setItem(savename, JSON.stringify(savestate));
  if (savenames.indexOf(savename) === -1) savenames.push(savename);
  localStorage.setItem("#savenames", JSON.stringify(savenames));
}

function saveNames(){
  // localStorage.setItem("#savenames", JSON.stringify(["h","y"]));
  // console.log(JSON.parse(localStorage.getItem("#savenames")));
  return JSON.parse(localStorage.getItem("#savenames"))
}

function load(savename = "quicksave"){
  if (savename === "a") {savename = "autoSave"; console.log("auto");}
  if (savename === "clear"){localStorage.setItem("#savenames", JSON.stringify([]))}
  else{
    let newState = JSON.parse(localStorage.getItem(savename));
    console.log(newState);
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
}
