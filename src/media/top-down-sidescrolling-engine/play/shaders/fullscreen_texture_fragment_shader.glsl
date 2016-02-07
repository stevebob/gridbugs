precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;

void main() {
    vec2 coord = vec2(gl_FragCoord);
    gl_FragColor = texture2D(u_texture, coord/u_resolution);
}
