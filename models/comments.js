var marked = require('marked');
var Comment = require('../lib/mongo').Comment;

// convert comment's content from markdown to html
Comment.plugin('contentToHtml', {
  afterFind: function (comments) {
    return comments.map(function (comment) {
      comment.content = marked(comment.content);
      return comment;
    });
  }
});

module.exports = {
  // create a comment
  create: function create(comment) {
    return Comment.create(comment).exec();
  },

  // delete a comment by user id and post id
  delCommentById: function delCommentById(commentId, author) {
    return Comment.remove({ author: author, _id: commentId }).exec();
  },

  // delete all comments of a post by post id
  delCommentsByPostId: function delCommentsByPostId(postId) {
    return Comment.remove({ postId: postId }).exec();
  },

  // retrieve all comments of a post，sorting by asc create time
  getComments: function getComments(postId) {
    return Comment
      .find({ postId: postId })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec();
  },

  // get comment count of one post by post id
  getCommentsCount: function getCommentsCount(postId) {
    return Comment.count({ postId: postId }).exec();
  }
};
