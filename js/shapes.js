
function Points3D (matrix, maxRows, maxCols, nodes, ctx, style) {
  this.ctx = ctx;
  this.boardHeight = maxRows || 1;
  this.boardWidth = maxCols || 1;
  this.w = 45;
  this.h = 50;
  this.side = nodes || 0;
  this.angle = (Math.PI) / 2;
  this.matrix = (matrix.length === this.getBoadDimension() * this.side) ? matrix : Array_1D(1, maxRows * maxCols * this.side);
  this.style = style;
  this.sideLength = this.w/2;
  this.radius = 2;
  this.grid = {'vertices' : [], 'centroid': [], 'sideLength':this.sideLength};
  this.dotArr = [];
  this.stepsVert = [];
}
Points3D.prototype.getMatrix = function () {
  return this.matrix;
}
Points3D.prototype.getGrid = function () {
  return this.grid;
}
Points3D.prototype.setGrid = function (vert, centroid) {
  this.grid.vertices.push(vert);
  this.grid.centroid.push(centroid);
}
Points3D.prototype.getSide = function () {
  return this.side;
}
Points3D.prototype.getBoadDimension = function () {
  return this.boardHeight * this.boardWidth;
}
Points3D.prototype.drawBoard = function () {
  var starsGeometry = new THREE.Geometry();
  this.sh = 20;
  for (let i = 0, cnt = 0; i < this.boardHeight; i++) {
    for (let j = 0; j < this.boardWidth; j++,cnt++) {
      let x = j * this.w + this.w/2 +Math.cos(i*j)*this.sh;
      let y = 100;
      let z = i * this.h + this.h/2 +Math.sin(i*j)*this.sh;
      this.drawPoints (starsGeometry, x, y, z,cnt, j, i);
    }
  }
  var starsMaterial = new THREE.PointsMaterial( { color: "white",visible: true, size: 5 , sizeAttenuation: true} );
  var starField = new THREE.Points( starsGeometry, starsMaterial );
  starField.name = "starField";
  this.ctx.add( starField );
  return  this.stepsVert;
}



Points3D.prototype.drawPoints = function (geom, x, y, z,idx, ci, cj) {
  
  let mx = this.matrix.slice(this.side*idx, (this.side*idx)+this.side);

  var steps = [];
  for (let j = 0; j<this.side; j++){
    var tempSteps = [];
    if(!mx[j]){

      let a = j * this.angle - this.angle;
      let tx = x - Math.cos(ci*cj)*this.sh;
      let tz = z - Math.sin(ci*cj)*this.sh;
      let rx = tx + this.w * Math.cos(a);
      let ry = y;
      let rz = tz + this.h * Math.sin(a);
      let dz = (rz - tz);
      let dx = (rx - tx);
      let kx =  ci + Math.sign(dx);
      let kz =  cj + Math.sign(dz);
      rx = rx + Math.cos(kx*kz)*this.sh;
      rz = rz + Math.sin(kx*kz)*this.sh;

      for (let i = 0; i < 1; i+=0.2) {
        let star = new THREE.Vector3();
        star.x = quadraticBezier (x, x  , rx, i);
        star.y = quadraticBezier (y, y + 0  , y, i);
        star.z = quadraticBezier (z, z , rz, i);
        geom.vertices.push(star);
        
      }
    }
  }
  this.stepsVert.push(new THREE.Vector3(x, y, z));

}






/*
Vehicle
 */
function Vehicle(ctx, start, end,  geom, vert) {
  this.ctx = ctx;
  this.vech;
  this.vert = vert;
  this.p1 = this.vert[start];
  this.x = this.p1.x;
  this.y = this.p1.y;
  this.z = this.p1.z;
  this.w = 45;
  this.h = 50;
  this.pathCoord = []; 
  this.grp =  new THREE.Group();
  this.pointGeom = new THREE.BufferGeometry();
  this.MAX_POINTS = 100000;

  this.pointGeom.addAttribute( 'position', new THREE.BufferAttribute(  new Float32Array( this.MAX_POINTS * 3 ), 3 ) );
  // drawcalls
  this.drawCount = 2; // draw the first 2 points, only
  this.pointGeom.setDrawRange( 0, this.drawCount );
  // material
  this.material = new THREE.PointsMaterial( { color: "#ffc55c" , size:15} );

  // line
  this.point = new THREE.Points( this.pointGeom,  this.material );
   this.point.frustumCulled = false;
  this.ctx.add( this.point );
  //this.line.geometry.attributes.position.needsUpdate = true; 

  this.ctx.add(this.grp);
  this.mark(start, "yellow");
  this.mark(end, "green");
  this.body();

}
Vehicle.prototype.body = function () {
  var starsGeometry = new THREE.Geometry();

  for ( var i = 0; i < 50; i ++ ) {

    var star = new THREE.Vector3();
    star.x = i*Math.cos(i) * 0.10 ;
    star.y =  i*Math.sin(i) * 0.10;
    star.z =0;

    starsGeometry.vertices.push( star )

  }

  var starsMaterial = new THREE.PointsMaterial( { color: "red", size:10 } )

  var starField = new THREE.Points( starsGeometry, starsMaterial );
  starField.name="star";
  starField.position.copy(new THREE.Vector3(this.p1.x,this.p1.y,this.p1.z));
  starField.rotation.x = 45;
  this.vech = starField;
  this.ctx.add( starField );
}

Vehicle.prototype.anim = function() {
  this.vech.rotation.z +=90;
}
Vehicle.prototype.mark = function (idx, color) {
  var s = this.vert[idx];
  var geometry = new THREE.SphereGeometry( 20, 32, 32 );
  var material = new THREE.MeshPhongMaterial( {color: color} );
  var sphere = new THREE.Mesh( geometry, material );
  sphere.position.copy(new THREE.Vector3 (s.x, s.y+10, s.z));
  scene.add( sphere );
  var lights = new THREE.PointLight( "white", 0.5, 0, 2);

  lights.position.copy(new THREE.Vector3 (s.x+600, s.y+100, s.z - 100 ));

  scene.add( lights );
}


Vehicle.prototype.clearShape = function (x, y, fillColor, strokeColor) {
  this.ctx.beginPath();
  this.ctx.arc (x, y, 0.3 + Math.random() , 0, 2 * Math.PI, false);
  this.ctx.fillStyle = fillColor;
  this.ctx.fill();
  this.ctx.globalAlpha = 1;
}

Vehicle.prototype.run = function (path) {
  if (!path.length) {
    var pos = this.point.geometry.attributes.position.array;
    this.drawPath (this.pathCoord.shift(), pos);
    return;
  }
  var self = this;
  let idx = path.shift();  
  let p2 = this.vert[idx]; 
  
 var newx = 0, 
     newy = 0,
     newz =0;
 
  //var angle = vectorAngleTan2(normalizeVector ([this.p1[0] + this.w, this.p1[1] + this.h]), normalizeVector(p2));
  //var angle = vectorAngleTan2( normalizeVector([p2[0] - this.p1[0], p2[1] - this.p1[1]]));


  for (let i = 0; i < 1; i+=0.05) {
    newx = lerp(this.p1.x, p2.x, i),
    newy = lerp(this.p1.y, p2.y, i);
    newz = lerp(this.p1.z, p2.z, i);

    this.pathCoord.push(new THREE.Vector3(newx, newy, newz));

  }
  
  this.p1 = p2;
  this.run(path);
}

Vehicle.prototype.drawPath = function (prev, pos) {
    if (!this.pathCoord.length){
      this.vech.position.copy(new THREE.Vector3(prev.x, prev.y+10, prev.z));

      end();
      return;
    }
    //var line = new THREE.Geometry();
    //line.vertices.push(new THREE.Vector3(prev.x, prev.y, prev.z));
    let self = this;
    let curr = this.pathCoord.shift();
    self.addPoint(self, pos, curr);

    self.point.geometry.setDrawRange( 0, self.drawCount );
    self.updatePoint(self, pos, prev);
    self.vech.position.copy(new THREE.Vector3(prev.x, prev.y+10, prev.z));

    render(function () {

      self.drawPath(curr, pos);
    });
}

Vehicle.prototype.addPoint = function(self, arr, pos) {
    arr[self.drawCount*3+1] = pos.x;
    arr[self.drawCount*3+2] = pos.y;
    arr[self.drawCount*3+3] = pos.z;
    
    self.drawCount = ( self.drawCount + 1 ) % self.MAX_POINTS;

}


Vehicle.prototype.updatePoint = function(self, arr, pos) {
    arr[self.drawCount*3-3] = pos.x;
    arr[self.drawCount*3-2] = pos.y;
    arr[self.drawCount*3-1] = pos.z;
    self.point.geometry.attributes.position.needsUpdate = true;
}
Vehicle.prototype.rotateCenter = function(angle, pt1) {
  var mid = midpoint (pt1, [pt1[0]+ this.w, pt1[1]+ this.h]);
  this.ctx.translate (mid[0], mid[1]);
  this.ctx.rotate(angle);
  this.ctx.translate (-mid[0], -mid[1]);
};

Vehicle.prototype.translate = function(x, y) {
  this.ctx.translate(x,y);
};



