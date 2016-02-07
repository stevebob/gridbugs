function SpacialHashTable(cell_size, dimensions) {
    this.cell_size = cell_size;
    this.cell_width = cell_size[0];
    this.cell_height = cell_size[1];

    this.dimensions = dimensions;

    this.dimensions_cells = [Math.ceil(dimensions[0]/cell_size[0]), Math.ceil(dimensions[1]/cell_size[1])];
    this.width_cells = this.dimensions_cells[0];
    this.height_cells = this.dimensions_cells[1];

    this.length = this.dimensions_cells[0]*this.dimensions_cells[1];
    this.arr = new Array(this.length);
    
    for (var j = 0;j<this.width_cells;j++) {
        for (var i = 0;i<this.height_cells;i++) {
            this.arr[this.get_index(i, j)] = this.create_entry(null, i, j);
        }
    }
}

SpacialHashTable.prototype.create_entry = function(value, i, j) {
    return new SpacialHashTable.Entry(value, i, j, this);
}

SpacialHashTable.Entry = function(value, i, j, sh) {
    this.spacial_hash_table = sh;
    this.value = value;
    this.i_index = i;
    this.j_index = j;
    this.index = this.spacial_hash_table.get_index(i, j);
    var top_left = [i*sh.cell_width, j*sh.cell_height];
    this.vertices = [
        top_left,
        top_left.v2_add([sh.cell_width, 0]),
        top_left.v2_add([sh.cell_width, sh.cell_height]),
        top_left.v2_add([0, sh.cell_height])
    ];
    this.segments = [
        [this.vertices[0], this.vertices[1]],
        [this.vertices[1], this.vertices[2]],
        [this.vertices[2], this.vertices[3]],
        [this.vertices[3], this.vertices[0]]
    ];
}

SpacialHashTable.Entry.prototype.set = function(v) {
    this.value = v;
}

SpacialHashTable.prototype.loop_indices = function(f) {
    for (var i = 0;i<this.height_cells;i++) {
        for (var j = 0;j<this.width_cells;j++) {
            f(j, i);
        }
    }
}

SpacialHashTable.prototype.loop_vertices = function(f) {
    for (var i = 0;i<this.height_cells;i++) {
        for (var j = 0;j<this.width_cells;j++) {
            f(this.arr[this.get_index(j, i)].vertices);
        }
    }
}

SpacialHashTable.prototype.loop_segments = function(f) {
    for (var i = 0;i<this.height_cells;i++) {
        for (var j = 0;j<this.width_cells;j++) {
            f(this.arr[this.get_index(j, i)].segments);
        }
    }
}

SpacialHashTable.prototype.loop_entries = function(f) {
    for (var i = 0;i<this.height_cells;i++) {
        for (var j = 0;j<this.width_cells;j++) {
            f(this.arr[this.get_index(j, i)]);
        }
    }
}


SpacialHashTable.prototype.position_to_index = function(x, y) {
    return this.get_index(Math.floor(x/this.cell_width), Math.floor(y/this.cell_height));
}
SpacialHashTable.prototype.get_index = function(i, j) {
    return i + j * this.width_cells;
}

SpacialHashTable.prototype.put_idx_1d = function(i, val) {
    this.arr[i].value = val;
}

SpacialHashTable.prototype.get_idx_1d = function(i) {
    return this.arr[i].value;
}

SpacialHashTable.prototype.get_v2 = function(v) {
    return this.get(v[0], v[1]);
}

SpacialHashTable.prototype.put_v2 = function(v, val) {
    this.put(v[0], v[1], val);
}

SpacialHashTable.prototype.get = function(x, y) {
    return this.get_idx_1d(this.position_to_index(x, y));
}

SpacialHashTable.prototype.put = function(x, y, val) {
    this.put_idx_1d(this.position_to_index(x, y), val);
}

SpacialHashTable.prototype.get_idx = function(i, j) {
    return this.get_idx_1d(this.get_index(i, j));
}

SpacialHashTable.prototype.put_idx = function(i, j, val) {
    this.put_idx_1d(this.get_index(i, j), val);
}
