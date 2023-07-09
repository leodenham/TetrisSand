var tiles;
fetch('tiles.json').then(response => response.json()).then(data => tiles = data);

const TILESIZE = 13;
const GRIDWIDTH = 100;
const GRIDHEIGHT = 160;
const SQUARESIZE = 5;
const BUFFERSIZE = 250;
const BUFFERBUFFER = 10;  

let globalScore = 0;

class SandParticle {
    
    constructor(x, y, colour, size, type){
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.size = size;
        this.isVisited = false;
        this.toBeRemoved = false;
        this.type = type
        this.flashing = false;
    }

    draw(){
        if (this.flashing){
            fill(255);
        } else {
            fill(this.colour);
        }

        // if (this.isVisited){
        //     fill(255);
        // }
        rect(this.x*this.size, this.y*this.size, this.size, this.size);
        
    }
}

class SandGrid {
    constructor(WIDTH, HEIGHT, size){
        this.width = WIDTH; 
        this.height = HEIGHT;
        this.grid = [...Array(this.height)].map(e => Array(this.width));
        this.size = size;
        this.justRemoved = false;
    }

    draw(){
        rectMode(CORNER);
        // stroke(0, 0, 0);
        for (let i = 0; i < this.height; i++){
            for (let j = 0; j < this.width; j++){
                if (this.grid[i][j] != undefined){
                    this.grid[i][j].draw();
                }
            }
        }
    }

    update(){
        let anyMoved = false;
        for (let i = this.height-2; i >= 0; i--){
            for (let j = 0; j < this.width; j++){
                if (this.grid[i][j] != undefined){
                    if (this.grid[i+1][j] == undefined){
                        this.grid[i][j].y++;
                        this.grid[i+1][j] = this.grid[i][j];
                        this.grid[i][j] = undefined;
                        anyMoved = true;
                    } else {

                        let order = random();
                        if (order < 0.5){
                            if (j < this.width-1 && this.grid[i+1][j+1] == undefined){
                                this.grid[i][j].y++;
                                this.grid[i][j].x++;
                                this.grid[i+1][j+1] = this.grid[i][j];
                                this.grid[i][j] = undefined;
                                anyMoved = true;
                            } else if (j > 0 && this.grid[i+1][j-1] == undefined) {
                                this.grid[i][j].y++;
                                this.grid[i][j].x--;
                                this.grid[i+1][j-1] = this.grid[i][j];
                                this.grid[i][j] = undefined;
                                anyMoved = true;
                            }
                        } else {
                            if (j > 0 && this.grid[i+1][j-1] == undefined) {
                                this.grid[i][j].y++;
                                this.grid[i][j].x--;
                                this.grid[i+1][j-1] = this.grid[i][j];
                                this.grid[i][j] = undefined;
                                anyMoved = true;
                            } else if (j < this.width-1 && this.grid[i+1][j+1] == undefined){
                                this.grid[i][j].y++;
                                this.grid[i][j].x++;
                                this.grid[i+1][j+1] = this.grid[i][j];
                                this.grid[i][j] = undefined;
                                anyMoved = true;
                            } 
                        }
                    }
                }
            }
        }
        if (true){

            for (let i = 0; i < this.grid.length; i++){
                for (let j = 0; j < this.grid[0].length; j++){
                    if (this.grid[i][j] == undefined){
                        continue;
                    }
                    this.grid[i][j].isVisited = false;
                }
            }
            
            for (let i = 0; i < this.grid.length; i++){
                if (this.grid[i][0] == undefined){
                    continue;
                }
                let nextTiles = [this.grid[i][0]];
                let visitedTiles = [];
                let hasFound = false;

                while (nextTiles.length != 0){
                    let currentTile;

                    currentTile = nextTiles.pop();
                    currentTile.isVisited = true;
                    visitedTiles.push(currentTile);
                    if (currentTile.x == GRIDWIDTH-1){
                        hasFound = true;
                    }
                    let thisRound = []
                    if (currentTile.x > 0){
                        thisRound.push(this.grid[currentTile.y][currentTile.x-1]);
                    }
                    
                    if (currentTile.x < GRIDWIDTH-1){
                        thisRound.push(this.grid[currentTile.y][currentTile.x+1]);
                    }
                    if (currentTile.y > 0){
                        thisRound.push(this.grid[currentTile.y-1][currentTile.x]);
                    }
                    if (currentTile.y < GRIDHEIGHT-1){
                        thisRound.push(this.grid[currentTile.y+1][currentTile.x]);
                    }

                    while (thisRound.length > 0){
                        let nextTile = thisRound.pop();
                        if (nextTile != undefined && nextTile.isVisited == false && nextTile.type == this.grid[i][0].type){
                            nextTiles.push(nextTile);
                        }
                    }
                }
                if (hasFound){
                    for (let i = 0; i < visitedTiles.length; i++){
                        visitedTiles[i].toBeRemoved = true;
                        // this.grid[visitedTiles[i].y][visitedTiles[i].x] = undefined; // REMOVE THIS FOR BETTER REMOVE ANIMNATION.
                    }
                    return true;  // Do not remove any other tiles, removes excess computation. 
                }


            }
        }
        return false;
        
    }

    addParticle(i,j,colour, type){
        if (i < 0 || i >= this.width || j < 0 || j >= this.height){
            return;
        }
        this.grid[j][i] = new SandParticle(i,j,colour,SQUARESIZE, type);
    }

    isEmpty(x, y){
        if (x < 0 || x >= this.width || y <= 0 || y >= this.height-1){
            return false;
        }
        if (this.grid[y][x] == undefined){
            return true;
        }
        return false;
    }

    flash(num){
        if (num % 2 == 0){
            for (let i = 0; i < this.width; i++){
                for (let j = 0; j < this.height; j++){
                    if (this.grid[j][i] != undefined&& this.grid[j][i].toBeRemoved){
                        this.grid[j][i].flashing = true;
                    }
                }
            }
        } else {
            for (let i = 0; i < this.width; i++){
                for (let j = 0; j < this.height; j++){
                    if (this.grid[j][i] != undefined&& this.grid[j][i].toBeRemoved){
                        this.grid[j][i].flashing = false;
                    }
                }
            }
        }
    }

    removeDeleted(){
        for (let i = 0; i < this.width; i++){
            for (let j = 0; j < this.height; j++){
                if (this.grid[j][i] != undefined&& this.grid[j][i].toBeRemoved){
                    this.grid[j][i] = undefined
                    globalScore++;
                }
            }
        }
    }

}

class TileGrid {
    constructor(WIDTH, HEIGHT, size){
        this.width = WIDTH;
        this.height = HEIGHT;
        this.size = size;
        this.currentTile = [];
        this.currentType = '';
        this.currentRotation = 0;
        this.centerPos = []
    }

    moveTile(currentGrid){
        if (this.currentTile.length == 0){
            return;
        }
        let isTrue = false;
        for (let i = 0; i < this.currentTile.length; i++){
            if (!currentGrid.isEmpty(this.currentTile[i][0], this.currentTile[i][1]+1)){
                isTrue = true;
            }
        }
        if (!isTrue){
            for (let i = 0; i < this.currentTile.length; i++){
                this.currentTile[i] = [this.currentTile[i][0], this.currentTile[i][1]+1,this.currentTile[i][2]];
            }
        }
        this.centerPos[1]++;
        return isTrue;
    }

    update(currentGrid){
        if (this.moveTile(currentGrid)){
            let current;
            while (this.currentTile.length != 0){
                current = this.currentTile.pop();
                currentGrid.addParticle(current[0], current[1], current[2], this.currentType);
            }
            return true;
        }
        return false;
    }

    static toGrid(type, rotation, xOff, yOff, size){
        let retval = [];
        let tile = tiles[type][rotation];
        let colour = tiles["colours"][type]
        for (let i = 0; i < 4; i++){
            for (let j = 0; j < 4; j++){
                if (tile[i][j] != 0){
                    for (let k = 0; k < size; k++){
                        for (let h = 0; h < size; h++){
                            let index = 2-min(h,k,size-h-1,size-k-1);
                            if (index < 0){
                                index = 0;
                            }
                            retval.push([i*size+k+xOff, j*size+h+yOff,colour[index]]); // change colour based off distance from center.
                        }
                    }
                }
            }
        }
        return retval;
    }
    
    draw(){
        for (let i = 0; i < this.currentTile.length; i++){
            fill(this.currentTile[i][2])
            rect(this.currentTile[i][0]*this.size, this.currentTile[i][1]*this.size, this.size,this.size)
        }
    }

    addTile(x, y, type, grid){ // start at top left
        this.centerPos = [x,y];
        this.currentTile = []
        this.currentType = type;
        this.currentRotation = 0;
        this.currentTile = TileGrid.toGrid(type, 0, x, y, TILESIZE);
        for (let i = 0; i < this.currentTile.length; i++){
            if (grid.grid[this.currentTile[i][1]][this.currentTile[i][0]] != undefined){
                return false;
            }
        }
        return true;
    }

    moveLeft(){
        if (this.currentTile.filter(a => a[0] == 0).length > 0){
            return;
        }
        this.currentTile = this.currentTile.map(a => [a[0]-1, a[1], a[2]]);
        this.centerPos[0]--;
    }

    moveRight(){
        if (this.currentTile.filter(a => a[0] == (GRIDWIDTH-1)).length > 0){
            return;
        }
        this.currentTile = this.currentTile.map(a => [a[0]+1, a[1], a[2]]);
        this.centerPos[0]++;
    }

    rotateTile(grid){
        let newTile = TileGrid.toGrid(this.currentType, ++this.currentRotation % 4, this.centerPos[0], this.centerPos[1],TILESIZE);
        if (newTile.filter(a => {
            return (a[0] < 0 || a[0] >= GRIDWIDTH || a[1] < 0 || a[1] >= GRIDHEIGHT);
        }).length > 0){
            return;
        }

        if (newTile.filter(a => {
            return (grid.grid[a[1]][a[0]] != undefined);
        }).length > 0){
            return;
        }
        this.currentTile = newTile;
    }
}


class BufferGrid {
    constructor(startX, startY, WIDTH, HEIGHT, BUFFER){
        this.startX = startX;
        this.startY = startY;
        this.WIDTH = WIDTH;
        this.HEIGHT = HEIGHT;
        this.buffer = BUFFER;
        this.squaresize = 4;//floor((WIDTH-2*BUFFER)/(4*);
        this.tileNames = [];
        this.tileGrid = [];
        this.currentXOffsets = []
    }

    addTile(tileName){
        this.tileNames.push(tileName);
        this.tileGrid.push(TileGrid.toGrid(tileName, 0, 0, TILESIZE*this.tileGrid.length*3+this.tileGrid.length*this.buffer, TILESIZE))
        let min = width*2;
        let max = 0;
        for (let i = 0; i < this.tileGrid[this.tileGrid.length-1].length; i++){
            if (this.tileGrid[this.tileGrid.length-1][i][0] < min){
                min = this.tileGrid[this.tileGrid.length-1][i][0]
            }
            if (this.tileGrid[this.tileGrid.length-1][i][0] > max){
                max = this.tileGrid[this.tileGrid.length-1][i][0]
            }
        }
        this.currentXOffsets.push(parseInt(-min-max+width/2))
        // this.currentXOffsets.push(min-max+BUFFERSIZE/2)

        // width-max+this.startX = min

    }

    removeTile(){
        this.tileGrid.shift();
        this.tileNames.shift();
        for (let i = 0; i < this.tileGrid.length; i++){
            for (let j = 0; j < this.tileGrid[0].length; j++){
                this.tileGrid[i][j][1]-=TILESIZE*3+this.buffer
            }
        }
        this.currentXOffsets.shift();
    }

    draw(){
        for (let i = 0; i < this.tileGrid.length; i++){
            for (let j = 0; j < this.tileGrid[i].length; j++){
                if (this.tileGrid[i][j] == undefined){
                    console.log(i,j);
                    continue;
                }
                fill(this.tileGrid[i][j][2]);
                rect(this.currentXOffsets[i]+this.tileGrid[i][j][0]*this.squaresize+this.buffer, this.startY+this.tileGrid[i][j][1]*this.squaresize+this.buffer, this.squaresize, this.squaresize);
            }
        }
    }
}




function random_tile_name(){
    return ["L","T","I","J","O","Z","S"][parseInt(random()*7)]
}

let grid;
let tileGrid;
let bufferGrid;
let holdCount = 0;
let deletedCount = -1;
let future_tiles = [];
function setup(){
    createCanvas(GRIDWIDTH*SQUARESIZE+BUFFERSIZE,GRIDHEIGHT*SQUARESIZE);
    grid = new SandGrid(GRIDWIDTH, GRIDHEIGHT, SQUARESIZE);
    tileGrid = new TileGrid(GRIDWIDTH,GRIDHEIGHT,SQUARESIZE);
    bufferGrid = new BufferGrid(GRIDWIDTH*SQUARESIZE, 0, BUFFERSIZE, height, BUFFERBUFFER);
    for (let i = 0; i < 3; i++){
        future_tiles.push(random_tile_name())
        bufferGrid.addTile(future_tiles[i]);
    }
}

function draw(){
    frameRate(40)
    background(100);
    fill(200);
    rect(0,0,GRIDWIDTH*SQUARESIZE,GRIDHEIGHT*SQUARESIZE);
    noStroke();
    grid.draw();
    if (deletedCount == -1 && grid.update()){
        deletedCount++;
    };
    tileGrid.draw();
    if (deletedCount > -1){
        if (frameCount%3 == 0){
            deletedCount++;

            grid.flash(deletedCount);
        }
        if (deletedCount == 10){
            grid.removeDeleted();
            deletedCount = -1;
        }
    }else if (holdCount == 20){
        if (!tileGrid.addTile(floor(GRIDWIDTH/3), 0, future_tiles[0], grid)){
            // GAME OVER
            textSize(32);
            textAlign(CENTER, CENTER);
            text("GAME OVER: Score " + globalScore, width/2, height/3);
            noLoop();
        };
        future_tiles.shift();
        bufferGrid.removeTile();
        future_tiles.push(random_tile_name());
        bufferGrid.addTile(future_tiles[future_tiles.length-1])
        holdCount++;
    } else if (holdCount == 50){
        if (tileGrid.update(grid)){
            // Tile has been converted. Display new tile for 10 frames then begin updating.
            holdCount = 0;
        };
    } else {
        holdCount++;
    }


    // Draw Future tiles & score in other zone.
    bufferGrid.draw();
    
    if (keyIsDown(LEFT_ARROW)){
        tileGrid.moveLeft();
    } else if (keyIsDown(RIGHT_ARROW)){
        tileGrid.moveRight();
    } else if (keyIsDown(DOWN_ARROW)){
        if (tileGrid.update(grid)){
            // Tile has been converted. Display new tile for 10 frames then begin updating.
            holdCount = 0;
        };
    }
}

function keyPressed(){
    if (key == "ArrowUp"){
        tileGrid.rotateTile(grid);
    }
}