const Book = require('../../models/book');
const Joi = require('joi');
const {	Types: { ObjectId }} = require('mongoose');

exports.list = async(ctx) => {
    let books;

    try{
        books = await Book.find()
        .sort({_id: -1})
        .limit(3)
        .exec();
    }
    catch(e)
    {
        return ctx.throw(500,e);
    }

    ctx.body = books;
};

exports.create = async(ctx) => {
    const { 
        title, 
        authors, 
        publishedDate, 
        price, 
        tags 
    } = ctx.request.body;

    const book = new Book({
        title,
        authors,
        publishedDate,
        price,
        tags
    })

    try
    {
        // book 저장을 비동기로 처리
        await book.save();
    }
    catch(e)
    {
        // 실패시 에러 반환
        return ctx.throw(500, e);
    }

    ctx.body = book;
};

exports.get = async(ctx) => {
    const { id } =ctx.params;
    let book;

    try{
        book = await Book.findById(id).exec();
    }
    catch(e){
        if(e.name === 'CastError')
        {
            // id에 대한 에러처리
            ctx.status = 400;
            return;
        }
        return ctx.throw(500,e);
    }

    if(!book)
    {
        // 존재하지 않을때
        ctx.status = 404;
        ctx.body = {message: 'book not found'};
        return;
    }

    ctx.body = book;
};

exports.delete = async(ctx) => {
    const {id} = ctx.params;
    try{
        await Book.findByIdAndRemove(id).exec();
    }
    catch(e)
    {
        if(e.name === 'CastError')
        {
            ctx.status = 400;
            return;
        }
    }

    ctx.status = 204; // No Content
};

exports.replace = async(ctx) => {
    const { id } = ctx.params;

	if (!ObjectId.isValid(id)) {
        ctx.status = 400;
        ctx.body = "object ID is not valid";
        
		return;
	}

	const schema = Joi.object().keys({
		title: Joi.string().required(), // required()는 필수 항목이란 뜻
		authors: Joi.array().items(
			Joi.object().keys({
				name: Joi.string().required(),
				email: Joi.string().email().required(),
            })
        ),
        publishedDate: Joi.date().required(),
        price: Joi.number().required(),
        tags: Joi.array().items((Joi.string()).required())            
    });
    const result = Joi.validate(ctx.request.body, schema);

    if(result.error)
    {
        // 스키마가 잘못된경우
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }
    
    let book;

    try {
        // 아이디로 찾아서 업데이트를 합니다.
        // 파라미터는 (아이디, 변경 할 값, 설정) 순 입니다.
        book = await Book.findByIdAndUpdate(id, ctx.request.body, {
            upsert: true, // 이 값을 넣어주면 데이터가 존재하지 않으면 새로 만들어줍니다
            new: true // 이 값을 넣어줘야 반환하는 값이 업데이트된 데이터입니다.
                      // 이 값이 없으면 ctx.body = book 했을때 업데이트 전의 데이터를 보여줍니다.
        });
    } catch (e) {
        return ctx.throw(500, e);
    }
    ctx.body = book;
};

exports.update = async (ctx) => {
    const { id } =ctx.params;

    if(!ObjectId.isValid(id)){
        ctx.status = 400;
        return;
    }

    let book;

    try{
        book = await Book.findByIdAndUpdate(id, ctx.request.body,{
            new: true   
            // 이걸 넣어주어야 반환값이 업데이트된 값. 
            // 안하면 업데이트 전의 데이터를 보여줌.
        })
    }
    catch(e){
        return ctx.throw(500, e);
    }

    ctx.body = book;
};