const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {User} = require('../model/user');

const router = express.Router();

// token 인증 확인(header에 token으로 token값 보내기)
router.post('/auth', passport.authenticate('jwt', { session: false }),
	async (req, res, next) => {
    try {
      res.json({ result: true });
    } catch (error) {
      console.error(error);
      next(error);
    }
});


// 회원가입
// 127.0.0.1:5000/users/signup
router.post('/signup', function(req, res) {
  try {
      const user = new User();
      user.userId = req.body.userId;
      user.email = req.body.email;
      user.password = req.body.password;
      user.username = req.body.username;
      user.regdate = req.body.regdate;

      user.save(function(err){
        if(err){
          console.error(err);
          res.send({result: 0});
        }
        res.send({result: 1});
      });  
  }
  catch(err) {
    console.log(err);
    next(err);
  }
});

//  로그인
// 127.0.0.1:5000/users/login
router.post('/login', async(req, res, next) => {
  try {
    // index.js에서 local로 등록한 인증과정 실행
    passport.authenticate('local', (passportError, user, info) => {
      // 인증이 실패했거나 유저 데이터가 없다면 에러 발생
      if(passportError || !user) {
        res.status(400).json({message:info.reason});
        return;
      }

      // user데이터를 통해 로그인 진행
      req.login(user, {session:false}, (loginError) => {
        if(loginError) {
          res.send(loginError);
          return;
        }
        // 클라이언트에게 JWT생성 후 반환
        const token = jwt.sign(
          {id:user.id, name:user.name, auth:user.auth},
          'jwt-secret-key'
        );
        res.json({token});
      });
    })(req, res, next);
  }
  catch(error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;