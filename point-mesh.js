PointMesh = function() {
    this.thickness = 3;
    this.antialias = 2;

    this.length = 0;
    this.pointsOrig = [];
    this.pointsTrans = [];
    this.radius = [];
    
    this.data = {
        vertexes: null,
        angles: null,
        positions: null
    };

    this.buffers = {
        a_vertex: null,
        a_angle: null,
        a_position: null
    };

    this.shader = Shader.fromURL("point.vert", "point.frag");
}

PointMesh.prototype.addPoint = function(x, y, z, r)
{
    var p = vec3.create();
    vec3.set(p, x, y, z);

    this.length += 1;
    this.pointsOrig.push(p);
    this.pointsTrans.push(vec3.create());
    this.radius.push(r);
}

PointMesh.prototype.transform = function(mat)
{
    var i;

    for (i = 0; i < this.length; ++i) {
        vec3.transformMat4(this.pointsTrans[i], this.pointsOrig[i], mat);
    }

    this.upload();    
}

PointMesh.prototype.upload = function() {
    var i, j, right, top, radius, point;

    vertex = 6 * this.length;
    
    if (this.data.vertex == null || (this.data.vertex.length !== 3 * vertex)) {
        this.data.vertex = new Float32Array(3 * vertex);
        this.buffers.a_vertex = new GL.Buffer(gl.ARRAY_BUFFER, this.data.vertex, 3, gl.DYNAMIC_DRAW);
    }

    if (this.data.angles == null || (this.data.angles.length !== vertex)) {
        this.data.angles = new Float32Array(vertex);
        this.buffers.a_angle = new GL.Buffer(gl.ARRAY_BUFFER, this.data.angles, 1, gl.DYNAMIC_DRAW);
    }

    if (this.data.positions == null || (this.data.positions.length !== 2 * vertex)) {
        this.data.positions = new Float32Array(2 * vertex);
        this.buffers.a_position = new GL.Buffer(gl.ARRAY_BUFFER, this.data.positions, 2, gl.DYNAMIC_DRAW);
    }

    for (i = 0; i < this.length; ++i) {
        for (j = 0; j < 6; ++j) {
            top = j == 2 || j == 4 || j == 5;
            right = j == 1 || j == 2 || j == 4;
            
            point = this.pointsTrans[i];
            this.data.vertex[6*3*i + 3*j + 0] = point[0];
            this.data.vertex[6*3*i + 3*j + 1] = point[1];
            this.data.vertex[6*3*i + 3*j + 2] = point[2];

            this.data.angles[6*i + j] = Math.PI * (top ? 1.0 : -1.0) * (right ? 1.0 : 3.0) / 4;

            radius = this.radius[i];
            this.data.positions[6*2*i + 2*j + 0] = right ? radius : -radius;
            this.data.positions[6*2*i + 2*j + 1] = top ? -radius : radius;
        }
    }

    this.buffers.a_vertex.upload();
    this.buffers.a_angle.upload();
    this.buffers.a_position.upload();
}

PointMesh.prototype.draw = function(gl) {
    this.shader.uniforms({
        u_thickness: this.thickness,
        u_antialias: this.antialias,
        u_aspect: viewPortAspect
    }).drawBuffers(this.buffers, null, gl.TRIANGLES);
}