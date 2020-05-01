
import express from 'express';
import winston from 'winston';
import Server from './server.js';

const app = express()
const port = 3000

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console()
    ]
});

app.use('/', express.static("dist"))
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

const server = new Server();
server.start();

logger.info("Starting ");


