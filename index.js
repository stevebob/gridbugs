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

Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/layouts/partials/header.hbt').toString());
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/layouts/partials/footer.hbt').toString());

Metalsmith(__dirname)
    .use(ignore([
        '.*.swp',
        '*/.*.swp'
    ]))
    .use(markdown())
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
    .use(function(files, metalsmith, done) {
        console.log(files);
        done();
    })
    .use(layouts('handlebars'))
    .build((err) => { if (err) { throw  err; } });
