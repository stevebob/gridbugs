function WebGLVertexManager(glm, stack_size) {
    this.glm = glm;
    
    // initialize static buffers
    this.vertex_buffer = this.glm.array_buffer(2);
    this.index_buffer = this.glm.element_buffer();
    this.texture_buffer = this.glm.array_buffer(2);

    // initialize dynamic buffers and allocate memory
    this.dynamic_vertex_buffer = this.glm.array_buffer(2).bind().allocate_dynamic(8192);

    TransformStack.call(this, stack_size);
}
WebGLVertexManager.inherits_from(TransformStack);

// add a vertex at 0, 0 to use when drawing points
WebGLVertexManager.prototype.init_presets = function() {
    this.vertex_buffer.add([0,0]);
    this.texture_buffer.add([0,0]);
    this.index_buffer.add([0]);

    this.point_slice = this.glm.slice(0, 1);
}

WebGLVertexManager.prototype.sync_buffers = function() {
    this.vertex_buffer.bind().upload_static();
    this.texture_buffer.bind().upload_static();
    this.index_buffer.bind().upload_static();
}

WebGLVertexManager.prototype.select_vertex_attribute = function(attr) {
    attr.set(this.vertex_buffer);
}
WebGLVertexManager.prototype.select_texture_attribute = function(attr) {
    attr.set(this.texture_buffer);
}
WebGLVertexManager.prototype.select_dynamic_vertex_attribute = function(attr) {
    attr.set(this.dynamic_vertex_buffer);
}

WebGLVertexManager.Drawable = function(transform, vertex_manager) {
    // this line allows this class to be instantiated as a prototype
    if (!vertex_manager) {return}

    this.vertex_manager = vertex_manager;

    Transformable.call(this, transform);
}
WebGLVertexManager.Drawable.inherits_from(Transformable);


/* 
 * returns the index of the first vertex of this drawable
 * suitable for insertion into the index buffer
 */
WebGLVertexManager.Drawable.prototype.vertex_index_base = function() {
    /* halved since in the index buffer, each index refers to
     * a pair of numbers (which form one vertex)
     */
    return this.vertex_manager.vertex_buffer.data.length/2;
}

/*
 * returns the index of the first index of this drawable
 * in the index buffer. Suitable for finding the index argument
 * to draw_triangles
 */
WebGLVertexManager.Drawable.prototype.index_index_base = function() {
    /* doubled as this is a byte address, and each index
     * is represented with 2 bytes
     */
    return this.vertex_manager.index_buffer.data.length*2;
}

/*
 * Inserts values into the index buffer, first adding the
 * vertex index base.
 */
WebGLVertexManager.Drawable.prototype.insert_indices = function(idxs) {
    idxs = Array.array_or_arguments(idxs, arguments);
    
    var i_offset = this.index_index_base();
    
    var v_offset = this.vertex_index_base();
    this.vertex_manager.index_buffer.add(
        idxs.map(function(i){return i + v_offset})
    );

    this.slice = this.vertex_manager.glm.slice(i_offset, idxs.length);
}


/*
 * Inserts an array of numbers into the vertex buffer
 */
WebGLVertexManager.Drawable.prototype.insert_vertices = function(vs) {
    vs = Array.array_or_arguments(vs, arguments);
    this.vertex_manager.vertex_buffer.add(vs);
}

/*
 * Inserts an array of numbers into the texture coord buffer
 */
WebGLVertexManager.Drawable.prototype.insert_texture_coords = function(vs) {
    vs = Array.array_or_arguments(vs, arguments);
    this.vertex_manager.texture_buffer.add(vs);
}

/* Draws applying the static local transform first. */
WebGLVertexManager.Drawable.prototype.draw_with_static_transform = function(u_model_view) {
    var vtxmgr = this.vertex_manager;
    
    vtxmgr.save();
    
    var base_mv_transform = vtxmgr.mv_transform;
    mat3.multiply(base_mv_transform, base_mv_transform, this.mv_transform);
    u_model_view.set(base_mv_transform);
    
//    vtxmgr.index_buffer.bind();
    
    this.slice.draw_triangles();

    vtxmgr.restore();
}

/* Draws ignoring the static local transform,
 * saving some computation. Use this when the local
 * transform is the identity.
 */
WebGLVertexManager.Drawable.prototype.draw_with_model_view = function(u_model_view) {
    var vtxmgr = this.vertex_manager;

    u_model_view.set(vtxmgr.mv_transform);

//    vtxmgr.index_buffer.bind();

    this.slice.draw_triangles();
}

WebGLVertexManager.Drawable.prototype.draw = function() {
//    this.vertex_manager.index_buffer.bind();
    this.slice.draw_triangles();
}

WebGLVertexManager.Drawable.prototype.insert_rectangle_indices = function() {
    this.insert_indices(0, 1, 2, 0, 2, 3);
}

WebGLVertexManager.Drawable.prototype.insert_rectangle_vertices = function(position, size) {
    this.insert_vertices(
        position[0], position[1],
        position[0] + size[0], position[1],
        position[0] + size[0], position[1] + size[1],
        position[0], position[1] + size[1]
    );
}

WebGLVertexManager.Drawable.prototype.insert_rectangle_texture_coords = function(position, size) {
    this.insert_texture_coords(
        position[0], position[1],
        position[0] + size[0], position[1],
        position[0] + size[0], position[1] + size[1],
        position[0], position[1] + size[1]
    );
}


WebGLVertexManager.prototype.rectangle = function(position, size, transform) {
    return new WebGLVertexManager.Rectangle(position, size, transform, this);
}
WebGLVertexManager.Rectangle = function(position, size, transform, vertex_manager) {
    WebGLVertexManager.Drawable.call(this, transform, vertex_manager);
    
    if (!vertex_manager) {return}

    this.insert_rectangle_indices();
    this.insert_rectangle_vertices(position, size);
    this.insert_rectangle_texture_coords([0, 0], [1, 1]);
}
WebGLVertexManager.Rectangle.inherits_from(WebGLVertexManager.Drawable);



WebGLVertexManager.prototype.atlas_range = function(position, size, atlas_size, atlas_range_offset, atlas_range_size, transform) {
    return new WebGLVertexManager.AtlasRange(position, size, atlas_size, atlas_range_offset, atlas_range_size, transform, this);
}
WebGLVertexManager.AtlasRange = function(position, size, atlas_size, atlas_range_offset, atlas_range_size, transform, vertex_manager) {
    WebGLVertexManager.Drawable.call(this, transform, vertex_manager);

    this.position = position;
    this.size = size;
    this.atlas_size = atlas_size;
    this.atlas_range_offset = atlas_range_offset;
    this.atlas_range_size = atlas_range_size;

    this.insert_rectangle_indices();
    this.insert_rectangle_vertices(position, size);
    
    this.insert_rectangle_texture_coords(
        [atlas_range_offset[0]/atlas_size[0], atlas_range_offset[1]/atlas_size[1]], 
        [atlas_range_size[0]/atlas_size[0], atlas_range_size[1]/atlas_size[1]]
    );
    
    
}
WebGLVertexManager.AtlasRange.inherits_from(WebGLVertexManager.Drawable);

WebGLVertexManager.AtlasRange.prototype.clone = function() {
    return this.vertex_manager.atlas_range(
        this.position,
        this.size,
        this.atlas_size,
        this.atlas_range_offset,
        this.atlas_range_size,
        this.clone_transform()
    );
}

WebGLVertexManager.AtlasRange.prototype.clone_flip_x = function() {
    return this.vertex_manager.atlas_range(
        this.position.v2_mult([-1, 1]),
        this.size.v2_mult([-1, 1]),
        this.atlas_size,
        this.atlas_range_offset,
        this.atlas_range_size,
        this.clone_transform()
    );
}

WebGLVertexManager.prototype.dynamic_radial = function(buffer_size, transform) {
    return new WebGLVertexManager.DynamicRadial(buffer_size, transform, this);
}
WebGLVertexManager.DynamicRadial = function(buffer_size, transform, vertex_manager) {
    WebGLVertexManager.Drawable.call(this, transform, vertex_manager);
    
    this.vertex_offset = this.vertex_manager.dynamic_vertex_buffer.data.length;
    this.vertex_index_offset = this.vertex_offset/2;
    this.slice = vertex_manager.glm.slice(this.index_index_base(), 0);
        

    // allocate dedicated memory from the vertex buffer
    vertex_manager.dynamic_vertex_buffer.allocate(buffer_size);

    var indices = [];
    for (var i = 0;i<buffer_size/2;i++) {
        indices.push(this.vertex_index_offset);
        indices.push(this.vertex_index_offset + i + 1);
        indices.push(this.vertex_index_offset + i + 2);
    }

    vertex_manager.index_buffer.add(indices);

    this.vertex_array = new Array(buffer_size);
}
WebGLVertexManager.DynamicRadial.inherits_from(WebGLVertexManager.Drawable);

WebGLVertexManager.DynamicRadial.prototype.update = function(centre, points, n_points) {

    var vertex_manager = this.vertex_manager;
    var vertex_array = this.vertex_array;

    vertex_array[0] = centre[0];
    vertex_array[1] = centre[1];
    
    var j = 2;
    for (var i = 0;i<n_points;i++) {
        vertex_array[j++] = points[i][0];
        vertex_array[j++] = points[i][1];
    }
    vertex_array[j++] = points[0][0];
    vertex_array[j++] = points[0][1];

    /* multiply the offset by 4 as this requires a byte address and the vertex buffer
     * contains 4-byte floating point entries.
     */
    vertex_manager.dynamic_vertex_buffer.bind().update(this.vertex_offset*4, vertex_array);
    this.slice.set_length(n_points * 3);

}
