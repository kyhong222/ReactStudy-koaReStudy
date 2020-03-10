const mongoose = require('mongoose');
const {Schema} = mongoose;

const Author = new Schema({
    name: String,
    email: String
});

const Book = new Schema({
    title: String,
    authors: [Author],
    publishedDate: Date,
    price: Number,
    tags: [String],
    createdAt:{
        // default가 있는 경우엔 이렇게 객체로 설정.
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', Book);