"use strict"

/*global
Hex, Map
state:true
drawScreen,
debug:true,
interactiveConsole,
setup
data,
screenSettings,
randomInt
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
  let ans = prompt(`Current Game Name: ${state.gameName}
    0. New Game,
    1. Save,
    2: Load,
    3: Money,
    4: Tech,
    5: Toggle Debug,
    6: Show Trails,
    7: Get game list from server
    9: Send game '${state.gameName}' to server`, num);

  if(ans === "0"){
    let ans2 = Math.min(Number(prompt("Number of players (Max 6)", 4)),6);
    let ans3 = Number(prompt("Number of Humans ", 2));
    let ans4 = Number(prompt("Size of Board ", 8));
    let ans5 = prompt("Allied Humans y/n", "n")
    let ans6 = prompt("Game Name", randomName())
    state.boardSize = ans4;
    if(ans5 === "y") state = setup(ans2, state.boardSize, ans3, true, ans6);
    if(ans5 === "n") state = setup(ans2, state.boardSize, ans3, false, ans6);

  }

  if(ans === "1"){
    saveAs(prompt("Type Save Name", state.gameName))
  }
  if(ans === "2"){
    load(prompt("Type Save Name: (or 'a' for autoSave or 'clear')\n" + saveNames()))
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
  if(ans === "7"){
    fetch("https://hexbackendtest.herokuapp.com/userSaves").
      then(response => {return response.json()}).
    //  then(response => {console.log(response.rows); return response.rows.map(r => r.name)}).
    //  then(response => {console.log(response); return response}).
      then(getServerLoad)

  }
  if(ans === "8"){
    fetch("https://hexbackendtest.herokuapp.com/userSaves", {
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body:JSON.stringify({name: state.gameName, currentGame:packState()})
    }).
      then(response => {return response.json()}).
      then(response => {console.log(response)})
  }
  drawScreen();
}

function getServerLoad(serverData){
  console.log("saveData", serverData);
  let gamelist = serverData.rows.map(r => r.name)
  console.log("gamelist", gamelist);
  let response = prompt(gamelist.reduce( (a,c,i)  => { if(c){return" \n "+ (i+1) +  " " + c + a} else{return a}}," "))
  let gameStateObj = serverData.rows[Number(response) - 1]
  console.log(gameStateObj);

  state = unpackState(JSON.parse(gameStateObj.currentGame));
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

function packState(){
  let savestate = state.clone();
  savestate.tiles = [...state.tiles]
  return JSON.stringify(savestate);
}

function saveAs(savename = "quicksave"){
  if (savename === "") savename = "autoSave";
  let savenames = JSON.parse(localStorage.getItem("#savenames")) || [];
  if (!savenames.length) savenames = [];
  let saveString = packState();
  if (savename !== "autoSave") console.log(saveString);
  localStorage.setItem(savename, saveString);
  if (savenames.indexOf(savename) === -1) savenames.push(savename);
  localStorage.setItem("#savenames", JSON.stringify(savenames));
}

function saveNames(){
  // localStorage.setItem("#savenames", JSON.stringify(["h","y"]));
  // console.log(JSON.parse(localStorage.getItem("#savenames")));
  return JSON.parse(localStorage.getItem("#savenames"))
}

function unpackState(newState){
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
  return newState;
}

function load(savename = "quicksave"){
  if (savename === "a") {savename = "autoSave"; console.log("auto");}
  if (savename === "clear"){localStorage.setItem("#savenames", JSON.stringify([]))}
  else{
    let newState = JSON.parse(localStorage.getItem(savename));
    console.log(newState);


    state = unpackState(newState);
  }
}
