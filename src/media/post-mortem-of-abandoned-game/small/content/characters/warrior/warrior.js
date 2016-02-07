function Warrior() {
    this.images('content/characters/warrior/images/', {
        foot_front: ['foot-front.png', [-10, -30], [15, 40]],
        foot_back: ['foot-back.png', [-8, -8], [16, 16]],
        lower_leg_front: ['lower-leg-front.png', [-11, -60], [20, 50]],
        lower_leg_back: ['lower-leg-back.png', [-10, -50], [20, 60]],
        knee_front: ['knee-front.png', [-10, -10], [20, 20]],
        knee_back: ['knee-back.png', [-10, -10], [20, 20]],
        upper_leg_front: ['upper-leg-front.png', [-8, -60], [20, 60]],
        upper_leg_back: ['upper-leg-back.png', [-10, -60], [20, 60]],
        torso: ['torso.png', [-30, -6], [60, 25]],
        head: ['head.png', [-12, -5], [24, 24]],
        shoulder: ['shoulder.png', [-18, -10], [20, 20]],
        elbow_back: ['elbow-back.png', [-8, -8], [16, 16]],
        elbow_front: ['elbow-front.png', [-8, -8], [16, 16]],
        hand_front: ['hand-front.png', [-8, -8], [16, 16]],
        hand_back: ['hand-back.png', [-8, -8], [16, 16]],
        upper_arm_front: ['upper-arm-front.png', [-14, -40], [20, 40]],
        upper_arm_back: ['upper-arm-back.png', [-7, -50], [20, 50]],
        lower_arm_front: ['lower-arm-front.png', [-11, -40], [20, 40]],
        lower_arm_back: ['lower-arm-back.png', [-10, -40], [20, 40]]
    });

    var foot_switch = [210, 580];
    var knee_switch = [230, 600];

    this.states({
        walk: {
            torso: {
                image: 'torso',
                private_rotate: [[0, degrees_to_radians(-5)], [400, degrees_to_radians(5)], [800, degrees_to_radians(-5)]]
            },
            left_foot: {
                image: [[0, 'foot_front'], [foot_switch[0], 'foot_back'], [foot_switch[1], 'foot_front'], [800, 'foot_front']],
                translate: [[0, [2, -10]], [150, [2, 0]], [400, [2, 10]], [650, [2, 0]], [800, [2, -10]]],
                scale: [[0, [1, 1]], [foot_switch[0], [1, 0.2]], [foot_switch[0]+0.01, [1, 1]], 
                        [foot_switch[1]-0.01, [1, 1]], [foot_switch[1], [1, 0.1]], [800, [1, 1]]]
            },
            right_foot: {copy: 'left_foot', flip_x: true, offset: 400},
            left_knee: {
                image: [[0, 'knee_front'], [knee_switch[0], 'knee_back'], [knee_switch[1], 'knee_front'], [800, 'knee_front']], 
                translate: [[0, [5, -30]], [400, [5, 40]], [600, [5, 0]], [700, [5, -25]], [800, [5, -30]]]
            },
            right_knee: {copy: 'left_knee', flip_x: true, offset: 400},
            left_hip: {translate: [-15, 0]},
            right_hip: {copy: 'left_hip', flip_x: true},
            head: {
                image: 'head',
            },
            left_shoulder: {
                image: 'shoulder',
                translate: [[0, [-15, 8]], [400, [-15, 5]], [800, [-15, 8]]],
                rotate: [[0, degrees_to_radians(-5)], [400, degrees_to_radians(5)], [800, degrees_to_radians(-5)]]
            },
            right_shoulder: {copy: 'left_shoulder', flip_x: true, offset: 400},
            left_elbow: {
                image: [[0, 'elbow_back'], [200, 'elbow_front'], [600, 'elbow_back'], [800, 'elbow_back']],
                translate: [[0, [-10, 20]], [200, [-5, 0]], [400, [-10, -20]], [600, [-5, 0]], [800, [-10, 20]]]
            },
            right_elbow: {copy: 'left_elbow', flip_x: true, offset: 400},
            left_hand: {
                image: [[0, 'hand_back'], [200, 'hand_front'], [600, 'hand_back'], [800, 'hand_back']],
                translate: [[0, [-5, 15]], [200, [0, 0]], [400, [10, -20]], [600, [0, 0]], [800, [-5, 15]]]
            },
            right_hand: {copy: 'left_hand', flip_x: true, offset: 400},

            left_upper_arm: {
                image: [[0, 'upper_arm_back'], [200, 'upper_arm_front'], [600, 'upper_arm_back'], [800, 'upper_arm_back']]
            },
            right_upper_arm: {copy: 'left_upper_arm', flip_x: true, offset: 400},
            left_lower_leg: {
                image: [[0, 'lower_leg_front'], [knee_switch[0], 'lower_leg_back'], [knee_switch[1], 'lower_leg_front'], [800, 'lower_leg_front']]
            },
            right_lower_leg: {copy: 'left_lower_leg', flip_x: true, offset: 400},
            left_upper_leg: {
                image: [[0, 'upper_leg_front'], [knee_switch[0], 'upper_leg_back'], [knee_switch[1], 'upper_leg_front'], [800, 'upper_leg_front']]
            },
            right_upper_leg: {copy: 'left_upper_leg', flip_x: true, offset: 400},
            left_lower_arm: {
                image: [[0, 'lower_arm_back'], [200, 'lower_arm_front'], [600, 'lower_arm_back'], [800, 'lower_arm_back']]
            },
            right_lower_arm: {copy: 'left_lower_arm', flip_x: true, offset: 400}
        },
        still: {
            torso: {
                image: 'torso',
                private_scale: [[0, [1, 1]], [1600, [1, 1]], [2000, [1, 1.1]], [2800, [1, 1.1]], [3200, [1, 1]]],
                private_translate: [[0, [0, 0]], [1600, [0, 0]], [2000, [0, -1]], [2800, [0, -1]], [3200, [0, 0]]]
            },
            left_foot: 'foot_front',
            right_foot: {copy: 'left_foot', flip_x: true},
            head: 'head',
            left_knee: {
                image: 'knee_front',
                translate: [0, 10]
            },
            right_knee: {copy: 'left_knee', flip_x: true},
            left_hip: {
                translate: [-15, 0]
            },
            right_hip: {copy: 'left_hip', flip_x: true},
            left_shoulder: {
                image: 'shoulder',
                translate: [[0, [-15, 6]], [1600, [-15, 6]], [2000, [-14, 7]], [2800, [-14, 7]], [3200, [-15, 6]]]
            },
            right_shoulder: {copy: 'left_shoulder', flip_x: true},
            left_elbow: {
                image: 'elbow_front',
                translate: [-5, -5]
            },
            right_elbow: {copy: 'left_elbow', flip_x: true},
            left_hand: {
                image: 'hand_front',
                translate: [0, -5]
            },
            right_hand: {copy: 'left_hand', flip_x: true},
            left_upper_arm: 'upper_arm_front',
            right_upper_arm: {copy: 'left_upper_arm', flip_x: true},
            left_lower_leg: 'lower_leg_front',
            right_lower_leg: {copy: 'left_lower_leg', flip_x: true},
            left_upper_leg: 'upper_leg_front',
            right_upper_leg: {copy: 'left_upper_leg', flip_x: true},
            left_lower_arm: 'lower_arm_front',
            right_lower_arm: {copy: 'left_lower_arm', flip_x: true}


        }
    });

    this.composition('torso', [
        'left_hip', [
            {connect_to: 'left_knee', with_seq: 'left_upper_leg'},
            'left_knee', [
                'left_foot',
                {connect_to: 'left_foot', with_seq: 'left_lower_leg'}
            ]
        ],
        'right_hip', [
            {connect_to: 'right_knee', with_seq: 'right_upper_leg'},
            'right_knee', [
                'right_foot',
                {connect_to: 'right_foot', with_seq: 'right_lower_leg'}
            ]
        ]
    ], [
        'head',
        'left_shoulder', [
            {connect_to: 'left_elbow', with_seq: 'left_upper_arm'},
            'left_elbow', [
                {connect_to: 'left_hand', with_seq: 'left_lower_arm'},
                'left_hand'
            ],
        ],
        'right_shoulder', [
            {connect_to: 'right_elbow', with_seq: 'right_upper_arm'},
            'right_elbow', [
                {connect_to: 'right_hand', with_seq: 'right_lower_arm'},
                'right_hand'
            ]
        ]
    ]);
}
