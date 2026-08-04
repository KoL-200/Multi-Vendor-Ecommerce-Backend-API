const env = require('./src/config/env');
const logger = require('./src/config/logger');
const { connectDatabase } = require('./src/config/database');
const app = require('./src/app');

async function start() {
    try {
        await connectDatabase();
        app.listen(env.PORT, () => {
            logger.info(`Server running on http://localhost:${env.PORT}`);
        });
    } catch (err) {
        logger.error({ err }, 'Failed to start server');
        process.exit(1);
    }
}

start();