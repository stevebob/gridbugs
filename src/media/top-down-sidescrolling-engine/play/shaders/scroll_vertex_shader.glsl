precision mediump float;

attribute vec2 a_position;

uniform vec2 u_resolution;

void main() {
    vec2 tex_pos = vec2(a_position)/u_resolution;
    vec2 pos = (2.0*tex_pos - 1.0);
    gl_Position = vec4(pos, 0, 1);
}
