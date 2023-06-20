const express = require('express');
const app = express();
const port = 3000;

const postsRouter = require('./routes/posts');
const commnetsRouter = require('./routes/comments');
const authRouter = require('./routes/auth.js');

//블로그 연결
const connect = require('./schemas');
connect();

// 모든 라우터에서 bodyparser를 사용(미들웨어)
app.use(express.json());

// api 라우터들!!
app.use('/api', express.urlencoded({ extended: false }), [
  postsRouter,
  commnetsRouter,
  authRouter,
]);

// 서버실행 후 클라이언트의 요청을 대기!!
app.listen(port, () => {
  console.log(port, '서버가 실행되었습니다.');
});
