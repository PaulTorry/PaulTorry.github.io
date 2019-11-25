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
randomInt, sessionInfo
*/

/* eslint-disable no-unused-vars */

const serverPath = //"https://hexbackendtest.herokuapp.com/userSaves"
//"https://test1-a393.restdb.io/rest/coll";
"https://test1-a393.restdb.io/rest/savegames"
//"https://hexbackendtest.herokuapp.com/userSaves"
const apikey = "5dbdfb7064e7774913b6e80e";


function makeRequest(callback = console.log, type = "GET"){
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
    }
  });

  xhr.open(type, serverPath);
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("x-apikey", apikey);
  xhr.setRequestHeader("cache-control", "no-cache");
  //  xhr.setRequestHeader("samesite", "none");

  xhr.send(data);
}


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
    1. New Game,
    2. Local Saves (load and save),
    3: Network Saves (load and save),
    4: Cheat,
    5: Toggle Debug,
    6: Show Trails,
    7: Get game list from server
    8: Send game '${state.gameName}' to server`, num);

  if(ans === "1"){
    if (prompt("Are you sure y/n","y")==="y"){
      let ans2 = Math.min(Number(prompt("Number of players (Max 6)", 4)),6);
      let ans3 = Number(prompt("Number of Humans ", 2));
      let ans4 = Number(prompt("Size of Board ", 8));
      let ans5 = prompt("Allied Humans y/n", "n")
      let ans6 = prompt("Game Name", randomName())
      let ans7 = prompt("Multiplayer Game y/n", "n")
      state.boardSize = ans4;
      if(ans5 === "y") state = setup(ans2, state.boardSize, ans3, true, ans6);
      if(ans5 === "n") state = setup(ans2, state.boardSize, ans3, false, ans6);
      if(ans7 === "y") postToServer();
    }
  }

  if(ans === "2"){
    let saveLoad = prompt("Load or Save\n 1: Load\n 2: Save", "1")
    if(saveLoad === "1") load(prompt("Type Save Name: (or 'a' for autoSave or 'clear')\n" + saveNames()))
    if(saveLoad === "2") saveAs(prompt("Type Save Name", state.gameName))
  }
  if(ans === "3"){
    if(sessionInfo.currentGame){
      let opt = prompt("Load or Save game with id: " + sessionInfo.currentGame + "\n 1: Load\n 2: Save", "1")
      if(opt === "1"){
        fetch(serverPath + "/" + sessionInfo.currentGame).
          then(response => {return response.json()}).then(loadGameFromID)
      }
      if(opt === "2"){
        console.log();
        fetch(serverPath + "/" + sessionInfo.currentGame, {
          method: "PUT", headers: {"Content-Type": "application/json","x-apikey": apikey,},
          body:JSON.stringify({name: state.gameName, currentGame:packState()})
        }).then(response => {return console.log(response.json())})
      }
    }
    else alert("Start a new game (option1) or \nLoad a game from server (option7)or \nSave this game as a new server slot (option8) ")

  }
  if(ans === "4"){
    let cheat = prompt("How do you want to cheat\n 1: Money\n 2: Tech", "1")
    if(cheat === "1"){
      console.log("Cheating Money");
      state.playerData[state.playerTurn].money = 99;
    }
    if(cheat === "2"){
      console.log("Cheating Tech");
      data.techs.forEach(t => {
        state.playerData[state.playerTurn].tech[t.tech] = true;
      })
    }
  }
  if(ans === "5"){
    debug = !debug;
  }
  if(ans === "6"){
    screenSettings.showTrails = !screenSettings.showTrails;
  }
  if(ans === "7"){
    fetch(serverPath, {headers: {"Content-Type": "application/json", "x-apikey": apikey}}).
      then(response => {return response.json()}).then(getServerLoad)
  }
  if(ans === "8"){  postToServer()  }
  if(ans === "9"){ makeRequest(); }
  drawScreen();
}




function postToServer(){
  fetch(serverPath, {
    method: "POST",
    headers: {"Content-Type": "application/json", "x-apikey": apikey},
    body:JSON.stringify({name: state.gameName, currentGame:packState()})
  }).
    then(r => {return (r.json())}).
    then(r => {(sessionInfo.currentGame=r.id,r)})
  console.log("new game ID: ", sessionInfo.currentGame);
}


function loadGameFromID(serverData){
  state = unpackState(JSON.parse(serverData.currentGame));
  drawScreen();
}

function getServerLoad(serverData){
  console.log("saveData", serverData);
  let gamelist = serverData.rows.map(r => r.name)
  console.log("gamelist", gamelist);
  let response = prompt(
    "Type the number for the savegame you want to load" +
    gamelist.reduce( (a,c,i)  => { if(c){return" \n "+ (i+1) +  " " + c + a} else{return a}}," ")
  )
  if(Number(response)/Number(response) !== 1){console.log("Type a Number in the prompt");}
  let gameStateObj = serverData.rows[Number(response) - 1]
  console.log(gameStateObj);

  sessionInfo.currentGame = gameStateObj.id;
  state = unpackState(JSON.parse(gameStateObj.currentGame));

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
