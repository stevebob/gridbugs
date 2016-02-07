function FlatRenderer(vtxmgr, resolution) {
    this.shader_loader = new MultiShaderLoader(vtxmgr.glm, [
            ['shaders/scroll_vertex_shader.glsl', 'shaders/scroll_fragment_shader.glsl'],
            ['shaders/texture_vertex_shader.glsl', 'shaders/texture_fragment_shader.glsl'],
            ['shaders/simple_vertex_shader.glsl', 'shaders/fullscreen_texture_fragment_shader.glsl'],
            ['shaders/simple_vertex_shader.glsl', 'shaders/red_fragment_shader.glsl']
    ]);

    this.resolution = resolution;
    this.glm = vtxmgr.glm;
    this.vtxmgr = vtxmgr;
}

FlatRenderer.Shader = function(shader_program, renderer) {
    this.shader_program = shader_program;
    this.renderer = renderer;
    this.vtxmgr = renderer.vtxmgr;

    shader_program.use();
}

FlatRenderer.Shader.prototype.has_resolution = function() {
    this.resolution = this.shader_program.uniform2fv('u_resolution').set(this.renderer.resolution);
    return this;
}

FlatRenderer.Shader.prototype.has_model_view = function() {
    this.model_view = this.shader_program.uniformMatrix3fv('u_model_view').set(mat3.create());
    return this;
}

FlatRenderer.Shader.prototype.has_texture = function(n) {
    this.texture = this.shader_program.uniform1i('u_texture').set(n);
    return this;
}

FlatRenderer.Shader.prototype.has_texture_size = function(size) {
    this.texture = this.shader_program.uniform2fv('u_tex_size').set(size);
    return this;
}

FlatRenderer.Shader.prototype.has_position_attribute = function() {
    this.position_attribute = this.shader_program.attribute('a_position');
    this.position_attribute.enable();
    this.select_vertex_attribute();
    return this;
}

FlatRenderer.Shader.prototype.has_texture_coordinate_attribute = function() {
    this.texture_coordinate_attribute = this.shader_program.attribute('a_tex_coord');
    this.texture_coordinate_attribute.enable();
    this.select_texture_attribute();
    return this;
}

FlatRenderer.Shader.prototype.select_texture_attribute = function() {
    this.vtxmgr.select_texture_attribute(this.texture_coordinate_attribute);
}
FlatRenderer.Shader.prototype.select_vertex_attribute = function() {
    this.vtxmgr.select_vertex_attribute(this.position_attribute);
}

FlatRenderer.prototype.run = function(then) {
    this.shader_loader.run(function(shaders) {
        this.shaders = shaders;
        then(this);
    }.bind(this));
}

FlatRenderer.prototype.shader = function(shader_program) {
    return new FlatRenderer.Shader(shader_program, this);
}

FlatRenderer.prototype.init = function(floor_images, character, scroll_context, agent) {
    this.floor = this.glm.texture(floor_images[0]);
    
    this.character = character;
    this.scroll_context = scroll_context;
    this.agent = agent;

    // initialize shaders
    this.scroll_shader = this.shader(this.shaders[0])
        .has_resolution()
        .has_texture(1)
        .has_texture_size([floor_images[0].width, floor_images[0].height])
        .has_model_view()
        .has_position_attribute();
    this.scroll_shader.scroll_position = 
        this.scroll_shader.shader_program.uniform2fv('u_scroll_position').set([0, 0]);

    this.texture_shader = this.shader(this.shaders[1])
        .has_resolution()
        .has_texture(2)
        .has_model_view()
        .has_position_attribute()
        .has_texture_coordinate_attribute();
    this.texture_shader.flip_y =
        this.texture_shader.shader_program.uniform1f('u_flip_y').set(-1);

    this.fullscreen_shader = this.shader(this.shaders[2])
        .has_resolution()
        .has_texture(3)
        .has_model_view()
        .has_position_attribute();


    this.fullscreen_rect = this.vtxmgr.rectangle([0, 0], this.resolution);

    this.visible_area = this.vtxmgr.dynamic_radial(128);
    this.visible_area_buffer = new Array(128);

    this.framebuffer = this.glm.framebuffer();
    this.framebuffer_texture = this.glm.texture(this.resolution[0], this.resolution[1]);
    this.framebuffer.bind().texture(this.framebuffer_texture);
    this.framebuffer.unbind();
    this.framebuffer_texture.bind(3);

    this.floor.bind(1);

    character.set_model_view(this.texture_shader.model_view);
    this.character_atlas_texture = this.glm.texture(character.images[0]);
    this.character_atlas_texture.bind(2);

    this.vtxmgr.sync_buffers();


    this.glm.set_clear_colour([0,0,0,1]);
}


FlatRenderer.prototype.render_frame = function() {
    const HALF_PI = Math.PI/2;
    
    var glm = this.glm;
    var vtxmgr = this.vtxmgr;
    

    var rect_ref = new Reference(null);

    var n_points = this.agent.level.visibility_context.visible_polygon(
                        this.agent.pos.v2_floor(), 
                        this.visible_area_buffer,
                        rect_ref
                    );

    this.visible_area.update(this.agent.pos, this.visible_area_buffer, n_points);
    

    glm.clear();

    this.framebuffer.bind();

    this.scroll_shader.shader_program.use();
    this.scroll_shader.select_vertex_attribute();
    this.scroll_shader.scroll_position.set(this.scroll_context.translate);
    this.fullscreen_rect.draw();

    this.texture_shader.shader_program.use();
    this.texture_shader.select_vertex_attribute();
    vtxmgr.save();

    vtxmgr.translate(this.scroll_context.translate);
    vtxmgr.translate(this.agent.pos).rotate(this.agent.facing + HALF_PI);
    this.character.draw();
    this.scroll_context.set_next(vtxmgr.global_centre());

    vtxmgr.restore();

    this.framebuffer.unbind();

    this.fullscreen_shader.shader_program.use();
    vtxmgr.select_dynamic_vertex_attribute(this.fullscreen_shader.position_attribute);
    vtxmgr.save();
    vtxmgr.translate(scroll_context.translate);
    this.visible_area.draw_with_model_view(this.fullscreen_shader.model_view);

    /* debug */
    /*
    var segments = [];
    for (var i = 1;i<n_points;i++) {
        var seg = [this.visible_area_buffer[i-1], this.visible_area_buffer[i]];
        segments.push(seg);
    }
    segments.push([this.visible_area_buffer[n_points-1], this.visible_area_buffer[0]]);

    for (var i = 0;i<segments.length;i++) {
        debug_drawer.draw_line_segment(segments[i], [1,0,0,1], 4);
    }
    */
    //rect_ref.value.draw();

    vtxmgr.restore();
}
