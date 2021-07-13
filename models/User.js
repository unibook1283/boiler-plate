const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;      // 암호화하는데 필요한 salt를 몇자리로 할것인가(대충 넣어주면됨)
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {                //유효성 관리
        type: String
    },
    tokenExp: {             //유효 기간
        type: Number
    }
})

userSchema.pre('save', function( next ) {   // index.js에서 user가 .save되기 전에
    var user = this;    // 위에 userSchema를 가리킨다.->그 요소들을 가져올 수 있음
    if(user.isModified('password')) {
            //비밀번호를 암호화 시킨다
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err);        //에러처리

            bcrypt.hash(user.password, salt, function(err, hash) {  //user.password: 입력받은 'plain password'
                if(err) return next(err)    //에러처리
                user.password = hash        //plain password를 hash화된 것으로 바꿔줌
                next()
            })
        })
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
    //plainPassword 1234567 vs 암호화된 비밀번호 $2b$10$450ODFoEu29QHpuaIBwzLOehIgW/i4/unRw1HK72gbR94pvkT7jqO
    //이 둘을 비교하기위해 또 bcrypt를 쓴다.
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;
    //jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken');   // 임의의 string 'secretToekn'과 user._id를 합쳐서 toekn 생성
                                                    // 후에 toekn과 secretToken을 이용해 user._id를 찾아낸다.
    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    })
    
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    //토큰을 decode한다.
    jwt.verify(token, 'secretToken', function(err, decoded) {
        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id": decoded, "token": token}, function(err, user) {
            if(err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema) //schema를 model로 감싸줘야된다

module.exports = { User } // User라는 model을 다른곳에서도 쓸 수 있도록 module.