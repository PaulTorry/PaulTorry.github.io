'use strict'

/* global
Vec, Hex, sel:true, menuData
getXYfromHex,

state, debug, loggedInPlayer

drawScreen, drawMenu, screenSettings, interactiveConsole
nextTurn,  onTopPanelItemClicked,  onTechHexClicked, onMenuHexClicked, onHexClicked,
preturn:true,
*/

/* eslint-disable no-unused-vars, one-var, */

let mouseDownLocation = new Vec()
let mouseDownLocationABS = new Vec()
let fingerDistance = null
//let currentCanvas

function getRealXYfromScreenXY (pt) {
  return pt.scale(1 / screenSettings.scale).add(screenSettings.screenOffset)
}

function scaleContext (sc) {
  // console.log(sc,screenSettings.scale);
  const ctx = document.getElementById('board').getContext('2d')

  if (screenSettings.scale * sc < 0.2) sc = 1
  if (screenSettings.scale * sc > 2) sc = 1

  const viewCentre = getRealXYfromScreenXY(new Vec(400, 400))
  screenSettings.scale *= sc
  ctx.scale(sc, sc)
  screenSettings.screenOffset = screenSettings.screenOffset.scale(1 / sc)
  const newViewCentre = getRealXYfromScreenXY(new Vec(400, 400))

  translateContext((newViewCentre.subtract(viewCentre)).scale(-1)) //     screenSettings.scale));
}

function translateContext (dif, contextName = 'board') {
  const ctx = document.getElementById(contextName).getContext('2d')

  const viewCentre = getRealXYfromScreenXY(new Vec(400, 400))
  screenSettings.screenOffset = screenSettings.screenOffset.add(dif)
  ctx.translate(-dif.x, -dif.y)
  const newViewCentre = getRealXYfromScreenXY(new Vec(400, 400))

  if (newViewCentre.mag >= screenSettings.hexSize * state.boardSize * 1.5 + 50 &&
    newViewCentre.mag > viewCentre.mag) { translateContext(dif.scale(-1), contextName) }
}

function translateContextTo (loc, ctx = 'board') {
  const c = document.getElementById(ctx).getContext('2d')
  const dif = loc.subtract(screenSettings.screenOffset).subtract(screenSettings.screenCenter.scale(1 / screenSettings.scale))
  screenSettings.screenOffset = screenSettings.screenOffset.add(dif)
  c.translate(-dif.x, -dif.y)
}

function mousedown (event) {
  mouseDownLocationABS = new Vec(event.offsetX, event.offsetY)
  mouseDownLocation = new Vec(event.offsetX, event.offsetY)
  document.getElementById('board').addEventListener('mousemove', drag)
  document.getElementById('board').addEventListener('mouseup', removeMousemove)
}

function removeMousemove (event) {
  document.getElementById('board').removeEventListener('mousemove', drag)
  document.getElementById('board').removeEventListener('mouseup', removeMousemove)
}

function mouseWheel (event) {
  // console.log(event);
  event.preventDefault()
  if (event.deltaY > 0) { scaleContext(1 / 1.1) }
  if (event.deltaY < 0) { scaleContext(1.1) }
  drawScreen()
}

function drag (event) {
  if (mouseDownLocationABS.scale(-1).add(new Vec(event.offsetX, event.offsetY)).scale(-1 / (screenSettings.scale)).mag > 20) {
    sel = { state: 0, actions: { attacks: [], menu: [] }, moves: [] }
  }
  event.preventDefault()
  event.stopPropagation()
  var c = document.getElementById('board').getContext('2d')
  const dif = mouseDownLocation.scale(-1).add(new Vec(event.offsetX, event.offsetY)).scale(-1 / (screenSettings.scale))
  translateContext(dif)
  mouseDownLocation = new Vec(event.offsetX, event.offsetY)
  drawScreen()
}

function topPanelClick (event) {
  event.preventDefault()
  if (event.offsetX < 90 && event.offsetY < 100) {
    nextTurn()
  } else if (event.offsetY < 90 && event.offsetX > 710) {
    if (!preturn) toggleTechTree()
  } else if (event.offsetX > 655 && event.offsetX < 700 && event.offsetY > 5 && event.offsetY < 50) {
    if (screenSettings.currentCanvas === 'mainMenu') {
      if (preturn) changeCanvas('nextTurnScreen')
      else changeCanvas('board')
    } else changeCanvas('mainMenu')
    menuData.Screen = 'MainMenu'
    // interactiveConsole();
  } else if (event.offsetY < 90 && event.offsetY > 10 && !screenSettings.openTechTree) {
    console.log(event.offsetX)
    console.log((event.offsetX - 110), (event.offsetX - 110) / 70)
    const num = Math.ceil((event.offsetX - 110) / 70)
    console.log(num)
    if (num && sel.menu[num - 1]) {
      console.log(sel, sel.menu, sel.menu[num - 1])
      onTopPanelItemClicked(sel.menu[num - 1])
    }
  }

  drawScreen()
  drawMenu()
}

function toggleTechTree (newState) {
  if (newState === undefined) newState = !screenSettings.openTechTree
  screenSettings.openTechTree = newState
  if (newState) changeCanvas('techTree')
  else { changeCanvas('board') }
}

function techTreeClick (event) {
  const clickHex = Hex.getUnitHexFromXY((new Vec(event.offsetX, event.offsetY).add(screenSettings.techTreeOffset.invert())).scale(1 / 35))
  onTechHexClicked(clickHex)
  drawScreen()
}

function boardClick (event) {
  const clickHex = Hex.getUnitHexFromXY(getRealXYfromScreenXY(new Vec(event.offsetX, event.offsetY))
    .scale(1 / screenSettings.hexSize)
  )
  onHexClicked(clickHex)
  drawScreen()
}

function mainMenuClick (event) {
  console.log('mainMenuClick')
  const clickHex = Hex.getUnitHexFromXY((new Vec(event.offsetX, event.offsetY).add(screenSettings.techTreeOffset.invert())).scale(1 / 45))
  onMenuHexClicked(clickHex)

  drawScreen()
}

function loadGameMenuClick (event) {
  console.log('loadGameMenuClick')
}

function checkPlayerTurn () {
  const playerNum = state.meta.playergrid.filter((x) => x[1] === loggedInPlayer.handle)[0][0]
  return playerNum === state.playerTurn
}

function nextTurnScreenClick (event) {
  console.log('nextTurnScreenClick')
  if (!state.meta.online || debug || checkPlayerTurn()) {
    translateContextTo(getXYfromHex(state.playerData[state.playerTurn].capital))
    changeCanvas('board')
    preturn = false
  }
  drawScreen()
}

function changeCanvas (canvas) {
  document.body.querySelector('#board').style.display = 'none'
  document.body.querySelector('#techTree').style.display = 'none'
  document.body.querySelector('#mainMenu').style.display = 'none'
  document.body.querySelector('#newGameMenu').style.display = 'none'
  document.body.querySelector('#loadGameMenu').style.display = 'none'
  document.body.querySelector('#nextTurnScreen').style.display = 'none'
  if (canvas === 'board' && preturn) console.log('Ooops skipping nextTurnScreen')
  document.body.querySelector(`#${canvas}`).style.display = 'block'
  screenSettings.currentCanvas = canvas
}

function touchstart (event) {
  const { pageX, pageY } = event.touches[0]
  mouseDownLocation = new Vec(pageX, pageY)
  document.getElementById('board').addEventListener('touchmove', touchdrag)
  document.getElementById('board').addEventListener('touchend', removeTouchmove)
}

function removeTouchmove (event) {
  fingerDistance = null
  document.getElementById('board').removeEventListener('touchmove', touchdrag)
  document.getElementById('board').removeEventListener('touchend', removeTouchmove)
}

function touchdrag (event) {
  sel = { state: 0, actions: { attacks: [], menu: [] }, moves: [] }

  event.preventDefault()
  event.stopPropagation()
  var c = document.getElementById('board').getContext('2d')
  const { pageX, pageY } = event.touches[0]
  if (event.touches[1]) {
    const { pageX: x2, pageY: y2 } = event.touches[1]
    //  console.log(pageX , x2 , pageY , y2)
    const fingerDistanceNew = Math.sqrt((pageX - x2) * (pageX - x2) + (pageY - y2) * (pageY - y2))
    //  console.log(fingerDistanceNew + "fingerDistanceNew");
    if (fingerDistance) {
      scaleContext(fingerDistanceNew / fingerDistance)
    }
    fingerDistance = fingerDistanceNew
  } else fingerDistance = null
  const dif = mouseDownLocation.scale(-1).add(new Vec(pageX, pageY)).scale(-1 / (screenSettings.scale))
  translateContext(dif)
  mouseDownLocation = new Vec(pageX, pageY)
  drawScreen()
}

function keyHandle (e) {
//  console.log(e); 
  if (e.code === 'Tab') interactiveConsole()
  if (Number(e.key)) interactiveConsole(Number(e.key))
  if (e.key === 'ArrowRight') theta += 0.1
  if (e.key === 'ArrowLeft') theta -= 0.1

  drawScreen()
}
