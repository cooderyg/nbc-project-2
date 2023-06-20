const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../schemas/user');
const signupValidation = require('../validations/signup.validation');
require('dotenv').config();

router.post('/signup', async (req, res) => {
  const { nickname, email, password, confirmPassword } = req.body;

  // password, nickname 유효성검사
  const isValid = signupValidation({ password, nickname });
  if (!isValid) {
    res
      .status(412)
      .json({ message: '닉네임 혹은 패스워드 형식이 비정상적입니다.' });
    return;
  }

  // password, confirmPassword 확인
  if (password !== confirmPassword) {
    res.status(400).json({
      errorMessage: 'password와 confirmPassword가 일치하지 않습니다.',
    });
    return;
  }

  // email에 해당하는 사용자가 없는가
  // nickname에 해당하는 사용자가 있는가
  const existUser = await User.findOne({
    Sor: [{ email, nickname }],
  });
  if (existUser) {
    res.status(400).json({
      errorMessage: 'Email이나 Nickname이 이미 사용 중입니다.',
    });
    return;
  }

  //  DB에 데이터를 삽입
  const user = new User({ nickname, email, password });
  const result = await user.save();

  res.status(201).json({ result });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  // 1. 사용자가 존재하지 않거나
  // 2. 입력받은 password와 사용자의 password가 다를 때 에러메시지가 발생

  if (!user || password !== user.password) {
    res.status(400).json({
      errorMessage:
        '사용자가 존재하지 않거나, 사용자의 password와 입력받은 password가 일치하지 않습니다.',
    });
    return;
  }

  const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY);
  console.log(token);
  res.status(200).json({ token });
});

module.exports = router;
