/* eslint-disable no-unused-vars */
/* global Vec */

class Grating {
  constructor (number = 2, width = 1, separation = 2, vSize = 100) {
    this.vSize = vSize
    this.number = number; this.width = width; this.separation = separation
    this.firstSlit = vSize / 2 - ((number - 1) / 2) * (separation) - width / 2
    this.centres = Array(Number.parseInt(number)).fill().map((_, i) => i * (separation) + width / 2)
    this.edges = this.centres.map((v) => [v - width / 2, v + width / 2])
  }

  update (n = this.number, w = this.width, s = this.separation, vSize = this.vSize) {
    return new Grating(n, w, s, vSize)
  }
}

class Ray {
  constructor (grating = new Grating(), d = 1, D = 100, wave = { length: 2, phase: 0, amplitude: 20 }) {
    this.grating = grating; this.wave = wave
    this.length = grating.number
    this.geo = Ray.getGeometry(d, D)
    this.centerPhasors = grating.centres.map(c => Vec.fromCircularCoords(1, -wave.phase + c * this.geo.sin / wave.length))
    this.edgePhasors = grating.edges.map(c => c.map(cc => Vec.fromCircularCoords(1, -wave.phase + cc * this.geo.sin / wave.length)))
    this.posOfPhasor = this.grating.edges.map(c => c.map(cc => Vec.unitX.rotate(this.geo.theta).scale(-cc * this.geo.sin)))
    this.phasorAtGrating = this.edgePhasors[0][0]
    this.integrals = this.edgePhasors.map(c => c[0].integrateTo(c[1]).scale(5 / (grating.width * this.geo.sin)))
    this.lengthOfIntegral = Math.sin((grating.edges[0][1] - grating.edges[0][0]) * 0.5 * (this.geo.sin / wave.length)) * 10 / (grating.width * this.geo.sin)
    this.resultant = grating.centres.reduce((p, c) => p.add(Vec.fromCircularCoords(1, -wave.phase + c * this.geo.sin / wave.length)), new Vec(0, 0))
    this.singleSlitModulation = wave.length * Math.abs(Math.sin((grating.width) * 0.5 * (this.geo.sin / wave.length)) * 4 / (grating.width * this.geo.sin))
    this.zipped = Array(this.length).fill().map((c, i, a) => {
      return { e: this.grating.edges[i], ep: this.edgePhasors[i], integral: this.integrals[i], posPonB: this.posOfPhasor[i] }
    })
  }

  getDataForSlit (i = 0) {
    return { sin: this.geo.sin, edges: this.grating.edges[i], ePh: this.edgePhasors[i], res: this.resultant }
  }

  print (i = 0) { console.log(this.geo.sin, this.grating.edges[i], this.edgePhasors[i], this.resultant) }

  getRay (d = 1) {
    return new Ray(this.grating, d, this.geo.D, this.wave)
  }

  static getGeometry (d, D) {
    const theta = Math.atan(-d / D)
    const l = Math.sqrt(D * D + d * d)
    const sin = d / l
    const cos = D / l
    const tan = d / D
    return { d, D, theta, l, sin, cos, tan }
  }
}
