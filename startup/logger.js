const winston = require("winston");

const logger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: "appError.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

function handleGlobalErrors() {
  process.on("uncaughtException", (ex) => {
    console.log("Uncaught exception!");
    logger.error(ex.message, ex);
    process.exit(1);
  });

  process.on("unhandledRejection", (ex) => {
    console.log("Unhandled rejection!");
    logger.error(ex.message, ex);
    process.exit(1);
  });
}
module.exports.logger = logger;
module.exports.handleGlobalErrors = handleGlobalErrors;
