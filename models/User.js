const mongoose = require('mongoose');

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

const User = mongoose.model('User', userSchema) //schema를 model로 감싸줘야된다

module.exports = {User} // User라는 model을 다른곳에서도 쓸 수 있도록 module.