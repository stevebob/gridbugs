function ImageLoader(){}
ImageLoader.load_async = function(src_array, callback) {

    // create a black Image object for each image requested
    var images = src_array.map(function(){return new Image()});

    // this will count the number of images currently loaded
    var num_loaded = 0;
    var increment_num_loaded = function(){num_loaded++};

    // load all the images
    for (var i in images) {
        images[i].onload = increment_num_loaded;
        images[i].src = src_array[i];
    }

    /*
     * Periodically check if the images are loaded, and if they
     * are then call the callback on the array of loaded images.
     */
    var wait = function(period, retries) {
        if (num_loaded == images.length) {
            callback(images);
            return;
        }
        if (retries == 0) {
            console.debug("Image load timed out!");
            return;
        }
        console.log(".");
        setTimeout(wait, period, retries - 1);
    }
    console.log("Loading images");
    wait(100, 100);
}
