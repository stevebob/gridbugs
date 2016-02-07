var vis;
var scroll;
var circle;
var t;
var drawer;
var game_console;
var agent;
var cu;
var test_texture1;
var test_texture2;
var canvas;
var test_rect;
var scroll_context;
var vtxmgr;
var debug_drawer;

$(function() {

    game_console = new Console(
        document.getElementById("console-input"),
        document.getElementById("console-output"),
        new Echoer()
    );
    game_console.setup_keys();
    $("#console-container").hide();
    $("#info-overlay").hide();

    var fps_stats = new Stats();
    fps_stats.setMode(0);
    fps_stats.domElement.style.position = 'relative';
    fps_stats.domElement.style.float = 'left';
    document.getElementById('info-overlay').appendChild(fps_stats.domElement);
    var ms_stats = new Stats();
    ms_stats.setMode(1);
    ms_stats.domElement.style.position = 'relative';
    document.getElementById('info-overlay').appendChild(ms_stats.domElement);

    Input.set_canvas_offset(parseInt($("#screen").css("left")), parseInt($("#screen").css("top")));
    Input.init();
    
    agent = new Agent([300, 300], 0);
    agent.facing = -Math.PI/2;
    agent.move_speed = 400;

    canvas = document.getElementById('screen');
 
    $(document).resize(function() {
        canvas.width = $(window).width();
        canvas.height = $(window).height();
    });

    canvas.width = $(window).width();
    canvas.height = $(window).height();

    var glm = new WebGLManager(canvas, {preserveDrawingBuffer: true}).init_2d();
    vtxmgr = new WebGLVertexManager(glm);

    debug_drawer = new WebGLDebugDrawer(glm, vtxmgr);
    

    new AsyncGroup(
        new ContentManager(vtxmgr),
        new PhongRenderer(vtxmgr, [canvas.width, canvas.height])
    ).run(function(content, renderer) {
        scroll_context = new ScrollContext([0, 0], 300, [canvas.width, canvas.height]);
        var time_manager = new TimeManager();
        var character = content.characters.warrior.instance('still');

        var map;
        if (true) {
            agent.pos = [800, 800];
            map = content.maps.dungeon1;
            agent.enter_level(map.level_hash['level1']);
            agent.enter_region(map.region_hash['west']);
        } else {
            map = content.maps.small;
            agent.enter_level(map.level_hash['level1']);
            agent.enter_region(map.region_hash['main']);
        }

        console.debug(map);
        renderer.init(map.level_images['level1_floor'], character, scroll_context, agent);
        const WALK = 0;
        const STILL = 1;
        var agent_state = STILL;
        
        function frame() {
            fps_stats.begin();
            ms_stats.begin();

            
            // work out how much time passed since the last frame
            var time_delta = time_manager.get_delta();

            // compute new position of character
            // has_moved will be set to true iff the character moved a non-zero distance
            var has_moved = agent.absolute_control_tick(time_delta);
            
            // update animation state
            if (agent_state == STILL && has_moved) {
                agent_state = WALK;
                character.update('walk', 1, -200);
            } else if (agent_state == WALK && !has_moved) {
                agent_state = STILL;
                character.update('still');
            }


            // switch current region if necessary
            agent.border_detect();

            // show/hide regions if necessary
            agent.level_detect();

            renderer.render_frame();           
            
            // apply the scroll
            scroll_context.proceed();

            // progress the character animation
            character.tick(time_delta);
            

            glm.sync_gpu();
            requestAnimationFrame(frame);

            fps_stats.end();
            ms_stats.end();
        };
        frame();

    }.arr_args());

})
