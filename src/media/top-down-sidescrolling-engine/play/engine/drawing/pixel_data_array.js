/*
 * An interface for images drawable in a particular way.
 */

function PixelDataArray() {}

/*
 * Draws the image in its way.
 */
PixelDataArray.prototype.draw = function(){throw 'unimplemented'}

/*
 * Returns a PixelDataArrayCapture implementation that can record drawing
 * of this type of image.
 */
PixelDataArray.prototype.create_capture = function() {throw 'unimplemented'}

/*
 * An interface for objects that can record the drawing of images
 * which can be drawn in a particular way.
 */
function PixelDataArrayCapture() {}
PixelDataArrayCapture.inherits_from(PixelDataArray);

PixelDataArrayCapture.prototype.clear = function() {throw 'unimplemented'}
PixelDataArrayCapture.prototype.draw = function() {throw 'unimplemented'}
