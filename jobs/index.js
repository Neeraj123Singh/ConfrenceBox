const Queue = require('bull');
const runWatchProcessor = require('./processors/emailQueue');
const redisUrl = `redis://127.0.0.1:6379`;

const emailQueue = new Queue('Email Queue', redisUrl);
emailQueue.process((job) => runWatchProcessor(job));


module.exports = {
    emailQueue
}
//runWatchQueue.add(null);

