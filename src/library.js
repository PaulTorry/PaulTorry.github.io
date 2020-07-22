'use strict'

/* eslint-disable no-unused-vars, object-property-newline */

function json (a) { return JSON.stringify(a) }

class Vec {
  constructor (x = 0, y = 0) { this.x = x; this.y = y }

  * [Symbol.iterator] () {
    yield this.x
    yield this.y
  }

  add (b) { return new Vec(this.x + b.x, this.y + b.y) }
  addXY (x, y) { return new Vec(this.x + x, this.y + y) }
  subtract (b) { return new Vec(this.x - b.x, this.y - b.y) }
  scaleByVec (a) { return new Vec(this.x * a.x, this.y * a.y) }
  scaleXY (x, y) { return new Vec(this.x * x, this.y * y) }
  scale (m) { return new Vec(this.x * m, this.y * m) }
 
  dot (b) { return this.x * b.x + this.y * b.y }
  invert () { return this.scale(-1) }
  distance ( a ) {
   // console.log(this.subtract(a),this.subtract(a).mag )
    return this.subtract(a).mag
  }
  bounds (b1, b2 = b1.invert()) {
    const x2 = Math.min(b2.x, b1.x), x1 = Math.max(b2.x, b1.x); 
    const y2 = Math.min(b2.y, b1.y), y1 = Math.max(b2.y, b1.y); 
    const x = Math.max(x2, Math.min(x1, this.x))
    const y = Math.max(y2, Math.min(y1, this.y))
    // const x = Math.max(b2.x, Math.min(b1.x, this.x))
    // const y = Math.max(b2.y, Math.min(b1.y, this.y))
    //console.log(b1,b2,x2,x1,y2,y1,x,y);
    return new Vec(x, y)
  }
  
  get mag () { return Math.sqrt((this.x * this.x) + (this.y * this.y)) }

  static fromID (id) {
    const vals = id.split(',')

    return new Vec(...(id.split(',')).map(parseFloat))
  }

  static fromIdArray (idArray) {
    return idArray.map(Vec.fromID)
  }

  static zero = new Vec(0, 0) 
  static unit = new Vec(1, 1) 
  // static getArray (input, Vecs) {
  //   const [xx, yy, ...rest] = input
  //   if (xx === null || yy === null) { return Vecs } else { return Vec.getArray(rest, Vecs.concat(new Vec(xx, yy))) }
  // }
}

class Hex {
  constructor (p = 0, q = p, r = -p - q) { this.p = p; this.q = q; this.r = r }

  add (b) { return new Hex(this.p + b.p, this.q + b.q, this.r + b.r) }
  subtract (b) { return new Hex(this.p - b.p, this.q - b.q, this.r - b.r) }
  compare (b) { return this.p === b.p && this.q === b.q && this.r === b.r }
  distance (b) { return (Math.abs(this.p - b.p) + Math.abs(this.q - b.q) + Math.abs(this.r - b.r)) / 2 }

  within (n) {
    if (n === 0) { return [] } else if (n === 1) { return this.neighbours } else if (n === 2) { return this.secondNeighboursInclusive } else if (n === 3) { return this.thirdNeighboursInclusive } else if (Math.abs(n) === n) { Hex.findWithin(n).map(n => n.add(this)) } else { return [] }
  }

  spikyNeightbours (spikes) {
    if (spikes) return this.neighbours.concat(this.neighboursSpiky)
    else return this.neighbours.concat()
  }

  get mag () { return (Math.abs(this.p) + Math.abs(this.q) + Math.abs(this.r)) / 2 }
  get id () { return `${this.p},${this.q}` }

  get neighbours () { return Hex.neighbours().map(n => n.add(this)) }
  get neighboursSpiky () { return Hex.neighboursSpiky().map(n => n.add(this)) }
  get secondNeighbours () { return Hex.secondNeighbours().map(n => n.add(this)) }
  get thirdNeighbours () { return Hex.thirdNeighbours().map(n => n.add(this)) }

  get randomNeighbour () { return this.neighbours[randomInt(6)] }

  get secondNeighboursInclusive () { return this.neighbours.concat(this.secondNeighbours) }
  get thirdNeighboursInclusive () { return this.secondNeighboursInclusive.concat(this.thirdNeighbours) }

  static getFromPQR (obj) {
    if (obj.p + obj.q + obj.r !== 0)console.log('problem getFromPQR')
    return new Hex(obj.p, obj.q)
  }

  static getFromID (id) {
    const coords = id.split(',').map(x => parseInt(x))
    return new Hex(...coords)
  }

  static fromIdArray (idArray) {
    return idArray.map(Vec.getFromID)
  }

  static nToHex(n, breadth, pointy = false){
    const k = Math.floor(n / breadth)
    const j = n % breadth - Math.floor(k/2)
    if (pointy){ return new Hex(j, k) }
    else { return new Hex(k, j) }
  }

  static hexToN(hex, breadth, pointy = false){
    const {p, q} = hex
    const rsToN = (r, s) => {
       return r + Math.floor(s / 2) + s * breadth
    }
    if (pointy){ return rsToN(hex.p, hex.q) }
    else { return rsToN(hex.q, hex.p) }
  }


  // static getArray (input, Hexes) {
  //   const [pp, qq, rr, ...rest] = input
  //   if (pp === null || qq === null || rr === null) { return Hexes } else { return Hex.getArray(rest, Hexes.concat(new Hex(pp, qq, rr))) }
  // }

  static findWithin (n) {
    const list = []
    for (let i = -n; i <= n; i++) {
      for (let j = Math.max(-n, -n - i); j <= Math.min(n, n - i); j++) {
        list.push(new Hex(i, j, -i - j))
      }
    }
    return list
  }

  static arrayToID (l) {
    const [a, b] = l
    return `${a},${b}`
  }

  static getRandomPicker (n) {
    const list = []
    for (let i = -n; i <= n; i++) {
      list.push([i, Math.max(-n, -n - i), Math.min(n, n - i) - Math.max(-n, -n - i) + 1])
    }
    const total = list.reduce((a, c) => a + c[2], 0)
    return (r) => Hex.getNfromWeightedList(Math.floor(r * (total)), list)
  }

  static getNfromWeightedList (n, list) {
    const left = n
    const [head, ...tail] = list
    if (left < head[2]) {
      return [head[0], head[1] + left]
    }
    return Hex.getNfromWeightedList(n - head[2], tail)
  }

  // static neighbours () { return [new Hex(1, 0), new Hex(0, -1), new Hex(-1, 0), new Hex(-1, 1), new Hex(0, 1), new Hex(1, -1)] }
  static neighbours () { return [new Hex(0, 1), new Hex(-1, 1), new Hex(-1, 0), new Hex(0, -1), new Hex(1, -1), new Hex(1, 0)] }

  static neighboursSpiky () { return [new Hex(2, 0), new Hex(0, -2), new Hex(-2, 0), new Hex(-2, 2), new Hex(0, 2), new Hex(2, -2)] }

  static secondNeighbours () {
    return [
      new Hex(2, 0), new Hex(2, -2), new Hex(2, -1), new Hex(-2, 0), new Hex(-2, 2), new Hex(-2, 1),
      new Hex(1, -2), new Hex(1, 1), new Hex(-1, 2), new Hex(-1, -1), new Hex(0, 2), new Hex(0, -2)
    ]
  }

  static secondNeighboursDependants () {  
    return {
      '2,0': [new Hex(1, 0)], '2,-2': [new Hex(1, -1)], '-2,0': [new Hex(-1, 0)],
      '-2,2': [new Hex(-1, 1)], '0,2': [new Hex(0, 1)], '0,-2': [new Hex(0, -1)],
      '2,-1': [new Hex(1, -1), new Hex(1, 0)], '-2,1': [new Hex(-1, -1), new Hex(-1, 0)],
      '1,-2': [new Hex(0, -1), new Hex(1, -1)], '-1,2': [new Hex(0, 1), new Hex(-1, 1)],
      '1,1': [new Hex(0, 1), new Hex(1, 0)], '-1,-1': [new Hex(0, -1), new Hex(-1, 0)]
    }
  }

  static getDependants (x, y) {
    const things = Hex.secondNeighboursDependants()[x.subtract(y).id].map(n => n.add(y))
    return things
  }

  static thirdNeighbours () {
    return [
      new Hex(3, -3), new Hex(3, -2), new Hex(3, -1), new Hex(3, 0),
      new Hex(-3, 3), new Hex(-3, 2), new Hex(-3, 1), new Hex(-3, 0),
      new Hex(2, 1), new Hex(-2, -1), new Hex(-2, 3), new Hex(2, -3),
      new Hex(1, -3), new Hex(1, 2), new Hex(-1, 3), new Hex(-1, -2),
      new Hex(0, 3), new Hex(0, -3)
    ]
  }

  static getXYfromUnitHex (hexCoord, pointy = false) {
    const hexVecF = { p: new Vec(1, 0), q: new Vec((-1 / 2), Math.sqrt(3) / 2), r: new Vec((-1 / 2), -Math.sqrt(3) / 2) }
    const hexVecP = { p: new Vec(Math.sqrt(3) / 2, (-1 / 2)), q: new Vec(0, 1), r: new Vec( -Math.sqrt(3) / 2, ( -1 / 2)) }
    const hexVec = pointy ? hexVecP : hexVecF 
    return hexVec.p.scale(hexCoord.p).add(hexVec.q.scale(hexCoord.q)).add(hexVec.r.scale(hexCoord.r))
  }

  static getUnitHexFromXY (xy, pointy = false) {
    const hexVecF = { p: new Vec(2 / (3), 0), q: new Vec((-2 / 6), Math.sqrt(3) / 3), r: new Vec((-2 / 6), -Math.sqrt(3) / 3) }
    const hexVecP = { p: new Vec(Math.sqrt(3) / 3, (-2 / 6)), q: new Vec(0, 2 /(3)), r: new Vec( -Math.sqrt(3) / 3, ( -2 / 6)) }
    const { p, q, r } = pointy ?  hexVecP : hexVecF
    return Hex.hexRound(new Hex(xy.dot(p), xy.dot(q), xy.dot(r)))
  }

  static hexRound (h) {
    let qi = Math.round(h.q)
    let ri = Math.round(h.r)
    let pi = Math.round(h.p)
    const qd = Math.abs(qi - h.q)
    const rd = Math.abs(ri - h.r)
    const pd = Math.abs(pi - h.p)
    if (qd > rd && qd > pd) { qi = -ri - pi } else if (rd > pd) { ri = -qi - pi } else { pi = -qi - ri }
    return new Hex(pi, qi, ri)
  }
}

function randomInt (num) { return Math.floor(Math.random() * num) }

var clone = function () {
  var newObj = (this instanceof Array) ? [] : {}
  for (var i in this) {
    if (this[i] && typeof this[i] === 'object') {
      newObj[i] = this[i].clone()
    } else {
      newObj[i] = this[i]
    }
  }
  return newObj
}

function cloneFunc (ob) {
  var newObj = (ob instanceof Array) ? [] : {}
  for (var i in ob) {
    if (ob[i] && typeof ob[i] === 'object') {
      newObj[i] = ob[i].clone()
    } else {
      newObj[i] = ob[i]
    }
  }
  return newObj
}

Object.defineProperty(Object.prototype, 'clone', { value: clone, enumerable: false })

const PaulsMath = {
  lowestArrayIndex: function (a, b) {
    if (a === -1 && b === -1) return 0
    else if (a === -1) return b
    else if (b === -1) return a
    else return (Math.min(a, b))
  }
}



// for (let i = 0; i <= 40; i++) {
//   console.log(Hex.nToHex(i, 7, true).id)
//   console.log(Hex.hexToN(Hex.nToHex(i, 7, true), 7, true))
// }