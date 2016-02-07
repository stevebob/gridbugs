precision mediump float;

varying vec2 v_tex_coord;

uniform sampler2D u_texture;

void main() {
    vec4 colour = texture2D(u_texture, v_tex_coord);
    gl_FragColor = colour;
}
