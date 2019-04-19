"use strict"

/* global Hex, Vec,       */
/* eslint-disable no-unused-vars */

const data = {

  techs : [
    //centre
    {name:'Antimatter Extraction', tech:'titanTech', colour:[50,47,73], requires:['battleshipTech', 'missileDestroyerTech', 'defShieldTech'], hex:new Hex(0,0), cost:10, sprite:[['titanShip',0,-10,1]] },
    //1st ring, clockwise from top
    {name:'Planet Defence Shield', tech:'defShieldTech', colour:[50,47,73], requires:['armouredDestroyerTech'], hex:new Hex(0,-2), cost:8, sprite:[['planet',0,-10,0.70],['planetRing',0,-10,0.70],['planetDefShield',2,-10,0.80]] },
    {name:'Gas Refinery', tech:'missileDestroyerTech', colour:[50,47,73], requires:['harvestGasGiant'], hex:new Hex(2,-2), cost:8, sprite:[['missileDestroyer',0,-10,1.3]] },
    {name:'Devourer', tech:'devourerTech', colour:[51,49,50], requires:['dismantle'], hex:new Hex(2,0), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Ore Refinery', tech:'battleshipTech', colour:[50,47,73], requires:['asteroidMining'], hex:new Hex(0,2), cost:8, sprite:[['battleship',0,-10,1]] },
    {name:'Space Stations', tech:'spaceStationTech', colour:[51,49,50], requires:['navBeacon'], hex:new Hex(-2,2), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Nebula Destroyer', tech:'nebulaDestroyerTech', colour:[51,49,50], requires:['nebulaFrigateTech'], hex:new Hex(-2,0), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    //2nd ring, clockwise from top
    {name:'Universities', tech:'universities', colour:[51,49,50], requires:['navigation', 'sewerTech'], hex:new Hex(1,-4), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Gas Extraction', tech:'harvestGasGiant', colour:[50,47,73], requires:['missileFrigateTech'], hex:new Hex(3,-4), cost:6, sprite:[['gasGiant',0,-10,0.9],['harvestGasGiant',0,-10,0.9]] },
    {name:'Planetary Missile Defence', tech:'planetMissileDefTech', colour:[51,49,50], requires:['guidedMissilesTech'], hex:new Hex(4,-3), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Dismantle Units', tech:'dismantle', colour:[51,49,50], requires:['mediShipTech'], hex:new Hex(4,-1), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Advanced Field Repair', tech:'regeneration', colour:[51,49,50], requires:['factoryTech'],  hex:new Hex(3,1), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Asteroid Mining', tech:'asteroidMining', colour:[50,47,73], requires:['fastFrigateTech'], hex:new Hex(1,3), cost:6, sprite:[['asteroids',2,-12,0.75],['asteroidMining',2,-12,0.75]] },
    {name:'Asteroid Navigation', tech:'navAsteroid', colour:[50,47,73], requires:['asteroidMove', 'navBeacon'], hex:new Hex(-1,4), cost:6, sprite:[['asteroids',2,-12,0.75],['navBeaconCross',-17,-30,1]] },
    {name:'Navigation Beacons', tech:'navBeacon', colour:[50,47,73], requires:['scoutShipTech'], hex:new Hex(-3,4), cost:6, sprite:[['navBeaconCross',-17,-30,1]] },
    {name:'Nebula Navigation', tech:'navNebula', colour:[50,47,73], requires:['nebulaResearchPostTech', 'navBeacon'], hex:new Hex(-4,3), cost:6, sprite:[['nebula',1,-11,0.75],['navBeaconCross',-17,-30,1]]  },
    {name:'Nebula Frigate', tech:'nebulaFrigateTech', colour:[51,49,50], requires:['nebulaVision'], hex:new Hex(-4,1), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Harvest Protostar', tech:'harvestProtostar', colour:[50,47,73], requires:['harvestHydrogen'], hex:new Hex(-3,-1), cost:6, sprite:[['protostar',1,-10,0.75],['harvestProtostar',0,-11,0.75]] },
    {name:'Radiation Shield', tech:'armouredDestroyerTech', colour:[50,47,73], requires:['asteroidIceMining'], hex:new Hex(-1,-3), cost:6, sprite:[['armouredDestroyer',0,-10,1]] },
    //3rd ring, clockwise from top
    {name:'Black Hole Navigation', tech:'navigation', colour:[51,49,50], requires:['asteroidIceMining'], hex:new Hex(1,-6), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Sewer Systems', tech:'sewerTech', colour:[51,49,50], requires:['missileFrigateTech'], hex:new Hex(3,-6), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Missile Frigate', tech:'missileFrigateTech', colour:[50,47,73], hex:new Hex(5,-6), cost:4, sprite:[['missileFrigate',0,-10,1]] },
    {name:'Guided Missiles', tech:'guidedMissilesTech', colour:[51,49,50], requires:['missileFrigateTech', 'controlEnemyShip'], hex:new Hex(6,-5), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Assimilation', tech:'controlEnemyShip', colour:[51,49,50], requires:['mediShipTech'], hex:new Hex(6,-3), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Nano Bots', tech:'mediShipTech', colour:[51,49,50], hex:new Hex(6,-1), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Advanced Manufacturing', tech:'factoryTech', colour:[51,49,50], requires:['mediShipTech'], hex:new Hex(5,1), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Recycling', tech:'recyclingTech', colour:[51,49,50], requires:['asteroidMining'], hex:new Hex(3,3), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Fast Frigate', tech:'fastFrigateTech', colour:[50,47,73], hex:new Hex(1,5), cost:4, sprite:[['fastFrigate',0,-10,1]] },
    {name:'Asteroid Movement', tech:'asteroidMove', colour:[50,47,73], requires:['fastFrigateTech'], hex:new Hex(-1,6), cost:4, sprite:[['asteroids',2,-12,0.75],['arrowIcon',-20,-20,1]] },
    {name:'Hydroponics', tech:'hydroponicsTech', colour:[51,49,50], requires:['navBeacon'], hex:new Hex(-3,6), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Scouting', tech:'scoutShipTech', colour:[50,47,73], hex:new Hex(-5,6), cost:4, sprite:[['scoutShip',0,-10,1]] },
    {name:'Spy Ships', tech:'spyShipTech', colour:[51,49,50], requires:['scoutShipTech'], hex:new Hex(-6,5), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Nebula Research Post', tech:'nebulaResearchPostTech', colour:[50,47,73], requires:['nebulaVision'], hex:new Hex(-6,3), cost:4, sprite:[['nebula',1,-11,0.75],['defenceIcon',-10,-22,1]] },
    {name:'Advanced Sensors', tech:'nebulaVision', colour:[50,47,73], hex:new Hex(-6,1), cost:4, sprite:[['nebula',1,-11,0.75],['eyeIcon',-16,-22,0.85]] },
    {name:'Harvest Hydrogen', tech:'harvestHydrogen', colour:[50,47,73], requires:['nebulaVision'], hex:new Hex(-5,-1), cost:4, sprite:[['nebula',1,-11,0.75],['hydrogen',0,-10,1]] },
    {name:'Electro-Magnetic Pulse', tech:'EMPshipTech', colour:[51,49,50], requires:['asteroidIceMining'], hex:new Hex(-3,-3), cost:99999, sprite:[['padlockIcon',-12,-15,1]] },
    {name:'Asteroid Ice Mining', tech:'asteroidIceMining', colour:[50,47,73], hex:new Hex(-1,-5), cost:4, sprite:[['icyAsteroids',2,-12,0.75]] }
  ],


  shipHulls : {
    scoutShip:{type:'scoutShip',  hull:2, shield:3, maxMove:4, attack:2, retaliate:0, range:1, defence:0, view:2},
    basicFrigate:{type:'basicFrigate',  hull:3, shield:7, maxMove:1, attack:6, retaliate:4, range:1, defence:2, view:1},
    battleship:{type:'battleship',  hull:5, shield:10, maxMove:1, attack:8, retaliate:6, range:1, defence:2, view:1},
    armouredDestroyer:{type:'armouredDestroyer',  hull:5, shield:10, maxMove:1, attack:2, retaliate:10, range:1, defence:3, view:1},
    titanShip:{type:'titanShip',  hull:15, shield:25, maxMove:1, attack:10, retaliate:10, range:1, defence:3, view:1},
    fastFrigate:{type:'fastFrigate',  hull:3, shield:7, maxMove:2, attack:6, retaliate:2, range:1, defence:1, view:1},
    //devourer:{type:'devourer',  hull:5, shield:10, maxMove:3, attack:10, retaliate:1, range:1, defence:1, view:1},
    missileFrigate:{type:'missileFrigate',  hull:3, shield:7, maxMove:1, attack:6, retaliate:4, range:2, defence:1, view:1},
    missileDestroyer:{type:'missileDestroyer',  hull:2, shield:3, maxMove:1, attack:10, retaliate:0, range:3, defence:0, view:1},
  },

  thingList : [

    {name: 'Nav. Beacon', thing: 'navBeacon', type:"nav", price: 2, territoryState: 1,  shipState: 'ownPresent', tech: 'navBeacon',  terrain: ['space', ], sprite:[['navBeaconCross',-15,-18,1]] } ,
    {name: 'Nav. Beacon', thing: 'navAsteroid', type:"nav", price: 2, territoryState: 1,  shipState: 'ownPresent', tech: 'navAsteroid',  terrain: ['asteroids', ], sprite:[['asteroids',0,-2,0.75],['navBeaconCross',-15,-18,1]] } ,
    {name: 'Nav. Beacon', thing: 'navNebula',  type:"nav", price: 2, territoryState: 1,  shipState: 'ownPresent', tech: 'navNebula',  terrain: [ 'nebula', ], sprite:[['nebula',1,-2,0.75],['navBeaconCross',-15,-18,1]] } ,


    {name: 'Ast. Mining', thing: 'asteroidMining', type:"industry", price: 2, income: 2, territoryState: 2,  shipState: 'noEnemy', tech: 'asteroidMining',  terrain: ['asteroids', ], sprite:[['asteroids',0,-2,0.75],['asteroidMining',0,-2,0.75]] } ,
    {name: 'Gas Extraction', thing: 'harvestGasGiant', type:"industry", price: 2, income: 2, territoryState: 2,  shipState: 'noEnemy', tech: 'harvestGasGiant',  terrain: ['gasGiant', ], sprite:[['gasGiant',0,0,1],['harvestGasGiant',0,0,1]] } ,
    {name: 'Harvest Protostar', thing: 'harvestProtostar', type:"industry", price: 2, income: 2, territoryState: 2,  shipState: 'noEnemy', tech: 'harvestProtostar',  terrain: ['protostar', ], sprite:[['protostar',1,-1,0.75],['harvestProtostar',1,-1,0.75]] } ,
    {name: 'Solar Panel', thing: 'solarSail', type:"industry", price: 2, income: 1, territoryState: 2,  shipState: 'noEnemy',  terrain: ['space', ], nextTo:"star" , sprite:[['solarSail',0,0,1]]} ,



    {name: 'Ice Collection', thing: 'icyAsteroids', type:"resource", price: -2, territoryState: 2,  shipState: 'noEnemy', tech: 'asteroidIceMining',  terrain: ['asteroids', ] , resource:"icyAsteroids", sprite:[['icyAsteroids',0,-2,0.75]] } ,
    {name: 'Hydrogen. Collection', thing: 'hydrogen', type:"resource", price: -2, territoryState: 2,  shipState: 'noEnemy', tech: 'harvestHydrogen',  terrain: ['nebula', ] , resource:"hydrogen", sprite:[['nebula',1,-2,0.75],['hydrogen',0,0,1]] } ,


    {name: 'Conquer Planet', thing: 'inhabitedPlanet', price: 0,   shipState: 'ownPresent',   terrain: ['planet', ], sprite:[['planet',0,0,0.75],['planetRing',0,0,0.75]] } ,

    {name: ' Scout Ship', thing: 'scoutShip', type:"ship", price: 2, territoryState: 2, inhabitedPlanet: true, shipState: 'noShip', tech: 'scoutShipTech',  terrain: [], sprite:[['scoutShip',0,0,1]] } ,
    {name: 'Basic Frigate', thing: 'basicFrigate', type:"ship", price: 2, territoryState: 2, inhabitedPlanet: true, shipState: 'noShip',   terrain: [], sprite:[['basicFrigate',0,0,1]] } ,
    {name: 'Fast Frigate', thing: 'fastFrigate', type:"ship", price: 3, territoryState: 2, inhabitedPlanet: true, shipState: 'noShip',  tech: 'fastFrigateTech', terrain: [], sprite:[['fastFrigate',0,0,1]] } ,
    {name: '  Battleship', thing: 'battleship', type:"ship", price: 5, territoryState: 2, inhabitedPlanet: true, shipState: 'noShip', tech: 'battleshipTech',  terrain: [], sprite:[['battleship',0,0,1]] } ,
    {name: ' Arm. Dest.', thing: 'armouredDestroyer', type:"ship",  price: 3, territoryState: 2, inhabitedPlanet: true, shipState: 'noShip', tech: 'armouredDestroyerTech',  terrain: [], sprite:[['scoutShip',0,0,1]] } ,
    //{name: 'Devourer', thing: 'devourer', type:"ship", price: 8, territoryState: 2, inhabitedPlanet: true, shipState: 'noShip',  tech: 'devourerTech', terrain: [], sprite:[['devourer',0,0,1]] } ,
    {name: ' Missile Frig.', thing: 'missileFrigate', type:"ship", price: 3, territoryState: 2, inhabitedPlanet: true, shipState: 'noShip', tech: 'missileFrigateTech',  terrain: [], sprite:[['missileFrigate',0,0,1]] } ,
    {name: 'Missile Dest.', thing: 'missileDestroyer', type:"ship", price: 8, territoryState: 2, inhabitedPlanet: true, shipState: 'noShip', tech: 'missileDestroyerTech',  terrain: [], sprite:[['missileDestroyer',0,0,1.3]] } ,
    {name: '     Titan', thing: 'titanShip', type:"ship", price: 30, territoryState: 2, inhabitedPlanet: true, shipState: 'noShip',  tech: 'titanTech', terrain: [], sprite:[['titanShip',0,0,1]] } ,



  //  {thing: 'solar sails', price: 2, territoryState: 2,  shipState: 'noEnemy',   terrain: ['adjacent to star', ] } ,
  ],

  terrainInfo : {

    space: { moveCost:1,},
    asteroids: { moveCost:4, hullDamage:1, damTech:'asteroidMove', defenceTech:'asteroidMining',},
    nebula: { moveCost:2, viewTech:'nebulaVision', defenceTech:'nebulaResearchPostTech',},
    gasGiant: { moveCost:1, moveTech:'gasGiantMove',},
    planet: { moveCost:1, defenceTech:'defShieldTech',},
    protostar: { moveCost:5,},
    star: { moveCost:5, moveTech:'none'},
    blackHole: { moveCost:5, moveTech:'none', damTech:'none',},
  },
}

const navBeaconCost = 0.25;

let debug = false;

let screenSettings = {
  openTechTree : false,
  screenSize : 800,
  screenCenter : new Vec(400,400),
  screenOffset : new Vec(0,0),
  techTreeOffset : new Vec(400,400),
  hexSize : 75,
  scale : 1,
  showTrails:true,
}
