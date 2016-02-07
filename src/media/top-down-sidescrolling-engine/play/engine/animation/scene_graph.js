function SceneGraph(vertex_manager, m, root_idx, before, after) {
    this.sequence_manager = m;
    this.vertex_manager = vertex_manager;
    this.root = SceneGraph.Node.from_sequence(
        vertex_manager,
        m,
        root_idx,
        SceneGraph.parse(vertex_manager, m, before),
        SceneGraph.parse(vertex_manager, m, after)
    );
        
    this.root.idx = root_idx;
}

SceneGraph.prototype.set_model_view = function(u_model_view) {
    this.model_view = u_model_view;
}

SceneGraph.parse = function(vertex_manager, m, arr) {
    var nodes = [];
    var i = 0;
    while (i < arr.length) {
        var element = arr[i];
        var before_nodes = [];
        var after_nodes = [];
        if (element.constructor == String) {
            var before = arr[i+1];
            var after = arr[i+2];
            if (before && before.constructor == Array) {
                before_nodes = SceneGraph.parse(vertex_manager, m, before);
                ++i;
                if (after && after.constructor == Array) {
                    after_nodes = SceneGraph.parse(vertex_manager, m, after);
                    ++i;
                }
            }
            nodes.push(SceneGraph.Node.from_sequence(vertex_manager, m, element, before_nodes, after_nodes));
        } else if (element.constructor == Object) {
            var connect_idx = element.connect_to;
            var connect_img;
            if (element.with_seq) {
                connect_img = m.g(element.with_seq+'_i');
            } else if (element.with_img) {
                connect_img = new ConstantValue(new ImageWrapper(element.with_img));
            }
            var body_part = m.g(connect_idx+'_t').connect(connect_img);
            nodes.push(SceneGraph.Node.from_body_part(vertex_manager, body_part, [], []));
        }

        ++i;
    }

    return nodes;
}

SceneGraph.Node = function(vertex_manager, image, translate, rotate, scale, pr_translate, pr_rotate, pr_scale, before, after) {
    this.vertex_manager = vertex_manager;
    this.image = image;
    this.translate = translate;
    this.rotate = rotate;
    this.scale = scale;
    this.private_translate = pr_translate;
    this.private_rotate = pr_rotate;
    this.private_scale = pr_scale;
    this.before = before;
    this.after = after;
}

SceneGraph.Node.prototype.draw = function(model_view) {
    var t = this.translate.get_value();
    var r = this.rotate.get_value();
    var s = this.scale.get_value();
    var pt = this.private_translate.get_value();
    var pr = this.private_rotate.get_value();
    var ps = this.private_scale.get_value();

    var vertex_manager = this.vertex_manager;
    vertex_manager.save();

    vertex_manager.translate(t);
    vertex_manager.rotate(r);
    vertex_manager.scale(s);
    
    var before = this.before;
    for (var i = 0,len = before.length;i!=len;++i) {
        before[i].draw(model_view);
    }
  
    
    var i = this.image;
    if (i != undefined) {
        i = i.get_value();
        vertex_manager.save();
        vertex_manager.translate(pt);
        vertex_manager.rotate(pr);
        vertex_manager.scale(ps);
        i.draw_with_model_view(model_view);
        vertex_manager.restore();
    }

    var after = this.after;
    for (var i = 0,len = after.length;i!=len;++i) {
        after[i].draw(model_view);
    }

    vertex_manager.restore();
}

SceneGraph.prototype.draw = function() {
    this.root.draw(this.model_view);
}

SceneGraph.prototype.draw_at = function(translate, rotate, scale) {
    var vertex_manager = this.vertex_manager;
    vertex_manager.save();
    translate && vertex_manager.translate(translate);
    rotate && vertex_manager.rotate(rotate);
    scale && vertex_manager.scale(scale);
    this.root.draw();
    vertex_manager.restore();
}

SceneGraph.Node.from_body_part = function(vertex_manager, b, before, after) {
    return new SceneGraph.Node(
        vertex_manager,
        b.image,
        b.translate,
        b.rotate,
        b.scale,
        b.private_translate,
        b.private_rotate,
        b.private_scale,
        before,
        after
    );
}

SceneGraph.Node.from_sequence = function(vertex_manager, m, idx, before, after) {
    var node = new SceneGraph.Node(
        vertex_manager, 
        m.g(idx+'_i'),
        m.g(idx+'_t'),
        m.g(idx+'_r'),
        m.g(idx+'_s'),
        m.g(idx+'_pt'),
        m.g(idx+'_pr'),
        m.g(idx+'_ps'),
        before,
        after
    );
    node.idx = idx;
    return node;
}
