"use strict"
/*global
state, data, quickSetup, changeCanvas, randomName,
drawScreen,
replaceState,  setupNew,
      updateHandleList, updateCacheGameList,
      loginSignupConsole,
*/
/* eslint-disable no-unused-vars */

function makeConfigFromMenu(){
  let online = menuData.NewGameData.Online;
  let config = {}

  config.boardSize = menuData.NewGameData.BoardSize;
  config.allied = true;
  config.gameName = menuData.NewGameData.GameName;


  if (online){

    let tempPlayerlist = menuData.OnlinePlayers.map(x => {
      if(x.PlayerType === "None" || x.PlayerType === "AI"){return x}
      else{return {PlayerType:"Human", Alliance:x.Alliance}}
    })
    console.log("tempPlayerlist", tempPlayerlist);
    config.numHumans = tempPlayerlist.filter(x => x.PlayerType === "Human").length;
    config.numPlayers = tempPlayerlist.filter(x => x.PlayerType === "AI").length + config.numHumans;
    config.playerlist = tempPlayerlist.filter(x=> x.PlayerType !== "None").map(x => x.PlayerType);

  } else{
    config.numHumans = menuData.OfflinePlayers.filter(x => x.PlayerType === "Human").length;
    config.numPlayers = menuData.OfflinePlayers.filter(x => x.PlayerType === "AI").length + config.numHumans;
    config.playerlist = menuData.OfflinePlayers.filter(x=> x.PlayerType !== "None").map(x => x.PlayerType);
  }
  // config.numHumans = menuData.OfflinePlayers.filter(x => x.PlayerType === "Human").length;
  // config.numPlayers = menuData.OfflinePlayers.filter(x => x.PlayerType === "AI").length + config.numHumans;

  config.alliesGrid = makePlayerAlianceArrayFromMenu(config, online)

  console.log("config", config);
  return config
}

function makePlayerAlianceArrayFromMenu(config, online){
//  let playerlist; //= menuData.OfflinePlayers.filter(x=> x.PlayerType !== "None").map(x => x.PlayerType)
  let alliance; //= menuData.OfflinePlayers.filter(x=> x.PlayerType !== "None").map(x => x.Alliance)

  if (online){
    alliance = menuData.OnlinePlayers.filter(x=> x.PlayerType !== "None").map(x => x.Alliance);
  } else{
    //playerlist = menuData.OfflinePlayers.filter(x=> x.PlayerType !== "None").map(x => x.PlayerType);
    alliance = menuData.OfflinePlayers.filter(x=> x.PlayerType !== "None").map(x => x.Alliance);
  }


  let alliesGrid = []

  for(let i = 0; i < config.numPlayers; i++){
    alliesGrid[i] = [];
    for(let j = 0; j < config.numPlayers; j++){ alliesGrid[i][j] = alliance[i] === alliance[j] }
  }
  console.log("playerlist, alliesGrid",  alliesGrid);
  return  alliesGrid;
}

function makeMetaFromMenu(){
  let meta = {online:true, playergrid: []};
  let tempPlayergrid =  menuData.OnlinePlayers.filter(x=> !(x.PlayerType === "None"))
  tempPlayergrid = tempPlayergrid.map( (x,i) => [i,x.PlayerType])
  tempPlayergrid =  tempPlayergrid.filter(x=> !(x[1] === "AI"));
  tempPlayergrid =  tempPlayergrid.map(x => [...x, cacheHandleList.find(y => y[1] === x[1] )[2] ]);
//  console.log("tempPlayergrid", tempPlayergrid);
  meta.playergrid = tempPlayergrid;
  console.log("meta", meta);
  return meta;
}
// function makeOfflinePlayerListFromMenu(){
//   return menuData.OfflinePlayers.filter(x=> x.PlayerType !== "None").map(x => x.PlayerType)
// }



// function makeAlliesGridMenu(config, playerlist){
//   let alliance = menuData.OfflinePlayers.filter(x=> x.PlayerType !== "None").map(x => x.Alliance)
//   console.log("alliance", alliance);
//   let alliesGrid = []
//
//   for(let i = 0; i < config.numPlayers; i++){
//     if(config.allied){
//       alliesGrid[i] = [];
//       for(let j = 0; j < config.numPlayers; j++){ alliesGrid[i][j] = alliance[i] === alliance[j] }
//     } else {
//       alliesGrid[i] = [];
//       for(let j = 0; j < config.numPlayers; j++){ alliesGrid[i][j] = i === j }
//     }
//   }
//   console.log(alliesGrid);
//   return alliesGrid;
// }

let menuData = {
  Screen:"MainMenu",

  LoadGameOptions:{Online:true, Page:1, PageSize:4},

  NewGameData:{Online:false, GameName:"DefaultName", BoardSize: 8},
  OfflineOptions:["None", "AI", "Human"],
  OfflinePlayers:[
    {PlayerType:"Human", Alliance:1},
    {PlayerType:"Human", Alliance:2},
    {PlayerType:"Human", Alliance:3},
    {PlayerType:"AI", Alliance:4},
    {PlayerType:"AI", Alliance:5},
    {PlayerType:"AI", Alliance:6},
  ],
  OnlineDefaultOptions:["None", "AI", ],
  OnlineOptions:["None", "AI", ],
  OnlinePlayers:[
    {PlayerType:"AI", Alliance:1},
    {PlayerType:"AI", Alliance:2},
    {PlayerType:"AI", Alliance:3},
    {PlayerType:"AI", Alliance:4},
    {PlayerType:"AI", Alliance:5},
    {PlayerType:"AI", Alliance:6},
  ]
}


function onTechHexClicked (hex){
  let tech = data.techs.find(t => t.hex.compare(hex));
  let player = state.playerData[state.playerTurn];

  if(!player.tech[tech.tech] && player.money >= tech.cost){
    if(!tech.requires || tech.requires.filter(r => !player.tech[r]).length === 0){
      player.tech[tech.tech] = true;
      player.money -= tech.cost;
    }
  }
}


function onMenuHexClicked (hex){
  //
  // let opt = data.mainMenu.find(t => t.hex.compare(hex));
  // let action = opt.name;
  // console.log(opt);

  if(menuData.Screen === "MainMenu"){
    let opt = data.mainMenu.find(t => t.hex.compare(hex));
    let action = opt.name;
    console.log(opt);

    switch(action){
    case "Login/Signup":
      loginSignupConsole();
      break;
    case "Load":
      menuData.Screen = "loadGameMenu";
      console.log(menuData.Screen);
      break;
    case "Quick Setup":
      quickSetup();
      changeCanvas("nextTurnScreen");
      break;
    case "Setup":
      menuData.Screen = "NewGame";
      console.log("menuData.Screen === NewGame");
      // changeCanvas("newGameMenu");
      break;
    }
  }

  else if(menuData.Screen === "loadGameMenu"){
    let opt = data.loadGameMenu.find(t => t.hex.compare(hex));
    let action = opt.name;
    console.log(opt);

    switch(action){
    case 'Refresh':
      updateHandleList(); updateCacheGameList();
      break;
    case 'Online':
      console.log("online clicked");
      menuData.LoadGameOptions.Online = !menuData.LoadGameOptions.Online;
      break;
    case 'Page':
      menuData.LoadGameOptions.Page = ((menuData.LoadGameOptions.Page) % (cacheGameList.length/menuData.LoadGameOptions.PageSize)) +1
      console.log(menuData.LoadGameOptions.Page);
      break;
    case 'Load':
      console.log("loading", opt.num + (menuData.LoadGameOptions.PageSize * (menuData.LoadGameOptions.Page -1)) );
      loadGameFromID(cacheGameList[opt.num + (menuData.LoadGameOptions.PageSize * (menuData.LoadGameOptions.Page -1))][0])
      //  loadGameFromID()
      break;
    }
  }


  else if(menuData.Screen === "NewGame"){
    let opt = data.newGameMenu.find(t => t.hex.compare(hex));
    let action = opt.name;
    console.log(opt);

    switch(action){
    case 'Online':
      console.log("online clicked");
      menuData.NewGameData.Online = !menuData.NewGameData.Online;
      break
    case "GameName":
      menuData.NewGameData.GameName = randomName();
      drawScreen();
      break;
    case "BoardSize":
      menuData.NewGameData.BoardSize = (menuData.NewGameData.BoardSize - 6) % 10 + 8
      break;
    case "Make":
      console.log("Make ");
      if(menuData.NewGameData.Online){
        replaceState(setupNew(makeConfigFromMenu(),  makeMetaFromMenu())      );
      }
      else{replaceState(setupNew(makeConfigFromMenu(),  {online:false})      );}
      break;
    case "Refresh Friends":
      updateHandleList(); updateCacheGameList();
      menuData.OnlineOptions = menuData.OnlineDefaultOptions.concat(cacheHandleList.map(x=> x[1]))
      console.log(menuData.OnlineOptions);
      break;
    case "PlayerType":
      if(menuData.NewGameData.Online){
        menuData.OnlinePlayers[opt.num].PlayerType = cycleArray(menuData.OnlineOptions, menuData.OnlinePlayers[opt.num].PlayerType, 1)
      }
      else{
        menuData.OfflinePlayers[opt.num].PlayerType = cycleArray(menuData.OfflineOptions, menuData.OfflinePlayers[opt.num].PlayerType, 1)
      }
      break;
    case "Alliance":
      if(menuData.NewGameData.Online){menuData.OnlinePlayers[opt.num].Alliance = menuData.OnlinePlayers[opt.num].Alliance % 6 + 1;}
      else{menuData.OfflinePlayers[opt.num].Alliance = menuData.OfflinePlayers[opt.num].Alliance % 6 + 1;}
      break;
    }
  }
  drawScreen();
}

function cycleArray(array, current, step){
  let index = array.indexOf(current)
  if (index === -1) return array[0]
  else return array[(index + step + array.length) % (array.length)]
}



function quickSetup(){
  let config =  {numPlayers: 4, boardSize: 8, numHumans: 2, playersTogether:false}
  config.gameName = randomName();
  config.playerlist = ["Human", "Human", "AI","AI"];
  config.alliesGrid = [
    [true,false,false,false],
    [false,true,false,false],
    [false,false,true,false],
    [false,false,false,true],
  ]
  replaceState(setupNew( config, {online: false}));
}

// function onNewGameMenuHexClicked (hex){
//
//   let opt = data.newGameMenu.find(t => t.hex.compare(hex));
//   let action = opt.name;
//
//   switch(action){
//   case "GameName":
//     menuData.NewGameData.GameName = randomName();
//     drawScreen()
//     break;
//   case "BoardSize":
//     menuData.NewGameData.BoardSize = (menuData.NewGameData.BoardSize - 6) % 10 + 8
//     break;
//   case "Make":
//
//     break;
//   }
//   console.log(opt);
// }
