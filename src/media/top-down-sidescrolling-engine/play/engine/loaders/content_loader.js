function ContentManager(vertex_manager) {
    this.to_load = [];
    this.characters = [];
    this.maps = [];

    for (var name in ContentManager.characters) {
        var c_class = ContentManager.characters[name];
        c_class.inherits_from(Character);
        var c = new c_class();
        this.to_load.push(c);
        this.characters[name] = c;
    }

    for (var name in ContentManager.maps) {
        var m_class = ContentManager.maps[name];
        m_class.inherits_from(Map);
        var m = new m_class();
        this.to_load.push(m);
        this.maps[name] = m;
    }

    this.to_load.map(function(c){c.set_vertex_manager(vertex_manager)});
}

ContentManager.prototype.run = function(then) {
    new AsyncGroup(this.to_load).run(function() {
        then(this);
    }.bind(this));
}
