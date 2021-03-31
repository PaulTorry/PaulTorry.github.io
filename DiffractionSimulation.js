/* global
Vec, requestAnimationFrame, arrayFuncs, Ray, Grating
*/
const colours = (i, o = 1) => {
  const colourArray = [[73, 137, 171], [73, 171, 135], [73, 171, 96], [135, 171, 73], [171, 166, 73], [171, 146, 73]]
  const col = 'rgba(' + colourArray[i][0] + ',' + colourArray[i][1] + ',' + colourArray[i][2] + ',' + o + ')'
  return col
}
const getSinFill = (a, b) => [[a, b - a, 'blue', (a) => Math.max(a, 0)], [a, b - a, 'red', (a) => Math.min(a, 0)]]
const canvas = document.querySelector('#screen') // ('canvas')
const cx = canvas.getContext('2d')
const fx = document.querySelector('#forground').getContext('2d')
const bx = document.querySelector('#background').getContext('2d')
const animate = { run: false, notPaused: true }

const sliders = {
  wave: { s: document.getElementById('wavelengthSlide'), t: document.getElementById('wavelengthText') },
  slits: { s: document.getElementById('slitsSlide'), t: document.getElementById('slitsText') },
  slitSeparation: { s: document.getElementById('slitSeparationSlide'), t: document.getElementById('slitSeparationText') },
  slitWidth: { s: document.getElementById('slitWidthSlide'), t: document.getElementById('slitWidthText') }
}
const buttons = {
  record: document.getElementById('rec')
}

const pos = { topViewXY: new Vec(1200, 600), grating: { x: 300, dx: 5 }, screen: { x: 900, dx: 4 }, phaseDiagram: new Vec(1000, 700) }
let slit = new Grating(5, 10, 80, pos.screen.x - pos.grating.x)
const wave = { length: 2, phase: 0, amplitude: 20 }

const intensity = Array(4).fill(0).map(c => Array(pos.topViewXY.y).fill(0))

let screenDisplacement = pos.topViewXY.y / 2 + 1
let blocks = makeBlocks()
let ray = new Ray(slit, screenDisplacement - pos.topViewXY.y / 2, pos.screen.x - pos.grating.x, wave)

const sliderHandlers = {
  wave: (e, v = sliders.wave.s.valueAsNumber) => {
    if (v !== wave.length) { sliders.wave.t.textContent = v; wave.length = v; update(true) }
  },
  slits: (e, v = sliders.slits.s.valueAsNumber) => {
    if (v !== slit.number) { sliders.slits.t.textContent = v; slit = slit.update(v); update(true) }
  },
  slitSeparation: (e, v = sliders.slitSeparation.s.valueAsNumber) => {
    if (v !== slit.separation) { sliders.slitSeparation.t.textContent = v; slit = slit.update(undefined, undefined, v); update(true) }
  },
  slitWidth: (e, v = sliders.slitWidth.s.valueAsNumber) => {
    if (v !== slit.width) { sliders.slitWidth.t.textContent = v; slit = slit.update(undefined, v); update(true) }
  }
}

function addEventListeners () {
  let mouseCoords

  function dragEvent (a, b) {
    const d = b.subtract(a)
    if (d.x * d.x > 16 * d.y * d.y || a.x < pos.grating.x || a.x > pos.screen.x || a.y > pos.topViewXY.y) {
      wave.phase += (d.x) * 0.5 / wave.length
    } else if (16 * d.x * d.x < d.y * d.y) {
      screenDisplacement += d.y
      if (animate.run) {
        wave.phase = 0
      } else {
        if (wave.phase > 6) { addIntensity(screenDisplacement) }
      }
    }
    update()
  }
  buttons.record.addEventListener('click', (e) => {
    recordIntensites()
  })
  sliders.wave.s.addEventListener('input', sliderHandlers.wave)
  sliders.slits.s.addEventListener('input', sliderHandlers.slits)
  sliders.slitSeparation.s.addEventListener('input', sliderHandlers.slitSeparation)
  sliders.slitWidth.s.addEventListener('input', sliderHandlers.slitWidth)
  canvas.addEventListener('mousedown', function (e) { mouseCoords = new Vec(e.offsetX, e.offsetY); animate.notPaused = false })
  canvas.addEventListener('mouseup', function (e) { mouseCoords = undefined; animate.notPaused = true })
  canvas.addEventListener('dblclick', function (e) { animate.run = !animate.run })
  canvas.addEventListener('mousemove', (e) => {
    if (mouseCoords) {
      const b = new Vec(e.offsetX, e.offsetY)
      dragEvent(mouseCoords, b)
      mouseCoords = b
    }
  })
}

function makeBlocks ({ centres: c, firstSlit: f } = slit, w = slit.width, vSize = pos.topViewXY.y) {
  const blocks = [0].concat(c.map((v) => v + f - w / 2)).concat(c.map((v) => v + f + w / 2)).concat([vSize]).sort((a, b) => a - b)
  return blocks.reduce((ac, cv, i, ar) => i % 2 ? ac.concat([[ar[i - 1], ar[i]]]) : ac, [])
}

function addIntensity (screenD = screenDisplacement) {
  for (let i = screenD - 4; i <= screenD + 4; i++) {
    if (i > 0 && i < pos.topViewXY.y) {
      const thisRay = ray.getRay(i - pos.topViewXY.y / 2)
      intensity[0][i] = thisRay.resultant.mag
      intensity[1][i] = thisRay.singleSlitModulation
      intensity[2][i] = thisRay.resultant.mag * thisRay.singleSlitModulation
    }
  }
}

function recordIntensites () {
  console.log('intensity recorded')
  intensity[3] = intensity[2].map(a => a)
  update()
}

function drawScreen () {
  cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height)
  cx.drawImage(bx.canvas, 0, 0)
  cx.drawImage(fx.canvas, 0, 0)
}

function drawBackground (c = bx) {
  c.clearRect(0, 0, c.canvas.width, c.canvas.height)
  c.fillStyle = 'lightgrey'
  c.strokeStyle = 'black'
  c.strokeRect(0, 0, c.canvas.width, c.canvas.height)
  c.strokeRect(0, 0, ...pos.topViewXY)
  c.strokeRect(pos.screen.x, 0, pos.screen.dx, pos.topViewXY.y)
  blocks.forEach(([y1, y2], i, a) => {
    c.fillRect(pos.grating.x - pos.grating.dx, y1, pos.grating.dx * 2, y2 - y1)
  })

  drawTrace(c, intensity[0], pos.screen.x, 0, 'rgba(255, 0, 0, 0.4)', 0, 1, -wave.amplitude, 0)
  drawTrace(c, intensity[1], pos.screen.x, 0, 'rgba(0, 255, 0, 0.4)', 0, 1, -wave.amplitude, 0)
  drawTrace(c, intensity[2], pos.screen.x, 0, 'black', 0, 1, -wave.amplitude, 0)
  drawTrace(c, intensity[3], pos.screen.x - 100, 0, undefined, 0, 1, -wave.amplitude, 0)
}

function drawForground (c = fx, sd = slit, geo = ray.geo) {
  c.clearRect(0, 0, c.canvas.width, c.canvas.height)

  // line from center of slits to screen
  drawLine(c, pos.grating.x, pos.topViewXY.y / 2, geo.D, geo.d)

  // waves arriving at grating
  newSin(c, wave, pos.grating.x, sd.firstSlit, [-pos.grating.x, pos.grating.x])

  // waves, phasors at slit and at path difference
  let arrowStart = new Vec(0, 0)

  ray.zipped.forEach(({ e: [top, bot], ep: [ph1, ph2], integral, posPonB: [p1, p2] }, i, a) => {
    const slitTop = new Vec(pos.grating.x, top + sd.firstSlit)
    const slitBottom = new Vec(pos.grating.x, bot + sd.firstSlit)

    // sincurves at angles
    newSin(c, wave, ...slitTop, [0, geo.l / 2], 0, 1, geo.theta, colours(i, 0.4))
    newSin(c, wave, ...slitBottom, [0, geo.l / 2], 0, 1, geo.theta, colours(i), getSinFill(-top * geo.sin, -bot * geo.sin))

    // phasor at grating
    drawLine(c, ...slitTop, ...Vec.unitY.scale(wave.amplitude))

    // on angled sin curve
    drawLine(c, ...slitTop.add(p1), ...ph1.scale(wave.amplitude))
    drawLine(c, ...slitBottom.add(p2), ...ph2.scale(wave.amplitude))
    // vector at bottom
    drawLine(c, ...pos.phaseDiagram.addXY(-100, i * 40 - slit.number * 20 + 20), ...integral.scale(wave.amplitude), colours(i))
    // vector added to sum
    drawLine(c, ...arrowStart.add(pos.phaseDiagram), ...integral.scale(wave.amplitude), colours(i))
    arrowStart = arrowStart.add(integral.scale(wave.amplitude))

    // const integralPh = ph.integrateTo(ph2).scale(5 / (slit.width * geo.sin))
    drawLine(c, ...pos.phaseDiagram.addXY(-100, i * 40 - slit.number * 20 + 20), ...integral.scale(wave.amplitude), colours(i))

    // const lengthOfIntegral = Math.sin((bot - top) * 0.5 * (geo.sin / wave.length)) * 10 / (slit.width * geo.sin)
    // const lengthOfIntegral2 = ray.singleSlitModulation

    // console.log(ph, ray.edgePhasors[i][0])
    // drawLine(c, ...pos.phaseDiagram.addXY(-120, i * 40 - slit.number * 20 + 20), ...integral.normalise.scale(wave.amplitude).scale(lengthOfIntegral), colours(i))
    // drawLine(c, ...pos.phaseDiagram.addXY(-140, i * 40 - slit.number * 20 + 20), ...integral.normalise.scale(wave.amplitude).scale(lengthOfIntegral2), colours(i))
  })

  // bottom wave with areas
  // const fills = sd.centres.map((yy, i, a) => [yy * geo.sin, 3, colours(i)])

  const fills = sd.edges.map(([yy, yyy], i, a) => [-yy * geo.sin, -yyy * geo.sin + yy * geo.sin, colours(i)])

  //newSin(c, wave, 100, pos.topViewXY.y + 300, [0, 600], pos.grating.x, 1, 0, 'black', fills)
  newSin(c, wave, 300, 700, [-150, 700], 0, 4, 0, 'black', fills)
  drawLine(c, 300, 600, 0, 200, 'black')

  const finalPhasor = ray.resultant.scale(wave.amplitude * ray.singleSlitModulation)
  drawLine(c, ...pos.phaseDiagram.addXY(100, 0), ...finalPhasor, 'black')

  // Resultant sin wave and phasor at right
  const newWave2 = { amplitude: wave.amplitude * ray.resultant.mag * ray.singleSlitModulation, length: wave.length, phase: ray.resultant.phase - Math.PI / 2 }
  newSin(c, newWave2, pos.screen.x, screenDisplacement, [0, wave.phase * wave.length], 0, 1, 0, 'black')
  drawLine(c, pos.screen.x, screenDisplacement, ...finalPhasor, 'black')
}

function newSin (c, w = wave, startX, startY, [start, length] = [0, 200], pd = 0, scale = 1, deflectionAngle = 0, colour = 'black', fill = [[0, 0, 'black']], trigFunc = Math.cos) {
  const dispAtX = (x, rectFunc = (a) => a) => rectFunc(w.amplitude * trigFunc(((x + pd)) / (w.length) - w.phase))
  const pageVec = (x, y) => new Vec(x, y).rotate(deflectionAngle).scale(scale).addXY(startX, startY)
  const plot = (x, dx, rectFunc) => {
    c.beginPath()
    c.moveTo(...pageVec(x, 0))
    for (let dl = x; dl <= x + dx; dl += 1 / scale) {
      c.lineTo(...pageVec(dl, dispAtX(dl, rectFunc)))
    }
    c.lineTo(...pageVec(x + dx, 0))
  }
  c.strokeStyle = colour
  plot(start / scale, length / scale)
  c.stroke()

  if (fill) {
    for (const [x, dx, col, func] of fill) {
      c.fillStyle = col
      plot(x, dx, func)
      c.stroke()
      c.fill()
    }
  }
}

function drawLine (c, x1, y1, dx, dy, color) {
  if (color) { c.strokeStyle = color }
  c.beginPath()
  c.moveTo(x1, y1)
  c.lineTo(x1 + dx, y1 + dy)
  c.stroke()
  c.fill()
  c.beginPath()
}

function drawTrace (cx, array, startX = 0, startY = 0, colour = 'rgba(0, 0, 0, 0.4)', dx = 0, dy = 1, vx = 1, vy = 0) {
  cx.beginPath()
  cx.moveTo(startX, startY)
  cx.strokeStyle = colour
  array.forEach((v, i, a) => {
    if (v * a[i - 1] === 0) {
      cx.moveTo(startX + dx * i + vx * v, startY + dy * i + vy * v)
    } else { cx.lineTo(startX + dx * i + vx * v, startY + dy * i + vy * v) }
  })
  cx.stroke()
}

function update () {
  updateVars()
  updateScreen()
}

function updateVars () {
  ray = new Ray(slit, screenDisplacement - pos.topViewXY.y / 2, pos.screen.x - pos.grating.x, wave)
  blocks = makeBlocks()
}

function updateScreen () {
  drawBackground()
  drawForground()
  drawScreen()
}

addEventListeners()

function animateIt (time, lastTime) {
  if (lastTime != null & animate.run & animate.notPaused) {
    const prePhase = ray.resultant.phase
    wave.phase += (time - lastTime) * 0.003
    updateVars()
    if (prePhase > 0 && ray.resultant.phase < 0) {
      addIntensity()
    }
    updateScreen()
  }
  requestAnimationFrame(newTime => {
    return animateIt(newTime, time)
  })
}
requestAnimationFrame(animateIt)

update()
