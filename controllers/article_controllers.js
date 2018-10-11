
// dependencies
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');

// models
const Articles = require('../models/articles.js');
const Notes = require('../models/notes.js');

const router = express.Router();

const newsURL = 'https://investopedia.com/news';

// scrapes and displays news articles 
router.get('/', function(req, res) {
    request(newsURL, function(error, response, html) {
    	// loads html into cheerio and saves it to $
        const $ = cheerio.load(html);
        // holds items objects
        var items = [];

        $('h3.item-title').each(function(i, element) {
            var results = {};
            results.title = $(this).text();
            results.link = $(this).children('a').attr(`href`);
            results.summary = $(this).siblings('div.item-description').text();
            results.img = $(this).siblings('a.item-image').children('img.item-image-src').attr('src');
            items.push(new Articles(results));
        });
        for (var i = 0; i < items.length; i++) {
            items[i].save(function(err, data) {
                if (err) {
                    console.log(err)
                } else { console.log(data) }
            });
            console.log((i === (items.length - 1)));
            // retrieves articles from db only after all entries have been made
            if (i === (items.length - 1)) {
                res.redirect('/articles');
            }
        }
    });
});

        // items.forEach(item => item.save((err, data) => { 
        //     if (err) {
        //         console.log(err)
        //     } else { console.log(data) }
        // }));

// gets unsaved, unhidden articles from db and displays them
router.get('/articles', function(req, res) {
    Articles.find({'status': 0}, (err, data) => {
        if (err){ 
            console.log(err);
        } else {
            res.render('index', {articles: data, current: true});
        }
    });
});

// grabs an article by it's ObjectId
router.get('/articles/:id', function(req, res) {
    // queries the db to find the article with a matching id 
    Articles.findOne({ '_id': req.params.id })
    // populates all of the notes associated with it
    .populate('notes')
    // executes the query
    .exec(function(error, doc) {
        // logs any errors
        if (error) {
            console.log(error);
        }
        // sends doc to the browser as a json object
        else {
            res.json(doc);
        }
    });
});

// creates a new note or replaces an existing note
router.post('/articles/:id', function(req, res) {
    // creates a new note and passes the req.body to the items
    var newNote = new Notes(req.body);
    // saves the new note the db
    newNote.save(function(error, doc) {
        // logs any errors
        if (error) {
            console.log(error);
        }
        else {
            // uses the article id to find and update it's note
            Articles.findOneAndUpdate({ '_id': req.params.id }, { 'notes': doc._id })
            .populate('notes')
            // executes the above query
            .exec(function(err, doc) {
                 // logs any errors
                if (err) {
                    console.log(err);
                }
                else {
                    // or sends the document to the browser
                    res.send(doc);
                }
            });
        }
    });
});

// assigns saved status to article 
router.post('/save', function(req, res) {
    Articles.findOneAndUpdate({'_id': req.body.articleId}, {$set : {'status': 1}})
    .exec((err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.send('Post successful');
        }
    });
});

// gets saved articles from db and displays them
router.get('/saved', function(req, res) {
    Articles.find({'status': 1}, (err, data) => {
        if (err) { 
            console.log(err);
        } else {
            res.render('index', {articles: data, saved: true});
        }
    });
});

// exports routes
module.exports = router;