---
layout: post.hbt
title: "Lessons learnt writing a game from scratch with ECS in one month"
date:   2016-01-25 12:30:01+1000
categories: gamedev roguelikes ecs
permalink: ecs-lessons-learnt
---

- EcsContext storing entity list and spacial hash, separate from schedule
- automate type assignment
- one function for each system "type"
  - passive (e.g. renderer)
  - periodic (e.g. poison)
  - responsive (e.g. collisions)
  - other? (observation)
- mixins so components can inherit directly
- system superclass
- tidier entity/component api (with, has, is)
- hash table updated as components change
- dijkstra maps for common goals
- composable prototypes for entities
- tile ids and single canvas with all pre-renderer tiles
  - faster than rendering them on-demand
  - possibly faster than one canvas per tile
  - faster to index into tile store (than using strings)
  - easy to swap out for actual pictures (rather than ascii)
