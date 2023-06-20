// 모델
// jwt
const jwt = require('jsonwebtoken');
const User = require('../schemas/user');

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(400).json({ errorMessage: '로그인 토큰이 존재하지 않습니다.' });
  }
  const [authType, authToken] = authorization.split(' ');
  // authType: Bearer
  // authToken: 실제 jwt 값

  const lowerAuthType = authType.toLowerCase();
  if (lowerAuthType !== 'bearer' || !authToken) {
    res.status(400).json({
      errorMessage: '로그인 정보가 정확하지 않습니다.',
    });
    return;
  }
  try {
    const { userId } = jwt.verify(authToken, 'young-secretkey');
    const user = await User.findById(userId);

    if (!user) {
      res
        .status(401)
        .json({ message: '토큰에 해당하는 사용자가 존재하지 않습니다.' });
      return;
    }
    res.locals.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({
      errorMessage: '로그인 정보가 정확하지 않습니다.',
    });
  }
};
