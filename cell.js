class Cell {
    constructor(i,j, cellWidth) {
        this.i = i;
        this.j = j;
        this.cellWidth = cellWidth;
        this.walls = [ false, false, false, false ];
        this.r = 22;
        this.g = 22;
        this.b = 22;
    }

    setRGB( r, g ,b ) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    setWalls( hasWalls ) {
        this.walls[0] = hasWalls;
        this.walls[1] = hasWalls;
        this.walls[2] = hasWalls;
        this.walls[3] = hasWalls;
    }

    display() {
        let x = this.i * this.cellWidth;
        let y = this.j * this.cellWidth;

        stroke(0);
        if (this.walls[0]) {
            line(x, y, x + this.cellWidth, y);
        }
        if (this.walls[1]) {
            line(x + this.cellWidth, y, x + this.cellWidth, y + this.cellWidth);
        }
        if (this.walls[2]) {
            line(x + this.cellWidth, y + this.cellWidth, x, y + this.cellWidth);
        }
        if (this.walls[3]) {
            line(x, y + this.cellWidth, x, y);
        }

        
        noStroke();
        fill( this.r,this.g,this.b,100)
        rect( x, y, this.cellWidth, this.cellWidth)
    }
}