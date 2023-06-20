const signupValidation = ({ password, nickname }) => {
  // 영문과 숫자만 입력가능
  const nicknameCheck = /^[a-zA-Z0-9]+$/;
  if (nicknameCheck.test(nickname) || nickname.length < 3) {
    return false;
  }
  // 비번에 닉네임 포함 불가능
  if (password.includes(nickname) || password.length < 4) {
    return false;
  }
  return true;
};

module.exports = signupValidation;
