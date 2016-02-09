var AM = new AssetManager();

function Animation(spriteSheet, frameWidth, frameHeight, frameDuration, frames, loop, reverse, numFramesInRow) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
	this.numFramesInRow = numFramesInRow;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    if (frame > 13) {
        frame = 26 - frame;
    }
    xindex = frame % this.numFramesInRow;
    yindex = Math.floor(frame / this.numFramesInRow);

    //console.log(frame + " " + xindex + " " + yindex);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth,
                 this.frameHeight);
}

Animation.prototype.drawFrameRotate = function (tick, ctx, x, y, angle) {
	this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    if (frame > 13) {
        frame = 26 - frame;
    }
    xindex = frame % this.numFramesInRow;
    yindex = Math.floor(frame / this.numFramesInRow);

    //console.log(frame + " " + xindex + " " + yindex);

    // ctx.drawImage(this.spriteSheet,
                 // xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 // this.frameWidth, this.frameHeight,
                 // x, y,
                 // this.frameWidth,
                 // this.frameHeight);

	// //void ctx.drawImage(image, dx, dy);
	// //void ctx.drawImage(image, dx, dy, dWidth, dHeight);
	// //void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
	
	var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(this.frameWidth, this.frameHeight);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size/2, size/2);
    //offscreenCtx.rotate(angle + Math.PI/2);
	offscreenCtx.rotate(angle * Math.PI/180);
    //offscreenCtx.drawImage(this.spriteSheet,
                 // xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 // this.frameWidth, this.frameHeight,
				 // -(this.frameWidth/2), -(this.frameHeight/2));
	 offscreenCtx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 -(this.frameWidth/2), -(this.frameHeight/2),  //0, 0, works
                 this.frameWidth,
                 this.frameHeight);
    offscreenCtx.restore();
	var theImage = offscreenCtx.getImageData(0, 0, this.frameWidth, this.frameHeight);
    ctx.drawImage(offscreenCanvas, x, y);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function() {
}

Entity.prototype.draw = function(ctx) {
    if (this.game.showOutlines && this.radius) {
        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.stroke();
        ctx.closePath();
    }
}

Entity.prototype.drawSpriteCentered = function(ctx) {
    if (this.sprite && this.x && this.y) {
        var x = this.x - this.sprite.width/2;
        var y = this.y - this.sprite.height/2;
        ctx.drawImage(this.sprite, x, y);
    }
}

Entity.prototype.outsideScreen = function() {
    return (this.x > this.game.halfSurfaceWidth || this.x < -(this.game.halfSurfaceWidth) ||
        this.y > this.game.halfSurfaceHeight || this.y < -(this.game.halfSurfaceHeight));
}

Entity.prototype.rotateAndCache = function(image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size/2, size/2);
    offscreenCtx.rotate(angle + Math.PI/2);
    offscreenCtx.drawImage(image, -(image.width/2), -(image.height/2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}


function spaceAlien(game, spritesheet, SwipeSpriteSheet) {
	//Animation(spriteSheet, frameWidth, frameHeight, frameDuration, frames, loop, reverse, numFramesOnRow)
    this.animation = new Animation(spritesheet, 50, 42, 0.1, 8, true, false, 8);
	this.SwipeAnimation = new Animation(SwipeSpriteSheet, 50, 47, 0.1, 5, true, false, 5);
	this.elapsedTime = 0;
	this.elapsedTarget = 1.6;
    this.x = 0;
    this.y = 0;
	this.swipe = true;
	this.swipeCounter = 0;
	this.swipeTarget = .5;
    this.game = game;
    this.ctx = game.ctx;
	this.angle = 0;
}

spaceAlien.prototype.draw = function () {
	if (!this.swipe) {
		this.animation.drawFrameRotate(this.game.clockTick, this.ctx, this.x, this.y, this.angle);
	} else {
		this.SwipeAnimation.drawFrameRotate(this.game.clockTick, this.ctx, this.x, this.y, this.angle);
	}
    
}

spaceAlien.prototype.update = function() {	
	if (!this.swipe && this.elapsedTime < this.elapsedTarget) {
		//console.log("walking");
		this.squareWalk();
		this.elapsedTime += this.game.clockTick;
	} else if (!this.swipe && this.elapsedTime >= this.elapsedTarget){
		//console.log("begin swipe");
		this.swipe = true;
		this.swipeCounter += this.game.clockTick;
	} else if (this.swipe && this.swipeCounter < this.swipeTarget){
		//console.log("swiping");
		this.swipeCounter += this.game.clockTick;
		//console.log(this.swipeCounter);
	} else {
		//console.log("end swipe");
		this.swipe = false;
		this.elapsedTime = 0;
		this.swipeCounter = 0;
	}
}

spaceAlien.prototype.squareWalk = function() {
	var bottomRow = 400;
	var topRow = 0
	var rightRow = 400; 
	var leftRow = 0;
	var step = 2;
	if (this.x <= leftRow && this.y < bottomRow) {
		//walking right: top to bottom
		this.y += step;
		this.angle = 0;
	} else if (this.y >= bottomRow && this.x < rightRow) {
		//walking bottom: left to right
		this.x += step;
		this.angle = 270;
	} else if (this.x >= rightRow && this.y > topRow) {
		//walking left: bottom to top
		this.y -= step;
		this.angle = 180;
	} else if (this.y <= topRow && this.x > leftRow) {
		//walking top: right to left
		this.x -= step;
		this.angle = 90; //done
	}
    //console.log(this.x + ", " + this.y);
}

AM.queueDownload("./img/spaceAlien.png");
AM.queueDownload("./img/spaceAlienSwipe.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new spaceAlien(gameEngine, AM.getAsset("./img/spaceAlien.png"), AM.getAsset("./img/spaceAlienSwipe.png")));

    console.log("All Done!");
});