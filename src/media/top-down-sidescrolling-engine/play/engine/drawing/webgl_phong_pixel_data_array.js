/*
 * Image data encoded in 4 maps.
 * colour:
 *   Each pixel contains the colour of each pixel
 * bump:
 *   R - horizontal angle of normal to surface at pixel
 *   G - vertical angle of normal to surface at pixel
 *   B - height (in pixels) of surface at pixel
 * light:
 *   R - ambient reflection coefficient
 *   G - diffuse reflection coefficient
 *   B - specular reflection coefficient
 * misc:
 *   R - shininess
 *   G - rotate flag
 *   B - (unused)
 *
 * All image arguments must be image objects.
 *
 * The 'drawer' argument should be a Drawer object.
 */

function WebGLDrawer.PhongPixelDataArray = function(colour, bump, light, misc, transform, drawer) {
    WebGLDrawer.Drawable.call(this, transform, drawer);

    this.colour = colour;
    this.bump = bump;
    this.light = light;
    this.misc = misc;

    this.colour_texture = drawer.glm.texture(this.colour);
    this.bump_texture = drawer.glm.texture(this.bump);
    this.light_texture = drawer.glm.texture(this.light);
    this.misc_texture = drawer.glm.texture(this.misc);

    this.size = [this.colour.width, this.colour.height];
}
WebGLDrawer.PhongPixelDataArray.inherits_from(WebGLDrawer.Drawable);

WebGLDrawer.prototype.phong_pixel_data_array = function(colour, bump, light, misc, transform) {
    return new WebGLDrawer.PhongPixelDataArray(colour, bump, light, misc, transform, this);
}
