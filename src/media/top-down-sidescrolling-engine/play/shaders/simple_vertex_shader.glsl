precision mediump float;

attribute vec2 a_position;

uniform vec2 u_resolution;
uniform mat3 u_model_view;

void main() {
    vec3 world_pos = u_model_view * vec3(a_position, 1);
    vec2 tex_pos = vec2(world_pos)/u_resolution;
    vec2 pos = (2.0*tex_pos - 1.0) * vec2(1.0, -1.0);
    gl_Position = vec4(pos, 0, 1);
}
