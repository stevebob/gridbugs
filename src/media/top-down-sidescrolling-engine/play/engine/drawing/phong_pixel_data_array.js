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

function PhongPixelDataArray(colour, bump, light, misc, drawer) {
    
}
