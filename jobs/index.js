const Queue = require('bull');
const runWatchProcessor = require('./processors/emailQueueLead');
const calculatePayoutForLeadProcessor = require('./processors/calculatePayoutForLead');
const dsaCountByStepProcessor = require('./processors/dsaCountByStep');
const uploadPayoutProcessor  = require('./processors/uploadPayout');
const uploadBankProcessor  = require('./processors/uploadBank');
const createUserFromDsaProcessor = require('./processors/createUserFromDsa')
const redisUrl = `redis://127.0.0.1:6379`;

const emailQueueLead = new Queue('Email Queue', redisUrl);
const cplq = new Queue('Payout For Lead Calculate', redisUrl);
const dsaCountByStepQueue = new Queue('Dsa Count By Step', redisUrl);
const createUserFromDsaQueue = new Queue('Create User From Dsa');
const uploadPayoutQueue = new Queue('Upload Payout Queue', redisUrl);
const uploadBankQueue = new Queue('Upload Bank Queue', redisUrl);
emailQueueLead.process((job) => runWatchProcessor(job));
createUserFromDsaQueue.process((job)=> createUserFromDsaProcessor(job));
uploadPayoutQueue.process((job) => uploadPayoutProcessor(job));
uploadBankQueue.process((job) => uploadBankProcessor(job));
cplq.process((job) => calculatePayoutForLeadProcessor(job));
dsaCountByStepQueue.process((job)=>dsaCountByStepProcessor(job))
dsaCountByStepQueue.add(null,{repeat:{cron:"0 0 * * *"}});
createUserFromDsaQueue.add(null,{repeat:{cron:"0 1 * * *"}});


// emailQueue.add(null)
// cplq.add(null)


module.exports = {
    emailQueueLead,
    cplq,
    uploadPayoutQueue,
    uploadBankQueue,
    createUserFromDsaQueue
}
//runWatchQueue.add(null);

