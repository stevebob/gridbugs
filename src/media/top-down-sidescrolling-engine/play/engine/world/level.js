function Level(vertex_manager, regions, visible_segs, images) {
    this.vertex_manager = vertex_manager;
    this.regions = regions;
    this.visibility_context = VisibilityContext.from_segs(
        visible_segs,
        []
    );
    this.lights = [];
    this.images = images;
}

Level.prototype.add_light = function(position, radius, colour) {
    var light = new Light(this.visibility_context, position);
    this.lights.push(light);
}

Level.prototype.update_lights = function() {
    this.lights.map(function(l){l.update()});
}

Level.prototype.draw_floor = function() {
    this.floor.draw();
}
Level.prototype.draw_floor_flat = function(level) {
    this.floor.draw_flat(level);
}
