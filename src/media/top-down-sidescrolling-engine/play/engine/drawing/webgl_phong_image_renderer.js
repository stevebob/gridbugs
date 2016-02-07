function WebGLPhongImageRenderer(glm) {
    WebGLImageRenderer.call(this, glm);
 
    Init.register_async(
        new AsyncGroup(
            new AsyncThenSync(
                new ShaderProgramLoader(
                    'shaders/standard_vertex_shader.glsl',
                    'shaders/standard_fragment_shader.glsl',
                    glm
                ), function(shader_program) {
                    this.basic_shader_program = shader_program;
                }.bind(this)
            ),
            new AsyncThenSync(
                new ShaderProgramLoader(
                    'shaders/standard_vertex_shader.glsl',
                    'shaders/standard_fragment_shader.glsl',
                    glm
                ), function(shader_program) {
                    this.phong_shader_program = shader_program;
                }.bind(this)
            )
        )
    );
}
WebGLPhongImageRenderer.inherits_from(WebGLImageRenderer);

function WebGLPhongImage() {

}

function WebGLPhongFrameBuffer() {

}
