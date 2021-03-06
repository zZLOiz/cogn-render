var FlatMouse = function() {
    this.camera = vec3.create();
    this.delta = vec2.create();
    this.current = vec2.create();
    this.prev = vec2.create();
    this.koef = vec2.create();
    this.scene = null;
    
    this.mouseMoveEvent = 0;
    this.mouseDownEvent = 0;
    this.mouseUpEvent = 0;
    this.mouseWheelEvent = 0;
}

FlatMouse.prototype.attach = function(scene) {
    this.scene = scene;
    this.scene.getCameraPosition(this.camera);
    
    this.mouseDownEvent = this.scene.onMouseDown.add(this.mouseDownHandler.bind(this));
    this.mouseUpEvent = this.scene.onMouseUp.add(this.mouseUpHandler.bind(this));
    this.mouseWheelEvent = this.scene.onMouseWheel.add(this.mouseWheelHandler.bind(this));
}

FlatMouse.prototype.detach = function(scene) {
    this.scene.onMouseDown.remove(this.mouseDownEvent);
    this.scene.onMouseUp.remove(this.mouseUpEvent);
    this.scene.onMouseMove.remove(this.mouseMoveEvent);
    this.scene.onMouseWheel.remove(this.mouseWheelEvent);

    this.mouseUpEvent = 0;
    this.mouseDownEvent = 0;
    this.mouseMoveEvent = 0;
    this.mouseWheelEvent = 0;
}

FlatMouse.prototype.mouseMoveHandler = function(e) {
    var zoom = this.scene.getCameraZoom(),
        canvas = this.scene.context.canvas;
    
    this.scene.getCameraPosition(this.camera);
    vec2.set(this.current, e.realX, e.realY);
    vec2.subtract(this.delta, this.current, this.prev);
    vec3.copy(this.prev, this.current);
    vec2.set(this.koef, canvas.width, canvas.height);

    this.camera[0] += this.delta[0] * this.koef[0] * zoom;
    this.camera[1] -= this.delta[1] * this.koef[1] * zoom;
    this.scene.setCameraPosition(this.camera);
    
    this.scene.draw();
}

FlatMouse.prototype.mouseWheelHandler = function(e) {
    var zoom = this.scene.getCameraZoom(),
        prevZoom = zoom,
        canvas = this.scene.context.canvas;
    
    this.scene.getCameraPosition(this.camera);
    vec2.set(this.koef, canvas.width, canvas.height);

    zoom *= 1.0 + (e.wheelDelta > 0 ? -1 : 1) * 0.1;
    if (zoom <= 0.01) { zoom = 0.01; }
    if (zoom >= 100) { zoom = 100; }
    this.camera[0] += (zoom - prevZoom) * (e.realX - 0.5) * this.koef[0]
    this.camera[1] -= (zoom - prevZoom) * (e.realY - 0.5) * this.koef[1];
    this.scene.setCameraPosition(this.camera);
    this.scene.setCameraZoom(zoom);
    
    this.scene.draw();
}

FlatMouse.prototype.mouseDownHandler = function(e) {
    if (this.mouseMoveEvent !== 0) {
        return;
    }

    this.mouseMoveEvent = this.scene.onMouseMove.add(this.mouseMoveHandler.bind(this));
    vec3.set(this.current, e.realX, e.realY);
    vec3.copy(this.prev, this.current);
}

FlatMouse.prototype.mouseUpHandler = function(e) {
    this.scene.onMouseMove.remove(this.mouseMoveEvent);
    this.mouseMoveEvent = 0;
}

module.exports = FlatMouse;
