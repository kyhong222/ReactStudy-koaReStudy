const Joi = require('joi');
const Account = require('../../models/account');

// local sign-up
exports.localRegister = async ctx => {
	// 데이터 검증
	const schema = Joi.object().keys({
		username: Joi.string()
			.alphanum()
			.min(4)
			.max(15)
			.required(),
		email: Joi.string()
			.email()
			.required(),
		password: Joi.string()
			.required()
			.min(6),
	});

	const result = Joi.validate(ctx.request.body, schema);

	// 스키마 검증 실패시
	if (result.error) {
		ctx.status = 400;
		return;
	}

	// 이메일 중복처리 구현
	// 아이디와 이메일 중복체크
	let existing = null;
	try {
		existing = await Account.findByEmailOrUsername(ctx.request.body);
	} catch (e) {
		ctx.throw(500, e);
	}
	if (existing) {
		// 중복인 경우
		ctx.status = 409;
		ctx.body = {
			// 이메일이 일치하면 이메일을
			// 그렇지않으면 (유저네임이 일치하는거니까) 유저네임을 key에 지정
			key: existing.email === ctx.request.body.email ? 'email' : 'username',
		};
		return;
	}

	// 계정 생성
	let account = null;
	try {
		account = await Account.localRegister(ctx.request.body);
	} catch (e) {
		ctx.throw(500, e);
	}

	let token = null;
	try {
		token = await account.generateToken();
	} catch (e) {
		ctx.throw(500, e);
	}

	ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });

	ctx.body = account.profile;
};

exports.localLogin = async ctx => {
	const schema = Joi.object().keys({
		// 로그인 입력 폼에 대하여, 이메일과 비번을 검증
		email: Joi.string()
			.email()
			.required(),
		password: Joi.string().required(),
	});

	const result = Joi.validate(ctx.request.body, schema);

	if (result.error) {
		ctx.status = 400; // bad request
		return;
	}

	const { email, password } = ctx.request.body;

	let account = null;
	try {
		// 이메일로 계정의 존재 찾기
		account = await Account.findByEmail(email);
	} catch (e) {
		ctx.throw(500, e);
	}
	if (!account || !account.validatePassword(password)) {
		// 유저가 존재하지 않거나 || 비번이 일치하지않음
		ctx.status = 403; //forbidden
		return;
	}

	let token = null;
	try {
		token = await account.generateToken();
	} catch (e) {
		ctx.throw(500, e);
	}

	ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
	ctx.body = account.profile;
};

exports.exists = async ctx => {
	const { key, value } = ctx.params;
	let account = null;

	try {
		account = await (key === 'email' ? Account.findByEmail(value) : Account.findByUsername(value));
	} catch (e) {
		ctx.throw(500, e);
	}

	ctx.body = {
		exists: account !== null,
	};
};

exports.logout = async ctx => {
	ctx.cookies.set('access_token', null, {
		maxAge: 0,
		httpOnly: true,
	});
	ctx.status = 204;
};


exports.check = (ctx) => {
    // if access_token is exist
    const {user} = ctx.request;
    
    if(!user){
        // there's no token
        ctx.status = 403;   // forbidden
        return;
    }
    // then, response logined user's info with ctx
    ctx.body = user.profile;
}