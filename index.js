var Metalsmith  = require('metalsmith');
var markdown    = require('metalsmith-markdown-remarkable');
var layouts     = require('metalsmith-layouts');
var collections = require('metalsmith-collections');
var permalinks  = require('metalsmith-permalinks');
var tags        = require('metalsmith-tags');
var drafts      = require('metalsmith-drafts');
var pagination  = require('metalsmith-pagination');
var ignore      = require('metalsmith-ignore');
var excerpts    = require('metalsmith-excerpts');
var sass        = require('metalsmith-sass');
var feed        = require('metalsmith-feed');
var serve       = require('metalsmith-serve');

var cheerio     = require('cheerio');
var fs          = require('fs');
var Handlebars  = require('handlebars');
var hljs        = require('highlight.js');
var path        = require('path');

const DEBUG = false;

Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/layouts/partials/header.hbt').toString());
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/layouts/partials/footer.hbt').toString());
Handlebars.registerPartial('rightbar', fs.readFileSync(__dirname + '/layouts/partials/rightbar.hbt').toString());
Handlebars.registerPartial('pagenumbers', fs.readFileSync(__dirname + '/layouts/partials/pagenumbers.hbt').toString());

Handlebars.registerHelper("getPages", (pagination) => {
    var ret = [];
    var pages = pagination.getPages(10);
    var current = parseInt(pagination.name);
    for (var i in pages) {
        var num = parseInt(i) + 1;
        if (num == current) {
            ret.push('<a class="current-pagination-link" href="/'+pages[i].path+'">' + (parseInt(i)+1) + '</a>');
        } else {
            ret.push('<a class="pagination-link" href="/'+pages[i].path+'">' + (parseInt(i)+1) + '</a>');
        }
    }
    if (ret.length == 1) {
        return [];
    }
    return ret.join('');
});

function categorySet(opts) {
    return function(files, metalsmith, done) {
        for (var f in files) {
            if (files[f].categories) {
                files[f].categories = new Set(files[f].categories.split(' '));
            }
        }
        done();
    }
}

function formatPostDates(opts) {
    return function(files, metalsmith, done) {
        for (var post of metalsmith._metadata.collections.posts) {
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var date = new Date(post.date);
            post.date = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
        }
        done();
    }
}

function setPostHeaderFields(opts) {
    return function(files, metalsmith, done) {
        for (var post of metalsmith._metadata.collections.posts) {
            post.headerTitle = 'Posts';
            post.headerLink = '/posts';
        }
        done();
    }
}

function copyPostContents(opts) {
    return function(files, metalsmith, done) {
        for (var post of metalsmith._metadata.collections.posts) {
            post.original = post.contents.slice();
        }
        done();
    }
}

function moveContentsUpOneLevel(opts) {
    return function(files, metalsmith, done) {
        for (var f in files) {
            var pathArray = f.split(path.sep);
            if (pathArray.shift() == opts) {
                var newPath = pathArray.join(path.sep);
                var fileObject = files[f];
                files[newPath] = fileObject;
                delete files[f];

            }
        }
        done();
    }
}

function makePostLinksAbsolute(opts) {
    return function(files, metalsmith, done) {
        var pattern = /^https?:\/\/|^\/\/|^\//i;
        for (var post of metalsmith._metadata.collections.posts) {
            var $ = cheerio.load(post.contents);
            $('a').each((index, element) => {
                var url = element.attribs.href;
                if (!url.match(pattern)) {
                    element.attribs.href = '/' + post.permalink + '/' + url;
                }
            });
            $('img').each((index, element) => {
                var url = element.attribs.src;
                if (!url.match(pattern)) {
                    element.attribs.src = '/' + post.permalink + '/' + url;
                }
            });
            $('script').each((index, element) => {
                var url = element.attribs.src;
                if (!url.match(pattern)) {
                    element.attribs.src = '/' + post.permalink + '/' + url;
                }
            });
            post.contents = new Buffer($.html());
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
    .use(serve({
        port: 8000,
        verbose: true
    }))
    .use(ignore([
        '.*.swp',
        '*/.*.swp'
    ]))
    .use(moveContentsUpOneLevel('media'))
    .use(markdown({
        html: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (err) {}
            }
            try {
                return hljs.highlightAuto(str).value;
            } catch (err) {}
            return ''; // use external default escaping
          }}))
    .use(categorySet())
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
    .use(makePostLinksAbsolute())
    .use(formatPostDates())
    .use(setPostHeaderFields())
    .use(copyPostContents())
    .use(feed({
        collection: 'posts',
        limit: false,
        postDescription: (file) => {
            return file.contents;
        }
    }))
    .use(permalinks({
        pattern: ':permalink'
    }))
    .use(pagination({
        'collections.posts': {
            perPage: 4,
            layout: 'pagination-full.hbt',
            first: 'index.html',
            path: ':num/index.html',
            pageMetadata: {
                title: 'Take the Stairs',
            }
        }
    }))
    .use(pagination({
        'collections.posts': {
            perPage: 10,
            layout: 'pagination-excerpts.hbt',
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
            perPage: 10,
            layout: 'pagination-full.hbt',
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
                console.log(f);
            }
        }
        done();
    })
    .use(layouts('handlebars'))
    .build((err) => { if (err) { throw  err; } });
