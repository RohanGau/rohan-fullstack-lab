import pino from 'pino';
import process from 'process';

const isProduction = process.env.NODE_ENV === 'production';
const logtailToken = process.env.LOGTAIL_SOURCE_TOKEN;

// Build transports array
const transports: any[] = [];

// Development: Pretty printing
if (!isProduction) {
  transports.push({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  });
}

// Production: Send to Logtail if configured
if (isProduction && logtailToken) {
  transports.push({
    target: '@logtail/pino',
    options: {
      sourceToken: logtailToken,
    },
  });
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Use transport only if we have transports configured
  ...(transports.length > 0 && {
    transport:
      transports.length === 1
        ? transports[0]
        : {
            targets: transports,
          },
  }),
});

export default logger;
