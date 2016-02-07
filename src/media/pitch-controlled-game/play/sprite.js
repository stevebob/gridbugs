function Sprite(){}
Sprite.create = function(sheet) {
    var s = new Sprite();
    s.sheet = sheet;

    s.frames = [];
    s.sequences = [];

    s.current_sequence = null;

    s.fps = 5;
    s.duration = 1000/s.fps;

    return s;
}
$SPR = Sprite.create;

Sprite.prototype.set_fps = function(fps) {
    this.fps = fps;
    this.duration = 1000/this.fps;
}

Sprite.prototype.add_frame = function(name, top_left, bottom_right) {
    this.frames[name] = $FR(this.sheet, top_left, bottom_right);
}
Sprite.prototype.add_frame_by_image = function (name, image) {
    this.frames[name] = $FR(image, [0, 0], [image.width, image.height]);
}
Sprite.prototype.a = Sprite.prototype.add_frame_by_image;
Sprite.prototype.draw_current = function(ctx, x, y) {
    this.sequences[this.current_sequence].get_current_frame().draw_test(ctx, x, y);
}
Sprite.prototype.draw_next = function(ctx, x, y) {
    this.sequences[this.current_sequence].get_next_frame().draw_test(ctx, x, y);
}

Sprite.prototype.progress = function(n) {
    this.sequences[this.current_sequence].get_next_frame();
}

Sprite.prototype.progress_by = function(n) {
    this.sequences[this.current_sequence].progress_by(n);
}
Sprite.prototype.get_next_frame = function() {
    return this.sequences[this.current_sequence].get_next_frame();
}

Sprite.prototype.get_frame_no = function() {
    return this.sequences[this.current_sequence].current_frame;
}
Sprite.prototype.set_frame_no = function(n) {
    this.sequences[this.current_sequence].current_frame = n;
}


Sprite.prototype.draw_frame = function(name, ctx) {
    var frame = this.frames[name];
    ctx.drawImage(
        // image to draw
        frame.image,
        // offset into the original image to start drawing
        frame.x, frame.y,
        // amount of original image to draw
        frame.width, frame.height,
        // offset on the canvas to start drawing
        10, 10,
        // actual size of drawn image on canvas
        frame.width, frame.height
    );

}

Sprite.prototype.add_sequence = function(name, frame_names, loop) {
    var s = this;
    var frames = frame_names.map(function(name){return s.frames[name]});
    var seq = $SEQ(frames, loop);
    seq.sprite = this;
    this.sequences[name] = seq;
}

function Frame(){}
Frame.create = function(image, top_left, bottom_right) {
    var f = new Frame();
    f.image = image;
    f.x = top_left[0];
    f.y = top_left[1];
    f.width = bottom_right[0]-top_left[0];
    f.height = bottom_right[1]-top_left[1];
    return f;
}
$FR = Frame.create;
Frame.prototype.draw_test = function(ctx, x, y) {
    ctx.drawImage(
        // image to draw
        this.image,
        // offset into the original image to start drawing
        this.x, this.y,
        // amount of original image to draw
        this.width, this.height,
        // offset on the canvas to start drawing
        x, y,
        // actual size of drawn image on canvas
        this.width, this.height
    );
}

function Sequence(){}
Sequence.create = function(frames, loop) {
    var s = new Sequence();
    s.frames = frames;
    s.loop = loop;
    s.last_frame_time = -1;
    s.current_frame = 0;
    return s;
}
$SEQ = Sequence.create;


Sequence.prototype.progress_by = function(n) {
    for (var i = 0;i<n;++i) {
        this.get_next_frame();
    }
}

Sequence.prototype.get_current_frame = function() {
    return this.frames[this.current_frame];
}
Sequence.prototype.get_next_frame = function() {
    var ret = this.frames[this.current_frame];
    var now = Date.now();
    if (now - this.last_frame_time > this.sprite.duration) {
        this.last_frame_time = now;
        if (this.loop || this.current_frame < this.frames.length - 1) {
            this.current_frame++;
            if (this.current_frame == this.frames.length) {
                this.current_frame = 0;
            }
        }
    }
    return ret;
}

Sequence.prototype.get_frame = function(i) {
    if (this.loop) {
        return this.frames[i%this.frames.length];
    } else {
        return this.frames[Math.min(i, this.frames.length-1)];
    }
}
