// 사용할 모듈 불러오기
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local'); // 사용자 인증을 구현하는 모듈
const { ExtractJwt, Strategy: JWTStrategy } = require('passport-jwt');
const bcrypt = require('bcrypt'); // 해쉬된 비밀번호를 비교하기 위한 bcrypt

const User = require('../models/user'); // sequelize의 user모델(User의 데이터를 조회 가능)
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
module.exports = () => {
    passport.use('local', new LocalStrategy(passportConfig, passportVerify));
    passport.use('jwt', new JWTStrategy(JWTConfig, JWTVerify));
};