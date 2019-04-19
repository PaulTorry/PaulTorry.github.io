"use strict"

/*global,  state , Hex, data  */

/* eslint-disable no-unused-vars */

function makeNewViewMask(tiles){
  let mask = {};
  tiles.forEach( (a,id,b) => { mask[id] = 0 })
  return mask;
}


function removeActiveViews(viewMask){
  let mask = {};
  for (let k of Object.keys(viewMask)){
    if (viewMask[k] === 2 || viewMask[k] === 1){mask[k] = 1}
  }
  return mask;
}


function addViewMasks(state, vm1, vm2){
  let mask = {};
  state.tiles.forEach(b => {
    mask[b.hex.id] = Math.max(vm1[b.hex.id], vm2[b.hex.id]);
  })
  return mask;
}

function getUpdatedViewMask(state, player = state.playerTurn){

  let mask = state.playerData[state.playerTurn].viewMask
  for(let i = 0; i < state.numPlayers; i++){
    if(i === player || state.alliesGrid[player][i]){
      mask = addViewMasks(state, mask, getOwnViewMask(state, i));
    }
  }
  return mask;
}

function getOwnViewMask(state, player = state.playerTurn){
  let mask = removeActiveViews(state.playerData[state.playerTurn].viewMask);

  let viewHex = n => {
    if(
      data.terrainInfo[state.tiles.get(n.id).terrain].viewTech
       && !state.playerData[state.playerTurn].tech[data.terrainInfo[state.tiles.get(n.id).terrain].viewTech]
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

  state.shipArray.forEach(s => {
    if(s.owner === player){
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
