
// dependencies
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');

// models
const Articles = require('../models/articles.js');
const Notes = require('../models/notes.js');

const router = express.Router();

const newsURL = 'https://investopedia.com/news';
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

// scrapes and displays news articles 
router.get('/', function(req, res) {
    // gets html body
 

        // const $ = cheerio.load(response.data); 
      
    request(newsURL, function(error, response, html) {
    	// loads html into cheerio and saves it to $
        var $ = cheerio.load(html);
        // holds items objects
        var items = [];
        // grabs requested items from sections with classes .item.has-image
        $('h3.item-title').each(function(i, element) {
        // $('.item.has-image').each(function(i, element) {
            // empties result object
            var result = {};
            result.title = $(this).text();
            result.link = $(this).children('a').attr(`href`);
            result.teaser = $(this).siblings('div.item-description').text();
            result.img = $(this).siblings('a.item-image').children('img.item-image-src').attr('src');
            items.push(new Articles(result));             
        });
        for (var i = 0; i < items.length; i++) {
            items[i].save(function(err, data) {
                if (err) {
                    console.log(err);
                } 
                else {
                    console.log(data);
                }
            });
            // retrieves articles from db only after all entries have been made
            if (i === (items.length - 1)) {
                res.redirect('/articles');
            }
        }

    });
});

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

// gets hidden articles from db and displays them
router.get('/hidden', function(req, res) {
    Articles.find({'status': 2}, (err, data) => {
        if (err) { 
            console.log(err);
        } else {
            res.render('index', {articles: data, hidden: true});
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

// assigns hidden status to article
router.post('/hide', (req, res) => {
    Articles.findOneAndUpdate({'_id': req.body.articleId}, {$set : {'status': 2}})
    .exec(function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.send('Post successful');
        }
    });
});

// removes articles from saved status 
router.post('/unsave', function(req, res) {
    Articles.findOneAndUpdate({'_id': req.body.articleId}, {$set : {'status': 0}})
    .exec((err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.send('Post successful');
        }
    });
});

// removes articles from hidden status 
router.post('/unhide', function(req, res) {
    Articles.findOneAndUpdate({'_id': req.body.articleId}, {$set : {'status': 0}})
    .exec(function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.send('Post successful');
        }
    });
});

// exports routes
module.exports = router;