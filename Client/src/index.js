require('dotenv').config('koa');

// import swaggerUI from 'swagger-ui-koa';
// import convert from 'koa-convert';
// import mount from 'koa-mount';

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();
const api = require('./api');

const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');

const {jwtMiddleware} = require('./lib/token');

// export const swaggerConfig = (app) => {
//     app.use(swaggerUI.serve);
//     app.use(convert(mount('/swagger-apis', swaggerUI.setup(options))));
// }

mongoose.Promise = global.Promise;  // using node's native promise
// connection mongoDB
mongoose.connect(process.env.MONGO_URI, {
    useMongoClient: true
}).then(
    (response) => {
        console.log('connected to mongoDB');
    }
).catch(e => {
    console.log('connection failed')
    console.error(e);
})

const port = process.env.PORT || 4000;

app.use(bodyParser());  // bodyparser사용, router 적용보다 위에 있어야함.
app.use(jwtMiddleware);

router.use('/api', api.routes());
app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
	console.log('my server is listening to port 4000');
});
