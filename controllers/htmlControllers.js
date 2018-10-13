var express = require('express')
var router = express.Router()
var Article = require('../models/Articles.js')
var request = require('request')
var rp = require('request-promise')
var axios = require('axios')
var cheerio = require('cheerio')

router.get('/', function (req, res) {
    console.log("hi")
    axios.get(`https://investopedia.com/news`)
        .then(function (html) {
            const $ = cheerio.load(html.data);
            // var items = [];
            $('h3.item-title').each(function (i, element) {
                // var results = {};
                const images = $(this).siblings('a.item-image').children('img.item-image-src').attr('src');
                const titles = $(this).text();
                const link = $(this).children('a').attr(`href`);
                const summaries = $(this).siblings('div.item-description').text();

                console.log(this);

                const reviewObj = {
                    titles: titles,
                    summaries: summaries,
                    url: `https://www.investopedia.com/${link}`,
                    images: images
                }
                console.log(reviewObj);
                let Review = new Article(reviewObj)

                Article.find({
                    summaries: reviewObj.summaries
                }).exec(function (err, doc) {
                    if (doc.length) {
                        console.log('Review already exists!')
                    } else {
                        Review.save(function (err, doc) {
                            if (err) {
                                console.log(err);
                                res.send(err)
                            } else {
                                console.log('review inserted')
                            }
                        })
                    }
                })
            })
        }).then(function () {
            Article.find({}).populate('comments').sort({
                date: -1
            }).exec(function (err, doc) {
                if (err) {
                    res.send(err)
                } else {
                    let reviewList = {
                        reviewList: doc
                    }
                    res.render('index', reviewList)
                }
            })
        }).catch(function (err) {
            console.log(err);
            res.send(err);
        })
})