function Small() {
    var points = [
            [[200, 200], [600, 200]],
            [[600, 200], [600, 600]],
            [[600, 600], [400, 600]],
            [[400, 600], [400, 400]],
            [[400, 400], [200, 400]],
            [[200, 400], [200, 200]]
        ];


    this.regions({
        main: points     
    });

    this.connect(
    );

    this.image_files('images/', {
        level1_floor: ['white.jpg']
    });

    this.levels({
        level1: [[
                'main',
            ], 
            [], 'level1_floor'
        ]
    });

    this.light_obstructions({
        level1: points
    });

    this.lights({
    });

    this.level_detectors({
        
    });

    this.initial('level1');
}
