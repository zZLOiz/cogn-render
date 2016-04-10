PointMesh = function(options) {
    this.constructor.prototype.constructor();

    options = options || {};

    this.borderColor = colorToArray(options.color || "#000000");
    this.thickness = options.thickness || 1;
    this.antialias = options.antialias || 2;

    this.length = 0;
    this.points = [];
    this.colors = [];
    this.radius = [];
    this.ids = [];
    
    this.data = {
        vertexes: null,
        angles: null,
        positions: null,
        colors: null,
        ids: null
    };

    this.buffers = {
        a_vertex: null,
        a_angle: null,
        a_position: null,
        a_color: null,
        a_id: null
    };

    this.shader = Shader.fromURL("point.vert", "point.frag");
}

PointMesh.prototype = Object.create(BaseMesh.prototype);

PointMesh.prototype.addPoint = function(value, options)
{
    options = options || {};
    
    this.length += 1;
    this.points.push(vec3.clone(value));
    this.radius.push(options.radius || 1.0);
    this.colors.push(colorToArray(options.color || "#ffffff"));
    this.ids.push(idToColor(options.id || 0));

    return this;
}

PointMesh.prototype.upload = function() {
    var i, j, right, top, radius, point, color, id;

    vertex = 6 * this.length;
    
    if (this.data.vertexes == null || (this.data.vertexes.length !== 3 * vertex)) {
        this.data.vertexes = new Float32Array(3 * vertex);
        this.buffers.a_vertex = new GL.Buffer(gl.ARRAY_BUFFER, this.data.vertexes, 3, gl.DYNAMIC_DRAW);
    }

    if (this.data.angles == null || (this.data.angles.length !== vertex)) {
        this.data.angles = new Float32Array(vertex);
        this.buffers.a_angle = new GL.Buffer(gl.ARRAY_BUFFER, this.data.angles, 1, gl.DYNAMIC_DRAW);
    }

    if (this.data.positions == null || (this.data.positions.length !== 2 * vertex)) {
        this.data.positions = new Float32Array(2 * vertex);
        this.buffers.a_position = new GL.Buffer(gl.ARRAY_BUFFER, this.data.positions, 2, gl.DYNAMIC_DRAW);
    }

    if (this.data.colors == null || (this.data.colors.length !== 4 * vertex)) {
        this.data.colors = new Float32Array(4 * vertex);
        this.buffers.a_color = new GL.Buffer(gl.ARRAY_BUFFER, this.data.colors, 4, gl.DYNAMIC_DRAW);
    }

    if (this.data.ids == null || (this.data.ids.length !== 4 * vertex)) {
        this.data.ids = new Float32Array(4 * vertex);
        this.buffers.a_id = new GL.Buffer(gl.ARRAY_BUFFER, this.data.ids, 4, gl.DYNAMIC_DRAW);
    }

    for (i = 0; i < this.length; ++i) {
        for (j = 0; j < 6; ++j) {
            top = j == 2 || j == 4 || j == 5;
            right = j == 1 || j == 2 || j == 4;
            
            point = this.points[i];
            this.data.vertexes[6*3*i + 3*j + 0] = point[0];
            this.data.vertexes[6*3*i + 3*j + 1] = point[1];
            this.data.vertexes[6*3*i + 3*j + 2] = point[2];

            this.data.angles[6*i + j] = Math.PI * (top ? 1.0 : -1.0) * (right ? 1.0 : 3.0) / 4;

            radius = this.radius[i];
            this.data.positions[6*2*i + 2*j + 0] = right ? radius : -radius;
            this.data.positions[6*2*i + 2*j + 1] = top ? -radius : radius;

            color = this.colors[i];
            this.data.colors[6*4*i + 4*j + 0] = color[0];
            this.data.colors[6*4*i + 4*j + 1] = color[1];
            this.data.colors[6*4*i + 4*j + 2] = color[2];
            this.data.colors[6*4*i + 4*j + 3] = color[3];

            id = this.ids[i];
            this.data.ids[6*4*i + 4*j + 0] = id[0];
            this.data.ids[6*4*i + 4*j + 1] = id[1];
            this.data.ids[6*4*i + 4*j + 2] = id[2];
            this.data.ids[6*4*i + 4*j + 3] = id[3];
        }
    }

    this.buffers.a_vertex.upload();
    this.buffers.a_angle.upload();
    this.buffers.a_position.upload();
    this.buffers.a_color.upload();
    this.buffers.a_id.upload();
}

PointMesh.prototype.draw = function(step) {
    this.shader.uniforms({
        u_mvp: this.mvp,
        u_aspect: this.scene.cameraAspect,
        u_far: this.scene.far,
        u_depth: 0,
        
        u_step: step,
        u_thickness: this.thickness,
        u_antialias: this.antialias
    }).drawBuffers(this.buffers, null, gl.TRIANGLES);
}
