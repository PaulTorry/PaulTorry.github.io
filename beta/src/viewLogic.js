"use strict"

/*global  Hex, data  */

/* eslint-disable no-unused-vars */

function makeNewViewMask(tiles, n=0){
  //console.log(tiles);

  let mask = {};
  tiles.forEach( (a,id,b) => { mask[id] = n })
  return mask;
}


function removeActiveViews(viewMask){
  let mask = {};
  for (let k of Object.keys(viewMask)){
    if (viewMask[k] === 2 || viewMask[k] === 1){mask[k] = 1}
    else viewMask[k] = 0;
  }
  return mask;
}

function outputValuesViewmask(viewMask){
  let values = [];
  for (let k of Object.keys(viewMask)){
    values.push(viewMask[k])
  }
  return values;
}


function addViewMasks(state, vm1, vm2){
  let mask = {};
  state.tiles.forEach(b => {
    //    console.log(vm1[b.hex.id], vm2[b.hex.id]);
    mask[b.hex.id] = Math.max(vm1[b.hex.id], vm2[b.hex.id]);
  })
  //console.log(outputValuesViewmask(mask));
  return mask;
}

function getUpdatedViewMask(state, player = state.playerTurn){

  let mask = makeNewViewMask(state.tiles)//state.playerData[player].viewMask
  for(let i = 0; i < state.numPlayers; i++){
    if(i === player || state.alliesGrid[player][i]){
      mask = addViewMasks(state, mask, getOwnViewMask(state, i));
    }
  }
  mask = addViewMasks(state, mask, getOwnViewMask(state, player));
  return mask;
}

function getOwnViewMask(state, player = state.playerTurn){
  // console.log("state.playerData[player].viewMask",state.playerData[player].viewMask);
//  let mask = makeNewViewMask(state.tiles)
  let mask = addViewMasks(state, makeNewViewMask(state.tiles), removeActiveViews(state.playerData[player].viewMask));

  let viewHex = n => {
    if(
      data.terrainInfo[state.tiles.get(n.id).terrain].viewTech
       && !state.playerData[player].tech[data.terrainInfo[state.tiles.get(n.id).terrain].viewTech]
    ) { mask[n.id] = 1;}
    else{ mask[n.id] = 2; }
  };

  let checkBetween = (x) => {
    return (y) => {
      if ( Hex.getDependants(x,y).filter(h => h.mag <= state.boardSize)
        .find(x => state.tiles.get(x.id).terrain !== "nebula") ) return true;
      else { return false; }
    };
  }


  //console.log("shiparrray",state.shipArray );

  state.shipArray.forEach(s => {
    if(s.owner === player){
      // console.log("doship", player);

      mask[s.hex.id] = 2;
      s.hex.neighbours.filter(h => h.mag <= state.boardSize).forEach(viewHex)
      if(data.shipHulls[s.type].view>1){
        s.hex.secondNeighbours.filter(h => h.mag <= state.boardSize)
          .filter(checkBetween(s.hex))
          .forEach(viewHex)
      }
    }
  })

  state.baseArray.forEach(b => {
    if(b.owner === player){
      mask[b.hex.id] = 2;
      b.territory.forEach(t => { mask[t.id] = 2; })
    }
  })

  for(let [id , tile] of state.tiles){
    if(tile.navBeacon && tile.navBeacon.owner === player){ mask[tile.hex.id] = 2; }
  }
  state.playerData[state.playerTurn].viewMask = removeActiveViews(mask);
  return mask;
}
