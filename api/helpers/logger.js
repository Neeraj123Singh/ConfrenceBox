const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf,errors } = format;
const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
exports.logger = createLogger({
    level: 'info',
    format: combine(
      timestamp(),
      errors({ stack: true }),
      myFormat
    ),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' })
    ]
  });
  