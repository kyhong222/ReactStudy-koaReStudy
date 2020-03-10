const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

function generateToken(payload) {
    return new Promise(
        (resolve, reject) => {
            jwt.sign(
                payload,
                jwtSecret,
                {
                    expiresIn: '7d'
                }, (error, token) => {
                    if(error) reject(error);
                    resolve(token);
                }
            );
        }
    );
};

function decodeToken(token)
{
    return new Promise(
        (resolve, reject) => {
            jwt.verify(token, jwtSecret, (error, decoded) => {
                if(error) reject(error);
                resolve(decoded);
            });
        }
    );
}

exports.jwtMiddleware = async (ctx, next) => {
    const token = ctx.cookies.get('access_token');  // get token from ctx
    if(!token) return next();   // if token is not exist, skip

    try{
        const decoded = await decodeToken(token);   // to decode token

        // if token has 1 valid day, refresh it
        if(Date.now() / 1000 - decoded.iat>60*60*24){
            const {_id, profile} = decoded;
            const freshToken = await generateToken({_id, profile}, 'account');
            ctx.cookies.set('access_token', freshToken,{
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
                httpOnly: true
            });
        }
        ctx.request.user = decoded;
    }
    catch(e)
    {
        ctx.request.user = null;
    }
    return next();
};

exports.generateToken = generateToken;