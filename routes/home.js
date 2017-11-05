
var express = require('express');
var router = express.Router();

var PostModel = require('../models/posts');

router.get('/', function(req, res, next) {
    var author = req.query.author;
    var page = req.query.p ? parseInt(req.query.p) : 1;

    PostModel.getAllPosts(author)
        .then(function (all) {
            req.total = all.length;
        });
    next();
    },function(req, res, next){
    var author = req.query.author;
    var page = req.query.p ? parseInt(req.query.p) : 1;
    PostModel.getTenPosts(author, page)
        .then(function (posts) {
            res.render('home', {
                posts: posts,
                page: page,
                pageCount: Math.ceil(req.total / 10),
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page-1)*10 + posts.length) == req.total
            });
        }).catch(next);


});
module.exports = router;