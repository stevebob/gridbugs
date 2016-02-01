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
var sass        = require('metalsmith-sass');
var feed        = require('metalsmith-feed');

var fs          = require('fs');
var Handlebars  = require('handlebars');

const DEBUG = false;

Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/layouts/partials/header.hbt').toString());
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/layouts/partials/footer.hbt').toString());
Handlebars.registerPartial('rightbar', fs.readFileSync(__dirname + '/layouts/partials/rightbar.hbt').toString());

Handlebars.registerHelper("getPages", (pagination) => {
    var ret = [];
    var pages = pagination.getPages(10);
    var current = parseInt(pagination.name);
    for (var i in pages) {
        var num = parseInt(i) + 1;
        if (num == current) {
            ret.push('<a class="current-page-link" href="/'+pages[i].path+'">' + (parseInt(i)+1) + '</a>');
        } else {
            ret.push('<a class="page-link" href="/'+pages[i].path+'">' + (parseInt(i)+1) + '</a>');
        }
    }
    return ret.join('');
});

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
    .metadata({
        site: {
            title:  'Take the Stairs',
            url:    'http://takestairs.net',
            author: 'Stephen Sherratt'
        }
    })
    .use(ignore([
        '.*.swp',
        '*/.*.swp'
    ]))
    .use(markdown())
    .use(categoryset())
    .use(excerpts())
    .use(sass({
        outputStyle: 'expanded'
    }))
    .use(collections({
        posts: {
            pattern: 'posts/*.html',
            sortBy: 'date',
            reverse: true
        }
    }))
    .use(function(files, metalsmith, done) {
        for (var post of metalsmith._metadata.collections.posts) {
            post.headerTitle = 'Posts';
            post.headerLink = '/posts';
        }
        done();
    })
    .use(feed({
        collection: 'posts'
    }))
    .use(permalinks({
        pattern: ':permalink'
    }))
    .use(pagination({
        'collections.posts': {
            perPage: 2,
            layout: 'pagination.hbt',
            first: 'index.html',
            path: ':num/index.html',
            pageMetadata: {
                title: 'Take the Stairs',
            }
        }
    }))
    .use(pagination({
        'collections.posts': {
            perPage: 2,
            layout: 'pagination.hbt',
            first: 'posts/index.html',
            path: 'posts/:num/index.html',
            pageMetadata: {
                title: 'Posts',
                headerTitle: 'Posts',
                headerLink: '/posts'
            }
        }
    }))
     .use(pagination({
        'collections.posts': {
            perPage: 2,
            layout: 'pagination.hbt',
            first: 'projects/index.html',
            path: 'projects/:num/index.html',
            filter: (page) => {
                return page.categories && page.categories.has('project');
            },
            pageMetadata: {
                title: 'Projects',
                headerTitle: 'Projects',
                headerLink: '/projects'
            }
        }
    }))
    .use(function(files, metalsmith, done) {
        if (DEBUG) {
            for (var f in files) {
                console.log(files[f]);
            }
        }
        done();
    })
    .use(layouts('handlebars'))
    .build((err) => { if (err) { throw  err; } });
