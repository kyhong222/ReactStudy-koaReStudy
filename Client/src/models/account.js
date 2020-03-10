const mongoose = require('mongoose');
const {Schema} = mongoose;
const crypto = require('crypto');
const { generateToken } = require('../lib/token');

function hash(password){
    return crypto.createHmac('sha256', process.env.SECRET_KEY).update(password).digest('hex');
}

const Account = new Schema({
    profile: {
        username: String,
        thumbnail: {
            type: String, 
            default: '/static/images/default_thumbnail.png'
        },
    },
    email: {type: String},
    socail:{
        facebook:{
            id:String,
            accessToken: String
        },
        google:{
            id: String,
            accessToken: String
        }
    },
    password: String,
    thoughtCount: {type:Number, default: 0},
    createAt: {type: Date, default: Date.now}     
});

Account.statics.findByUsername = function(username) {
    // 객체에 내장되어있는 값을 사용 할 때는 객체명.키 이런식으로 쿼리하면 됩니다
    return this.findOne({'profile.username': username}).exec();
};

Account.statics.findByEmail = function(email)
{
    return this.findOne({email}).exec();
};

Account.statics.findByEmailOrUsername = function({username, email}){
    return this.findOne({
        $or: [
            {'profile.username': username},
            {email}
        ]
    }).exec();
};

Account.statics.localRegister = function({username,email,password})
{
    // 데이터 생성, new this() 사용
    const account = new this({
        profile: {
            username
        },
        email,
        password: hash(password)
    });
    return account.save();
};

Account.methods.validatePassword = function(password){
    const hashed = hash(password);
    return this.password === hashed;
};

Account.methods.generateToken = function() {
    // JWT 에 담을 내용
    const payload = {
        _id: this._id,
        profile: this.profile
    };

    return generateToken(payload, 'account');
};

module.exports = mongoose.model('Account', Account);