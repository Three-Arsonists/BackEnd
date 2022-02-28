// 사용할 모듈 불러오기
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local'); // 사용자 인증을 구현하는 모듈
const { ExtractJwt, Strategy: JWTStrategy } = require('passport-jwt');
const KakaoStrategy = require('passport-kakao').Strategy;
const bcrypt = require('bcrypt'); // 해쉬된 비밀번호를 비교하기 위한 bcrypt
require("dotenv").config();

const {User} = require('../model/user'); // mongoose의 user모델(User의 데이터를 조회 가능)
// {"userId": "jihi", "password": "password"}
const passportConfig = { usernameField:'userId', passwordField:'password'}

const passportVerify = async(userId, password, done) => {
    try{
        // 유저 아이디로 일치하는 유저 데이터 검색
        const user = await User.findOne({ where:{ user_id:userId }});
        
        if(!user) { // 검색된 유저 데이터가 없다면 에러 표시
            done(null, false, { reason:'존재하지 않는 사용자입니다.' });
            return;
        }
        // 검색된 유저 데이터가 있다면 해쉬된 비밀번호 비교
        const compareResult = await bcrypt.compare(password, user.password);

        // 해쉬된 비밀번호가 같다면 유저 데이터 객체 전송
        if(compareResult) {
            done(null, user);
            return;
        }
        // 비밀번호가 다를 경우 에러 표시
        done(null, false, {reason:'올바르지 않은 비밀번호 입니다.'});
    }
    catch(error) { 
        console.error(error);
        done(error);
    }
};

const JWTConfig = { // token을 읽기위한 설정
    jwtFromRequest: ExtractJwt.fromHeader('authorization'), // request에서 header의 authorization에서 정보를 가져온다
    secretOrKey: 'jwt-secret-key', // 암호 키 입력
};

const JWTVerify = async(jwtPayload, done) => {
    try{
        // payload의 id값으로 유저의 데이터 조회
        const user = await User.findOne({where:{id:jwtPayload.id}});
        // 유저 데이터가 있다면 유저 데이터 객체 전송
        if(user) {
            done(null, user);
            return;
        }
        // 유저 데이터가 없다면 에러 표시
        done(null, false, {reason:'올바르지 않은 인증정보입니다.'});
    }
    catch(error) {
        console.error(error);
        done(error);
    }
}

const KAKAOConfig = {
    clientID: process.env.KAKAO_ID, // 카카오 로그인에서 발급받은 REST API KEY
    callbackURL : '/auth/kakao/callback', // 카카오 로그인 Redirect URL 경로
};

// accessToken, refreshToken은 로그인 성공 후 카카오가 보내준 토큰, profile은 카카오가 보내준 유저 정보
const KAKAOVerify = async (accessToken, refreshToken, profile, done) => {
    console.log('kakao profile', profile);
    try{
        const exUser = await User.findOne({
            // 카카오 플랫폼에서 로그인 했고 & snsId필드에 카카오 아이디가 일치할 경우
            where: {snsId: profile.id, provider: 'kakao'},
        });
        // 이미 가입된 카카오 프로필이면 성공
        if(exUser) {
            done(null, exUser); // 로그인 성공
        } else{ // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다.
            const newUser = await User.create({
                email: profile._json && profile._json.kakao_account_email,
                username: profile.displayName,
                snsId: profile.id,
                provider: 'kakao',
            });
            done(null, newUser); // 회원가입하고 로그인 인증 완료
        }
    }
    catch(error) {
        console.error(error);
        done(error);
    }
};

module.exports = () => {
    passport.use('local', new LocalStrategy(passportConfig, passportVerify));
    passport.use('jwt', new JWTStrategy(JWTConfig, JWTVerify));
    passport.use('kakao', new KakaoStrategy(KAKAOConfig, KAKAOVerify));
};