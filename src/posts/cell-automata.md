---
layout: post.hbt
title: "Cellular Automata Cave Generation"
date:   2015-09-26 12:30:01+1000
categories: gamedev roguelikes
permalink: cellular-automata-cave-generation
---

A cellular automata is a collection of cells whose states change over time
based on the states of adjacent cells.
They can be used to produce natural-looking patterns, such as the cave
in the picture below.

![Caverns](/media/cell-automata/images/caverns.png)

Perhaps the most well-known instance of a cellular automata is [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life),
shown below (click to start). Each cell is considered to be either alive or dead.
In this example, the initial states of each cell is random.
At each step, the neighbours of each cell are examined to determine if that
cell will be alive or dead in the next step. This proceeds according to the following rules:

- if a cell is __alive__ and has __less than 2__ living neighbours, the cell dies (as if of underpopulation)
- if a cell is __alive__ and has __more than 3__ living neighbours, the cell dies (as if of overpopulation)
- if a cell is __alive__ and has __2 or 3__ living neighbours, the cell remains alive
- if a cell is __dead__ and has __exactly 3__ living neighbours, the cell becomes alive (as if by reproduction)

<div style="width:600px" class="centre">
<canvas id="conway" height="400" width="600"></canvas>
<p class="label">Conway's game of life. Click to toggle animation.</p>
</div>

Here's pseudocode for the function applied at each step of the simulation.
In short, it takes a 2D array of cells and updates the state of each cell
based on the states of its neighbours. 

{% highlight lua %}
SURVIVE_MIN = 2
SURVIVE_MAX = 3
RESURRECT_MIN = 3
RESURRECT_MAX = 3

step(cells[HEIGHT][WIDTH]) {
  for i in 0..HEIGHT-1 {
    for j in 0..WIDTH-1 {
      count = 0
      for each neighbour of cells[i][j] {
        if neighbour is alive {
          count++
        }
      }

      if cells[i][j].alive {
        if count >= SURVIVE_MIN and count <= SURVIVE_MAX {
          cells[i][j].alive_next_step = true
        } else {
          cells[i][j].alive_next_step = false
        }
      } else {
        if count >= RESURRECT_MIN and count <= RESURRECT_MAX {
          cells[i][j].alive_next_step = true
        } else {
          cells[i][j].alive_next_step = false
        }
      }
    }
  }
  
  for i in 0..HEIGHT-1 {
    for j in 0..WIDTH-1 {
      cells[i][j].alive = cells[i][j].alive_next_step
    }
  }
}
{% endhighlight %}

Notice the four constants
at the start of the code. These encode the rules for Conway's game of
life, described above. These values can be changed to obtain different
behaviour of the cellular automata.

- if a cell is __alive__ and has __less than 4__ living neighbours, the cell dies
- if a cell is __alive__ and has __4 or more__ living neighbours, the cell remains alive
- if a cell is __dead__ and has __exactly 5__ living neighbours, the cell becomes alive (as if by reproduction)

The constants that encode these rules are:

{% highlight lua %}
SURVIVE_MIN = 4
SURVIVE_MAX = 8
RESURRECT_MIN = 5
RESURRECT_MAX = 5
...
{% endhighlight %}

<div style="width:600px" class="centre">
<canvas id="conway-variant-1" height="400" width="600"></canvas>
<p class="label">Variant of Conway's game of life used for cave generation.</p>
</div>

These set of rules creates large clumps of living cells which can be used as the walls of a cave.
When generating terrain for a game level of finite size, players shouldn't be able to walk off the
edge of the map. A simple way to enforce this is to place walls around the edge of the map. A solution
that places natural-looking walls around the outside of the map is to ensure the border of the area
is always made up of living cells. Enforcing this at each step of the simulation means that these cells
cause other nearby cells to become (and stay) alive. The walls grow inwards and interact with interior
walls to give the appearance of natural cavern walls.

<div style="width:600px" class="centre">
<canvas id="conway-variant-2" height="400" width="600"></canvas>
<p class="label">Cells around border are always alive.</p>
</div>

Within the first few steps, natural-looking caverns are generated.
In the subsequent steps, the walls recede and the caverns become very vast.
Limiting the number of steps to 4 seems to produce interesting-looking caves.
Rough edges and single dead cells can be smoothed/removed by killing any cells
with less than 2 living neighbours, and resurrecting cells with more than 5 living neighbours.
Finally, to ensure that there are no closed-off sections of the generated cave,
all but the largest contiguous groups of dead cells are are resurrected, filling in closed-off open spaces.

<div style="width:600px" class="centre">
<canvas id="conway-variant-3" height="400" width="600"></canvas>
<p class="label">Running for 4 steps, then cleaning.</p>
</div>


<script src="/lib/jquery.js"></script>
<script>

$(function() {
    
    conway($('#conway'), {
        survive_min: 2,
        survive_max: 3,
        resurrect_min: 3,
        resurrect_max: 3
    }, false);
    
    conway($('#conway-variant-1'), {
        survive_min: 4,
        survive_max: 8,
        resurrect_min: 5,
        resurrect_max: 5
    }, false);
    
    conway($('#conway-variant-2'), {
        survive_min: 4,
        survive_max: 8,
        resurrect_min: 5,
        resurrect_max: 5
    }, true);
    
    conway($('#conway-variant-3'), {
        survive_min: 4,
        survive_max: 8,
        resurrect_min: 5,
        resurrect_max: 5
    }, true, true);

    function conway($canvas, rules, edge_alive, complete) {
        var ctx = $canvas[0].getContext('2d');

        const SIZE = 4;
        var WIDTH = +$canvas[0].width / SIZE;
        var HEIGHT = +$canvas[0].height / SIZE;

        function mkcells() {
            var ret = [];
            for (var i = 0; i < HEIGHT; ++i) {
                ret[i] = []
                for (var j = 0; j < WIDTH; ++j) {
                    ret[i][j] = false;
                }
            }
            return ret;
        }

        function foreach_cell(cells, f) {
            for (var i = 0; i < HEIGHT; ++i) {
                for (var j = 0; j < WIDTH; ++j) {
                    f(cells, i, j);
                }
            }
        }

        var current = mkcells();
        var next = mkcells();

        function init() {
            foreach_cell(current, function(cells, i, j) {
                cells[i][j] = Math.random() < 0.5;
            });
        }

        $canvas.click(toggle);

        function progress(current, next, rules) {
            foreach_cell(current, function(cells, i, j) {

                if (edge_alive && (i == 0 || j == 0 || i == HEIGHT - 1 || j == WIDTH - 1)) {
                    next[i][j] = true;
                    return;
                }

                var count = 0;
                for (var k = Math.max(0, i-1); k < Math.min(HEIGHT, i+2); ++k) {
                    for (var l = Math.max(0, j-1); l < Math.min(WIDTH, j+2); ++l) {
                        if (!(k==i&&l==j)) {
                            if(cells[k][l]) {
                                ++count;
                            }
                        }
                    }
                }

                if (cells[i][j]) {
                    if (count >= rules.survive_min && count <= rules.survive_max) {
                        next[i][j] = true;
                    } else {
                        next[i][j] = false;
                    }
                } else {
                    if (count >= rules.resurrect_min && count <= rules.resurrect_max) {
                        next[i][j] = true;
                    } else {
                        next[i][j] = false;
                    }
                }
            });
            
            var diff_count = 0;
            foreach_cell(current, function(cells, i, j) {
                if (cells[i][j] != next[i][j]) {
                    cells[i][j] = next[i][j];
                    ++diff_count;
                }
            });
            return diff_count;
        }

        function draw(cells) {
            ctx.beginPath();
            foreach_cell(current, function(cells, i, j) {
                if (cells[i][j]) {
                    ctx.fillStyle = "black";
                } else {
                    ctx.fillStyle = "white";
                }
                
                ctx.fillRect(j * SIZE, i * SIZE, SIZE, SIZE);
            });
            ctx.fill();
            
        }

        var running = false;
        var steps = 0;

        function clean(cells) {
            foreach_cell(current, function(cells, i, j) {

                if (edge_alive && (i == 0 || j == 0 || i == HEIGHT - 1 || j == WIDTH - 1)) {
                    next[i][j] = true;
                    return;
                }

                var count = 0;
                for (var k = Math.max(0, i-1); k < Math.min(HEIGHT, i+2); ++k) {
                    for (var l = Math.max(0, j-1); l < Math.min(WIDTH, j+2); ++l) {
                        if (!(k==i&&l==j)) {
                            if(cells[k][l]) {
                                ++count;
                            }
                        }
                    }
                }

                if (count > 5) {
                    cells[i][j] = true;
                }
                if (count < 2) {
                    cells[i][j] = false;
                }
            });
        }

        function flood(id, ids, cells, i, j, group) {

            var stack = [{i: i, j: j}];

            while (stack.length > 0) {
                var current = stack.pop();
                i = current.i;
                j = current.j;

                for (var k = Math.max(0, i-1); k < Math.min(HEIGHT, i+2); ++k) {
                    for (var l = Math.max(0, j-1); l < Math.min(WIDTH, j+2); ++l) {
                        if (!(k==i&&l==j) && (k==i||l==j)) {
                            if (!cells[k][l] && !ids[k][l]) {
                                ids[k][l] = id;
                                group.push({i: k, j: l});
                                stack.push({i: k, j: l});
                            }
                        }
                    }
                }

            }
            return group;
        }

        function find_biggest(cells) {
            var ids = mkcells();
            var id = 1;
            var groups = [];
            foreach_cell(cells, function(cells, i, j) {
                if (!cells[i][j] && !ids[i][j]) {
                    groups.push(flood(id, ids, cells, i, j, [{i: i, j: j}]));
                    ++id;
                }
            });

            var max_idx = 0;
            var max_size = groups[0].length;

            for (var i = 1; i < groups.length; ++i) {
                var group = groups[i];
                if (group.length > max_size) {
                    max_size = group.length;
                    max_idx = i;
                }
            }

            for (var i = 0; i < groups.length; ++i) {
                if (i != max_idx) {
                    for (var j = 0; j < groups[i].length; ++j) {
                        var coords = groups[i][j];
                        cells[coords.i][coords.j] = true;
                    }
                }
            }

        }

        function tick() {

            if (complete && steps == 4) {

                setTimeout(function() {
                    clean(current);
                    draw(current);
                    setTimeout(function() {
                        find_biggest(current);
                        draw(current);
                        setTimeout(function() {
                            init();
                            steps = 0;
                            tick();
                        }, 2000);
                    }, 1000);
                }, 1000);

                return;
            }

            if (running) {
                diff_count = progress(current, next, rules);
                if (diff_count == 0) {
                    init();
                }
                draw(current);
                ++steps;
                setTimeout(tick, 200);
            }
        }

        function stop() {
            running = false;
        }
        function start() {
            running = true;
            tick();
        }

        function toggle() {
            if (running) {
                stop();
            } else {
                start();
            }
        }

        init();
        draw(current);
    }
})

</script>
