var Metalsmith  = require('metalsmith');
var markdown    = require('metalsmith-markdown');
var layouts     = require('metalsmith-layouts');
var collections = require('metalsmith-collections');
var permalinks  = require('metalsmith-permalinks');
var tags        = require('metalsmith-tags');
var gist        = require('metalsmith-gist');
var drafts      = require('metalsmith-drafts');
var pagination  = require('metalsmith-pagination');
var watch       = require('metalsmith-watch');
var ignore      = require('metalsmith-ignore');
var excerpts    = require('metalsmith-excerpts');

var fs          = require('fs');
var Handlebars  = require('handlebars');

const DEBUG = true;

Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/layouts/partials/header.hbt').toString());
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/layouts/partials/footer.hbt').toString());

function categoryset(opts) {
    return function(files, metalsmith, done) {
        for (var f in files) {
            if (files[f].categories) {
                files[f].categories = new Set(files[f].categories.split(' '));
            }
        }
        done();
    }
}

Metalsmith(__dirname)
    .use(ignore([
        '.*.swp',
        '*/.*.swp'
    ]))
    .use(markdown())
    .use(categoryset())
    .use(excerpts())
    .use(collections({
        posts: {
            pattern: 'posts/*.html'
        }
    }))
    .use(permalinks({
        pattern: ':permalink'
    }))
    .use(pagination({
        'collections.posts': {
            perPage: 2,
            layout: 'home.hbt',
            first: 'index.html',
            path: ':num/index.html'
        }
    }))
    .use(pagination({
        'collections.posts': {
            perPage: 2,
            layout: 'posts.hbt',
            first: 'posts/index.html',
            path: 'posts/:num/index.html'
        }
    }))
     .use(pagination({
        'collections.posts': {
            perPage: 2,
            layout: 'projects.hbt',
            first: 'projects/index.html',
            path: 'projects/:num/index.html',
            filter: (page) => {
                return page.categories && page.categories.has('project');
            }
        }
    }))
    .use(function(files, metalsmith, done) {
        if (DEBUG) {
            console.log(files);
            done();
        }
    })
    .use(layouts('handlebars'))
    .build((err) => { if (err) { throw  err; } });
