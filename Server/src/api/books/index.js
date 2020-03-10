const Router = require('koa-router');

const books = new Router();
const booksCtrl = require('./books.controller');

const handler = (ctx, next) => {
    // example handler
    ctx. body = `${ctx.request.method} ${ctx.request.path}`;
}

// define REST API's methods : get, post, delete, put, patch
// 각 메소드에 대한 핸들러를 getHandler처럼 따로 작성할것.
// 이 프로젝트에서는 books.controller.js에 작성됨.
books.get('/', booksCtrl.list);

books.get('/:id', booksCtrl.get);

books.post('/', booksCtrl.create);

books.delete('/:id', booksCtrl.delete);

books.put('/:id', booksCtrl.replace);

books.patch('/:id', booksCtrl.update);

module.exports = books;