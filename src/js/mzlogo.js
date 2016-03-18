var MZ = function(services){
  "use strict";
  //Private vars
  var module = {};

  var attrs = {
    border:{
      fill: "none",
      stroke: "#000",
      strokeWidth: 1,
      "fill-opacity": 1.0
    },
    invisible:{
      strokeWidth: 1,
      fill: "none",
      stroke: "#000",
      "stroke-opacity": 0.0
    }
  };

  var matrixes ={
    M: new Snap.Matrix(),
    Z: new Snap.Matrix()
  };

  var snap;
  var stepDuration;
  var coords = {};
  var paths = {};

  // Private funtions
  var setCoords = function(){
    coords = {
      triangle: [
        new Coord(1, 0),
        new Coord(module.size.x, 0),
        new Coord(module.size.x / 2.0, module.size.y / 2.0)
      ],
      mirroredTriangle: [
        new Coord(1, module.size.y),
        new Coord(module.size.x, module.size.y),
        new Coord(module.size.x / 2.0, module.size.y / 2.0)
      ],
      externBox: [
        new Coord(1, 0),
        new Coord(module.size.x, 0),
        new Coord(module.size.x, module.size.y),
        new Coord(1, module.size.y)
      ],
      M: [
        new Coord(1, module.size.y),
        new Coord(1, 0),
        new Coord(module.size.x / 2.0, module.size.y / 2.0),
        new Coord(module.size.x, 0),
        new Coord(module.size.x, module.size.y)
      ],
      Z: [
        new Coord(1, 0),
        new Coord(module.size.x, 0),
        new Coord(1, module.size.y),
        new Coord(module.size.x, module.size.y)
      ]
    };
  };

  var setPaths = function(){
    if(coords === undefined){
      throw "Object coordinates undefined.";
    }

    paths = {
      triangle: new Path(coords.triangle, true),
      mirroredTriangle: new Path(coords.mirroredTriangle, true),
      externBox: new Path(coords.externBox, true),
      M: new Path(coords.M, false),
      Z: new Path(coords.Z, false)
    };

    paths.triangleCopy = paths.triangle.copy();
  };

  var applyInitialStateInSnap = function(){
    paths.triangle.apply(snap).attr(attrs.border);
    paths.triangleCopy.apply(snap).attr(attrs.border);
    paths.externBox.apply(snap).attr(attrs.invisible);
    paths.M.apply(snap).attr(attrs.invisible);
    paths.Z.apply(snap).attr(attrs.invisible);
  };

  var createMZ = function(){
    paths.MBox = new Path(coords.externBox, true);

    paths.MBox.apply(snap).attr(attrs.border);
    paths.mirroredTriangle.apply(snap).attr(attrs.border);

    var MGroup = snap.group(paths.triangle.path.clone(),
                              paths.mirroredTriangle.path, paths.MBox.path);
    var ZGroup = MGroup.clone();

    var showMZ = function(){
      paths.M.path.animate({'stroke-opacity': 1, strokeWidth: 5}, stepDuration,
                            mina.easeinout);
      paths.Z.path.animate({'stroke-opacity': 1, strokeWidth: 5}, stepDuration,
                            mina.easeinout);
      MGroup.animate({'stroke-opacity': 0}, stepDuration, mina.easeinout);
      ZGroup.animate({'stroke-opacity': 0}, stepDuration, mina.easeinout);
    };

    var moveGroupsToFinalDestinationAndShowMZ = function(){
      paths.M.path.animate({transform: matrixes.M}, stepDuration,
                            mina.easeinout);
      paths.Z.path.animate({transform: matrixes.Z}, stepDuration,
                            mina.easeinout);
      MGroup.animate({transform: matrixes.M}, stepDuration, mina.easeinout);
      ZGroup.animate({transform: matrixes.Z}, stepDuration, mina.easeinout);
      setTimeout(showMZ , stepDuration);
    };

    setTimeout(moveGroupsToFinalDestinationAndShowMZ, stepDuration);
  };

  //Public methods
  module.startAnimation = function(){
    if(this.size === undefined){
      throw "The MZ was not initialized.";
    }
    paths.triangleCopy.animateCoords(coords.mirroredTriangle, stepDuration);
    paths.externBox.path.animate({'stroke-opacity':1, }, stepDuration,
                                  mina.easeinout);
    applyInitialStateInSnap();
    setTimeout(createMZ, stepDuration);
  };

  module.init = function(div, width, height, duration){
    snap = Snap(div);
    stepDuration = duration;

    this.size = new Coord();
    this.size.x = width;
    this.size.y = height;

    matrixes.M.scale(0.2, 0.2, module.size.x / 2.0, module.size.y);
    matrixes.M.translate(0, -module.size.y * 3.5);

    matrixes.Z.scale(0.2, 0.2, module.size.x / 2.0, module.size.y);
    matrixes.Z.translate(0, -module.size.y * 0.5);

    setCoords();
    setPaths();
    applyInitialStateInSnap();
  };

  return module;
};
/*
 * Define um elemento de coordenada bidimensional.
 * @param {int} x Abscissas
 * @param {int} y Ordenadas
 */
var Coord = function(x, y){
  this.x = x;
  this.y = y;
};

/* 
 * Gera um elemento path a partir das coordenadas passadas 
 * @param {list of Coord} coords Lista de coordenadas dos pontos
 */
var Path = function(coords, closed){
  if(coords === null){
    return;
  }
  this.coords = coords;
  this.closed = closed;
  this.svgPathString = this.strigifyCoords(coords);
};

/*
 * Gera uma string coma descrição de um path no formado definido
 * pela especificações do svg
 * @param {list of Coord} coords Lista de coordenadas
 */
Path.prototype.strigifyCoords = function(coords){
  var svgPathString = 'M';
  var finalPathChar = this.closed ? 'z': '';
  for(var index in coords){ 
    svgPathString += coords[index].x + ',' + coords[index].y;
    //If is the last line make a close path
    svgPathString += index == coords.length - 1 ? finalPathChar : 'L';
  }
  return svgPathString;
};

/*
 * Aplica o path à um elemento Snap
 * @param {Snap element} snap Elemento Snap no qual o path será aplicado
 */
Path.prototype.apply = function(snap){
  this.path = snap.path(this.svgPathString);
  return this.path;
};

/*
 * Cria uma cópia do path
 * @return {Path element} Copy of
 */
Path.prototype.copy = function(){
  var copy = new Path();
  copy.svgPathString = this.svgPathString;
  copy.coords = this.coords;
  copy.closed = this.closed;
  return copy;
};

/*
 * Anima o path para as novas coordenadas passadas
 * @param {list of Coords} coords Lista com as novas coordenadas
 * @param {float} time Duração da animação em microssegundos
 */
Path.prototype.animateCoords = function(coords, time){
  var newPathString = this.strigifyCoords(coords);
  this.path.animate({path:newPathString}, time, mina.easeinout);
};

exports.MZ = MZ;
