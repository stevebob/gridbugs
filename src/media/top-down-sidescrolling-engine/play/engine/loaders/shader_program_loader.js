function ShaderProgramLoader(glm, vertex, fragment) {
    this.file_loader = new FileLoader([vertex, fragment]);
    this.glm = glm;
}

ShaderProgramLoader.prototype.run = function(then) {
    this.file_loader.run(function(files) {
        var vertex_source = files[0];
        var fragment_source = files[1];
        var shader_program = this.glm.shader_program(vertex_source, fragment_source);
        then(shader_program);
    }.bind(this));
}

function MultiShaderLoader(glm, files) {
    this.async_group = new AsyncGroup(
        files.map(function(line){return new ShaderProgramLoader(glm, line[0], line[1])})
    );
}

MultiShaderLoader.prototype.run = function(then) {
    this.async_group.run(then);
}
