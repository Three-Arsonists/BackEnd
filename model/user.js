const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 

const userSchema = new mongoose.Schema({
    userId : { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, // 순서대로 문자열이고 필수이며 유일해야한다
    password: { type: String, required: true, min: 8, trim: true }, // 최소 8자로 설정, trim은 공백은 제외한다는 의미
    username: String,
    birth: { type: Date, default: Date.now }, // 생년월일을 선택안하면 가입한날이 기본값으로 들어간다.
});

userSchema.pre('save', function(next) {
    // pre를 통해 해당 스키마에 데이터가 저장되기전(.create) 수행할 작업들을 지정해줄 수 있음
    let user = this;
    if (user.isModified("password")) { //패스워드가 변경될때만 해싱작업이 처리됨.
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return next(err);
                bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
})

const User = mongoose.model('User', userSchema);
module.exports = {User};