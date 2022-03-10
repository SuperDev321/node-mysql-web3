require('dotenv').config()
const express = require('express')
const http = require('http');
const compression = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./router');

const port = process.env.PORT;
const app = express();
const server = http.createServer(app)
app.use(cookieParser());
app.use(compression());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(cors())

app.use('/api', router)

app.get('/', (req, res) => {
  res.send('Hello World!')
});


server.listen(port, () =>
  // eslint-disable-next-line no-console
  console.log(`server is running`)
);
