const express = require('express');
const router = express.Router();
const Post = require('../schemas/post');
const Comment = require('../schemas/comment');
const authMiddleware = require('../middlewares/auth-middleware');

// posts 전체 조회
router.get('/posts', async (_, res) => {
  try {
    // posts 조회 sort매서드를 활용해서 내림차순으로 정렬
    const posts = await Post.find({}).sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ errorMessage: error });
  }
});
// posts 전체 조회 끝

// 상세조회
router.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    //postId로 조회
    const result = await Post.findOne({ _id: postId });
    if (!result) {
      res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
      return;
    }
    res.status(200).json({ data: { result } });
  } catch (error) {
    res.status(500).json({ errorMessage: error });
  }
});
// 상세조회 끝

// 생성
router.post('/posts', authMiddleware, async (req, res) => {
  const { password, title, content } = req.body;
  // 미들웨어에서 로그인한 유저데이터로 id, nickname 받아오기
  const { userId, nickname } = res.locals.user;
  // content 입력 안했을 때 메세지
  if (!content) {
    res.status(400).json({ message: '포스트 내용을 입력해주세요' });
    return;
  }

  try {
    // post 생성
    const result = await Post.create({
      nickname,
      password,
      title,
      content,
      userId,
    });
    res.status(200).json({ data: { result } });
  } catch (error) {
    res.status(500).json({ errorMessage: error });
  }
});
// 생성 끝

// 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;

  // 커스텀 찾기 함수 최하단참조
  const post = findPost(postId);
  if (post.userId !== userId) {
    res.status(400).json({ errorMessage: '글을 삭제할 권한이 없습니다.' });
    return;
  }

  try {
    // 해당 post 삭제
    const postDeleteResult = await Post.deleteOne({ _id: postId });

    // 해당 Post와 연결된 댓글들 삭제
    const commentDeleteResult = await Comment.deleteMany({ postId: postId });
    res.status(200).json({ data: { postDeleteResult, commentDeleteResult } });
  } catch (error) {
    res.status(500).json({ errorMessage: error });
  }
});
// 삭제 끝

// 수정
router.put('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { content, title } = req.body;
  const { userId } = res.locals.user;

  // content 입력 안했을 때 메세지
  if (!content || !title) {
    res.status(400).json({ message: '포스트 내용을 입력해주세요' });
    return;
  }

  // findPost 함수
  const post = await findPost({ postId, res });

  // 로그인유저가 글쓴이가 아닐 때
  if (post.userId !== userId) {
    res.status(400).json({ errorMessage: '글을 삭제할 권한이 없습니다.' });
    return;
  }

  try {
    // update
    const result = await Post.updateOne(
      { _id: postId },
      { $set: { content, title } },
    );
    res.status(200).json({ data: { result } });
  } catch (error) {
    res.status(500).json({ errorMessage: error });
  }
});
// 수정 끝

// post찾기 함수 delet, put 등에서 사용
const findPost = async ({ postId, res }) => {
  try {
    return await Post.findOne({ _id: postId });
  } catch (error) {
    res.status(500).json({ errorMessage: error });
  }
};

module.exports = router;
