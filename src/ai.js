"use strict"

/*global
Hex, state, getShipOnHex, getUpdatedViewMask, data,
findPossibleMoves, findPossibleAttacks, applyDamage,
makeMenu, onMenuItemClicked,
getTerrainDefVal
*/

/* eslint-disable no-unused-vars */

function takeAIturn(){
  let ships = state.shipArray.filter(s => s.owner === state.playerTurn);
  let viewHexes = Object.entries(getUpdatedViewMask(state)).filter(([k,v]) => v > 1).map(([k,v]) => Hex.getFromID(k))

  ships.forEach( ship => {
    let possibleMoves = findPossibleMoves(ship.hex, ship.maxMove);
    let possibleAttacks = findPossibleAttacks(ship.hex,  data.shipHulls[ship.type].range);

    if (possibleAttacks.length && Math.random() > 0.5){
      let attack = possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)];
      applyDamage(ship, getShipOnHex(attack),true, getTerrainDefVal(getShipOnHex(attack), attack))
    }
    else if (possibleMoves.length && Math.random() > 0.5){
      let move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      ship.hex = move;
    }
  })

  let tech = data.techs[Math.floor(Math.random() * data.techs.length)];
  let player = state.playerData[state.playerTurn];

  if(!player.tech[tech.tech] && player.money >= tech.cost && Math.random() > 0.5){
    player.tech[tech.tech] = true;
    player.money -= tech.cost;
  }


  viewHexes.forEach(hex => {
    let menu = makeMenu(hex);
    if (menu.length && Math.random() > 0.5){
      let choice = menu[Math.floor(Math.random() * menu.length)];
      onMenuItemClicked(choice, hex)
    }
  })



}
