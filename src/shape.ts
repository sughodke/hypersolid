interface Vertex {
    x: number;
    y: number;
    z: number;
    w: number;
}

// Edge: [];

// Multiplication by vector rotation matrices of dimension 4
// each function is rotating on that plane, with the inputted vector being mutable
class VectorRotationMatrices {
    xy(v: Vertex, s: number, c: number) {
        let tmp = c * v.x + s * v.y;
        v.y = -s * v.x + c * v.y;
        v.x = tmp;
    }

    xz(v: Vertex, s: number, c: number) {
        let tmp = c * v.x + s * v.z;
        v.z = -s * v.x + c * v.z;
        v.x = tmp;
    }

    xw(v: Vertex, s: number, c: number) {
        let tmp = c * v.x + s * v.w;
        v.w = -s * v.x + c * v.w;
        v.x = tmp;
    }

    yz(v: Vertex, s: number, c: number) {
        let tmp = c * v.y + s * v.z;
        v.z = -s * v.y + c * v.z;
        v.y = tmp;
    }

    yw(v: Vertex, s: number, c: number) {
        let tmp = c * v.y - s * v.w;
        v.w = s * v.y + c * v.w;
        v.y = tmp;
    }

    zw(v: Vertex, s: number, c: number) {
        let tmp = c * v.z - s * v.w;
        v.w = s * v.z + c * v.w;
        v.z = tmp;
    }
}

class Emittable {
    eventCallbacks: {
        [eventName: string] : ((self: Object) => any)[]
    } = {};

    on(eventName, callback) {
        if (!(eventName in this.eventCallbacks)) {
            this.eventCallbacks[eventName] = [];
        }

        this.eventCallbacks[eventName].push(callback);
    }

    triggerEventCallbacks(eventName) {
        if (eventName in this.eventCallbacks) {
            this.eventCallbacks[eventName].map(callback => callback.call(self));
        }
    }
}


const rotationOrder = ['yz', 'xw', 'yw', 'zw', 'xy', 'xz'];
class Shape extends Emittable {

    private rotatedVertices: Vertex[];

    // the current rotations about each axis.
    private rotations = {
        xy: 0,
        xz: 0,
        xw: 0,
        yz: 0,
        yw: 0,
        zw: 0
    };

    private rotateVertex = new VectorRotationMatrices();


    copyVertices() {
        this.rotatedVertices = this.shapeVertices.map((v: Vertex) => Object.create(v));
    }

    constructor(public shapeVertices: any[], public edges: any[]) {
        super();
        // Rotations will always be relative to the original shape to avoid rounding errors.
        // This is a structure for caching the rotated vertices.

        // this.rotatedVertices = new Array(vertices.length);
        this.copyVertices();
    }

    get originalVertices() {
        return this.shapeVertices;
    }

    get vertices() {
        return this.rotatedVertices;
    };

    // This will copy the original shape and put a rotated version into rotatedVertices
    rotate(axis, theta) {
        this.addToRotation(axis, theta);
        this.applyRotations();
        this.triggerEventCallbacks('rotate');
    }

    addToRotation(axis, theta) {
        this.rotations[axis] = (this.rotations[axis] + theta) % (2 * Math.PI);
    }

    applyRotations() {
        this.copyVertices();
        // this.rotatedVertices = shapeVertices.map((v: Vertex) => v);

        // let self = this;
        rotationOrder.map(axis => {
            // sin and cos precomputed for efficiency
            let s = Math.sin(this.rotations[axis]);
            let c = Math.cos(this.rotations[axis]);
            let rotateFunction = this.rotateVertex[axis];

            this.rotatedVertices.map(vertex => {
                rotateFunction(vertex, s, c);
            });
        }
        );
    }

}