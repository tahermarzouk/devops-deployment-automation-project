const keys = require("./keys");

// Express Application setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");


const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;
const uuid = require('uuid');

const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { globalTracer } = require('@opentelemetry/api');



// Create a logger with the JSON format and console and file transports
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});



const zipkinExporter = new ZipkinExporter({
  serviceName: process.env.OTEL_SERVICE_NAME,
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
});
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(zipkinExporter));
provider.register();


// Create a custom format for the logs
const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message} requestId=${info.requestId} clientIp=${info.clientIp}`;
});

// Create a logger with the JSON format and console and file transports
const custom_logger = winston.createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});





// Function to generate a new request id (UUID)
function generateRequestId() {
  return uuid.v4();
}


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres client setup
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();
collectDefaultMetrics({ register });


const numberOfRequestsCounter = new client.Counter({
    name: 'number_of_inputs',
    help: 'counts the numbers of inputs',
    labelNames: ['status'],
});



register.registerMetric(numberOfRequestsCounter)



pgClient.on("connect", client => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch(err => console.log("PG ERROR", err));
});

//Express route definitions
app.get("/", (req, res) => {
  res.send("Hi");


  let requestId;
  if(req.headers && req.headers["X-Request-ID"]) {
    requestId = req.headers["X-Request-ID"];
  } else {
    requestId = generateRequestId();
  }
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Log the request details
  logger.info({ 
    message: 'Handling request',
    requestId: requestId, 
    clientIp: clientIp 
  });

});

// get the values
app.get("/values/all", async (req, res) => {

  const values = await pgClient.query("SELECT * FROM values");

  res.send(values);
});

// now the post -> insert value
app.post("/values", async (req, res) => {


  let requestId;
  if(req.headers && req.headers["X-Request-ID"]) {
    requestId = req.headers["X-Request-ID"];
  } else {
    requestId = generateRequestId();
  }
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;



 
  const span = globalTracer().startSpan('handleRequest');
// set requestId and clientIp as attributes
span.setAttribute('requestId', requestId);
span.setAttribute('clientIp', clientIp);


  // Log the request details
  custom_logger.info({ 
    message: 'Handling request',
    requestId: requestId, 
    clientIp: clientIp 
  });



if (!req.body.value) 
    {
        res.send({ working: false });
    }  

  if (parseInt(req.body.value)) 
  {
      numberOfRequestsCounter.inc({ 'status': 200 });
      res.send({ working: false });
  }  
else{
  numberOfRequestsCounter.inc({ 'status': 400 });
}


  pgClient.query("INSERT INTO values(number) VALUES($1)", [req.body.value]);


    // Log the response details
    logger.info({ 
      message: 'Request handled',
      requestId: requestId, 
      clientIp: clientIp,
      value: req.body.value 
    });


  res.send({ working: true });

 
});


app.get('/metrics', async (req, res) => {
    try {
        return res.status(200).send(await register.metrics())
    } catch (error) {
        return error
    }
})



app.listen(5000, err => {
  console.log("Listening");

});

