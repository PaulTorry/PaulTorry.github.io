'use strict'

/* global
screenSettings, Vec, Hex,
sel, state,
getUpdatedViewMask,
simpleShapes, getTerrainDamage,
 preturn, menuData,
gameSprites, debug, territoryState,  whichPlanetsTerritory,
baseShapes,
data, subTurn,
localGameInfo, loggedInPlayer,
getRealXYfromScreenXY, iconShapes,
cacheGameList
*/

/* eslint-disable no-unused-vars, dot-notation */
//  document.getElementById("menu").height = 500;

function getPlayerColour (player = state.playerTurn, opacity = 1, mid = false, dark = false) {
  const playerColours = ['green', 'red', 'lightblue', 'orange', 'purple', 'brown']
  const playerColoursNew = [[33, 163, 79], [216, 36, 53], [124, 0, 255], [0, 131, 219], [177, 0, 95], [158, 170, 30], [216, 130, 25]]
  const playerColoursMid = [[3, 124, 52], [158, 28, 35], [95, 0, 186], [0, 107, 188], [139, 0, 73], [126, 137, 20], [172, 104, 14]]
  const playerColoursDark = [[0, 110, 43], [130, 6, 20], [58, 5, 161], [0, 74, 156], [122, 0, 62], [101, 112, 8], [142, 85, 1]]

  let [r, g, b] = playerColoursNew[player]
  if (mid) [r, g, b] = playerColoursMid[player]
  if (dark) [r, g, b] = playerColoursDark[player]
  return `rgba(${r},${g},${b},${opacity})`
}

function mapColours (string, player, transparency = 1) {
  if (string === 'rgb(130, 6, 20)') return getPlayerColour(player, transparency, 1) // MAYBE 0,1)
  else if (string === 'rgb(158, 28, 35)') return getPlayerColour(player, transparency, 1)
  else if (string === 'rgb(215, 35, 53)') return getPlayerColour(player, transparency)
  else if (string === 'rgba(215, 35, 53, 0.00)') return getPlayerColour(player, 0)
  else return string
}

// let colour = (x) => { return (y) => `rgb(${x[0]},${x[1]},${x[2]})` }

function getColMap (player, transparency = 1) {
  return (v) => mapColours(v, player, transparency)
}

const selectedColour = ['white', 'purple', 'blue', 'orange']

function getXYfromHex (hexCoord, size = screenSettings.hexSize) { return Hex.getXYfromUnitHex(hexCoord).scale(size) }

function drawScreen () {
  // window.requestAnimationFrame((t) => {
  // drawlog();
  drawTopPanel()
  switch (screenSettings.currentCanvas) {
    case 'nextTurnScreen': drawNextTurnScreen()
      break
    case 'mainMenu': drawMenu()
      break
    case 'board': drawBuffer(); drawView()
      break
    case 'techTree': drawTechTree()
      break
    default: console.log('drawfail')
  }
  // })
}

function drawBuffer () {
  const b = document.body.querySelector('#buffer').getContext('2d')
  b.translate(...screenSettings.bufferCenter)
  drawBoard(b)
  b.translate(...screenSettings.bufferCenter.scale(-1))
  if (screenSettings.lowRes) {
    document.getElementById('intermediate').getContext('2d').drawImage(
      document.getElementById('buffer'),
      0, 0, 3200, 3200, 0, 0, 800, 800
    )
  }
}

function drawView () {
  const cover = document.body.querySelector('#board').getContext('2d')
  const ss = screenSettings
  // const { x, y } = screenSettings.viewOffset
  cover.clearRect(-99999, -99999, 199999, 199999)

  if (!ss.lowRes) {
    cover.drawImage(
      document.getElementById('buffer'),
      ...ss.screenCenter.scale(1 - ss.scale).add(ss.viewOffset).add(ss.bufferCenter),
      ...ss.screenCenter.scale(ss.scale * 2),
      ...Vec.zero,
      ...Vec.unit.scale(ss.screenSize)
    )
  } else {
    cover.drawImage(
      document.getElementById('intermediate'),
      ...ss.screenCenter.scale(1 - ss.scale).add(ss.viewOffset.scale(1/4)).add(ss.intermediateCenter),
      ...ss.screenCenter.scale(ss.scale / 2),
      // ...Vec.zero,
      // ...ss.intermediateCenter,
      ...Vec.zero,
      ...Vec.unit.scale(ss.screenSize)
    )
  }
}

function drawNextTurnScreen () {
  const ss = screenSettings
  const c = document.getElementById('nextTurnScreen').getContext('2d')
  c.clearRect(-99999, -99999, 199999, 199999)
  c.fillStyle = 'white'

  const center = ss.techTreeOffset
  const { x, y } = center
  // let playerLoc = getXYfromHex(state.playerData[state.playerTurn].capital);
  // let {x,y} = playerLoc;
  const logoSize = 0.3
  drawFromData(c, 'logo', 400 - 300 * logoSize, 200 - 300 * logoSize, (x) => x, logoSize)
  drawText(c, `Player ${state.playerTurn} . ${localGameInfo.player}`, center.add(new Vec(-80, 0)), 50, getPlayerColour(state.playerTurn))
  drawText(c, 'Click to Start', center.add(new Vec(-80, 50)), 30, 'white')
}

function getAngleFromVariant (tile) {
  let angle = 0
  switch (tile.terrain) {
    case 'planet':
    case 'asteroids':
      angle = tile.variant
      break
    case 'gasGiant':
      angle = -tile.variant / 6
  }
  return angle
}

function drawBoard (c) {
  const ss = screenSettings
  c.clearRect(-99999, -99999, 199999, 199999) // FIX THIS @TODO
  c.fillStyle = '#ff0000'
  c.strokeStyle = '#ff00ff'
  c.lineWidth = 5

  const viewMask = getUpdatedViewMask(state)

  for (const [id, tile] of state.tiles) {
    if (viewMask[id] || debug) {
      const { x, y } = getXYfromHex(tile.hex)

      if (gameSprites[tile.terrain]) {
        drawFromData(c, tile.terrain, x, y, undefined, undefined, getAngleFromVariant(tile))
      }
      if (gameSprites[tile.resource]) {
        drawFromData(c, tile.resource, x, y, undefined, undefined, getAngleFromVariant(tile))
      }

      if (tile.station) {
        drawFromData(c, tile.station.type, x, y, getColMap(tile.station.owner))
      }
      if (tile.navBeacon) {
        tile.hex.neighbours.forEach((v, i) => {
          if (state.tiles.get(v.id) && state.tiles.get(v.id).navBeacon) drawFromData(c, 'navBeacon', x, y, getColMap(tile.navBeacon.owner), undefined, -i / 6)
        })
      }
      const base = state.baseArray.find(b => b.hex.compare(tile.hex))
      if (base) {
        drawFromData(c, 'planetRing', x, y, getColMap(base.owner))
      }
      if (viewMask[id] === 1) {
        // drawPoly(c, simpleShapes['hexVert'], getXYfromHex(tile.hex), ss.hexSize, 1, 'rgba(200,200,200,0.1)', 'rgba(200,200,200,0.1)')
        drawFromData(c, 'hexVert', ...getXYfromHex(tile.hex), () => 'rgba(200,200,200,0.1)')
      }
    }
    drawFromData(c, 'hexVert', ...getXYfromHex(tile.hex), () => 'rgb(37,32,45)')
  }

  for (const [id, tile] of state.tiles) {
    const { x, y } = getXYfromHex(tile.hex)
    if (tile.terrain === 'blackHole' && (viewMask[id] || debug)) {
      drawFromData(c, 'blackHole', x, y, x => x, 1, 0, true)
      //  if (gameSprites[tile.terrain]) { drawFromData(c, gameSprites[tile.terrain], x, y, x => x, 1, 0, true) }
    }
  }

  for (const [id, tile] of state.tiles) {
    if (viewMask[id] || debug) {
      const planet = whichPlanetsTerritory(tile.hex)
      if (planet) drawFromData(c, 'hexVert', ...getXYfromHex(tile.hex), () => getPlayerColour(planet.owner, 0.5))
      if (debug) drawText(c, `${territoryState(tile.hex)}`, getXYfromHex(tile.hex).add(new Vec(-30, -30)), 14)
      if (debug) drawText(c, `${tile.hex.id}`, getXYfromHex(tile.hex).add(new Vec(-40, +40)), 14, 'grey')
    }
  }

  if (screenSettings.showTrails) {
    for (let h = subTurn(); h >= Math.max(subTurn() - state.numPlayers + 1, 0); h--) {
      for (const { type, rand, path } of state.history[h]) {
        const randomOffset = new Vec(((rand * 123432 % 1) - 0.5) * screenSettings.hexSize / 3, ((rand * 1232632 % 1) - 0.5) * screenSettings.hexSize / 3)
        if (type === 'move') {
          for (let i = 0; i < path.length - 1; i++) {
            if (path[i] && path[i + 1] && (debug || viewMask[path[1].id] > 1 || viewMask[path[1].id] > 1)) {
              drawArrow(c, getXYfromHex(path[i]).add(randomOffset), getXYfromHex(path[i + 1]).add(randomOffset), 6, 'rgba(255,255,255,0.3)')
            }
          }
        }
        if (type === 'attack' && (debug || viewMask[path[0].id] > 1 | 5 | viewMask[path[1].id] > 1)) {
          drawArrow(c, getXYfromHex(path[0]), getXYfromHex(path[1]), 2, 'rgba(255,0,0,0.8)')
        }
      }
    }
  }

  for (const ship of state.shipArray) {
    if (viewMask[ship.hex.id] === 2 || debug) {
      let borderColour = 'black'
      if (ship.owner === state.playerTurn && (!ship.moved || !ship.attacked)) { borderColour = 'white' }

      if (gameSprites[ship.type]) {
        const { x, y } = getXYfromHex(ship.hex)
        let transparency = 1
        if (ship.owner === state.playerTurn && (ship.moved && ship.attacked)) { transparency = 0.4 }
        drawFromData(c, ship.type, x, y, getColMap(ship.owner, transparency))
      }

      drawText(c, `${Math.round(ship.shield + ship.hull)}`, getXYfromHex(ship.hex).add(new Vec(-20, 45)), 20, 'white')
      drawText(c, `(${Math.round(ship.hull)})`, getXYfromHex(ship.hex).add(new Vec(10, 45)), 15, 'orange')
      // drawText(c, `${ship.hulltype.actionList}`, getXYfromHex(ship.hex).add(new Vec(-40, 25)), 15, 'gray')
      // drawText(c, `${ship.actionsRemaining}`, getXYfromHex(ship.hex).add(new Vec(-40, 5)), 15, 'white')

      let actionIconColour = 'blue'
      for (const a in ship.hulltype.actionList) {
        if (Number(a) + ship.actionsRemaining.length >= ship.hulltype.actionList.length) actionIconColour = 'white'
        const { x, y } = getXYfromHex(ship.hex)
        drawFromData(c, ship.hulltype.actionList[a], x - 40 + 20 * a, y - 25, () => actionIconColour)
      }
    }
  }

  if (sel.hex) {
    for (const [move, ...hist] of sel.actions.moves) {
      const { x, y } = getXYfromHex(move)
      if (getTerrainDamage(sel.ship, move)[0] > 0 && !getTerrainDamage(sel.ship, move)[1]) {
        drawFromData(c, 'warningIconOrange', x, y)
      } else if (getTerrainDamage(sel.ship, move)[1]) {
        drawFromData(c, 'warningIconGreen', x, y)
      }
      drawFromData(c, 'hexVert', ...getXYfromHex(move), () => 'rgb(166,191,187)', 0.90)
      // drawPoly(c, simpleShapes['hexVert'], getXYfromHex(move), ss.hexSize - 5, 3, 'rgb(166,191,187)')
    } for (const attack of sel.actions.attacks) {
      drawFromData(c, 'hexVert', ...getXYfromHex(attack), () => 'red', 0.90)
      //   drawPoly(c, simpleShapes['hexVert'], getXYfromHex(attack), ss.hexSize - 5, 3, 'red')
    }
    drawFromData(c, 'hexVert', ...getXYfromHex(sel.hex), () => selectedColour[sel.state], 0.90)
    // drawPoly(c, simpleShapes['hexVert'], getXYfromHex(sel.hex), ss.hexSize - 5, 3, selectedColour[sel.state])
  }
}

function drawlog () {
  const log = document.getElementById('log')
  let current = ''
  for (let l = Math.max(state.log.length - 10, 0); l < state.log.length; l++) {
    current = current + '<p>' + state.log[l] + '</p>'
  }
  log.innerHTML = current
}

function drawTopPanel () {
  const ss = screenSettings
  const c = document.getElementById('topPanel').getContext('2d')
  document.getElementById('topPanel').style.borderColor = getPlayerColour(state.playerTurn)
  document.getElementById('topPanel').height = 100 // + 700 * ss.openTechTree;
  c.clearRect(-99999, -99999, 199999, 199999)
  c.strokeStyle = 'white'

  if (sel.menu && sel.menu.length > 0 && !screenSettings.openTechTree) {
    //    console.log(sel.menu);
    const menu = sel.menu
    for (let i = 0; i < menu.length; i++) {
      const details = data.thingList.find(t => t.thing === menu[i])
      //    console.log(details);
      if (details.sprite && details.sprite[0][0]) {
        drawFromData(c, 'roundedHex', 110 + 70 * i, 30, getColMap(state.playerTurn, 1), 0.35)
        drawFromData(c, 'roundedHexOutline', 110 + 70 * i, 30, x => 'rgb(36,34,73)', 0.35)
        details.sprite.forEach(x => {
          drawFromData(c, x[0], 140 + 70 * i + x[1], 60 + x[2], getColMap(state.playerTurn, 1), 0.5 * x[3])
        })
        drawText(c, `${details.price}`, new Vec(125 + 70 * i, 40), 10, 'white')
        drawText(c, `${details.name}`, new Vec(115 + 70 * i, 95), 10, 'white')
      } else if (gameSprites[menu[i]]) {
        drawFromData(c, 'roundedHex', 110 + 70 * i, 30, getColMap(state.playerTurn, 1), 0.35)
        drawFromData(c, menu[i], 140 + 70 * i, 60, getColMap(state.playerTurn, 1), 0.5)
        drawText(c, `${details.price}`, new Vec(125 + 70 * i, 40), 10, 'white')
        drawText(c, `${details.name}`, new Vec(115 + 70 * i, 95), 10, 'white')
      } else (console.log('problem', details))
    }
  }
  c.strokeStyle = getPlayerColour(state.playerTurn)
  drawFromData(c, 'nextTurnButton', 0, 0, getColMap(state.playerTurn, 1), 0.15, 0, true)
  drawFromData(c, 'menuButton', 650, 0, getColMap(state.playerTurn, 1), 0.08, 0, true)
  drawFromData(c, 'techTreeButton', 700, 0, getColMap(state.playerTurn, 1), 0.15, 0, true)
  // c.rect(655, 5, 45, 45);
  c.stroke()

  drawText(c, `Player: ${state.playerTurn}`, new Vec(100, 20), 15, 'white')
  if (state.meta.online && state.playerData[state.playerTurn].type === 'Human') {
    drawText(c, `Handle: ${state.meta.playergrid.find(x => x[0] === state.playerTurn)[1]}`, new Vec(100, 35), 15, 'white')
  }
  drawText(c, `Turn: ${state.turnNumber}`, new Vec(180, 20), 15, 'white')
  if (!preturn) drawText(c, `Money:  ${state.playerData[state.playerTurn].money}  ( ${state.playerData[state.playerTurn].income} )`, new Vec(245, 20), 15, 'white')
  if (!preturn) drawText(c, 'City Points: **', new Vec(360, 20), 15, 'white')
  drawText(c, `Game: ${state.gameName}`, new Vec(420, 40), 15, 'white')
  if (loggedInPlayer) drawText(c, `Logged in Player: ${loggedInPlayer.handle}`, new Vec(420, 60), 15, 'white')
}

function drawMenu () {
  const ss = screenSettings
  const c = document.getElementById('mainMenu').getContext('2d')

  for (const [id, tile] of state.tiles) {
    const { x, y } = getXYfromHex(tile.hex)// .subtract(new Vec(screenSettings.hexSize,screenSettings.hexSize))
    drawFromData(c, 'hexVert', ...getXYfromHex(tile.hex, 45).add(ss.techTreeOffset), () => 'rgba(37,32,45, 0.5)', 0.5)
    // drawPoly(c, simpleShapes['hexVert'], getXYfromHex(tile.hex, 45).add(ss.techTreeOffset), 45, 1, 'rgb(37,32,45)', 'rgb(18,15,34)')
  }

  if (menuData.Screen === 'MainMenu') {
    data.mainMenu.forEach((t) => {
      const center = getXYfromHex(t.hex, 45).add(ss.techTreeOffset)
      const { x, y } = center

      drawFromData(c, 'roundedHex', x - 58, y - 53, x => 'rgb(30,30,30)', 0.65, 0, true)
      drawText(c, `${t.name}`, center.add(new Vec(-30, 25)), 12, 'rgb(159,216,206)')
    })
  }

  if (menuData.Screen === 'loadGameMenu') {
    data.loadGameMenu.forEach((t) => {
      const center = getXYfromHex(t.hex, 45).add(ss.techTreeOffset)
      const { x, y } = center
      drawFromData(c, 'roundedHex', x - 58, y - 53, x => 'rgb(30,30,30)', 0.65, 0, true)

      let valueToOutput = menuData.LoadGameOptions[t.name] || ''
      if (t.num || t.num === 0) {
        const numm = t.num + (menuData.LoadGameOptions.PageSize * (menuData.LoadGameOptions.Page - 1))
        if (cacheGameList[numm]) {
          valueToOutput = cacheGameList[numm][1].name
        }
      }
      //   else valueToOutput = menuData.OfflinePlayers[t.num][t.name]
      // }
      drawText(c, `     ${valueToOutput}`, center.add(new Vec(-40, 5)), 14, 'rgb(159,216,206)')
      drawText(c, `${t.name} ${[t.num] || '1'}`, center.add(new Vec(-30, 25)), 12, 'rgb(159,216,206)')
    })
  }

  if (menuData.Screen === 'NewGame') {
    data.newGameMenu.forEach((t) => {
      const center = getXYfromHex(t.hex, 45).add(ss.techTreeOffset)
      const { x, y } = center
      drawFromData(c, 'roundedHex', x - 58, y - 53, x => 'rgb(30,30,30)', 0.65, 0, true)

      let valueToOutput = menuData.NewGameData[t.name] || ''
      if (t.num || t.num === 0) {
        if (menuData.NewGameData.Online) valueToOutput = menuData.OnlinePlayers[t.num][t.name]
        else valueToOutput = menuData.OfflinePlayers[t.num][t.name]
      }
      drawText(c, `${valueToOutput}`, center.add(new Vec(-30, 5)), 14, 'rgb(159,216,206)')
      drawText(c, `${t.name} ${[t.num] || '1'}`, center.add(new Vec(-30, 25)), 12, 'rgb(159,216,206)')
    })
  }
}

function drawTechTree () {
  const arrows = []
  const ss = screenSettings
  const c = document.getElementById('techTree').getContext('2d')
  data.techs.forEach((t) => {
    if (t.requires) {
      t.requires.forEach(r => {
        arrows.push([t.hex, data.techs.filter(tt => tt.tech === r)[0].hex])
      })
    }
  })

  arrows.forEach(a => {
    drawArrow(c, getXYfromHex(a[1], 35).add(ss.techTreeOffset), getXYfromHex(a[0], 35).add(ss.techTreeOffset))
  })

  data.techs.forEach((t) => {
    const center = getXYfromHex(t.hex, 35).add(ss.techTreeOffset)
    const { x, y } = center
    const draw = t.cost < 99
    // let col = `rgb(${t.colour[0]},${t.colour[1]},${t.colour[2]})`

    if (t.cost > 99) {
      drawFromData(c, 'roundedHex', x - 48, y - 43, x => 'rgb(30,30,30)', 0.55, 0, true)
    } else if (state.playerData[state.playerTurn].tech[t.tech]) {
      drawFromData(c, 'roundedHex', x - 48, y - 43, x => 'rgb(18,15,34)', 0.55, 0, true)
      drawFromData(c, 'roundedHexOutline', x - 48, y - 43, getColMap(state.playerTurn, 1), 0.55, 0, true)
    } else if (t.cost > 99 || (t.requires &&
      t.requires.find(r => !state.playerData[state.playerTurn].tech[r])
    )) {
      drawFromData(c, 'roundedHex', x - 48, y - 43, x => 'rgb(18,15,34)', 0.55, 0, true)
      drawFromData(c, 'roundedHexOutline', x - 48, y - 43, x => 'rgb(36,34,73)', 0.55, 0, true)
    } else { // if (draw){
      drawFromData(c, 'roundedHex', x - 48, y - 43, x => 'rgb(18,15,34)', 0.55, 0, true)
      drawFromData(c, 'roundedHexOutline', x - 48, y - 43, x => 'rgb(159,216,206)', 0.55, 0, true)
    }

    if ((draw || debug) && t.sprite) {
      t.sprite.forEach(s => {
        drawFromData(c, s[0], x + s[1], y + s[2], getColMap(state.playerTurn, 1), 0.55 * s[3])
      })
    }
    if (draw || debug) drawText(c, `${t.name}`, center.add(new Vec(-30, 25)), 12, 'rgb(159,216,206)')
    if (draw || debug) drawText(c, `${t.cost}`, center.add(new Vec(-40, +6)), 12, 'rgb(159,216,206)')
  })
}

// function drawPoly (c, pointVec, center = new Vec(0, 0), scale = 50, width, sColor, fColor) {
//   const { x: xx, y: yy } = center
//   //  if(!isOnScreen(xx,yy)) return;
//   if (width) { c.lineWidth = width }
//   if (sColor) { c.strokeStyle = sColor }
//   if (fColor) { c.fillStyle = fColor }

//   c.lineWidth = 3
//   c.moveTo(pointVec[0].x, pointVec[0].y)
//   c.beginPath()
//   for (const point of pointVec) {
//     const { x, y } = point.scale(scale).add(center)
//     c.lineTo(x, y)
//   }
//   c.closePath()
//   c.stroke()
//   if (fColor) { c.fill() }
//   c.beginPath(); c.closePath() // Hack to stop drawing after clear
// }

function drawArrow (c, start, end, width = 3, color = 'white') {
//  console.log(start,end);
  const midpoint = start.add(end).scale(0.5)
  c.strokeStyle = color // keep col form last func
  c.lineWidth = width
  c.beginPath()
  c.moveTo(start.x, start.y)
  c.lineTo(end.x, end.y)
  c.stroke()
  c.closePath()
}

function drawFromData (c, sprite, xx = 0, yy = 0, colourMap = x => x, scale = 1, rotation = 0) {
  // const scale = scaleFactor * screenSettings.resolutionLevel
  const data = gameSprites[sprite]
  const startTime = new Date()

  const pack2 = (ac, cv, ix, arr) => ix % 2 ? ac.concat([[arr[ix - 1], arr[ix]]]) : ac
  const rotateMath = (x, y, th) => [x * Math.cos(th) + y * Math.sin(th), x * -Math.sin(th) + y * Math.cos(th)]
  const rotate = (a, th) => a.reduce(pack2, []).map((a) => rotateMath(...a, th)).flat()

  const add = (a, x, y, s = 1) => a.map((v, i) => i % 2 ? v * s + y : v * s + x)

  const transform = (a, x, y, t) => add(rotate(add(a, x, y), t), xx, yy, scale)

  let gradient
  let x = 0
  let y = 0
  const th = rotation * 2 * 3.1425

  // c.save();
  // c.shadowColor = "rgba(0, 0, 0, 0.35)";
  // c.shadowOffsetX = 3.0; c.shadowOffsetY = 3.0;
  // c.shadowBlur = 10.0;

  data.forEach(([t, ...v]) => {
    if (t === 'sv') c.save()
    else if (t === 'sc') scale *= v[0]
    else if (t === 'of') {
      x = v[0]; y = v[1]// x = v[0] * scale; y = v[1] * scale
    } else if (t === 'bp') c.beginPath()
    else if (t === 'mt') c.moveTo(...transform(v, x, y, th))
    else if (t === 'lt') c.lineTo(...transform(v, x, y, th))
    else if (t === 'lw') c.lineWidth = v[0]
    else if (t === 'cp') c.closePath()
    else if (t === 'fs') {
      if (v && v[0]) { c.fillStyle = colourMap(v[0]) } else if (gradient) { c.fillStyle = gradient }
    } else if (t === 'ss') { if (v) { c.strokeStyle = colourMap(v[0]) } } else if (t === 'fl') c.fill()
    else if (t === 'ct') c.bezierCurveTo(...transform(v, x, y, th))
    else if (t === 're') c.restore()
    else if (t === 'st') c.stroke()
    else if (t === 'tr') c.transform(...v)
    else if (t === 'xrg') {
      gradient = c.createRadialGradient(...transform([v[0], v[1]], x, y, th), v[2] * scale, ...transform([v[3], v[4]], x, y, th), v[5] * scale)
      // gradient = c.createRadialGradient(v[0] * scale + x + xx, v[1] * scale + y + yy, v[2] * scale, v[3] * scale + x + xx, v[4] * scale + y + yy, v[5] * scale)
    } else if (t === 'xlg') {
      gradient = c.createLinearGradient(...transform(v, x, y, th))
    } else if (t === 'xcs') { gradient.addColorStop(v[0], colourMap(v[1])) }
  })
  c.shadowOffsetX = 0; c.shadowOffsetY = 0; c.shadowBlur = 0.0
  c.restore(); c.beginPath(); c.closePath() // Hack to stop drawing after clear

  //  if(new Date() - startTime >=1) console.log("Draw > 2", getNameFromData(data));

  if (c.data) return c.data
}

function drawText (c, text, center = new Vec(0, 0), size = 28, color = 'blue', font = 'Helvetica') {
  const { x, y } = center
  c.font = `${size}px ${font}`
  c.fillStyle = color
  c.fillText(text, x, y)
  //  c.stroke();
}
