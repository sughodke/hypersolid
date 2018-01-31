var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// Edge: [];
// Multiplication by vector rotation matrices of dimension 4
// each function is rotating on that plane, with the inputted vector being mutable
var VectorRotationMatrices = /** @class */ (function () {
    function VectorRotationMatrices() {
    }
    VectorRotationMatrices.prototype.xy = function (v, s, c) {
        var tmp = c * v.x + s * v.y;
        v.y = -s * v.x + c * v.y;
        v.x = tmp;
    };
    VectorRotationMatrices.prototype.xz = function (v, s, c) {
        var tmp = c * v.x + s * v.z;
        v.z = -s * v.x + c * v.z;
        v.x = tmp;
    };
    VectorRotationMatrices.prototype.xw = function (v, s, c) {
        var tmp = c * v.x + s * v.w;
        v.w = -s * v.x + c * v.w;
        v.x = tmp;
    };
    VectorRotationMatrices.prototype.yz = function (v, s, c) {
        var tmp = c * v.y + s * v.z;
        v.z = -s * v.y + c * v.z;
        v.y = tmp;
    };
    VectorRotationMatrices.prototype.yw = function (v, s, c) {
        var tmp = c * v.y - s * v.w;
        v.w = s * v.y + c * v.w;
        v.y = tmp;
    };
    VectorRotationMatrices.prototype.zw = function (v, s, c) {
        var tmp = c * v.z - s * v.w;
        v.w = s * v.z + c * v.w;
        v.z = tmp;
    };
    return VectorRotationMatrices;
}());
var Emittable = /** @class */ (function () {
    function Emittable() {
        this.eventCallbacks = {};
    }
    Emittable.prototype.on = function (eventName, callback) {
        if (!(eventName in this.eventCallbacks)) {
            this.eventCallbacks[eventName] = [];
        }
        this.eventCallbacks[eventName].push(callback);
    };
    Emittable.prototype.triggerEventCallbacks = function (eventName) {
        if (eventName in this.eventCallbacks) {
            this.eventCallbacks[eventName].map(function (callback) { return callback.call(self); });
        }
    };
    return Emittable;
}());
var rotationOrder = ['yz', 'xw', 'yw', 'zw', 'xy', 'xz'];
var Shape = /** @class */ (function (_super) {
    __extends(Shape, _super);
    function Shape(shapeVertices, edges) {
        var _this = _super.call(this) || this;
        _this.shapeVertices = shapeVertices;
        _this.edges = edges;
        // the current rotations about each axis.
        _this.rotations = {
            xy: 0,
            xz: 0,
            xw: 0,
            yz: 0,
            yw: 0,
            zw: 0
        };
        _this.rotateVertex = new VectorRotationMatrices();
        // Rotations will always be relative to the original shape to avoid rounding errors.
        // This is a structure for caching the rotated vertices.
        // this.rotatedVertices = new Array(vertices.length);
        _this.copyVertices();
        return _this;
    }
    Shape.prototype.copyVertices = function () {
        this.rotatedVertices = this.shapeVertices.map(function (v) { return Object.create(v); });
    };
    Object.defineProperty(Shape.prototype, "originalVertices", {
        get: function () {
            return this.shapeVertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "vertices", {
        get: function () {
            return this.rotatedVertices;
        },
        enumerable: true,
        configurable: true
    });
    ;
    // This will copy the original shape and put a rotated version into rotatedVertices
    Shape.prototype.rotate = function (axis, theta) {
        this.addToRotation(axis, theta);
        this.applyRotations();
        this.triggerEventCallbacks('rotate');
    };
    Shape.prototype.addToRotation = function (axis, theta) {
        this.rotations[axis] = (this.rotations[axis] + theta) % (2 * Math.PI);
    };
    Shape.prototype.applyRotations = function () {
        var _this = this;
        this.copyVertices();
        // this.rotatedVertices = shapeVertices.map((v: Vertex) => v);
        // let self = this;
        rotationOrder.map(function (axis) {
            // sin and cos precomputed for efficiency
            var s = Math.sin(_this.rotations[axis]);
            var c = Math.cos(_this.rotations[axis]);
            var rotateFunction = _this.rotateVertex[axis];
            _this.rotatedVertices.map(function (vertex) {
                rotateFunction(vertex, s, c);
            });
        });
    };
    return Shape;
}(Emittable));
//# sourceMappingURL=shape.js.map