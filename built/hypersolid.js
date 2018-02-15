/*
 * Hypersolid, Four-dimensional solid viewer
 *
 * Copyright (c) 2014 Milosz Kosmider <milosz@milosz.ca>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
var Hypersolid = /** @class */ (function () {
    function Hypersolid() {
    }
    /* Begin constants. */
    /* End constants. */
    /* Begin methods. */
    // parse ascii files from http://paulbourke.net/geometry/hyperspace/
    Hypersolid.prototype.parseVEF = function (text) {
        var lines = text.split("\n");
        var nV = parseInt(lines[0]); // number of vertices
        var nE = parseInt(lines[1 + nV]); // number of edges
        var nF = parseInt(lines[2 + nV + nE]); // number of faces
        var vertices = lines.slice(1, 1 + nV).map(function (line) {
            var d = line.split("\t").map(parseFloat);
            return {
                x: d[0],
                y: d[1],
                z: d[2],
                w: d[3],
            };
        });
        var edges = lines.slice(2 + nV, 2 + nV + nE).map(function (line) {
            var d = line.replace("\s", "").split("\t").map(function (vertex) {
                return parseInt(vertex);
            });
            return [d[0], d[1]];
        });
        var faces = lines.slice(3 + nV + nE, 3 + nV + nE + nF).map(function (line) {
            var d = line.replace("\s", "").split("\t").map(function (edge) {
                return parseInt(edge);
            });
            return d;
        });
        return [vertices, edges, faces];
    };
    ;
    return Hypersolid;
}());
//# sourceMappingURL=hypersolid.js.map