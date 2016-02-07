function PhongRenderer(vtxmgr, resolution) {
    this.shader_loader = new MultiShaderLoader(vtxmgr.glm, [
            ['shaders/scroll_vertex_shader.glsl', 'shaders/scroll_fragment_shader.glsl'],
            ['shaders/texture_vertex_shader.glsl', 'shaders/texture_fragment_shader.glsl'],
            ['shaders/simple_vertex_shader.glsl', 'shaders/fullscreen_texture_fragment_shader.glsl'],
            ['shaders/simple_vertex_shader.glsl', 'shaders/fullscreen_phong_fragment_shader.glsl'],
            ['shaders/simple_vertex_shader.glsl', 'shaders/red_fragment_shader.glsl']
    ]);

    this.resolution = resolution;
    this.glm = vtxmgr.glm;
    this.vtxmgr = vtxmgr;
}

PhongRenderer.Shader = function(shader_program, renderer) {
    this.shader_program = shader_program;
    this.renderer = renderer;
    this.vtxmgr = renderer.vtxmgr;

    shader_program.use();
}

PhongRenderer.Shader.prototype.has_resolution = function() {
    this.resolution = this.shader_program.uniform2fv('u_resolution').set(this.renderer.resolution);
    return this;
}

PhongRenderer.Shader.prototype.has_model_view = function() {
    this.model_view = this.shader_program.uniformMatrix3fv('u_model_view').set(mat3.create());
    return this;
}

PhongRenderer.Shader.prototype.has_texture = function(n) {
    this.texture = this.shader_program.uniform1i('u_texture').set(n);
    return this;
}

PhongRenderer.Shader.prototype.has_texture_size = function(size) {
    this.texture_size = this.shader_program.uniform2fv('u_tex_size').set(size);
    return this;
}

PhongRenderer.Shader.prototype.has_position_attribute = function() {
    this.position_attribute = this.shader_program.attribute('a_position');
    this.position_attribute.enable();
    this.select_vertex_attribute();
    return this;
}

PhongRenderer.Shader.prototype.has_texture_coordinate_attribute = function() {
    this.texture_coordinate_attribute = this.shader_program.attribute('a_tex_coord');
    this.texture_coordinate_attribute.enable();
    this.select_texture_attribute();
    return this;
}

PhongRenderer.Shader.prototype.select_texture_attribute = function() {
    this.vtxmgr.select_texture_attribute(this.texture_coordinate_attribute);
}
PhongRenderer.Shader.prototype.select_vertex_attribute = function() {
    this.vtxmgr.select_vertex_attribute(this.position_attribute);
}

PhongRenderer.prototype.run = function(then) {
    this.shader_loader.run(function(shaders) {
        this.shaders = shaders;
        then(this);
    }.bind(this));
}

PhongRenderer.prototype.shader = function(shader_program) {
    return new PhongRenderer.Shader(shader_program, this);
}

PhongRenderer.prototype.init = function(map_images, character, scroll_context, agent) {

    
    this.character = character;
    this.scroll_context = scroll_context;
    this.agent = agent;

    // initialize shaders
    this.scroll_shader = this.shader(this.shaders[0])
        .has_resolution()
        .has_texture(1)
        .has_texture_size([map_images[0].width, map_images[0].height])
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

    this.phong_shader = this.shader(this.shaders[3])
        .has_resolution()
        .has_model_view()
        .has_position_attribute();

    this.red_shader = this.shader(this.shaders[4])
        .has_resolution()
        .has_model_view()
        .has_position_attribute();

    this.phong_shader.image = this.phong_shader.shader_program.uniform1i('u_image');
    this.phong_shader.light_map = this.phong_shader.shader_program.uniform1i('u_light_map');
    this.phong_shader.bump_map = this.phong_shader.shader_program.uniform1i('u_bump_map');
    this.phong_shader.misc_map = this.phong_shader.shader_program.uniform1i('u_misc_map');
    this.phong_shader.light_position = this.phong_shader.shader_program.uniform2fv('u_light_position');
    this.phong_shader.rotation_offset = this.phong_shader.shader_program.uniform1f('u_rotation_offset');


    this.fullscreen_rect = this.vtxmgr.rectangle([0, 0], this.resolution);

    this.lights = this.agent.level.lights.map(function(l) {return this.light(l)}.bind(this));
    
    this.visible_area = this.vtxmgr.dynamic_radial(128);
    this.visible_area_buffer = new Array(128);


    this.framebuffer_image = this.glm.framebuffer();
    this.framebuffer_bump = this.glm.framebuffer();
    this.framebuffer_light = this.glm.framebuffer();
    this.framebuffer_misc = this.glm.framebuffer();
    
    this.framebuffer_image_tex = this.glm.texture(this.resolution[0], this.resolution[1]);
    this.framebuffer_bump_tex = this.glm.texture(this.resolution[0], this.resolution[1]);
    this.framebuffer_light_tex = this.glm.texture(this.resolution[0], this.resolution[1]);
    this.framebuffer_misc_tex = this.glm.texture(this.resolution[0], this.resolution[1]);

    this.framebuffer_image.bind().texture(this.framebuffer_image_tex).unbind();
    this.framebuffer_bump.bind().texture(this.framebuffer_bump_tex).unbind();
    this.framebuffer_light.bind().texture(this.framebuffer_light_tex).unbind();
    this.framebuffer_misc.bind().texture(this.framebuffer_misc_tex).unbind();
    
    this.framebuffer_image_tex.bind(3);

    this.map_image = this.glm.texture(map_images[0]);
    this.map_bump = this.glm.texture(map_images[1]);
    this.map_light = this.glm.texture(map_images[2]);
    this.map_misc = this.glm.texture(map_images[3]);
    
    this.map_image.bind(1);

    character.set_model_view(this.texture_shader.model_view);
    this.character_atlas_image = this.glm.texture(character.images[0]);
    this.character_atlas_bump = this.glm.texture(character.images[1]);
    this.character_atlas_light = this.glm.texture(character.images[2]);
    this.character_atlas_misc = this.glm.texture(character.images[3]);

    this.character_atlas_image.bind(2);



    this.glm.set_clear_colour([0,0,0,1]);
    
//    var rect_ref = new Reference(null);
    
    var n_points = this.agent.level.visibility_context.visible_polygon(
                        this.agent.pos.v2_floor(), 
                        this.visible_area_buffer
//                        rect_ref
                    );
    

    this.visible_area.update(this.agent.pos, this.visible_area_buffer, n_points);

    console.debug(this.lights[0].lit_area);
    console.debug(this.lights[1].lit_area);
    //console.debug(this.visible_area);
 
    this.vtxmgr.sync_buffers();
}

PhongRenderer.Light = function(light, renderer) {
    this.renderer = renderer;
    this.light = light;
    this.lit_area = renderer.vtxmgr.dynamic_radial(512);
    var lit_area_buffer = [];
    var n_points = this.light.visibility_context.visible_polygon(
                                this.light.position,
                                lit_area_buffer
    );

    console.debug(lit_area_buffer);

    this.lit_area.update(this.light.position, lit_area_buffer, n_points);
}
PhongRenderer.prototype.light = function(light) {
    return new PhongRenderer.Light(light, this);
}

PhongRenderer.prototype.render_frame = function() {


    const HALF_PI = Math.PI/2;
    
    var glm = this.glm;
    var vtxmgr = this.vtxmgr;
    
    
    var n_points = this.agent.level.visibility_context.visible_polygon(
                        this.agent.pos.v2_floor(), 
                        this.visible_area_buffer
                    );
    
    this.visible_area.update(this.agent.pos, this.visible_area_buffer, n_points);

    glm.clear();

    this.map_image.bind(1);
    this.map_bump.bind(2);
    this.map_light.bind(3);
    this.map_misc.bind(4);


    this.scroll_shader.shader_program.use();
    this.scroll_shader.select_vertex_attribute();
    this.scroll_shader.scroll_position.set(this.scroll_context.translate);

    // render background into framebuffers
    this.framebuffer_image.bind();
    this.scroll_shader.texture.set(1);
    this.fullscreen_rect.draw();

    this.framebuffer_bump.bind();
    this.scroll_shader.texture.set(2);
    this.fullscreen_rect.draw();

    this.framebuffer_light.bind();
    this.scroll_shader.texture.set(3);
    this.fullscreen_rect.draw();
    
    this.framebuffer_misc.bind();
    this.scroll_shader.texture.set(4);
    this.fullscreen_rect.draw();

    this.texture_shader.shader_program.use();
    this.texture_shader.select_vertex_attribute();
    vtxmgr.save();

    vtxmgr.translate(this.scroll_context.translate);
    vtxmgr.translate(this.agent.pos).rotate(this.agent.facing + HALF_PI);

    // render character into framebuffers
    this.character_atlas_image.bind(1);
    this.character_atlas_bump.bind(2);
    this.character_atlas_light.bind(3);
    this.character_atlas_misc.bind(4);
    
    this.framebuffer_image.bind();
    this.texture_shader.texture.set(1);
    this.character.draw();
    
    this.framebuffer_bump.bind();
    this.texture_shader.texture.set(2);
    this.character.draw();
    
    this.framebuffer_light.bind();
    this.texture_shader.texture.set(3);
    this.character.draw();
    
    this.framebuffer_misc.bind();
    this.texture_shader.texture.set(4);
    this.character.draw();
    
    var character_screen_position = vtxmgr.global_centre();
    this.scroll_context.set_next(character_screen_position);

    vtxmgr.restore();

    this.framebuffer_image.unbind();

    this.framebuffer_image_tex.bind(1);
    this.framebuffer_bump_tex.bind(2);
    this.framebuffer_light_tex.bind(3);
    this.framebuffer_misc_tex.bind(4);

/*
    this.red_shader.shader_program.use();
    this.red_shader.select_vertex_attribute();
    vtxmgr.select_dynamic_vertex_attribute(this.red_shader.position_attribute);
    */
    
    
    this.phong_shader.shader_program.use();
    
    this.phong_shader.image.set(1);
    this.phong_shader.bump_map.set(2);
    this.phong_shader.light_map.set(3);
    this.phong_shader.misc_map.set(4);

    this.phong_shader.light_position.set([character_screen_position[0], this.resolution[1]-character_screen_position[1]]);
    this.phong_shader.rotation_offset.set(-HALF_PI-this.agent.facing);
    vtxmgr.select_dynamic_vertex_attribute(this.phong_shader.position_attribute);
    
    vtxmgr.save();
    vtxmgr.translate(scroll_context.translate);

    
    this.visible_area.draw_with_model_view(this.phong_shader.model_view);
//    this.red_shader.shader_program.use();
//    this.red_shader.select_vertex_attribute();
//    vtxmgr.select_dynamic_vertex_attribute(this.red_shader.position_attribute);
    this.lights[0].lit_area.draw_with_model_view(this.phong_shader.model_view);
//    this.lights[1].lit_area.slice.offset = 2280 + 144*2;
//    this.lights[1].lit_area.slice.length = 12;
    this.lights[1].lit_area.draw_with_model_view(this.phong_shader.model_view);

    /* debugging */
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
    /* end debugging */

    vtxmgr.restore();

}
