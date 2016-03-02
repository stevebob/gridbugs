---
layout: post.hbt
title: "Encoding Rules for Turn-Based Games"
date:   2016-03-02 23:20:01+1000
categories: gamedev roguelikes
permalink: encoding-rules-for-turn-based-games
---

A key consideration when designing a game engine is how rules of the game will
be encoded. The engine needs a way of enforcing statements such as "Doors can
only be passed through if they are open", and "If a burning character walks into
a pool of water, it stops burning". The expressiveness of a game engine's
rule-encoding is important, as it dictates the limitations of mechanics that can
be present in games. Nobody wants to discover late in development that their
engine can't be used to efficiently implement a certain feature.

This post will describe the framework I used to encode rules in two games I
recently made: [Glacial](/glacial) and [Bugcatcher](/bugcatcher). It's based on
the idea of an Entity Component System (ECS).

## Entity Component System
Every object in the game (walls,
characters, doors, bullets, etc) is represented by an **entity**. An
entity is simply a container for storing **components**. Components store
information about objects in the world. The fact that an object is solid, that
an object is opaque, that it has health or that it can take actions are all
examples of components. The key idea of ECS is that all the information about
the state of the world is stored in components, and each entity is simply a
collection of various components.

The rules of the game are represented by various systems that operate on
components of entities. A simple example is a renderer, which could iterate over
all entities in the world, and for each one with a Position component and a Tile
component, draw the specified tile at the specified position. Another system
could be a collision detector, that checks if an entity with a Collider
component is about to walk into an entity with a Solid component, and stops the
movement from going ahead. A third system could be burning. Periodically, loop
through each entity with a Burning component and a Health component, and reduce
their health by some amount.

This should serve as sufficient background in Entity Component Systems. The
previous paragraph was intentionally vague about the details of how systems
work. Rest assured that a more concrete explanation will follow. To learn more
about ECS:
- Wikipedia has an overview: [Entity component system](https://en.wikipedia.org/wiki/Entity_component_system)
- More detailed description and comparison to OOP:
[Understanding
Component-Entity-Systems](http://www.gamedev.net/page/resources/_/technical/game-programming/understanding-component-entity-systems-r3013)
- Another index of references from roguebasin:
[Entity Component System](http://www.roguebasin.com/index.php?title=Entity_Component_System)

## Entities
## Components
## Actions
## Passive Systems
## Reactive Systems
## Periodic Systems
## Game Loop
