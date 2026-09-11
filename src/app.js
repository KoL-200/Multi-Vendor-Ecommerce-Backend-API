require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');

const logger = require('./config/logger');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp(
    {
        logger,
        redact: {
            paths: [
                'req.headers.authorization',
                'req.body.password',
                'req.body.refreshToken',
                'req.body.accessToken',
            ],
            censor: '[REDACTED]',
        },
    }
)
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;