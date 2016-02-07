precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_bump_map;
uniform sampler2D u_light_map;
uniform sampler2D u_misc_map;

uniform vec2 u_resolution;

uniform vec2 u_light_position;

uniform float u_rotation_offset;

const float light_height = 100.0;
const float eye_height = 400.0;


#define HORIZONTAL_ANGLE 0
#define VERTICAL_ANGLE 1
#define PIXEL_HEIGHT 2

#define GET_PIXEL_HEIGHT(bump_map_pix) bump_map_pix[2]*256.0

#define AMBIENT_COEF 0
#define DIFFUSE_COEF 1
#define SPECULAR_COEF 2

#define SHINE_EXPONENT 0
#define USE_ROTATION_OFFSET 1

#define PI 3.141592653589793
#define TWO_PI 6.283185307179586
#define HALF_PI 1.5707963267948966


vec3 bump_map_to_normal(vec4 bump_map_pix, float rotation_offset) {
    float theta = bump_map_pix[0] * TWO_PI + rotation_offset;
    float phi = (1.0 - bump_map_pix[1]) * HALF_PI;

    float z = sin(phi);
    float base_len = cos(phi);

    float x = base_len * cos(theta);
    float y = base_len * sin(theta);

    return vec3(x,y,z);
}

vec3 refl(vec3 norm, vec3 to_light) {
    return 2.0*(dot(to_light, norm))*norm - to_light;
}


void main() {
    vec2 tex_coord = vec2(gl_FragCoord)/u_resolution;

    vec4 image_pix = texture2D(u_image, tex_coord);
    vec4 bump_map_pix = texture2D(u_bump_map, tex_coord);
    vec4 light_map_pix = texture2D(u_light_map, tex_coord);
    vec4 misc_map_pix = texture2D(u_misc_map, tex_coord);

    vec3 pix_point = vec3(vec2(gl_FragCoord), bump_map_pix[PIXEL_HEIGHT]*256.0);
    vec3 light_pos = vec3(u_light_position, light_height);
    vec3 eye_pos = vec3(u_resolution/2.0, eye_height);

    float rotation_offset = u_rotation_offset * misc_map_pix[USE_ROTATION_OFFSET];
    
    vec3 normal = normalize(bump_map_to_normal(bump_map_pix, rotation_offset));
    vec3 to_light = normalize(light_pos - pix_point);
    float diffuse = max(dot(to_light, normal), 0.0);
    vec3 reflection = normalize(refl(normal, to_light));
    vec3 to_eye = normalize(eye_pos - pix_point);
    
    float specular;
    if (diffuse > 0.0) {
        specular = pow(max(dot(reflection, to_eye), 0.0), 1.0+(misc_map_pix[SHINE_EXPONENT]*255.0));
    } else {
        specular = 0.0;
    }
    
    vec4 pix_colour =
        image_pix * 
         
         
     /*    (light_map_pix[AMBIENT_COEF] +  */     // ambient light
          2.0*diffuse*light_map_pix[DIFFUSE_COEF] // diffuse light
         + vec4(specular, specular, specular, 1)*
           light_map_pix[SPECULAR_COEF];       // specular light
    /*
    return vec4(
        0.0*light_map_pix[AMBIENT_COEF] + diffuse * light_map_pix[DIFFUSE_COEF] * 0.5,
        specular * light_map_pix[SPECULAR_COEF],
        0, 1
    );
    */

    pix_colour[3] = 1.0;

    gl_FragColor = pix_colour;
}

