function CanvasUtil(){
    this.strokestyle_stack = [];
    this.linewidth_stack = [];
    this.fillstyle_stack = [];
}
CanvasUtil.prototype.register_canvas = function(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
}

CanvasUtil.prototype.push_fillstyle = function(style) {
    this.fillstyle_stack.push(this.ctx.fillStyle);
    this.ctx.fillStyle = style;
}

CanvasUtil.prototype.pop_fillstyle = function() {
    this.ctx.fillStyle = this.fillstyle_stack.pop();
}
CanvasUtil.prototype.push_strokestyle = function(style) {
    this.strokestyle_stack.push(this.ctx.strokeStyle);
    this.ctx.strokeStyle = style;
}

CanvasUtil.prototype.pop_strokestyle = function() {
    this.ctx.strokeStyle = this.strokestyle_stack.pop();
}

CanvasUtil.prototype.push_linewidth = function(width) {
    this.linewidth_stack.push(this.ctx.lineWidth);
    this.ctx.lineWidth = width;
}

CanvasUtil.prototype.pop_linewidth = function() {
    this.ctx.lineWidth = this.linewidth_stack.pop();
}

CanvasUtil.prototype.circle = function(centre, radius, filled, colour, width) {
    filled = default_value(filled, false);
    colour = default_value(colour, "black");
    width = default_value(width, 1);

    if (filled) {
        this.push_fillstyle(colour);
    } else {
        this.push_linewidth(width);
        this.push_strokestyle(colour);
    }

    this.ctx.beginPath();
    var _this = this;
    element_call(function(x, y){_this.ctx.arc(x, y, radius, 0, Math.PI*2)}, centre);

    if (filled) {
        this.ctx.fill();
        this.pop_fillstyle();
    } else {
        this.ctx.stroke();
        this.pop_linewidth();
        this.pop_strokestyle();
    }
}

CanvasUtil.prototype.move_to = function(pos) {
    this.ctx.moveTo(pos[0], pos[1]);
}
CanvasUtil.prototype.line_to = function(pos) {
    this.ctx.lineTo(pos[0], pos[1]);
}

CanvasUtil.prototype.line_at_angle = function(start, angle, length) {
    this.ctx.beginPath();
    var end = numeric['+'](numeric['*'](length, angle_to_unit_vector(angle)), start);
    this.move_to(start);
    this.line_to(end);
    this.ctx.stroke();
}

CanvasUtil.prototype.clear = function(col) {
    if (col) {
        this.push_fillstyle(col);
        this.ctx.beginPath();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fill();
        this.pop_fillstyle();
    } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

CanvasUtil.prototype.draw_point = function(pt) {
    const size = 4;
    this.ctx.beginPath();
    this.ctx.fillRect(pt[0] - size/2, pt[1] - size/2, size, size);
    this.ctx.fill();
}

CanvasUtil.prototype.draw_segment = function(segment) {
    this.ctx.beginPath();
    this.move_to(segment[0]);
    this.line_to(segment[1]);
    this.ctx.stroke();
}
