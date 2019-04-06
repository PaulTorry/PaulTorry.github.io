"use strict";

/* global
Vec, Hex, sel:true

boardSize,

drawScreen, drawMenu, screenSettings, interactiveConsole
nextTurn,  onMenuItemClicked,  onTechHexClicked, onHexClicked,
preturn,
*/

/* eslint-disable no-unused-vars, one-var, */

let mouseDownLocation = new Vec();
let mouseDownLocationABS = new Vec();
let fingerDistance = null;


function getRealXYfromScreenXY (pt) {
  return pt.scale(1 / screenSettings.scale).add(screenSettings.screenOffset);
}

function scaleContext (sc) {
  //console.log(sc,screenSettings.scale);
  const ctx = document.getElementById("board").getContext("2d");

  if (screenSettings.scale * sc < 0.2) sc = 1;
  if (screenSettings.scale * sc > 2) sc = 1;

  const viewCentre = getRealXYfromScreenXY(new Vec(400,400));
  screenSettings.scale *= sc;
  ctx.scale(sc, sc);
  screenSettings.screenOffset = screenSettings.screenOffset.scale(1 / sc);
  const newViewCentre = getRealXYfromScreenXY(new Vec(400,400));

  translateContext((newViewCentre.subtract(viewCentre)).scale(-1));///screenSettings.scale));
}

function translateContext (dif, contextName = "board") {
  const ctx = document.getElementById(contextName).getContext("2d");

  const viewCentre = getRealXYfromScreenXY(new Vec(400,400));
  screenSettings.screenOffset = screenSettings.screenOffset.add(dif);
  ctx.translate(-dif.x, -dif.y)
  const newViewCentre = getRealXYfromScreenXY(new Vec(400,400));

  if (newViewCentre.mag >= screenSettings.hexSize*boardSize*1.5+50 && newViewCentre.mag > viewCentre.mag){
    translateContext(dif.scale(-1), contextName);
  }
}

function translateContextTo(loc, ctx = "board") {
  const c = document.getElementById(ctx).getContext("2d");
  let dif = loc.subtract(screenSettings.screenOffset).subtract(screenSettings.screenCenter);
  screenSettings.screenOffset = screenSettings.screenOffset.add(dif)
  c.translate(-dif.x,-dif.y)
}


function mousedown(event){
  mouseDownLocationABS = new Vec( event.offsetX, event.offsetY) ;
  mouseDownLocation = new Vec( event.offsetX, event.offsetY) ;
  document.getElementById("board").addEventListener("mousemove", drag);
  document.getElementById("board").addEventListener("mouseup", removeMousemove);
}

function removeMousemove(event){
  document.getElementById("board").removeEventListener("mousemove", drag);
  document.getElementById("board").removeEventListener("mouseup", removeMousemove);
}


function mouseWheel(event){
  event.preventDefault();
  if (event.deltaY>0){    scaleContext(1/1.1);  }
  if (event.deltaY<0){    scaleContext(1.1);  }
  drawScreen();
}

function drag(event){
  if (mouseDownLocationABS.scale(-1).add(new Vec(event.offsetX,  event.offsetY)).scale(-1/(screenSettings.scale)).mag > 20){
    sel = {state:0, attacks:[], menu:[], moves:[]}
  }
  event.preventDefault();
  event.stopPropagation();
  var c = document.getElementById("board").getContext("2d");
  let dif = mouseDownLocation.scale(-1).add(new Vec(event.offsetX,  event.offsetY)).scale(-1/(screenSettings.scale));
  translateContext(dif)
  mouseDownLocation =  new Vec( event.offsetX, event.offsetY) ;
  drawScreen();
}


function menuClick(event){

  event.preventDefault();
  if(event.offsetX < 90 && event.offsetY < 100){nextTurn()}
  else if (event.offsetY < 90 && event.offsetX > 710) {
    if(!preturn)screenSettings.openTechTree = !screenSettings.openTechTree;
  }
  else if(event.offsetY < 90 && event.offsetY > 10 && !screenSettings.openTechTree){
    console.log(event.offsetX);
    console.log((event.offsetX-110), (event.offsetX-110)/70 );
    let num = Math.ceil((event.offsetX-110)/70);
    console.log(num);
    if (num && sel.menu[num-1]){
      console.log(sel, sel.menu, sel.menu[num-1]);
      onMenuItemClicked(sel.menu[num-1]);
    }
  }
  else{
    let clickHex = Hex.getUnitHexFromXY((new Vec(event.offsetX,  event.offsetY).add(screenSettings.techTreeOffset.invert())).scale(1/35))
    onTechHexClicked(clickHex);
  }
  drawScreen();
  drawMenu();
}


function boardClick(event) {
  let clickHex = Hex.getUnitHexFromXY(getRealXYfromScreenXY(new Vec(event.offsetX,  event.offsetY))
    .scale(1/screenSettings.hexSize)
  )
  onHexClicked(clickHex);
  drawScreen();
}


function touchstart(event) {
  let {pageX,pageY} = event.touches[0];
  mouseDownLocation = new Vec( pageX, pageY) ;
  document.getElementById("board").addEventListener("touchmove", touchdrag);
  document.getElementById("board").addEventListener("touchend", removeTouchmove);
}

function removeTouchmove(event){
  fingerDistance = null;
  document.getElementById("board").removeEventListener("touchmove", touchdrag);
  document.getElementById("board").removeEventListener("touchend", removeTouchmove);
}

function touchdrag(event){

  sel = {state:0, attacks:[], menu:[], moves:[]}

  event.preventDefault();
  event.stopPropagation();
  var c = document.getElementById("board").getContext("2d");
  let {pageX,pageY} = event.touches[0];
  if(event.touches[1]){
    let {pageX:x2,pageY:y2} = event.touches[1];
    //  console.log(pageX , x2 , pageY , y2)
    let fingerDistanceNew = Math.sqrt( (pageX - x2)*(pageX - x2) + (pageY - y2)*(pageY - y2))
    //  console.log(fingerDistanceNew + "fingerDistanceNew");
    if (fingerDistance){
      scaleContext(fingerDistanceNew/fingerDistance)
    }
    fingerDistance = fingerDistanceNew
  }
  else fingerDistance = null;
  let dif = mouseDownLocation.scale(-1).add(new Vec(pageX, pageY)).scale(-1/(screenSettings.scale));
  translateContext(dif)
  mouseDownLocation =  new Vec( pageX, pageY) ;
  drawScreen();
}

function keyHandle(e){
  console.log(e);
  if(e.code === "Tab") interactiveConsole();
}
