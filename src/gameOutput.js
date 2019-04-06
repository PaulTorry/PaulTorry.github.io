"use strict"



/*global
screenSettings, Vec, Hex,
drawScreen,  sel, state,
getUpdatedViewMask,
simpleShapes, getTerrainDamage
 Map,  makeNewViewMask, preturn,
gameSprites, debug, territoryState,  whichPlanetsTerritory,
baseShapes,
data,

*/


/* eslint-disable no-unused-vars */


//  document.getElementById("menu").height = 500;



function getPlayerColour(player = state.playerTurn, opacity = 1, mid = false, dark = false){
  const playerColours = ["green", "red", "lightblue", "orange", "purple", "brown"];
  const playerColoursNew = [    [33,163,79], [216,36,53], [124,0,255], [0,131,219],
    [177,0,95],[158,170,30], [216,130,25]];
  const playerColoursMid = [    [3,124,52], [158,28,35], [95,0,186], [0,107,188],
    [139,0,73],[126,137,20], [172,104,14]];
  const playerColoursDark = [   [0,110,43],[130,6,20],[58,5,161],[0,74,156],[122,0,62],[101,112,8],[142,85,1]];

  let [r,g,b] = playerColoursNew[player];
  if (mid) [r,g,b] = playerColoursMid[player];
  if (dark) [r,g,b] = playerColoursDark[player];
  return `rgba(${r},${g},${b},${opacity})`
}

function mapColours(string, player, transparency = 1){
  if(string === "rgb(130, 6, 20)")return getPlayerColour(player, transparency , 1) // MAYBE 0,1)
  else if (string === "rgb(158, 28, 35)") return getPlayerColour(player, transparency, 1);
  else if (string === "rgb(215, 35, 53)") return getPlayerColour(player, transparency);
  else if (string === "rgba(215, 35, 53, 0.00)") return getPlayerColour(player, 0);
  else return string;
}

const selectedColour = ["white", "purple", "blue", "orange"];


function getXYfromHex(hexCoord, size=screenSettings.hexSize){return Hex.getXYfromUnitHex(hexCoord).scale(size)}

function drawScreen() {
  let ss = screenSettings;
  var c = document.getElementById("board").getContext("2d");
  c.clearRect(-99999,-99999,199999,199999);                            // FIX THIS @TODO
  c.fillStyle = '#ff0000';
  c.strokeStyle = '#ff00ff';
  c.lineWidth = 5

  let viewMask = getUpdatedViewMask(state)
  if (preturn){
    viewMask = makeNewViewMask(new Map());
  }

  for(let [id , tile] of state.tiles){
    if(viewMask[id] || debug){
      let {x,y} = getXYfromHex(tile.hex)//.subtract(new Vec(screenSettings.hexSize,screenSettings.hexSize))
      drawPoly(c, simpleShapes["hexVert"], getXYfromHex(tile.hex), ss.hexSize, 1,  "rgb(37,32,45)", "rgb(18,15,34)"  );

      if(tile.terrain !== "space"){
        if(gameSprites[tile.terrain]){
          drawFromData(c, gameSprites[tile.terrain], x, y)
        }
        else{ console.log("filed draw, no curve"); }
      }
      if(tile.station){
        drawFromData(c, gameSprites[tile.station.type], x, y, tile.station.owner)
        // if(tile.station.type === "asteroidMining"){drawFromData(c, curves["asteroidMining"], x, y, tile.station.owner)  }
        // else drawPoly(c, baseShapes["asteroidMining"], getXYfromHex(tile.hex), 10, 4 , getPlayerColour(tile.station.owner) );
      }
      if(tile.navBeacon){
        drawPoly(c, baseShapes["navBeacon"], getXYfromHex(tile.hex), 10, 4 , getPlayerColour(tile.navBeacon.owner) );
      }
      let base = state.baseArray.find(b => b.hex.compare(tile.hex));
      if(base){
        if(gameSprites["planetRing"]){drawFromData(c, gameSprites["planetRing"], x, y, base.owner)}
        else drawPoly(c, baseShapes["inhabitedPlanet"], getXYfromHex(tile.hex), 10, 4 , getPlayerColour(base.owner) );
      }
      if(viewMask[id] === 1){
        drawPoly(c, simpleShapes["hexVert"], getXYfromHex(tile.hex), ss.hexSize, 1,  "rgba(200,200,200,0.1)", "rgba(200,200,200,0.1)"  );
      }
    }
    drawPoly(c, simpleShapes["hexVert"], getXYfromHex(tile.hex), ss.hexSize, 2,  "rgb(37,32,45)");

  }

  for(let [id , tile] of state.tiles){
    if(viewMask[id] || debug ){
      let planet = whichPlanetsTerritory(tile.hex);
      if(planet) drawPoly(c,  simpleShapes["hexVert"], getXYfromHex(tile.hex), ss.hexSize, 1,  getPlayerColour(planet.owner, 1, 0, 1)  );
      if(debug) drawText(c, `${territoryState(tile.hex)}`, getXYfromHex(tile.hex).add(new Vec(-30,-30)),14 )
      if(debug) drawText(c, `${tile.hex.id}`, getXYfromHex(tile.hex).add(new Vec(-40,+40)),14, "grey" )
    }
  }

  for(let ship of state.shipArray){
    if(viewMask[ship.hex.id] === 2 || debug){
      let borderColour = "black";
      if (ship.owner === state.playerTurn && (!ship.moved || !ship.attacked)) {borderColour = "white"}

      if (gameSprites[ship.type]){
        let {x,y} = getXYfromHex(ship.hex);
        let transparency = 1;
        if (ship.owner === state.playerTurn && (ship.moved && ship.attacked)) {transparency =  0.4}
        drawFromData(c, gameSprites[ship.type], x, y, ship.owner, transparency)
      }
      else if (baseShapes[ship.type]){
        drawPoly(c, baseShapes[ship.type], getXYfromHex(ship.hex), 30,  2 , borderColour, getPlayerColour(ship.owner));
      }

      //drawText(c, `${Math.round(ship.shield+ship.hull)}(${ship.hull})`, getXYfromHex(ship.hex).add(new Vec(-20,45)), 20, "white")
      drawText(c, `${Math.round(ship.shield+ship.hull)}`, getXYfromHex(ship.hex).add(new Vec(-20,45)), 20, "white")
      drawText(c, `(${ship.hull})`, getXYfromHex(ship.hex).add(new Vec(10,45)), 15, "orange")
    }
  }

  if(sel.hex){
    for (let move of sel.moves){
      if(getTerrainDamage(sel.ship, move) > 0) drawPoly(c,  simpleShapes["hexVert"], getXYfromHex(move), ss.hexSize -5, 3 , "rgb(255,91,87)");
      else drawPoly(c,  simpleShapes["hexVert"], getXYfromHex(move), ss.hexSize -5, 3 , "rgb(166,191,187)");
    }
    for (let attack of sel.attacks){
      drawPoly(c,  simpleShapes["hexVert"], getXYfromHex(attack), ss.hexSize -5, 3 , "red");
    }
    drawPoly(c,  simpleShapes["hexVert"], getXYfromHex(sel.hex), ss.hexSize -5, 3 , selectedColour[sel.state]);
  }

  if (preturn){
  //  viewMask = makeNewViewMask(new Map());
    let playerLoc = getXYfromHex(state.playerData[state.playerTurn].capital);
    let {x,y} = playerLoc;
    drawFromData(c, gameSprites["logo"], x-20, y-230, 1, null, 0.3)
    drawText(c, `Player ${state.playerTurn}`, playerLoc, 50, getPlayerColour(state.playerTurn) )
    drawText(c, `Click to Start`, playerLoc.add(new Vec(0,50)), 30, "white" )
  }

  drawMenu();
}



function drawMenu(){
  let arrows = [];
  let ss = screenSettings;
  var c = document.getElementById("menu").getContext("2d");
  document.getElementById("menu").height = 100 + 700 * ss.openTechTree;
  c.clearRect(-99999,-99999,199999,199999);
  c.strokeStyle = "white";

  if(sel.menu && sel.menu.length > 0 && !screenSettings.openTechTree){
    let menu = sel.menu;
    for(let i=0; i<menu.length; i++){

      if(gameSprites[menu[i]]){
        drawFromData(c, gameSprites["roundedHex"], 110+70*i, 30, state.playerTurn, 1 ,0.35)
        drawFromData(c, gameSprites[menu[i]], 140+70*i, 60, state.playerTurn, 1 ,0.5)
        let details = data.thingList.find(t => t.thing === menu[i]);
        drawText(c, `${details.price}`, new Vec(125+70*i, 40), 10, "white" )
        drawText(c, `${details.name}`, new Vec(115+70*i, 95), 10, "white" )
      }

      else if(baseShapes[menu[i]]){
        drawFromData(c, gameSprites["roundedHex"], 110+70*i, 32, state.playerTurn, 1 ,0.35)
        drawPoly(c, baseShapes[menu[i]], new Vec(130+70*i, 60), 10, 4 , getPlayerColour(state.playerTurn) );
        let details = data.thingList.find(t => t.thing === menu[i]);
        drawText(c, `${details.price}`, new Vec(125+70*i, 40), 10, "white" )
        drawText(c, `${details.name}`, new Vec(115+70*i, 95), 10, "white" )
      } else i
    }
  }
  c.strokeStyle = getPlayerColour(state.playerTurn);
  drawFromData(c, gameSprites["nextTurnButton"], 0, 0, state.playerTurn, 1 ,0.15);
  drawFromData(c, gameSprites["techTreeButton"], 700, 0, state.playerTurn, 1 ,0.15)

  c.stroke();

  drawText(c, `Player: ${state.playerTurn}`, new Vec(100,20), 15, "white" )
  if(!preturn) drawText(c, `Money:  ${state.playerData[state.playerTurn].money}`, new Vec(180,20), 15, "white" )
  if(!preturn) drawText(c, `City Points: **`, new Vec(280,20), 15, "white" )

  //drawText(c, `Tech Tree`, new Vec(720,30), 15, "white" )

  if (screenSettings.openTechTree){
    data.techs.forEach((t)=>{
      if (t.requires){
        t.requires.forEach(r => {
          arrows.push([t.hex, data.techs.filter(tt => tt.tech === r)[0].hex]);
        })
      }
    })

    arrows.forEach(a => {
      drawArrow(c, getXYfromHex(a[1],35).add(ss.techTreeOffset),getXYfromHex(a[0],35).add(ss.techTreeOffset));
    })

    data.techs.forEach((t)=>{
      let center = getXYfromHex(t.hex, 35).add(ss.techTreeOffset);
      let colour = "white";
      let colNum = t.colour;

      let draw = t.cost < 99;

      let col = `rgb(${colNum[0]},${colNum[1]},${colNum[2]})`
      //if (state.playerData[state.playerTurn].tech[t.tech]) {colour = "yellow"}
      if (state.playerData[state.playerTurn].tech[t.tech]) {
      //  col = "rgb(78,78,117)"
        drawPoly(c, simpleShapes["hexVert"], center, 45, 10, getPlayerColour(state.playerTurn), "rgb(78,78,117)")
      } else if (t.cost > 99 || (t.requires &&
        t.requires.find(r => !state.playerData[state.playerTurn].tech[r])
      )
      ) {
        drawPoly(c, simpleShapes["hexVert"], center, 45, 10, "white", col)
      } else {
        drawPoly(c, simpleShapes["hexVert"], center, 45, 10, "white", "rgb(78,78,117)")
      }
      //  drawPoly(c, simpleShapes["hexVert"], center, 45, 10, getPlayerColour(state.playerTurn), col)
      if(draw || debug) drawText(c, `${t.name}`, center.add(new Vec(-30,25)) , 12, colour )
      if(draw || debug) drawText(c, `${t.cost}`, center.add(new Vec(-20,-20)) , 12, colour )
    })


  }
}

function drawPoly(c, pointVec, center = new Vec(0,0), scale = 50, width, sColor, fColor){
  if(width){c.lineWidth = width}
  if(sColor){c.strokeStyle = sColor}
  if(fColor){c.fillStyle = fColor}

  c.lineWidth = 3;
  c.moveTo(pointVec[0].x, pointVec[0].y);
  c.beginPath();
  for (let point of pointVec){
    let {x,y} = point.scale(scale).add(center);
    c.lineTo(x, y)
  }
  c.closePath();
  c.stroke();
  if(fColor){c.fill();}
  c.beginPath();c.closePath();   // Hack to stop drawing after clear
}

function drawArrow(c, start, end, width, colour){
//  console.log(start,end);
  let midpoint = start.add(end).scale(0.5);

  c.lineWidth = 3;
  c.moveTo(start.x, start.y);
  c.beginPath();
  c.lineTo(midpoint.x, midpoint.y);
  c.lineTo(start.x, start.y);
  c.closePath();
  c.stroke();
  c.beginPath();c.closePath();
  c.lineWidth = 3;
  c.moveTo(end.x, end.y);
  c.beginPath();
  c.lineTo(midpoint.x, midpoint.y);
  c.lineTo(end.x, end.y);
  c.closePath();
  c.stroke();
  c.beginPath();c.closePath();
}

function drawFromData(c, data, xx=0, yy=0, player, transparency, scale = 1){
  let add = (a, x, y) => a.map((v,i) => i%2 ? v*scale+y  : v*scale+x);
  let gradient;
  let x = xx;
  let y = yy;

  //c.save();
  //c.shadowColor = "rgba(0, 0, 0, 0.35)";
  //c.shadowOffsetX = 3.0;
  //c.shadowOffsetY = 3.0;
  //c.shadowBlur = 10.0;

  data.forEach(([t, ...v]) => {
    if(t === "sv") c.save();
    else if(t === "of") {x = xx + v[0]*scale; y = yy + v[1]*scale;}
    else if(t === "bp") c.beginPath();
    else if(t === "mt") c.moveTo(...add(v,x,y));
    else if(t === "lt") c.lineTo(...add(v,x,y));
    else if(t === "lw") c.lineWidth = v[0];
    else if(t === "cp") c.closePath();
    else if(t === "fs"){
      if (v && v[0] ){ c.fillStyle = mapColours(v[0], player, transparency); }
      else if (gradient) {c.fillStyle = gradient}
    }
    else if(t === "ss"){ if (v){ c.strokeStyle = mapColours(v[0], player, transparency);}}
    else if(t === "fl") c.fill();
    else if(t === "ct") c.bezierCurveTo(...add(v,x,y));
    else if(t === "re") c.restore();
    else if(t === "st") c.stroke()
    //else if(t === "tr") c.transform(...v)
    else if(t === "xrg"){gradient = c.createRadialGradient(v[0]*scale+x,v[1]*scale+y,v[2]*scale,v[3]*scale+x,v[4]*scale+y,v[5]*scale)    }
    else if(t === "xlg"){gradient = c.createLinearGradient(...add(v,x,y))
    }
    else if(t === "xcs"){
      gradient.addColorStop(v[0],mapColours(v[1], player, transparency))
    }
  })
  c.shadowOffsetX = 0;
  c.shadowOffsetY = 0;
  c.shadowBlur = 0.0;
  c.restore()
  c.beginPath();c.closePath(); // Hack to stop drawing after clear

  if (c.data) return c.data;
}


function drawText(c, text, center = new Vec(0,0), size=28, color="blue", font= "Helvetica"){
  let {x,y} = center;
  c.font = `${size}px ${font}`;
  c.fillStyle = color;
  c.fillText(text, x, y);
  //  c.stroke();
}
