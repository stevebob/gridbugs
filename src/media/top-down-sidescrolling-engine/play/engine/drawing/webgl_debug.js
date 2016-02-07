function WebGLDebugDrawer(glm, vertex_manager) {
    this.glm = glm;
    this.vertex_manager = vertex_manager;

    this.index_buffer = this.glm.element_buffer();
    this.dynamic_vertex_buffer = this.glm.array_buffer(2).bind().allocate_dynamic(32);

    this.index_buffer.add([0, 1]);

    this.index_buffer.bind().upload_static();

    var vs_src = [
        'precision mediump float;',
        'attribute vec2 a_position;',
        'uniform vec2 u_resolution;',
        'uniform mat3 u_model_view;',
        'void main() {',
        '   vec2 scaled_pos = vec2(u_model_view*vec3(a_position, 1))/u_resolution;',
        '   vec2 pos = (2.0*scaled_pos-1.0)*vec2(1.0, -1.0);',
        '   gl_Position = vec4(pos, 0, 1);',
        '}'
    ].join('\n');

    var fs_src = [
        'precision mediump float;',
        'uniform vec4 u_colour;',
        'void main() {',
        '   gl_FragColor = u_colour;',
        '}'
    ].join('\n');

    this.shader_program = glm.shader_program(vs_src, fs_src).use();
    this.u_colour = this.shader_program.uniform4fv('u_colour');
    this.u_resolution = this.shader_program.uniform2fv('u_resolution').
        set([glm.canvas.width, glm.canvas.height]);
    this.u_model_view = this.shader_program.uniformMatrix3fv('u_model_view');
    this.a_position = this.shader_program.attribute('a_position');
    this.a_position.enable();
    this.a_position.set(this.dynamic_vertex_buffer);

    this.line_segment_slice = this.glm.slice(0, 2);
}

WebGLDebugDrawer.prototype.draw_line_segment = function(seg, colour, width) {
    this.shader_program.use();
    colour = colour || [0,0,0,1];
    width = width != undefined ? width : 4;

    this.u_colour.set(colour);
    this.u_model_view.set(this.vertex_manager.mv_transform);

    this.glm.line_width(width);

    this.dynamic_vertex_buffer.update(0, [
        seg[0][0], seg[0][1], seg[1][0], seg[1][1]
    ]);

    this.line_segment_slice.draw_lines();
}

WebGLDebugDrawer.prototype.coloured_rectangle = function(position, size, colour, transform) {
    return new WebGLDebugDrawer.ColouredRectangle(position, size, colour, transform, this);
}
WebGLDebugDrawer.ColouredRectangle = function(position, size, colour, transform, debug_drawer) {
    WebGLVertexManager.Rectangle.call(this, position, size, transform, debug_drawer.vertex_manager);
    this.colour = colour;
    this.debug_drawer = debug_drawer;
}
WebGLDebugDrawer.ColouredRectangle.inherits_from(WebGLVertexManager.Rectangle);

WebGLDebugDrawer.ColouredRectangle.prototype.draw = function() {
    this.debug_drawer.shader_program.use();
    this.debug_drawer.a_position.set(this.debug_drawer.vertex_manager.vertex_buffer);

    this.debug_drawer.u_model_view.set(this.vertex_manager.mv_transform);
    this.debug_drawer.u_colour.set(this.colour);

    this.slice.draw_triangles();
}
