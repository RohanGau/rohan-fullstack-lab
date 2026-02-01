import process from 'process';
import path from 'path';
import glob from 'glob';
import swaggerJSDoc from 'swagger-jsdoc';

const isDev = (process.env.NODE_ENV ?? 'development') === 'development';

const fromRoot = (...p: string[]) => path.resolve(process.cwd(), ...p);

const apiGlobs = isDev
  ? [fromRoot('src/routes/**/*.ts'), fromRoot('src/controllers/**/*.ts')]
  : [fromRoot('dist/routes/**/*.js'), fromRoot('dist/controllers/**/*.js')];

if (process.env.SWAGGER_DEBUG === '1') {
  const matched = apiGlobs.flatMap((g) => glob.sync(g));
  console.log('Swagger files:', matched);
}

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
  apis: apiGlobs,
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
