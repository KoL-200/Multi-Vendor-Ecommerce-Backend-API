const pino = require('pino');
const env = require('./env');

const logger = pino({
    level: env.LOG_LEVEL || (env.NODE_ENV === 'production' ? 'info' : 'debug'),
    transport:
        env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
            : undefined,
});

module.exports = logger;