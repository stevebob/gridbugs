WebGLDrawer.AbstractImage = function() {

}

WebGLDrawer.require_shaders = function(cl, vertex_shader, fragment_shader) {
    Init.register_async(
        new AsyncThenSync(
            new FileLoader([vertex_shader, fragment_shader]), function(shaders) {
                cl.vertex_shader_string = shaders[0];
                cl.fragment_shader_string = shaders[1];


            }
        )
    );
}

WebGLDrawer.image_types = [];

WebGLDrawer.register_image_type = function(cl) {
    WebGLDrawer.image_types
}
