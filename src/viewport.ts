const DEFAULT_VIEWPORT_WIDTH = 480; // Width of canvas in pixels
const DEFAULT_VIEWPORT_HEIGHT = 480; // Height of canvas in pixels
const DEFAULT_VIEWPORT_SCALE = 2; // Maximum distance from origin (in math units) that will be displayed on the canvas
const DEFAULT_VIEWPORT_FONT = 'italic 10px sans-serif';
const DEFAULT_VIEWPORT_FONT_COLOR = '#000';
const DEFAULT_VIEWPORT_LINE_WIDTH = 4;
const DEFAULT_VIEWPORT_LINE_JOIN = 'round';

const DEFAULT_CHECKBOX_VALUES = {
    perspective: {checked: true},
    indices: {checked: false},
    edges: {checked: true}
};


class Viewport {

    private context : CanvasRenderingContext2D;
    private bound : number;
    private startCoords : any;
    private clicked = false;
    private scale: number;
    private checkboxes: any;
    private animateInterval = -1;

    constructor (
        public shape: Shape,
        public canvas: HTMLCanvasElement,
        public document: HTMLDocument,
        private options: any
    ) {
        options = options || {};

        this.scale = options.scale || DEFAULT_VIEWPORT_SCALE;

        canvas.width = options.width || DEFAULT_VIEWPORT_WIDTH;
        canvas.height = options.height || DEFAULT_VIEWPORT_HEIGHT;

        this.bound = Math.min(canvas.width, canvas.height) / 2;

        let context = canvas.getContext('2d');
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

        this.change();
    }

    draw() {
        // blank the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // track what has changed
        let adjusted : {
            [index: number] : Vertex
        } = {};
        
        this.shape.vertices.map((v: Vertex, i: number) => {

            if (this.checkboxes.perspective.checked) {
                let zratio = v.z / this.scale;
                
                adjusted[i] = <Vertex>{
                    x: Math.floor(this.canvas.width / 2 + (0.90 + zratio * 0.30) * this.bound * (v.x / this.scale)) + 0.5,
                    y: Math.floor(this.canvas.height / 2 - (0.90 + zratio * 0.30) * this.bound * (v.y / this.scale)) + 0.5,
                    z: 0.50 + 0.40 * zratio,
                    w: 121 + Math.floor(134 * v.w / this.scale)
                };
            }
            else {
                adjusted[i] = <Vertex>{
                    x: Math.floor(this.canvas.width / 2 + this.bound * (v.x / this.scale)) + 0.5,
                    y: Math.floor(this.canvas.height / 2 - this.bound * (v.y / this.scale)) + 0.5,
                    z: 0.50 + 0.40 * v.z / this.scale,
                    w: 121 + Math.floor(134 * v.w / this.scale)
                };
            }

        });

        if (this.checkboxes.edges.checked) {
            this.shape.edges.map(e => {
                let x = [adjusted[e[0]].x, adjusted[e[1]].x];
                let y = [adjusted[e[0]].y, adjusted[e[1]].y];
                let z = [adjusted[e[0]].z, adjusted[e[1]].z];
                let w = [adjusted[e[0]].w, adjusted[e[1]].w];

                this.context.beginPath();
                this.context.moveTo(x[0], y[0]);
                this.context.lineTo(x[1], y[1]);
                this.context.closePath();

                let gradient = this.context.createLinearGradient(x[0], y[0], x[1], y[1]); // Distance fade effect
                gradient.addColorStop(0, 'rgba(' + w[0] + ',94,' + (125-Math.round(w[0]/2)) +', ' + z[0] + ')');
                gradient.addColorStop(1, 'rgba(' + w[1] + ',94,' + (125-Math.round(w[0]/2)) +', ' + z[1] + ')');
                this.context.strokeStyle = gradient;
                this.context.stroke();
            });
        }

        if (this.checkboxes.indices.checked) {
            for (let i in adjusted) {
                this.context.fillText(i.toString(), adjusted[i].x, adjusted[i].y);
            }
        }
    }

    mousedown(e) {
        this.startCoords = mouseCoords(e, this.canvas);
        this.startCoords.x -= Math.floor(this.canvas.width / 2);
        this.startCoords.y = Math.floor(this.canvas.height / 2) - this.startCoords.y;
        this.clicked = true;
    }

    mousemove(e) {
        if (!this.clicked) {
            return true;
        }

        let currCoords = mouseCoords(e, this.canvas);
        currCoords.x -= Math.floor(this.canvas.width / 2);
        currCoords.y = Math.floor(this.canvas.height / 2) - currCoords.y;

        let motion = { 'x': currCoords.x - this.startCoords.x,
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
    }

    mouseup() {
        this.clicked = false;
    }

    change() {
        if (this.checkboxes.animate.checked && this.animateInterval == -1) {
            this.animateInterval = setInterval(this.animate.bind(this), 30);
        } else {
            clearInterval(this.animateInterval);
            this.animateInterval = -1;
        }

        this.draw();
    }

    animate() {
        this.shape.rotate('xw', Math.PI * 1 / this.bound);
        this.shape.rotate('yw', Math.PI * 1 / this.bound);

        this.draw();
    }
}


function mouseCoords(e, element) { // http://answers.oreilly.com/topic/1929-how-to-use-the-canvas-and-draw-elements-in-html5/
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
