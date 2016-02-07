precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_tex_size;
uniform vec2 u_scroll_position;
uniform vec2 u_resolution;

void main() {
    vec2 coord = vec2(gl_FragCoord);
    coord[1] = u_resolution[1] - coord[1];
    coord -= u_scroll_position;

    gl_FragColor = texture2D(u_texture, coord/u_tex_size);
}
