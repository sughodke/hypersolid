var DEFAULT_VIEWPORT_WIDTH = 480; // Width of canvas in pixels
var DEFAULT_VIEWPORT_HEIGHT = 480; // Height of canvas in pixels
var DEFAULT_VIEWPORT_SCALE = 2; // Maximum distance from origin (in math units) that will be displayed on the canvas
var DEFAULT_VIEWPORT_FONT = 'italic 10px sans-serif';
var DEFAULT_VIEWPORT_FONT_COLOR = '#000';
var DEFAULT_VIEWPORT_LINE_WIDTH = 4;
var DEFAULT_VIEWPORT_LINE_JOIN = 'round';
var DEFAULT_CHECKBOX_VALUES = {
    perspective: { checked: true },
    indices: { checked: false },
    edges: { checked: true }
};
var Viewport = /** @class */ (function () {
    function Viewport(shape, canvas, document, options) {
        this.shape = shape;
        this.canvas = canvas;
        this.document = document;
        this.options = options;
        this.clicked = false;
        options = options || {};
        this.scale = options.scale || DEFAULT_VIEWPORT_SCALE;
        canvas.width = options.width || DEFAULT_VIEWPORT_WIDTH;
        canvas.height = options.height || DEFAULT_VIEWPORT_HEIGHT;
        this.bound = Math.min(canvas.width, canvas.height) / 2;
        var context = canvas.getContext('2d');
        context.font = options.font || DEFAULT_VIEWPORT_FONT;
        context.textBaseline = 'top';
        context.fillStyle = options.fontColor || DEFAULT_VIEWPORT_FONT_COLOR;
        context.lineWidth = options.lineWidth || DEFAULT_VIEWPORT_LINE_WIDTH;
        context.lineJoin = options.lineJoin || DEFAULT_VIEWPORT_LINE_JOIN;
        this.context = context;
        this.checkboxes = options.checkboxes || DEFAULT_CHECKBOX_VALUES;
        this.canvas.addEventListener('mousedown', this.mousedown.bind(this));
        this.document.addEventListener('mousemove', this.mousemove.bind(this));
        this.document.addEventListener('mouseup', this.mouseup.bind(this));
        this.checkboxes.addEventListener('change', this.change.bind(this));
    }
    Viewport.prototype.draw = function () {
        var _this = this;
        // blank the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // track what has changed
        var adjusted = {};
        this.shape.vertices.map(function (v, i) {
            if (_this.checkboxes.perspective.checked) {
                var zratio = v.z / _this.scale;
                adjusted[i] = {
                    x: Math.floor(_this.canvas.width / 2 + (0.90 + zratio * 0.30) * _this.bound * (v.x / _this.scale)) + 0.5,
                    y: Math.floor(_this.canvas.height / 2 - (0.90 + zratio * 0.30) * _this.bound * (v.y / _this.scale)) + 0.5,
                    z: 0.50 + 0.40 * zratio,
                    w: 121 + Math.floor(134 * v.w / _this.scale)
                };
            }
            else {
                adjusted[i] = {
                    x: Math.floor(_this.canvas.width / 2 + _this.bound * (v.x / _this.scale)) + 0.5,
                    y: Math.floor(_this.canvas.height / 2 - _this.bound * (v.y / _this.scale)) + 0.5,
                    z: 0.50 + 0.40 * v.z / _this.scale,
                    w: 121 + Math.floor(134 * v.w / _this.scale)
                };
            }
        });
        if (this.checkboxes.edges.checked) {
            this.shape.edges.map(function (e) {
                var x = [adjusted[e[0]].x, adjusted[e[1]].x];
                var y = [adjusted[e[0]].y, adjusted[e[1]].y];
                var z = [adjusted[e[0]].z, adjusted[e[1]].z];
                var w = [adjusted[e[0]].w, adjusted[e[1]].w];
                _this.context.beginPath();
                _this.context.moveTo(x[0], y[0]);
                _this.context.lineTo(x[1], y[1]);
                _this.context.closePath();
                var gradient = _this.context.createLinearGradient(x[0], y[0], x[1], y[1]); // Distance fade effect
                gradient.addColorStop(0, 'rgba(' + w[0] + ',94,' + (125 - Math.round(w[0] / 2)) + ', ' + z[0] + ')');
                gradient.addColorStop(1, 'rgba(' + w[1] + ',94,' + (125 - Math.round(w[0] / 2)) + ', ' + z[1] + ')');
                _this.context.strokeStyle = gradient;
                _this.context.stroke();
            });
        }
        if (this.checkboxes.indices.checked) {
            for (var i in adjusted) {
                this.context.fillText(i.toString(), adjusted[i].x, adjusted[i].y);
            }
        }
    };
    ;
    Viewport.prototype.mousedown = function (e) {
        this.startCoords = mouseCoords(e, this.canvas);
        this.startCoords.x -= Math.floor(this.canvas.width / 2);
        this.startCoords.y = Math.floor(this.canvas.height / 2) - this.startCoords.y;
        this.clicked = true;
    };
    ;
    Viewport.prototype.mousemove = function (e) {
        if (!this.clicked) {
            return true;
        }
        var currCoords = mouseCoords(e, this.canvas);
        currCoords.x -= Math.floor(this.canvas.width / 2);
        currCoords.y = Math.floor(this.canvas.height / 2) - currCoords.y;
        var motion = { 'x': currCoords.x - this.startCoords.x,
            'y': currCoords.y - this.startCoords.y };
        if (e.shiftKey && (e.altKey || e.ctrlKey)) {
            this.shape.rotate('xy', Math.PI * motion.x / this.bound); // Full canvas drag ~ 2*PI
            this.shape.rotate('zw', Math.PI * motion.y / this.bound);
        }
        else if (e.shiftKey) {
            // Interpretation of this rotation varies between left- and right- brained users
            this.shape.rotate('xw', Math.PI * motion.x / this.bound);
            this.shape.rotate('yw', Math.PI * motion.y / this.bound);
        }
        else {
            this.shape.rotate('xz', Math.PI * motion.x / this.bound);
            this.shape.rotate('yz', Math.PI * motion.y / this.bound);
        }
        this.startCoords = currCoords;
        this.draw();
    };
    ;
    Viewport.prototype.mouseup = function () {
        this.clicked = false;
    };
    ;
    Viewport.prototype.change = function () {
        this.draw();
    };
    ;
    return Viewport;
}());
function mouseCoords(e, element) {
    var x;
    var y;
    if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
    }
    else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= element.offsetLeft;
    y -= element.offsetTop;
    return { 'x': x, 'y': y };
}
//# sourceMappingURL=viewport.js.map