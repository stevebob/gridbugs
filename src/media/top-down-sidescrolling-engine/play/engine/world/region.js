/*
 * A collection of colliding walls
 */
function Region(segs, drawer, map) {
    this.segs = segs;
    this.drawer = drawer;
    this.neighbours = [];
    this.border_detectors = [];
    this.display_detectors = [];
    this.level_detectors = [];
    this.vertices = [];
    this.map = map;
    this.visible = true;
}

Region.prototype.connect = function(region, segment) {
    var detector = new DetectorSegment(
        segment,
        function(path, agent) {
            agent.enter_region(region);    
        }.bind(this),
        function(path, agent) {
            agent.enter_region(this);
        }.bind(this)
    );

    this.neighbours.push(region);
    this.border_detectors.push(detector);
    region.neighbours.push(this);
    region.border_detectors.push(detector);
}

Region.prototype.border_detect = function(agent) {
    
    var path = agent.last_move_seg();

    this.border_detectors.map(function(d) {
        d.detect(path, agent);    
    });

}

Region.prototype.add_level_detector = function(left, right, segment) {
    this.level_detectors.push(new DetectorSegment(segment, 
        function(path, agent) {
            left.regions.map(function(r){r.visible = false});
            right.regions.map(function(r){r.visible = true});
            agent.enter_level(right);
            this.create_collision_processor();
        }.bind(this),
        function(path, agent) {
            left.regions.map(function(r){r.visible = true});
            right.regions.map(function(r){r.visible = false});
            agent.enter_level(left);
            this.create_collision_processor();
        }.bind(this)
    ));
}

Region.prototype.level_detect = function(agent) {
    var path = agent.last_move_seg();

    this.level_detectors.map(function(d) {
        d.detect(path, agent);
    });
}



Region.prototype.add_display_detector = function(left, right, segment) {
    if (left.constructor != Array) {
        left = [left];
    }
    if (right.constructor != Array) {
        right = [right];
    }

    this.display_detectors.push(new DetectorSegment(segment, 
        function() {
            left.map(function(d){d.group.hide()});
            right.map(function(d){d.group.show()});
            this.create_collision_processor();
            this.create_visibility_context();
        }.bind(this),
        function() {
            left.map(function(d){d.group.show()});
            right.map(function(d){d.group.hide()});
            this.create_collision_processor();
            this.create_visibility_context();
        }.bind(this)
    ));
}

Region.prototype.display_detect = function(agent) {
    var path = agent.last_move_seg();

    this.display_detectors.map(function(d) {
        d.detect(path);
    });
}

Region.prototype.get_segs = function() {
    var segs = this.segs;
    for (var i = 0;i<this.neighbours.length;++i) {
        var nei = this.neighbours[i];
        if (nei.group.visible) {
            segs = segs.concat(nei.segs);
        }
    }
    return segs;
}

Region.prototype.create_collision_processor = function() {
    var segs = this.segs;
    for (var i = 0;i<this.neighbours.length;++i) {
        var nei = this.neighbours[i];
        if (nei.visible) {
            segs = segs.concat(nei.segs);
        }
    }
    
    this.collision_processor = new CollisionProcessor(segs);
}

