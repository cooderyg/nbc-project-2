const express = require('express');
const router = express.Router();
const Comment = require('../schemas/comment');
const authMiddleware = require('../middlewares/auth-middleware');

// 조회
router.get('/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  // commnets 조회 sort매서드를 활용해서 내림차순으로 정렬
  const result = await Comment.find({ postId }).sort({
    //내림차순 -1 오름차순 1
    createdAt: -1,
  });

  res.status(200).json({ data: { result } });
});
// 조회 끝

// 생성
router.post('/comments/:postId', authMiddleware, async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  const { userId, nickname } = res.locals.user;
  // console.log(typeof postId); // 결과 string => 몽구스에서는 스키마를 잘 작성해줬다면 objectId로 자동변환시켜줌

  // content 입력 안했을 때 메세지
  if (!content) res.status(400).json({ message: '댓글 내용을 입력해주세요' });

  // 댓글생성
  try {
    // create(mongoose)
    const result = await Comment.create({
      nickname,
      content,
      userId,
      postId,
    });
    res.status(200).json({ data: { result } });
  } catch (error) {
    res.status(400).json({ errorMessage: error });
  }
});
// 생성 끝

// 삭제
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params;
  const { userId } = res.locals.user;

  // 댓글찾기
  const comment = await Comment.findOne({ _id: commentId });

  // 로그인정보와 댓글정보 일치하지 않으면 에러반환
  if (String(comment.userId) !== userId) {
    res.status(400).json({ errorMessage: '댓글을 삭제할 권한이 없습니다.' });
  }
  // delete(mongoose)
  const result = await Comment.deleteOne({ _id: commentId });
  res.status(200).json({ data: { result } });
});
// 삭제 끝

// 수정
router.put('/comments/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const { userId } = res.locals.user;
  // content 입력 안했을 때 메세지
  if (!content) {
    res.status(400).json({ errormessage: '댓글 내용을 입력해주세요.' });
  }

  // 댓글찾기
  const comment = await findComment({ commentId, res });

  // 로그인정보와 댓글정보 일치하지 않으면 에러반환
  if (String(comment.userId) !== userId) {
    res.status(400).json({ errorMessage: '댓글을 삭제할 권한이 없습니다.' });
  }

  // update(mongoose)
  try {
    const result = await Comment.updateOne(
      { _id: commentId },
      { $set: { content } },
    );
    res.status(200).json({ data: { result } });
  } catch (error) {
    res.status(400).json({ errorMessage: error });
  }
});
// 수정 끝

// 댓글찾기함수
const findComment = async ({ commentId, res }) => {
  try {
    return await Comment.findOne({ _id: commentId });
  } catch (error) {
    res.status(400).json({ errorMessage: error });
  }
};

module.exports = router;
