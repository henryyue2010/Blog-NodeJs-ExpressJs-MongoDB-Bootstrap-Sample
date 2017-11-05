var express = require('express');
var router = express.Router();

var PostModel = require('../models/posts');
var CommentModel = require('../models/comments');
var checkLogin = require('../middlewares/check').checkLogin;

// GET /posts all authors' or particular author's posts
// eg: GET /posts?author=xxx
router.get('/', function(req, res, next) {
  var author = req.query.author;

  PostModel.getPosts(author)
    .then(function (posts) {
      res.render('posts', {
        posts: posts
      });
    })
    .catch(next);
});

// GET /posts/create
// create page
router.get('/create', checkLogin, function(req, res, next) {
  res.render('create');
});

// POST /posts
router.post('/', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var title = req.fields.title;
  var content = req.fields.content;

  // check
  try {
    if (!title.length) {
      throw new Error('Title must be completed');
    }
    if (!content.length) {
      throw new Error('Content must be completed');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  var post = {
    author: author,
    title: title,
    content: content,
    pv: 0
  };

  PostModel.create(post)
    .then(function (result) {
      //
      post = result.ops[0];
      req.flash('success', 'Create post successfully');
      // redirect to the post page
      res.redirect(`/posts/${post._id}`);
    })
    .catch(next);
});

// GET /posts/:postId
// one post
router.get('/:postId', function(req, res, next) {
  var postId = req.params.postId;
  
  Promise.all([
    PostModel.getPostById(postId),// get one post information
    CommentModel.getComments(postId),// get one post's all comments
    PostModel.incPv(postId)// pv + 1
  ])
  .then(function (result) {
    var post = result[0];
    var comments = result[1];
    if (!post) {
      throw new Error('The post does not exist');
    }

    res.render('post', {
      post: post,
      comments: comments
    });
  })
  .catch(next);
});

// GET /posts/:postId/edit
// get edit page
router.get('/:postId/edit', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('The post does not exist');
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('Not authorized');
      }
      res.render('edit', {
        post: post
      });
    })
    .catch(next);
});

// POST /posts/:postId/edit
// edit a post
router.post('/:postId/edit', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;
  var title = req.fields.title;
  var content = req.fields.content;

  PostModel.updatePostById(postId, author, { title: title, content: content })
    .then(function () {
      req.flash('success', 'Edit post successfully');
      // redirect to the post page
      res.redirect(`/posts/${postId}`);
    })
    .catch(next);
});

// GET /posts/:postId/remove
// delete post
router.get('/:postId/remove', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;

  PostModel.delPostById(postId, author)
    .then(function () {
      req.flash('success', 'Delete post successfully');
      // redirect to home page after deleting
      res.redirect('/home');
    })
    .catch(next);
});

// POST /posts/:postId/comment
// post a comment
router.post('/:postId/comment', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var postId = req.params.postId;
  var content = req.fields.content;
  var comment = {
    author: author,
    postId: postId,
    content: content
  };

  CommentModel.create(comment)
    .then(function () {
      req.flash('success', 'Comment successfully');
      // redirect to the last page
      res.redirect('back');
    })
    .catch(next);
});

// GET /posts/:postId/comment/:commentId/remove
// delete a comment
router.get('/:postId/comment/:commentId/remove', checkLogin, function(req, res, next) {
  var commentId = req.params.commentId;
  var author = req.session.user._id;

  CommentModel.delCommentById(commentId, author)
    .then(function () {
      req.flash('success', 'Delete a comment successfully');
      // redirect to the last page
      res.redirect('back');
    })
    .catch(next);
});

module.exports = router;
