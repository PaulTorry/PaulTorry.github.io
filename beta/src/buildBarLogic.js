"use strict"


/*global
state, territoryState, shipState, getShipOnHex, data
*/

/* eslint-disable no-unused-vars */

function makeBuildBar(hex){
  // console.log("makemenu");
  let base = state.baseArray.find(b => b.hex.compare(hex));
  let tile = state.tiles.get(hex.id);
  let ship =  getShipOnHex(hex); //shipArray.find(e => e.location.compare(hex));
  // console.log("makeBuildBar",base, tile, ship, hex.id);
  return data.thingList.filter(pos => {                                        // make a map to include failure point


  //  console.log("pos ", pos);
    if(pos.price > state.playerData[state.playerTurn].money) return false;
    // console.log(" price  success");

    if(pos.terrain.length !== 0 &&
       !pos.terrain.find(e => e === tile.terrain)) return false;
    // console.log(" terrain  success");

    if(pos.territoryState && pos.territoryState > territoryState(hex)) return false;
    // console.log(" territoryState  success");

    if(pos.resource && pos.resource !== tile.resource) return false;

    if(pos.base && !state.baseArray.filter(b => {return b.hex.compare(hex) && b.owner === state.playerTurn})[0]) {
      return false;
    }
    // console.log(" base  success");

    if(pos.inhabitedPlanet){ if (!base) return false; }
    // console.log(" inhabitedPlanet  success");

    if(pos.shipState === "noShip" && ship) return false;
    // console.log(" noShip  success");

    if(pos.shipState === "ownPresent" && (!ship || ship.owner !== state.playerTurn)) return false;
    // console.log(" ownPresent  success");

    if(pos.shipState === "ownPresentUnmoved"  && (!ship || ship.owner !== state.playerTurn || ship.moved === true)){
      return false;
    }
    // console.log(" ownPresentUnmoved  success");

    if(pos.shipState === "noEnemy" &&  getShipOnHex(hex) && shipState(hex) < 1) return false;
    // console.log(" noEnemy  success");

    if(pos.tech && !state.playerData[state.playerTurn].tech[pos.tech]) return false;
    // console.log(" tech  success");
    // if(pos.tech && pos.tech.length > 0){
    //   for (let t of pos.tech){ if(!state.playerData[state.playerTurn].tech[t]) return false; }
    // }

    if(pos.thingPresent && pos.thingPresent.find(t => t === "navBeacon") && !tile.navBeacon) return false;
    // console.log(" thingPresent  success");
    // Self check

    if(pos.nextTo && !hex.neighbours.filter(x => x.mag < state.boardSize).find((x)=> state.tiles.get(x.id).terrain === pos.nextTo)) return false;

    if(pos.thing === "navBeacon"){if (tile.navBeacon && tile.navBeacon.owner === state.playerTurn) return false;}
    if(pos.thing === "navAsteroid"){if (tile.navBeacon && tile.navBeacon.owner === state.playerTurn) return false;}
    if(pos.thing === "navNebula"){if (tile.navBeacon && tile.navBeacon.owner === state.playerTurn) return false;}



    if(pos.type === "industry" && tile.station) return false;

    if(pos.thing === "inhabitedPlanet" &&  base && base.owner === state.playerTurn) return false;

    return true

  }).map(pos => pos.thing);
}
