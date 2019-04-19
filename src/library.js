"use strict";

/* eslint-disable no-unused-vars */

function json(a) { return JSON.stringify(a); }

class Vec {
  constructor (x = 0, y = 0){    this.x = x;    this.y = y;  }

  add(b){    return new Vec (this.x + b.x, this.y + b.y)  }
  addXY(x, y){return new Vec (this.x + x, this.y + y)}
  subtract(b){return new Vec (this.x - b.x, this.y - b.y)  }
  scale(m) { return new Vec(this.x * m, this.y * m) }
  dot(b){    return this.x * b.x + this.y * b.y; }
  invert(){  return this.scale(-1)}
  get mag () {return Math.sqrt( (this.x*this.x) + (this.y*this.y))}

  static getArray(input, Vecs){
    let [xx, yy, ...rest] = input;
    if (xx === null || yy === null){return Vecs}
    else {  return Vec.getArray(rest,Vecs.concat(new Vec(xx,yy))) }
  }
}

class Hex{
  constructor(p=0,q=p,r=-p-q){ this.p=p; this.q=q; this.r=r; }

  add(b){return new Hex(this.p+b.p, this.q+b.q, this.r+b.r)}
  subtract(b){return new Hex(this.p-b.p, this.q-b.q, this.r-b.r)}
  compare(b){return this.p===b.p && this.q===b.q && this.r===b.r}
  distance(b){return (Math.abs(this.p - b.p) + Math.abs(this.q - b.q) + Math.abs(this.r - b.r)) / 2}

  within(n){
    if (n===0){return []}
    else if (n===1){return this.neighbours}
    else if (n===2){return this.secondNeighboursInclusive}
    else if (n===3){return this.thirdNeighboursInclusive}
    else if (Math.abs(n) === n){Hex.findWithin(n).map(n => n.add(this))}
    else {return []}
  }

  get mag(){return (Math.abs(this.p) + Math.abs(this.q) + Math.abs(this.r)) / 2}
  get id () {return  `${this.p},${this.q}`}

  get neighbours() {return Hex.neighbours().map(n => n.add(this))}
  get secondNeighbours() {return Hex.secondNeighbours().map(n => n.add(this))}
  get thirdNeighbours() {return Hex.thirdNeighbours().map(n => n.add(this))}

  get randomNeighbour(){return this.neighbours[randomInt(6)]}

  get secondNeighboursInclusive() {return this.neighbours.concat(this.secondNeighbours)}
  get thirdNeighboursInclusive() {return this.secondNeighboursInclusive.concat(this.thirdNeighbours)}

  static getFromPQR(obj){
    if(obj.p + obj.q + obj.r !== 0)console.log("problem getFromPQR");
    return new Hex(obj.p, obj.q)
  }

  static getFromID(id){
    let coords = id.split(",").map(x=>parseInt(x));
    return new Hex(...coords)
  }

  static getArray(input, Hexes){
    let [pp, qq, rr, ...rest] = input;
    if (pp === null || qq === null || rr === null){return Hexes}
    else {  return Hex.getArray(rest,Hexes.concat(new Hex(pp,qq,rr))) }
  }

  static findWithin(n){
    let list = []
    for(let i = -n; i<=n; i++){
      for(let j = Math.max(-n, -n-i); j <=Math.min(n, n-i); j++){
        list.push(new Hex(i, j, -i-j));
      }
    }
    return list;
  }

  static arrayToID(l){
    let [a,b] = l;
    return `${a},${b}`
  }

  static getRandomPicker(n){
    let list = []
    for(let i = -n; i<=n; i++){
      list.push ([i, Math.max(-n, -n-i), Math.min(n, n-i) - Math.max(-n, -n-i) + 1])
    }
    let total = list.reduce((a,c)=>a+c[2],0);
    return (r)=>Hex.getNfromWeightedList(Math.floor(r*(total)), list)
  }

  static getNfromWeightedList(n, list){
    let left = n;
    let [head, ...tail] = list;
    if (left < head[2]){
      return [head[0], head[1] + left]
    }
    return Hex.getNfromWeightedList(n - head[2], tail);
  }

  static neighbours() {return [new Hex(1,0), new Hex(0,-1), new Hex(-1,0), new Hex(-1,1), new Hex(0,1), new Hex(1,-1)]}

  static secondNeighbours () { return [
    new Hex(2,0), new Hex(2,-2), new Hex(2,-1), new Hex(-2,0), new Hex(-2,2), new Hex(-2,1),
    new Hex(1,-2), new Hex(1,1), new Hex(-1,2), new Hex(-1,-1), new Hex(0,2), new Hex(0,-2)
  ]}

  static secondNeighboursDependants () { return {
    "2,0":[new Hex(1,0)], "2,-2":[new Hex(1,-1)],  "-2,0":[new Hex(-1,0)],
    "-2,2":[new Hex(-1,1)],  "0,2":[new Hex(0,1)], "0,-2":[new Hex(0,-1)],
    "2,-1":[new Hex(1,-1), new Hex(1,0)], "-2,1":[new Hex(-1,-1), new Hex(-1,0)],
    "1,-2":[new Hex(0,-1), new Hex(1,-1)],"-1,2":[new Hex(0,1), new Hex(-1,1)],
    "1,1":[new Hex(0,1), new Hex(1,0)], "-1,-1":[new Hex(0,-1), new Hex(-1,0)],
  }}

  static getDependants(x,y){
    let things = Hex.secondNeighboursDependants()[x.subtract(y).id].map(n => n.add(y))
    return things;
  }

  static thirdNeighbours () { return [
    new Hex(3,-3), new Hex(3,-2), new Hex(3,-1), new Hex(3,0),
    new Hex(-3,3), new Hex(-3,2), new Hex(-3,1), new Hex(-3,0),
    new Hex(2,1), new Hex(-2,-1), new Hex(-2,3), new Hex(2,-3),
    new Hex(1,-3), new Hex(1,2), new Hex(-1,3), new Hex(-1,-2),
    new Hex(0,3), new Hex(0,-3)
  ]}

  static getXYfromUnitHex(hexCoord){
    const hexVec = {p: new Vec(1,0),   q: new Vec((-1/2), Math.sqrt(3)/2),  r: new Vec((-1/2), -Math.sqrt(3)/2) }
    return hexVec.p.scale(hexCoord.p).add(hexVec.q.scale(hexCoord.q))
      .add(hexVec.r.scale(hexCoord.r))
  }

  static getUnitHexFromXY(xy){
    const {p, q, r} = {p: new Vec(2/(3),0),   q: new Vec((-2/6), Math.sqrt(3)/3),  r: new Vec((-2/6), -Math.sqrt(3)/3) }
    //let {p, q, r} = invHexVec;
    return Hex.hex_round(new Hex(xy.dot(p), xy.dot(q),xy.dot(r)))
  }

  static hex_round(h){
    let qi = Math.round(h.q);
    let ri = Math.round(h.r);
    let pi = Math.round(h.p);
    let q_diff = Math.abs(qi - h.q);
    let r_diff = Math.abs(ri - h.r);
    let p_diff = Math.abs(pi - h.p);
    if (q_diff > r_diff && q_diff > p_diff)    {           qi = -ri - pi;    }
    else  if (r_diff > p_diff)                 {           ri = -qi - pi;        }
    else                                       {           pi = -qi - ri;        }
    return new Hex(pi, qi, ri);
  }
}

function randomInt(num) {return Math.floor(Math.random() * num);}

var clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (var i in this) {
    if (this[i] && typeof this[i] === "object") {
      newObj[i] = this[i].clone();
    }
    else
    {
      newObj[i] = this[i];
    }
  }
  return newObj;
};

Object.defineProperty( Object.prototype, "clone", {value: clone, enumerable: false});
