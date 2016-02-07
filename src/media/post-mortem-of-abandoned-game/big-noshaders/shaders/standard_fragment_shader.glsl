precision mediump float;

varying vec2 v_tex_coord;

uniform vec4 u_colour;

uniform int u_has_texture;
uniform vec2 u_tex_size;

uniform int u_pixelate;
uniform int u_pixel_size;
uniform float u_pixel_fade;
#define MAX_PIXEL_SIZE 10

uniform int u_blur;
uniform int u_blur_radius;
#define MAX_BLUR_RADIUS 1000

uniform sampler2D u_image;
uniform sampler2D u_bump_map;
uniform sampler2D u_light_map;
uniform sampler2D u_shine_map;

uniform float u_opacity;

uniform bool u_is_light;
uniform vec2 u_light_pos;
uniform float u_light_radius;
uniform vec4 u_light_colour;

uniform vec2 u_resolution;
uniform float u_flip_y;

uniform bool u_phong;

uniform vec2 u_mouse;

vec4 phong_pix(sampler2D texture_image, sampler2D bump_map, 
               sampler2D light_map, sampler2D shine_map, vec2 texture_coordinate);

void main() {

    if (u_phong) {
        
        gl_FragColor = phong_pix(u_image, u_bump_map, u_light_map, u_shine_map, v_tex_coord);


    } else if (u_has_texture == 1) {

        vec2 screen_coord = v_tex_coord * u_tex_size;
        vec2 pixel_size = vec2(1,1)/u_tex_size;
        
        if (u_pixelate == 1) {
 
            // the dimension of a real pixel in texture coordinate units
            vec2 real_pixel_size = vec2(1,1)/u_tex_size;
            
            // the dimension of a virtual pixel in texture coordinate units
            vec2 virtual_pixel_size = real_pixel_size * float(u_pixel_size);

            /* Round off the texture coordinate to the nearest virtual pixel size.
             * This is the texture coordinate of the top left pixel of the virtual pixel.
             */
            vec2 virtual_pixel_top_left = v_tex_coord - mod(v_tex_coord, virtual_pixel_size);

            vec4 total_colour = vec4(0,0,0,0);
            // loop over all the real pixels in the virtual pixel
            for (int i = 0;i<MAX_PIXEL_SIZE;++i) {
                if (i == u_pixel_size) {
                    break;
                }
                float tex_coord_x = virtual_pixel_top_left[0] + real_pixel_size[0] * float(i);
                for (int j = 0;j<MAX_PIXEL_SIZE;++j) {
                    if (j == u_pixel_size) {
                        break;
                    }
                    float tex_coord_y = virtual_pixel_top_left[1] + real_pixel_size[1] * float(j);
                    vec4 real_pixel_colour = texture2D(u_image, vec2(tex_coord_x, tex_coord_y));
                    total_colour += real_pixel_colour;
                }
            }

            vec4 colour = total_colour / float(u_pixel_size * u_pixel_size);
            gl_FragColor = colour;
        } else if (u_blur == 1) {
            vec4 sum = vec4(0,0,0,0);
            for (int i = 0;i<MAX_BLUR_RADIUS;++i) {
                int _i = i - u_blur_radius;
                if (_i >= u_blur_radius) {
                    break;
                }
                for (int j = 0;j<MAX_BLUR_RADIUS;++j) {
                    int _j = j - u_blur_radius;
                    if (_j >= u_blur_radius) {
                        break;
                    }
                    sum += texture2D(u_image, (screen_coord + vec2(_i, _j))*pixel_size );
                }
            }
            gl_FragColor = sum/float(u_blur_radius*u_blur_radius*4);
        } else if (u_is_light) {
            vec2 pos;
            if (u_flip_y == 1.0) {
                pos = vec2(gl_FragCoord[0], gl_FragCoord[1]);
            } else {
                pos = vec2(gl_FragCoord[0], u_resolution[1]-gl_FragCoord[1]);
            }
            vec4 colour = texture2D(u_image, screen_coord / u_tex_size) * u_opacity;
            float dist_to_light = distance(pos, u_light_pos);
            float light_dist_mult = 1.0 - min(1.0, dist_to_light / u_light_radius);
            colour[3] *= light_dist_mult;
            gl_FragColor = colour * u_light_colour;
            
        } else {
            vec4 colour = texture2D(u_image, screen_coord / u_tex_size)*u_opacity;
            if (colour[3] == 0.0) {
                gl_FragColor = colour;
            } else {
                gl_FragColor = colour;
            }
        }
    
    } else {
        gl_FragColor = u_colour * u_opacity;
    }
}

#define HORIZONTAL_ANGLE 0
#define VERTICAL_ANGLE 1
#define PIXEL_HEIGHT 2

#define GET_PIXEL_HEIGHT(bump_map_pix) bump_map_pix[2]*256.0

#define AMBIENT_COEF 0
#define DIFFUSE_COEF 1
#define SPECULAR_COEF 2

#define SHINE_EXPONENT 0

#define PI 3.141592653589793
#define TWO_PI 6.283185307179586
#define HALF_PI 1.5707963267948966

vec3 bump_map_to_normal(vec4 bump_map_pix) {
    float theta = bump_map_pix[0] * TWO_PI;
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

vec4 phong_pix(sampler2D texture_image, sampler2D bump_map, 
               sampler2D light_map, sampler2D shine_map, vec2 texture_coordinate) {

    vec4 texture_image_pix = texture2D(texture_image, texture_coordinate);
    vec4 bump_map_pix = texture2D(bump_map, texture_coordinate);
    vec4 light_map_pix = texture2D(light_map, texture_coordinate);
    vec4 shine_map_pix = texture2D(shine_map, texture_coordinate);

    vec3 pix_point = vec3(vec2(gl_FragCoord), bump_map_pix[PIXEL_HEIGHT]*256.0);
    
    vec3 light_pos = vec3(u_mouse, 200.0);
    vec3 eye_pos = vec3(u_resolution, 200.0);

    vec3 normal = normalize(bump_map_to_normal(bump_map_pix));
    vec3 to_light = normalize(light_pos - pix_point);
    float diffuse = max(dot(to_light, normal), 0.0);
    vec3 reflection = normalize(refl(normal, to_light));
    vec3 to_eye = normalize(eye_pos - pix_point);

    float specular;
    if (diffuse > 0.0) {
        specular = pow(max(dot(reflection, to_eye), 0.0), 1.0+shine_map_pix[SHINE_EXPONENT]*256.0);
    } else {
        specular = 0.0;
    }

    vec4 pix_colour =
        texture_image_pix * light_map_pix[1] * diffuse;
            (light_map_pix[AMBIENT_COEF] +       // ambient light
            diffuse*light_map_pix[DIFFUSE_COEF]) // diffuse light
         + vec4(specular, specular, specular, 1)*
            light_map_pix[SPECULAR_COEF];       // specular light
    
    pix_colour[3] = 1.0;

    return pix_colour;
}
