function Grapher(ctx) {
    this.ctx = ctx;
    this.x_min = 0;
    this.width = ctx.canvas.width;
    this.y_min = 0;
    this.height = ctx.canvas.height;
}

Grapher.prototype.set_range = function(x_min, y_min, width, height) {
    this.x_min = x_min;
    this.y_min = y_min;
    this.width = width;
    this.height = height;
}

Grapher.prototype.border = function() {
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "black";
    this.ctx.beginPath();
    this.ctx.strokeRect(this.x_min, this.y_min, this.width, this.height);
    this.ctx.stroke();
}

Grapher.prototype.clear = function() {
    this.ctx.clearRect(this.x_min, this.y_min, this.width, this.height);
}

Grapher.prototype.draw_x_axis = function() {
    var y_mid = this.y_min + this.height / 2;
    console.log(y_mid);
    this.ctx.beginPath();
    this.ctx.moveTo(this.x_min, y_mid);
    this.ctx.lineTo(this.x_min + this.width, y_mid);
    this.ctx.stroke();
}

Grapher.prototype.graph_data = function(data, y_scale, y_offset, colour, width, len) {
    len = len == undefined ? data.length : len;
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = colour;
    var y_mid = this.y_min + this.height / 2;
    var x_step = this.width / data.length;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x_min, y_mid);
    for (var i in data) {
        var scaled = y_mid -  data[i]  *y_scale + y_offset;
        this.ctx.lineTo( i*x_step * data.length / len, scaled);
    }
    this.ctx.stroke();
}

Grapher.prototype.graph_data_with_scaling = function(data, y_scale, x_scale) {
    var y_mid = this.y_min + this.height / 2;
    var x_step = this.width / data.length;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x_min, y_mid);
    for (var i in data) {
        var y_scaled = y_mid - y_scale(data[i]);
        var x_scaled = x_scale(i)*x_step;
        this.ctx.lineTo(x_scaled, y_scaled);
    }
    this.ctx.stroke();
}

