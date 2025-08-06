import process from 'process';
import swaggerJSDoc from 'swagger-jsdoc';

const isDev = process.env.NODE_ENV === 'development';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for your Todo backend',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || `http://localhost:${process.env.PORT || 5050}`,
      },
    ],
  },
  apis: isDev
    ? ['./src/routes/*.ts', './src/controllers/*.ts']
    : ['./dist/routes/*.js', './dist/controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
