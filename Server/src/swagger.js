import swaggerJSDoc from 'swagger-jsdoc';

const options = swaggerJSDoc({
    // 페이지 상단에 표시될 정보
    swaggerDefinition:{
        info:{
            title: 'Example API',
            description: 'Express with webpack',
            version: '1.0.0',
        },

        // host, basePath는 swagger에서 요청시 prefix 해준다.
        // http://<host><basePath>
        host: 'localhost:4000',
        basePath: '/api/v1',
        schemes: ['http'],
    },
    apis: ['./api.**.*.spec.js'],
})