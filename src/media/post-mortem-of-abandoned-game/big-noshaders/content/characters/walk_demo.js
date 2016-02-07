function WalkDemo() {
    this.images('images/', {
        foot: ['shoe.png', [-10, -30], [15, 40]],
        lower_leg: ['lower_leg.png', [-5, -45], [10, 50]],
        knee: ['knee.png', [-10, -10], [20, 20]],
        upper_leg: ['upper_leg.png', [-5, -60], [10, 60]],
        body: ['body.png', [-30, -30], [60, 60]],
        head: ['head.png', [-30, -30], [60, 60]],
        shoulder: ['shoulder.png', [-10, -10], [20, 20]],
        elbow: ['elbow.png', [-5, -5], [10, 10]],
        hand: ['hand.png', [-5, -5], [10, 10]],
        upper_arm: ['upper_arm.png', [-5, -40], [10, 40]],
        upper_arm_front: ['upper_arm.png', [-5, -40], [10, 40]],
        upper_arm_back: ['upper_arm_back.png', [-5, -40], [10, 40]],
        lower_arm: ['lower_arm.png', [-5, -40], [10, 40]]
    });

    this.states({
        walk: {
            body: {
                image: 'body',
            },
            left_foot: {
                image: 'foot', 
                translate: [[0, [0, -30]], [100, [0, 0]], [400, [0, 30]], [700, [0, 0]], [800, [0, -30]]]
            },
            right_foot: {copy: 'left_foot', flip_x: true, offset: 400},
            left_knee: {
                image: 'knee', 
                translate: [[0, [0, -30]], [400, [0, 20]], [600, [0, 0]], [700, [0, -25]], [800, [0, -30]]]
            },
            right_knee: {copy: 'left_knee', flip_x: true, offset: 400},
            left_hip: {translate: [-15, 0]},
            right_hip: {copy: 'left_hip', flip_x: true},
            head: {
                image: 'head',
            },
            left_shoulder: {
                image: 'shoulder',
                translate: [[0, [-35, 5]], [400, [-35, -5]], [800, [-35, 5]]],
            },
            right_shoulder: {copy: 'left_shoulder', flip_x: true, offset: 400},
            left_elbow: {
                image: 'elbow',
                translate: [[0, [0, 30]], [200, [-5, 0]], [400, [-10, -30]], [600, [-5, 0]], [800, [0, 30]]]
            },
            right_elbow: {copy: 'left_elbow', flip_x: true, offset: 400},
            left_hand: {
                image: 'hand',
                translate: [[0, [-5, 20]], [200, [0, 0]], [400, [10, -30]], [600, [0, 0]], [800, [-5, 20]]]
            },
            right_hand: {copy: 'left_hand', flip_x: true, offset: 400},
            left_upper_arm: {
                image: [[0, 'upper_arm_front'], [200, 'upper_arm_back'], [600, 'upper_arm_front'], [800, 'upper_arm_front']]
            },
            right_upper_arm: {copy: 'left_upper_arm', flip_x: true, offset: 400}

        },
        still: {
            body: {
                image: 'body',
                scale: [[0, [1, 1]], [1600, [1, 1]], [2000, [1, 1.1]], [2800, [1, 1.1]], [3200, [1, 1]]],
                translate: [[0, [0, 0]], [1600, [0, 0]], [2000, [0, -1]], [2800, [0, -1]], [3200, [0, 0]]]
            },
            left_foot: 'foot',
            right_foot: {copy: 'left_foot', flip_x: true},
            head: 'head',
            left_knee: 'knee',
            right_knee: {copy: 'left_knee', flip_x: true},
            left_hip: {
                translate: [[0, [-15, 0]], [1600, [-15, 0]], [2000, [-15, 1]], [2800, [-15, 1]], [3200, [-15, 0]]]
            },
            right_hip: {copy: 'left_hip', flip_x: true},
            left_shoulder: {
                image: 'shoulder',
                translate: [[0, [-35, 0]], [1600, [-35, 0]], [2000, [-34, 2]], [2800, [-34, 2]], [3200, [-35, 0]]]
            },
            right_shoulder: {copy: 'left_shoulder', flip_x: true},
            left_elbow: {
                image: 'elbow',
                translate: [-5, 0]
            },
            right_elbow: {copy: 'left_elbow', flip_x: true},
            left_hand: 'hand',
            right_hand: {copy: 'left_hand', flip_x: true},
            left_upper_arm: 'upper_arm_front',
            right_upper_arm: {copy: 'left_upper_arm', flip_x: true}
        }
    });

    this.composition('body', [
        'left_hip', [
            {connect_to: 'left_knee', with_img: 'upper_leg'},
            'left_knee', [
                'left_foot',
                {connect_to: 'left_foot', with_img: 'lower_leg'}
            ]
        ],
        'right_hip', [
            {connect_to: 'right_knee', with_img: 'upper_leg'},
            'right_knee', [
                'right_foot',
                {connect_to: 'right_foot', with_img: 'lower_leg'}
            ]
        ]
    ], [
        'head',
        'left_shoulder', [
            {connect_to: 'left_elbow', with_seq: 'left_upper_arm'},
            'left_elbow', [
                {connect_to: 'left_hand', with_img: 'lower_arm'},
                'left_hand'
            ],
        ],
        'right_shoulder', [
            {connect_to: 'right_elbow', with_seq: 'right_upper_arm'},
            'right_elbow', [
                {connect_to: 'right_hand', with_img: 'lower_arm'},
                'right_hand'
            ]
        ]
    ]);
}
