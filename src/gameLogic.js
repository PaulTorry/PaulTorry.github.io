"use strict"

/*global
drawScreen, sel:true, screenSettings,
nextTurn,
state,
onMenuItemClicked,
preturn:true, makeMenu,
findPossibleAttacks, getShipOnHex, findPossibleMoves,
buildShip,
translateContextTo, getXYfromHex, drawMenu, getUpdatedViewMask
data
takeAIturn,
subTurn,
autoSave
*/

// techs,

/* eslint-disable no-unused-vars */


function onHexClicked(clickHex){
  if(preturn){preturn = false; return }
  let viewMask = getUpdatedViewMask(state);

  let possibleAttacks = [], possibleMoves = [];

  sel.menu = [];

  if (viewMask[clickHex.id] === 2){

    if(sel.state === 2){
      if (clickHex.compare(sel.hex)) sel = {state:0,  moves:[], attacks:[], menu: []};
      else sel = {state:0,  moves:[], attacks:[], menu: []};
    //  else sel = {state:2, hex:clickHex, moves:[], attacks:[], menu: makeMenu(clickHex)};
    }

    else if (sel.state === 1){
      if (clickHex.compare(sel.hex)) {
        sel = {state:2, hex:clickHex, moves:[], attacks:[], menu: makeMenu(clickHex)};
      }

      else if(sel.moves.find( e =>  e[0].compare(clickHex))) {
        sel.ship.hex = clickHex;
        state.history[subTurn()].push({type:"move" , rand:Math.random(), path:sel.moves.find( e =>  e[0].compare(clickHex))})
        sel.ship.moved = true;
        sel.hex = clickHex;

        applyTerrainDamage(sel.ship, getTerrainDamage(sel.ship, clickHex));

        possibleAttacks = findPossibleAttacks(clickHex, data.shipHulls[sel.ship.type].range);
        if (possibleAttacks.length > 0) { sel.moves = []; sel.attacks = possibleAttacks}
        else{
          sel.ship.attacked = true;
          sel = {state:0, moves:[], attacks:[], menu:[]}
        //  sel = {state:2, hex:clickHex, moves:[], attacks:[], menu: makeMenu(clickHex)};
        }
        sel.menu = [];
      }

      else if(sel.attacks.find(e =>  e.compare(clickHex))) {
        let target = getShipOnHex(clickHex);
        if(target){
          applyDamage(sel.ship, target, true, getTerrainDefVal(target, clickHex));
          state.history[subTurn()].push({type:"attack" , rand:Math.random(), path:[clickHex, sel.ship.hex]})
          sel.ship.moved = true; sel.ship.attacked = true;
        }
        else { console.log("error in attacks"); }

        sel = {state:0, moves:[], attacks:[], menu:[]}
      }
      else sel = {state:0, moves:[], attacks:[], menu:[]}

    }

    else if (sel.state === 0){
      let currentShip = getShipOnHex(clickHex);

      if(currentShip && currentShip.owner === state.playerTurn){
        if (!currentShip.moved)  possibleMoves = findPossibleMoves(clickHex, currentShip.maxMove);
        if (!currentShip.attacked)  possibleAttacks = findPossibleAttacks(clickHex, currentShip.range);

        if(possibleMoves.length || possibleAttacks.length){
          sel = {state:1, hex:clickHex, ship:currentShip, moves:possibleMoves, attacks: possibleAttacks}
        }
        else sel = {state:2, hex:clickHex, moves:[], attacks:[], menu: makeMenu(clickHex)};
      }
      else{
        sel = {state:2, hex:clickHex, moves:[], attacks:[], menu: makeMenu(clickHex)};
      }
    }
  } else  sel = {state:0,  moves:[], attacks:[], menu: []};
}



function whichPlanetsTerritory(hex){
  return state.baseArray.find(b => b.hex.compare(hex) || b.territory.find(t => t.compare(hex)));
}

function territoryState(hex){
  if (whichPlanetsTerritory(hex) === undefined){ return 1}
  else if (whichPlanetsTerritory(hex).owner === state.playerTurn){ return 2}
  else return 0;
}


function onMenuItemClicked(item, hex = sel.hex){
  let tile = state.tiles.get(hex.id);
  let ship = getShipOnHex(hex);
  let thing = data.thingList.find(t => t.thing === item);
  // if (sel.state !== 2) console.log("sel.state !== 2");

  state.playerData[state.playerTurn].money -= thing.price;

  if(thing.type && thing.type === "industry"){
    tile.station = {type: item, owner: state.playerTurn}
  }

  if(thing.type && thing.type === "resource"){  tile.resource = null;  }

  if(thing.type && thing.type === "ship"){
    state.shipArray.push(buildShip(item, state.playerTurn, tile.hex))
    //tile.station = {type: item, owner: state.playerTurn}
  }

  if(thing.type && thing.type === "nav"){
    tile.navBeacon = {owner: state.playerTurn}
  }

  if(item === "inhabitedPlanet"){
    ship.moved = true; ship.attacked = true;
    let existingBase = state.baseArray.find(b => b.hex.compare(tile.hex));
    tile.navBeacon = {owner: state.playerTurn}
    if (existingBase){
      existingBase.owner = state.playerTurn;
      existingBase.territory.forEach(t => {
        let station = state.tiles.get(t.id).station
        //      console.log(t);
        if(station) state.tiles.get(t.id).station  = {type: station.type, owner: state.playerTurn}
      })
    }
    else {state.baseArray.push(
      {type:"planet", owner:state.playerTurn, hex: tile.hex,
        territory:tile.hex.neighbours.filter(t => territoryState(t) === 1 && t.mag <= state.boardSize)}
    )}
  }


  if(item === "destroy"){
    tile.navBeacon = null;
  }

  sel = {state:0, attacks:[], menu:[], moves:[]}
  reSetIncomes();
  drawScreen();
  drawMenu();
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


function getTerrainDefVal(ship, hex){

  if(data.terrainInfo[state.tiles.get(hex.id).terrain].defenceTech &&
   state.playerData[ship.owner].tech[data.terrainInfo[state.tiles.get(hex.id).terrain].defenceTech]) {
    return 1;
  }

  if(state.baseArray.find(b => b.hex.compare(hex) && b.owner === ship.owner)){ //hex compare
    return 1;
  }
  return 0;
}

function getTerrainDamage(ship, hex){
//  console.log(ship, hex, state.tiles.get(hex.id));

  if (data.terrainInfo[state.tiles.get(hex.id).terrain].damTech && !state.tiles.get(hex.id).navBeacon){
    let hasTech = state.playerData[ship.owner].tech[data.terrainInfo[state.tiles.get(hex.id).terrain].damTech];
    if (!hasTech || data.shipHulls[ship.type].maxMove < 2){
      return [1,hasTech]
    }
  }
  return [0,false];
}

function applyTerrainDamage(ship, damType){
  let [damage, applyToShield] = damType;
  let shipKilled
  if(applyToShield){
    shipKilled = applyDamageToShieldAndHull(ship, damage)
  } else {
    ship.hull -= damage;
    if(ship.hull <= 0) shipKilled = true;
  }
  if(shipKilled) state.shipArray = state.shipArray.filter(e => e !== ship)
}

function applyDamage(attacker, ship, attacking = true, terrainDefence = 0){
  let {type, hull, shield} = ship;
  let defence = data.shipHulls[type].defence + terrainDefence;
  let dammage = Math.max(getWeaponPower(attacker, attacking) -defence,0);
  let range = attacker.hex.distance(ship.hex);
  if ( attacker.range < range ){ dammage = 0}

  let shipKilled = applyDamageToShieldAndHull(ship, dammage)

  if(shipKilled){
    if (range === 1 && attacking){attacker.hex = ship.hex}
    state.shipArray = state.shipArray.filter(e => e !== ship)
  } else {
    if(attacking) applyDamage(ship, attacker, false);
  }

  //
  // if (shield >= dammage){
  //   ship.shield -= dammage;
  //   if(attacking) applyDamage(ship, attacker, false);
  // }
  // else if (shield + hull > dammage) {
  //   ship.hull -= dammage - shield; ship.shield = 0;
  //   if(attacking) applyDamage(ship, attacker, false);
  // }
  // else {
  //   if (range === 1 && attacking){attacker.hex = ship.hex}
  //   state.shipArray = state.shipArray.filter(e => e !== ship)
  // }

}


function applyDamageToShieldAndHull(ship, dammage){
  let {type, hull, shield} = ship;
  if (shield >= dammage){
    ship.shield -= dammage;
    return false;
  }
  else if (shield + hull > dammage) {
    ship.hull -= dammage - shield; ship.shield = 0;
    return false;
  }
  else {    return true;  }
}


function getWeaponPower(ship, attacking = true){
  let {type, hull} = ship;
  let  {attack, retaliate} = data.shipHulls[type];

  if(attacking){ return attack * hull / data.shipHulls[type].hull; }
  else{ return retaliate * hull / data.shipHulls[type].hull; }
}

function repair(ship){
  let hex = ship.hex;
  let tState = territoryState(hex);
  console.log("repair ship", hex, territoryState(hex));
  if(tState > 1) {
    if (state.baseArray.find(b => b.hex.compare(hex))) ship.hull = Math.min(ship.hull +2, data.shipHulls[ship.type].hull);


    ship.shield =  Math.min(ship.shield +2, data.shipHulls[ship.type].shield)
  }
  else if(tState > 1)  ship.shield =  Math.min(ship.shield +1, data.shipHulls[ship.type].shield)

}

function nextTurn(){
  if (state.playerData[state.playerTurn].type === "human") autoSave();

  state.playerData[state.playerTurn].money += state.playerData[state.playerTurn].income;

  for (let ship of state.shipArray){
    if (ship.owner === state.playerTurn){
      if (!ship.moved && !ship.attacked) repair(ship)
      ship.moved = false;
      ship.attacked = false;
    }
  }
  state.playerTurn = (state.playerTurn + 1) % state.numPlayers;
  if (state.playerTurn === 0) {
    state.turnNumber += 1;
  }
  state.history.push([]);
  translateContextTo(getXYfromHex(state.playerData[state.playerTurn].capital));
  screenSettings.openTechTree = false;
  drawMenu(); drawScreen();

  state.log.push(`newturn: turn${state.turnNumber}, player ${state.playerTurn}`)

  sel = {state:0, attacks:[], menu:[], moves:[]}
  drawMenu(); drawScreen();
  preturn = true;

  if(state.playerData[state.playerTurn].type === "AI"){
    takeAIturn();
    nextTurn()
  }
}

function reSetIncomes(){
  state.playerData.forEach((v,i) => {
    state.playerData[i].income = calcIncome(i);
  })
}

function calcIncome(player){
  let bases = state.baseArray.filter(b => b.owner === player);
  let stations = Array.from(state.tiles).filter(([id, val]) => val.station && val.station.owner === player)

  return bases.length + stations.length;
}
