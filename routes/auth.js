const express = require('express');
const passport = require('passport');

const router = express.Router();

// /kakao로 요청오면, 카카오 로그인 페이지로 가게 되고, 카카오 서버를 통해 카카오 로그인을 하게 되면, 다음 라우터로 요청한다.
router.get('/kakao', passport.authenticate('kakao'));

// 위에서 카카오 서버 로그인이 되면, 카카오 redirect url 설정에 따라 이쪽 라우터로 오게 된다.
// 그리고 passport 로그인 전략에 의해 kakaoStrategy로 가서 카카오계정 정보와 DB를 비교해서 회원가입시키거나 로그인 처리하게 한다.
router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/', // KakaoStrategy에서 실패한다면 실행
}), (res, req) => { // KakaoStrategy에서 성공한다면 콜백 실행
    res.redirect('/auth');    
});

module.exports = router;