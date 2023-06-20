// 포스트 스키마
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'User',
  },
});

// createAt & updateAt 자동으로 생성해주는 옵션
postSchema.set('timestamps', true);

module.exports = mongoose.model('Post', postSchema);
