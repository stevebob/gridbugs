const MOVE_DIST = 5;
const TOP_DIST = 30;
const BOTTOM_DIST = 30;

const SPEED = 4;

function Player(y) {
    this.y = y;
}

$(function() {
 
    $('#death').hide();

    var score = 0;

    var cu = new CanvasUtil();
    cu.register_canvas($("#screen")[0]);

    var control = start_mic();
    
    cu.canvas.width = $(window).width();
    cu.canvas.height = $(window).height();

    ImageLoader.load_async(
        _.range(1, 13).map(function(x){return 'images/n'+x+'.png'}).concat(
        _.range(1, 6) .map(function(x){return 'images/b'+x+'.png'}).concat(
        ['images/skyline.png']).concat(
        ['images/g1.png', 'images/g2.png', 'images/c1.png']
    )), function(images) {
    
        var nyan = $SPR();
        for (var i = 0;i<12;++i) {
            nyan.a(i, images[i]);
        }
        nyan.add_sequence("move", _.range(0, 11), true);
        nyan.current_sequence = "move";
        nyan.set_fps(30);

        const max_coins = 20;
        var coins = [];
        function create_coin() {
            var coin = $SPR();
            coin.a(0, images[20]);
            coin.add_sequence('a', [0], true);
            coin.current_sequence = 'a';
            coin.set_fps(30);
            coin.x = -60;
            coin.y = Math.floor(Math.random()*(cu.canvas.height - 60));
            return coin;
        }

        function add_coin() {
            for (var i = 0;i<max_coins;i++) {
                if (coins[i] == undefined) {
                    coins[i] = create_coin();
                    return;
                }
            }
        }

        function create_star() {
            var star_sprite = $SPR();
            for (var i = 0;i<5;++i) {
                star_sprite.a(i, images[i+12]);
            }
            var seq = _.range(0, 5);
            star_sprite.add_sequence("flash", seq, true);
            star_sprite.current_sequence = "flash";
            star_sprite.set_fps(10);
            return star_sprite;
        }
        
        function create_ghost() {
            var ghost = $SPR();
            ghost.a(0, images[18]);
            ghost.a(1, images[19]);
            ghost.add_sequence("move", _.range(0, 2), true);
            ghost.current_sequence = "move";
            ghost.set_fps(30);
            ghost.x = 0;
            ghost.y = Math.floor(Math.random()*(cu.canvas.height - 60));
            return ghost;
        }

        var ghosts = [];
        for (var i = 0;i<4;++i) {
            var g = create_ghost();
            g.x = (-i*cu.canvas.width/4) - 50;
            ghosts.push(g);
        }

        function move_ghosts() {
            for (var i = 0;i<4;++i) {
                var g = ghosts[i];
                g.x += SPEED;
                if (g.x > cu.canvas.width) {
                    g.x = -50;
                    g.y = Math.floor(Math.random()*(cu.canvas.height - 60));
                }
            }
        }

        function draw_ghosts(move) {
            for (var i in ghosts) {
                var g = ghosts[i];
                g.draw_current(cu.ctx, g.x, g.y);
                if (move) {
                    g.progress();
                }
            }
        }

        function create_stars() {
            var stars = [];
            for (var i = 0;i<50;++i) {
                var star = create_star();
                star.set_frame_no(Math.floor(Math.random()*5));
                stars.push({sprite: star, x: Math.floor(Math.random()*$(window).width()), y: Math.floor(Math.random()*$(window).height())});
            }

            return stars;
        }

        function draw_stars(stars, move) {
            for (var i in stars) {
                stars[i].sprite.draw_current(cu.ctx, stars[i].x, stars[i].y);
                if (move) {
                    stars[i].x+=2;
                    stars[i].sprite.progress();
                    if (stars[i].sprite.get_frame_no() == 0 && move) {
                        stars[i].x = Math.floor(Math.random()*$(window).width());
                        stars[i].y = Math.floor(Math.random()*$(window).height());
                    }
                }
            }
        }

        function draw_nyan(nyan, x, y, move) {
            nyan.draw_current(cu.ctx, x, y);
            if (move) {
                nyan.progress();
            }


        }

        const nyan_mid = cu.canvas.height/2;
        var nyan_y = nyan_mid;

        function move_up() {
            nyan_y = Math.max(nyan_y - MOVE_DIST, TOP_DIST);
        }
        function move_down() {
            nyan_y = Math.min(nyan_y + MOVE_DIST, cu.canvas.height - BOTTOM_DIST);
        }

        var stars = create_stars();
        
        function draw_coins(add) {
            if (add) {
                add_coin();
            }
            for (var i = 0;i<max_coins;++i) {
                if (coins[i]) {
                    coins[i].draw_current(cu.ctx, coins[i].x, coins[i].y);

                    coins[i].x+=SPEED;
                    if (coins[i].x > cu.canvas.width) {
                        coins[i] = undefined;
                    }
                }
            }
        }

        function detect_collision_2d(a, b) {
            const height = 60;
            if (a.y >= b.y - height && a.y <= b.y + height) {
                return true;
            }
            return false;
        }
        var timer;
        function handle_collisions() {
            var midx = cu.canvas.width/2-20;
            for (var i in coins) {
                var c = coins[i];
                if (c && c.x >= midx && c.x < midx + 50) {
                    if (detect_collision_2d(c, {y: nyan_y})) {
                        coins[i] = undefined;
                        score+=10;
                    }
                }
            }

            for (var i in ghosts) {
                var g = ghosts[i];
                if (g && g.x >= midx && g.x < midx + 50) {
                    if (detect_collision_2d(g, {y: nyan_y})) {
                        $('#death').html('You died! Your score: ' + score);
                        $('#death').show();
                        clearTimeout(timer);
                        setTimeout(function() {
                            location.reload();
                        }, 5000);
                        return false;
                    }
                }
            }
            
            return true;
        }

        function tick(n) {
            if (control.get_control() == UP) {
                move_up();
            } else if (control.get_control() == DOWN) {
                move_down();
            }
            cu.clear("darkblue");
            draw_stars(stars, n%5==0);
            draw_nyan(nyan, cu.canvas.width/2, nyan_y, n%5==0);


            move_ghosts();
            draw_ghosts(n%10==0);

            draw_coins(n%101==0);

            $('#score').html('Score: ' + score);

            if (handle_collisions()) {
                timer = setTimeout(tick, 20, n+1);
            }

            if (n%250 == 0 && n > 0) {
                score++;
            }
        }
        tick(0);
    });

});
