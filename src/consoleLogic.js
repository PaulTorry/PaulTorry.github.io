"use strict"

/*global
Hex, Map
state:true
drawScreen,
debug:true,
interactiveConsole,
data,
screenSettings,
randomInt,
firebase, loggedInPlayer, signupViaPrompt, checkForUpdatedServerGame, makeAlliesGridMenu,
loginViaPrompt,
replaceState, setupNew, cacheHandleList, cacheGameList, loadGameFromID
saveToServer,

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
  console.log("loggedInPlayer:  ", loggedInPlayer)
  let ans = prompt(`Current Game Name: ${state.gameName}
    1. New Game,
    2. Local Saves (load and save),
    3: Network Saves (load and save),
    4: Cheat / Debug
    5: Show Trails,
    6: Login Logout SignUp
    `, num);

  if(ans === "1"){
    setupGameViaPrompt()
  }
  if(ans === "2"){
    let saveLoad = prompt("Load or Save\n 1: Load\n 2: Save", "1")
    if(saveLoad === "1") {load(prompt("Type Save Name: (or 'a' for autoSave or 'clear')\n" + JSON.parse(localStorage.getItem("#savenames"))))}
    if(saveLoad === "2") saveAs(prompt("Type Save Name", state.gameName))
  }
  if(ans === "3"){
    let saveLoad = prompt("Load or Save\n 1: Load\n 2: Save", "1")
    if(saveLoad === "1") {loadNetworkGameConsole()}
    else if(saveLoad === "2") {saveToServer()}
  }
  if(ans === "4"){
    let cheat = prompt("How do you want to cheat\n 1: Money\n 2: Tech\n 3: View and debug", "1")
    if(cheat === "1"){
      state.playerData[state.playerTurn].money = 99;
    }
    if(cheat === "2"){
      data.techs.forEach(t => { state.playerData[state.playerTurn].tech[t.tech] = true; })
    }
    if(cheat === "3"){       debug = !debug;  }
  }
  if(ans === "5"){ screenSettings.showTrails = !screenSettings.showTrails;  }
  if(ans === "6"){loginSignupConsole()}

  if(ans === "7"){ console.log(checkForUpdatedServerGame()) }
  if(ans === "9"){
    makeMetaFromMenu()
    // console.log("state.playerData",state.playerData);
    // console.log(menuData.OfflinePlayers.filter(x => x.PlayerType === "Human"));
  //  console.log(getGameParamsViaPrompt());
  //  console.log("lastSaved  localGameInfo", lastSaved, localGameInfo);
  }
  drawScreen();
}

function loginSignupConsole(){
  let log = prompt("1: Login \n2: Logout \n 3: Signup ", "")
  if(log === "1"){ console.log("login"); loginViaPrompt()    }
  if(log === "2"){ console.log("logout"); firebase.auth().signOut()  }
  if(log === "3"){ console.log("signup"); signupViaPrompt() }
}


async function setupGameViaPrompt(){
  let ans7 = prompt("Multiplayer Game y/n", "y")
  if(ans7 === "n"){
    replaceState(setupNew(getGameParamsViaPrompt(false, ), {online: false}))

  }
  if(ans7 === "y") {
    if (loggedInPlayer){ // firebase.auth().currentUser){
      let meta = await setupMetaViaPrompt()
      console.log("meta",meta);
      //  state = await setupStateViaPrompt(tempMeta);
      let players;
      if (meta.playergrid) players = meta.playergrid.length;
      replaceState( setupNew(getGameParamsViaPrompt(meta.online, players), meta));
    //  localGameInfo = setlocalGameInfo();
    }
    else {
      console.log("not logged in");
      loginViaPrompt()
    }
  }
  drawScreen();
}

async function setupMetaViaPrompt(){
  let meta = {online:true, playergrid: []}
  //let handleList =  await getHandleList()
  let additionalPlayergrid =  await getAdditionalPlayers(cacheHandleList, [0, loggedInPlayer.uid, loggedInPlayer.handle])
  meta.playergrid = additionalPlayergrid;
  // console.log("additionalPlayergrid", additionalPlayergrid);
  return meta
}

function getGameParamsViaPrompt(online=false, numHumansParam){
  let config = {}
  let numPlayers = Math.min(Number(prompt("Number of players (Max 6)", 4)),6);
  if (numPlayers === null) return null;
  else config.numPlayers = numPlayers

  let numHumans;
  if(online) {numHumans = numHumansParam;}
  else numHumans = Number(prompt("Number of Humans ", 2));
  if (numHumans === null) return null;
  else config.numHumans = numHumans;

  let boardSize = Number(prompt("Size of Board ", 8));
  if (boardSize === null) return null;
  else config.boardSize = boardSize;

  let allied = prompt("Allied Humans y/n", "y")
  if (allied === null) return null;
  else {
    if(allied === "y" || allied === "y") config.allied = true;
    else config.allied = false;
  }
  let gameName = prompt("Game Name", randomName())
  if (gameName === null) return null;
  else config.gameName = gameName;
  //console.log(config);

  config.playerlist = makePlayerListConsole(config)
  config.alliesGrid = makeAlliesGridConsole(config)
  return config
}

function makePlayerListConsole(config){
  let playerlist = []
  for(let i = 0; i < config.numPlayers; i++){  playerlist.push("AI")  }
  for(let i = 0; i < config.numHumans; i++){ playerlist[i] = "Human";  }
  return playerlist;
}

function makeAlliesGridConsole(config){
  let alliesGrid = []
  for(let i = 0; i < config.numPlayers; i++){
    if(config.allied){
      alliesGrid[i] = [];
      for(let j = 0; j < config.numPlayers; j++){ alliesGrid[i][j] = config.playerlist[i] === config.playerlist[j] }
    } else {
      alliesGrid[i] = [];
      for(let j = 0; j < config.numPlayers; j++){ alliesGrid[i][j] = i === j }
    }
  }
  return alliesGrid;
}

async function setupStateViaPrompt(meta){
  let players;
  if (meta.playergrid) players = meta.playergrid.length;
  let tempState = setupNew(getGameParamsViaPrompt(meta.online, players), meta)
  //console.log(tempState);
  return tempState;
}


function setlocalGameInfo(){
  let players = state.meta.playergrid;
  let uidlist = players.map((a) => a[0]);
  let player = uidlist.indexOf(loggedInPlayer.uid);
  console.log("state, players, uidlist, player", state, players, uidlist, player );
  return {player:player}
}

function getAdditionalPlayers(handleList, startingList){
  var index = 1;
  console.log("getAdditionalPlayers handleList", handleList);
  let additionalPlayergrid = [startingList];
  let finishedAddingPlayers = false;
  while(!finishedAddingPlayers){
    let ans = prompt(JSON.stringify( handleList), "Press cancel to stop adding")
    if (ans === null) finishedAddingPlayers = true
    else {
      let newEntry = [index, handleList[Number(ans)][2], handleList[Number(ans)][1]]
      if(additionalPlayergrid.findIndex(x => JSON.stringify(x[1]) === JSON.stringify(newEntry[1])) === -1) {
        additionalPlayergrid.push(newEntry)
        index++
        console.log(additionalPlayergrid);
      }
    }
  }
  return additionalPlayergrid
}

function loadNetworkGameConsole(){
  var index = 0;
  var IDArray = [];

  let promptText = "select the number for your Game:  ";
  console.log("blah 1 ", cacheGameList);
  cacheGameList.forEach(function(doc) {
    console.log("blah ", doc[1]);
    let {name, users, turnNumber, playerTurn, when} = doc[1]
    promptText =  promptText + index + " => " + " Name: "+ name + " turn: "+ playerTurn + "\n";
    index += 1;
    IDArray.push(doc[0])
  })

  console.log("IDArray cacheGameList" , IDArray, cacheGameList);
  const gameID = IDArray[Number(prompt(promptText))]
  loadGameFromID(gameID)
}


// Helpers

function getTimestamp(){
  let d = new Date();
  return `${d.getMonth()}-${d.getDate()}:${d.getHours()}:${d.getMinutes()}`;
}

function getTurnstamp(){
  return `T:${state.turnNumber}-P:${state.playerTurn}`;
}

function packState(){
  let savestate = state.clone();
  savestate.tiles = [...state.tiles]
  return JSON.stringify(savestate);
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

// Local Save Logic

function autoSave(){
  console.log("autosaving");
  saveAs("autoSave");
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

function load(savename = "quicksave"){
  if (savename === "a") {savename = "autoSave"; console.log("auto");}
  if (savename === "clear"){localStorage.setItem("#savenames", JSON.stringify([]))}
  else{
    let newState = JSON.parse(localStorage.getItem(savename));
    console.log(newState);
    replaceState(unpackState(newState))
  }
}
