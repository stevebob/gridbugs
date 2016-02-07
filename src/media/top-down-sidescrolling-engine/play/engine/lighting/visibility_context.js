function VisibilityContext(vertices, segs) {
    this.vertices = vertices;
    this.segs = segs;

    /* debug */
    var cell_size = [500, 500];
    this.spacial_hash = new SpacialHashTable(cell_size, [4000, 4000]);
    this.spacial_hash.loop_indices(function(i, j) {
        this.spacial_hash.put_idx(i, j, debug_drawer.coloured_rectangle([i*cell_size[0], j*cell_size[1]], cell_size, [0,0,1,0,0.05]));
    }.bind(this));

    console.log("Number of vertices: " + vertices.length);

//    this.compute_visible_vertex_hash();
    
}

VisibilityContext.prototype.compute_vertex_segment_table = function() {
    var vertex_segment_table = new Array(this.vertices.length);
    for (var i = 0,vlen = this.vertices.length;i<vlen;i++) {
        vertex_segment_table[i] = new Array(this.segs.length);
    }

    for (var i = 0,vlen = this.vertices.length;i<vlen;i++) {
        for (var j = 0,slen = this.segs.length;j<slen;j++) {
            vertex_segment_table[i][j] = new VisibilityContext.VertexSegmentTableEntry(this.vertices[i], this.segs[j]);
        }
    }

    this.vertex_segment_table = vertex_segment_table;
}

VisibilityContext.VertexState = function(vertex) {
    this.visibility = VisibilityContext.VertexState.VISIBLE;
    this.segments_to_check = null;
}
VisibilityContext.VertexState.VISIBLE = 'visible';
VisibilityContext.VertexState.HIDDEN = 'hidden';
VisibilityContext.VertexState.RUNTIME = 'runtime';

VisibilityContext.VertexState.prototype.set_hidden = function() {
    this.visibility = VisibilityContext.VertexState.HIDDEN;
    this.segments_to_check = null;
}

VisibilityContext.VertexState.prototype.set_runtime = function() {
    this.visibility = VisibilityContext.VertexState.RUNTIME;
    if (this.segments_to_check == null) {
        this.segments_to_check = [];
    }
}

VisibilityContext.VertexState.prototype.is_visible = function() {
    return this.visibility == VisibilityContext.VertexState.VISIBLE;
}

VisibilityContext.VertexState.prototype.is_runtime = function() {
    return this.visibility == VisibilityContext.VertexState.RUNTIME;
}

VisibilityContext.VertexState.prototype.get_runtime_checks = function() {
    return this.segments_to_check;
}

VisibilityContext.VertexState.prototype.add_runtime_check = function(segment) {
    this.segments_to_check.push(segment);
}

VisibilityContext.VertexState.prototype.toString = function() {
    return this.visibility;
}

VisibilityContext.RuntimeVertexCheck = function(vertex, segments) {
    this.vertex = vertex;
    this.segments = segments;
}

VisibilityContext.CellData = function(vc, spacial_hash_table_entry) {
    this.visibility_context = vc;
    this.vertex_states = new Array(vc.vertices.length);
    for (var i = 0;i<vc.vertices.length;i++) {
        this.vertex_states[i] = new VisibilityContext.VertexState(vc.vertices[i]);
    }
    this.spacial_hash_table_entry = spacial_hash_table_entry;

    this.visible_vertices = [];
    this.runtime_vertices = [];

    var entry = spacial_hash_table_entry;
    var table = spacial_hash_table_entry.spacial_hash_table;
    this.rect = debug_drawer.coloured_rectangle(
        [entry.i_index*table.cell_size[0], entry.j_index*table.cell_size[1]], table.cell_size, [0,0,1,0.6]
    );

}

VisibilityContext.CellData.prototype.get_vertex_state = function(idx) {
    return this.vertex_states[idx];
}
VisibilityContext.CellData.prototype.set_vertex_state = function(idx, state) {
    this.vertex_states[idx].visibility = state;
}

VisibilityContext.CellData.prototype.generate_lists = function() {
    for (var i = 0;i<this.vertex_states.length;i++) {
        if (this.vertex_states[i].is_visible()) {
            this.visible_vertices.push(this.visibility_context.vertices[i]);
        } else if (this.vertex_states[i].is_runtime()) {
            this.runtime_vertices.push(new VisibilityContext.RuntimeVertexCheck(
                this.visibility_context.vertices[i],
                this.vertex_states[i].get_runtime_checks()
            ));
        }
    }
}

VisibilityContext.CellData.prototype.draw = function() {
    this.rect.draw();
}

VisibilityContext.prototype.compute_visible_vertex_hash = function() {
    this.compute_vertex_segment_table();
    var count = 0;
    this.spacial_hash.loop_entries(function(spacial_hash_table_entry) {
        
        var data = new VisibilityContext.CellData(this, spacial_hash_table_entry);

        for (var i = 0,ilen=this.vertex_segment_table.length;i<ilen;i++) {
            var vertex_segments = this.vertex_segment_table[i];
            var cell_vertex_state = data.vertex_states[i];
            for (var j = 0,jlen=vertex_segments.length;j<jlen;j++) {
                var vertex_segment_table_entry = vertex_segments[j];
                
                // check if the spacial hash table cell is contained in the obscured area
                if (vertex_segment_table_entry.obscured_area.contains_all_points(
                        spacial_hash_table_entry.vertices)) {
                    
                    // the current vertex is entirely hidden by the current segment
                    data.get_vertex_state(i).set_hidden();

                    // there's no point looking at any more segments since you can't see the vertex anyway
                    break;
                    
                }

                // check if the spacial hash table cell overlaps the obscured area
                if (vertex_segment_table_entry.obscured_area.intersects_any_segment(
                        spacial_hash_table_entry.segments)) {
                        
                    var segment = this.segs[j];
                    var state = data.get_vertex_state(i);
                    state.set_runtime();
                    state.add_runtime_check(segment);

                    
                }
            }
        }

        data.generate_lists();
        spacial_hash_table_entry.set(data);

        console.log("Computing cell #" + spacial_hash_table_entry.index + "("+data.visible_vertices.length+", "+data.runtime_vertices.length+")");
    }.bind(this));

}

VisibilityContext.VertexSegmentTableEntry = function(vertex, segment) {
    this.vertex = vertex;
    this.segment = segment;
    this.obscured_area = this.create_obscured_area(vertex, segment);
}

VisibilityContext.VertexSegmentTableEntry.prototype.create_obscured_area = function(vertex, segment) {
    if (vertex.pos.v2_equals(segment[0]) || vertex.pos.v2_equals(segment[1])) {
        return new VisibilityContext.NothingObscured();
    } else {
        return new VisibilityContext.ObscuredQuad(vertex, segment);
    }
}

VisibilityContext.ObscuredArea = function(){}

VisibilityContext.ObscuredArea.prototype.contains_all_points = function(pts) {
    return pts.map(function(p) {
        return this.contains_point(p)
    }.bind(this)).reduce(function(b, acc) {
        return b && acc;
    }, true);
}

VisibilityContext.ObscuredArea.prototype.intersects_any_segment = function(segs) {
    return segs.map(function(s) {
        return this.intersects_segment(s);
    }.bind(this)).reduce(function(b, acc) {
        return b || acc;
    }, false);
}

VisibilityContext.ObscuredQuad = function(vertex, segment) {
    const QUAD_LENGTH = 20000;
    var far_points = segment.map(function(v) {
        return v.v2_sub(vertex.pos).v2_to_length(QUAD_LENGTH).v2_add(v)
    });

    this.points = [segment[0], segment[1], far_points[1], far_points[0]];

    this.segments = [
        [segment[0], segment[1]],
        [segment[1], far_points[1]],
        [far_points[1], far_points[0]],
        [far_points[0], segment[0]]
    ];
}
VisibilityContext.ObscuredQuad.inherits_from(
    VisibilityContext.ObscuredArea
);

VisibilityContext.ObscuredQuad.prototype.contains_point = function(p) {
    return this.points.polygon_contains(p);
}

VisibilityContext.ObscuredQuad.prototype.intersects_segment = function(s) {
    for (var i = 0;i<this.segments.length;i++) {
        if (this.segments[i].seg_intersects(s)) {
            return true;
        }
    }

    return false;
}

VisibilityContext.ObscuredQuad.prototype.draw = function() {
    this.segments.map(function(s){debug_drawer.draw_line_segment(s, [0,1,0,1], 4)});
}

VisibilityContext.NothingObscured = function() {
}
VisibilityContext.NothingObscured.inherits_from(
    VisibilityContext.ObscuredArea
);

VisibilityContext.NothingObscured.prototype.draw = function(){}
VisibilityContext.NothingObscured.prototype.contains_point = function(p) {
    return false;
}
VisibilityContext.NothingObscured.prototype.intersects_segment = function(s) {
    return false;
}

VisibilityContext.from_regions = function(regions, extra) {
    var segs = [];
    for (var i = 0;i<regions.length;i++) {
        segs = segs.concat(regions[i].segs);
    }
    return VisibilityContext.from_segs(segs, extra);
}

VisibilityContext.from_segs = function(segs, extra) {
    var all_segs = segs.concat(extra);
    var vertices = Vertex.vertices_from_segs(all_segs);
    return new VisibilityContext(vertices, all_segs);
}

VisibilityContext.LARGE_NUMBER = 10000;
VisibilityContext.TOLERANCE = 0.01;
VisibilityContext.LOW_TOLERANCE = 0.0001;

VisibilityContext.prototype.vertex_by_position = function(pos) {
    for (var i = 0;i<this.vertices.length;i++) {
        if (this.vertices[i].pos.v2_close(pos, VisibilityContext.TOLERANCE)) {
            return this.vertices[i];
        }
    }
    return null;
}

VisibilityContext.prototype.non_intersecting_vertices_ = function(eye) {
    
    var cell_data = this.spacial_hash.get_v2(eye);

    var ret = cell_data.visible_vertices.slice();

    //console.debug(cell_data.visible_vertices.length + ", " + cell_data.runtime_vertices.length);

    var runtime_vertices = cell_data.runtime_vertices;
    for (var i = 0,ilen=runtime_vertices.length;i<ilen;i++) {
        var runtime_check = runtime_vertices[i];
        var vertex = runtime_check.vertex;
        
        var segments = runtime_check.segments;
        //var segments = this.segs;
        
        var eye_to_vertex_seg = [eye, vertex.pos];
        var intersects = false;
        for (var j = 0,jlen=segments.length;j<jlen;j++) {
            var segment = segments[j];
            var intersection = eye_to_vertex_seg.seg_to_line().line_intersection(segment.seg_to_line());

            if (intersection == null) {
                continue;
            }

            var seg_ratio = segment.seg_aligned_ratio(intersection);
            if (seg_ratio < 0 || seg_ratio > 1) {
                continue;
            }

            var ray_ratio = eye_to_vertex_seg.seg_aligned_ratio(intersection);

            if (ray_ratio > 0 && ray_ratio < (1-VisibilityContext.TOLERANCE)) {
                intersects = true;
                break;
            }
        
        }

        if (!intersects) {
            ret.push(vertex);
        }
    }

    //console.debug(ret);

    return ret;
}

VisibilityContext.prototype.non_intersecting_vertices = function(eye) {
    
    var vertices = this.vertices;
    var segs = this.segs;
    var ret = [];
    var ret_idx = 0;
    var ray = new Array(2);
    for (var i = 0,len=vertices.length;i<len;++i) {
        var vertex = vertices[i];
        ray[0] = eye;
        ray[1] = vertex.pos;

        var hits_seg = false;
        for (var j = 0,slen = segs.length;j<slen;j++) {
            var seg = segs[j];
            var intersection = ray.seg_to_line().line_intersection(seg.seg_to_line());

            if (intersection == null) {
                continue;
            }

           
            var seg_ratio = seg.seg_aligned_ratio(intersection);
            if (seg_ratio < 0 || seg_ratio > 1) {
                continue;
            }
 
            // if the interesction was anywhere on the ray except right at the end
            var ray_ratio = ray.seg_aligned_ratio(intersection);

            if (ray_ratio > 0 && ray_ratio < (1 - VisibilityContext.TOLERANCE)) {
                hits_seg = true;
                break
            }
            
        }
        if (!hits_seg) {
            ret[ret_idx++] = vertex;
        }
    }
    return ret;
}

VisibilityContext.prototype.closest_ray_intersection = function(ray, side_mask) {
    var min_distance = ray.seg_length();
    var closest = ray[0].v2_add(ray.seg_direction().v2_to_length(VisibilityContext.LARGE_NUMBER));
    var segs = this.segs;
    var hint = null;
    
    for (var i = 0,slen = segs.length;i<slen;i++) {
        var seg = segs[i];
        var intersection = ray.seg_to_line().line_intersection(seg.seg_to_line());


        // lines were parallel so no intersection
        if (intersection == null) {
            continue;
        }
 
        // intersection did not occur within the line segment      
        var seg_ratio = seg.seg_aligned_ratio(intersection);

        if (seg_ratio > 1 || seg_ratio < 0) {
            continue;
        }
        
        var vertex = this.vertex_by_position(intersection);
        
        var intersection_occured = false;
        if (vertex == null) {
            intersection_occured = true;
        } else {
            var connected_sides = this.connected_sides(ray, vertex);
            intersection_occured = (connected_sides[0]||side_mask[0])&&(connected_sides[1]||side_mask[1]);
            
       }

        if (intersection_occured) {
            var ray_ratio = ray.seg_aligned_ratio(intersection);
            if (ray_ratio > 0) {
                var dist = ray[0].v2_dist(intersection);
                if (dist < ray[0].v2_dist(closest)) {
                    closest = intersection;
                    if (vertex == null) {
                        hint = seg;
                    } else {
                        hint = vertex;
                    }
                }
            }
        }

        
    }
    return [closest, hint];
}

VisibilityContext.prototype.connected_sides = function(ray, vertex) {
    /* check if all the connected points to this vertex are all on one side
     * of the ray
     */
    var radial_vector = ray.seg_direction();
    var ray_norm = radial_vector.v2_norm();
    var neighbours = vertex.neighbours;
    var left = false;
    var right = false;
    for (var i = 0,nlen = neighbours.length;i<nlen;i++) {
        var v_to_nei = neighbours[i].v2_sub(vertex.pos);
        var dot = ray_norm.v2_dot(v_to_nei);
        if (dot < -VisibilityContext.LOW_TOLERANCE) {
            left = true;
        } else if (dot > VisibilityContext.LOW_TOLERANCE) {
            right = true;
        }
        // if dot == 0 it's not on either side
    }

    return [left, right];
}

VisibilityContext.prototype.connected_points_on_both_sides = function(ray, vertex) {
    var sides = this.connected_sides(ray, vertex);
    return sides[0] && sides[1];
}

VisibilityContext.prototype.visible_polygon = function(eye, points, rect_ref) {
    if (rect_ref) {
        rect_ref.value = this.spacial_hash.get_v2(eye);
    }
    
    // quadratic 10ms on macbook air
    var vertices = this.non_intersecting_vertices(eye);

    var indices = Array.range(0, vertices.length);

    var radial_vectors = vertices.map(function(v) {
        return v.pos.v2_sub(eye);
    });
    
    var angles = radial_vectors.map(function(v) {
        return v.v2_angle();
    });

    indices.sort(function(i, j) {
        return angles[i] - angles[j];
    });

//    var points = [];

    var segs = this.segs;

    var last_hint = null;

    // used to determine if there are multiple consecutive aligned vertices
    var last_radial_vector = null; 


    // rotate indices so indices[0] refers to a vertex connecetd on both sides
    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var vertex = vertices[idx];
        var ray = [eye, vertex.pos];

        if (this.connected_points_on_both_sides(ray, vertex)) {
            indices = indices.rotate(i);
            break;
        }
    }
  
    var points_idx = 0;

    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var vertex = vertices[idx];
        var ray = [eye, vertex.pos];

        var radial_vector = radial_vectors[i];

        var connected_sides = this.connected_sides(ray, vertex);
        if (connected_sides[0] && connected_sides[1]) {
            points[points_idx++] = [ray[1][0], ray[1][1], 0];
            last_hint = vertex;
        } else {

            /* the ray hit the side of a corner, so we continue it until
             * it hits something more substantial (either a segment edge
             * or the front of a corner
             */
            var closest_intersection = this.closest_ray_intersection(ray, connected_sides);
            var intersection_point = closest_intersection[0];
            
            /* the hint is used by the next vertex when determining the order
             * to insert points into the points array in the case where
             * the ray hits the side of a corner (ie. this case)
             */
            var hint = closest_intersection[1];

            /* Use the last hint to determine the order to insert points.
             * The choice is between the "near" point, which is the vertex
             * whose side was glanced by the ray, and the "far" point,
             * which is the point where the extended ray hits something.
             *
             * If the last hint is a segment, the last ray also glanced a vertex,
             * and was extended to collide with that segment. The first point
             * to insert is a point on that segment.
             *
             * If the last hint is a vertex, either the last ray hit that
             * vertex directly, or it glanced a different vertex and eventually
             * hit this vertex. In either case, the first point should be a
             * point between the hint vertex and one of its neighbours.
             */
            var near_first = true;
            if (last_hint && last_hint.constructor == Vertex) {
                if (last_hint.between_any_neighbour(ray[1], VisibilityContext.TOLERANCE)) {
                    near_first = true;
                } else if (last_hint.between_any_neighbour(intersection_point, VisibilityContext.TOLERANCE)) {
                    near_first = false;
                } else {
                    
                    console.debug(last_hint);
                    console.debug(ray[1]);
                    console.debug(intersection_point);
                    console.debug('error vertex');
                    console.debug(agent.pos);
                    
                }
            } else if (last_hint) {
               if (last_hint.seg_nearly_contains(ray[1], VisibilityContext.TOLERANCE)) {
                    near_first = true;
               } else if (last_hint.seg_nearly_contains(intersection_point, VisibilityContext.TOLERANCE)) {
                    near_first = false;
               } else {
                    console.debug(last_hint);
                    console.debug(ray[1]);
                    console.debug(intersection_point);
                    console.debug('error segment');
                    console.debug('pos', agent.pos);
               }
            }

            if (near_first) {
                points[points_idx++] = [ray[1][0], ray[1][1], 1];
                points[points_idx++] = [intersection_point[0], intersection_point[1], 1];
                last_hint = hint;
            } else {
                points[points_idx++] = [intersection_point[0], intersection_point[1], 1];
                points[points_idx++] = [ray[1][0], ray[1][1], 1];
                last_hint = vertex;
            }
         
        }
        
    }
    
    return points_idx;
}


VisibilityContext.prototype.visible_polygon2 = function(eye, points, rect_ref) {
    rect_ref.value = this.spacial_hash.get_v2(eye);
    
    // quadratic
    var vertices = this.non_intersecting_vertices(eye);

    var indices = Array.range(0, vertices.length);

    var radial_vectors = vertices.map(function(v) {
        return v.pos.v2_sub(eye);
    });
    
    var angles = radial_vectors.map(function(v) {
        return v.v2_angle();
    });

    indices.sort(function(i, j) {
        return angles[i] - angles[j];
    });

//    var points = [];

    var segs = this.segs;

    var last_hint = null;

    // used to determine if there are multiple consecutive aligned vertices
    var last_radial_vector = null; 


    // rotate indices so indices[0] refers to a vertex connecetd on both sides
    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var vertex = vertices[idx];
        var ray = [eye, vertex.pos];

        if (this.connected_points_on_both_sides(ray, vertex)) {
            indices = indices.rotate(i);
            break;
        }
    }
  
    var points_idx = 0;
    //console.debug(indices.map(function(i){return [eye, vertices[i].pos]}));

    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var vertex = vertices[idx];
        var ray = [eye, vertex.pos];

        var radial_vector = radial_vectors[i];

        var connected_sides = this.connected_sides(ray, vertex);
        if (connected_sides[0] && connected_sides[1]) {
            points[points_idx++] = [ray[1][0], ray[1][1], 0];
            last_hint = vertex;
        } else {

            /* the ray hit the side of a corner, so we continue it until
             * it hits something more substantial (either a segment edge
             * or the front of a corner
             */
            var closest_intersection = this.closest_ray_intersection(ray, connected_sides);
            var intersection_point = closest_intersection[0];
            
            /* the hint is used by the next vertex when determining the order
             * to insert points into the points array in the case where
             * the ray hits the side of a corner (ie. this case)
             */
            var hint = closest_intersection[1];

            /* Use the last hint to determine the order to insert points.
             * The choice is between the "near" point, which is the vertex
             * whose side was glanced by the ray, and the "far" point,
             * which is the point where the extended ray hits something.
             *
             * If the last hint is a segment, the last ray also glanced a vertex,
             * and was extended to collide with that segment. The first point
             * to insert is a point on that segment.
             *
             * If the last hint is a vertex, either the last ray hit that
             * vertex directly, or it glanced a different vertex and eventually
             * hit this vertex. In either case, the first point should be a
             * point between the hint vertex and one of its neighbours.
             */
            var near_first = true;
            if (last_hint && last_hint.constructor == Vertex) {
                if (last_hint.between_any_neighbour(ray[1], VisibilityContext.TOLERANCE)) {
                    near_first = true;
                } else if (last_hint.between_any_neighbour(intersection_point, VisibilityContext.TOLERANCE)) {
                    near_first = false;
                } else {
                    
                    console.debug(last_hint);
                    console.debug(ray[1]);
                    console.debug(intersection_point);
                    console.debug('error vertex');
                    console.debug(agent.pos);
                    
                }
            } else if (last_hint) {
               if (last_hint.seg_nearly_contains(ray[1], VisibilityContext.TOLERANCE)) {
                    near_first = true;
               } else if (last_hint.seg_nearly_contains(intersection_point, VisibilityContext.TOLERANCE)) {
                    near_first = false;
               } else {
                    console.debug(last_hint);
                    console.debug(ray[1]);
                    console.debug(intersection_point);
                    console.debug('error segment');
                    console.debug('pos', agent.pos);
               }
            }

            if (near_first) {
                points[points_idx++] = [ray[1][0], ray[1][1], 1];
                points[points_idx++] = [intersection_point[0], intersection_point[1], 1];
                last_hint = hint;
            } else {
                points[points_idx++] = [intersection_point[0], intersection_point[1], 1];
                points[points_idx++] = [ray[1][0], ray[1][1], 1];
                last_hint = vertex;
            }
         
        }
        
    }
    
    return points_idx;
}
