const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

// application-wide json parser
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
  next();
});

const PORT = 3000;
const secretKey = 'The secret key';
const jwtMW = exjwt({
  secret: secretKey,
  algorithms: ['HS256']
});
const expiresIn = 1000 * 60 * 3;

let users = [
  {
    id: 1,
    username: 'fabio',
    password: '123'
  },
  {
    id: 2,
    username: 'nolasco',
    password: '456'
  },
  {
    id: 3,
    username: 'udimkpa',
    password: '789'
  }
]

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  let token;
  // console.log('Server side: ', username, password);
  // res.json({data: 'received!'});

  for (let user of users) {
    if (username === user.username && password === user.password) {
      token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: expiresIn });
      
      // debugger;
      // let timeout = '1000';
      // setTimeout(function () {
      //   console.log('Token has expired!');
      // }, 1000);
      // console.log(token.expiresIn);
      
      res.json({
        success: true,
        err: null,
        expiresIn: expiresIn,
        token
      });

      break;
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      err: 'Username or password is incorrect',
      token: null
    });
  }
});

app.get('/api/dashboard', jwtMW, (req, res) => {
  // console.log(req);
  res.json({
    success: true,
    myContent: 'Your content'
  });
});

app.get('/api/settings', jwtMW, (req, res) => {
  // console.log(req);
  res.json({
    success: true,
    myContent: 'This is your settings page'
  })
})

app.use(function (err, req, res, next) {
  // console.log(err.name === 'UnauthorizedError');
  // console.log(err);
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      officialError: err,
      err: 'Protected route: Username or password is incorrect'
    })
  } else {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`Serving on port http://localhost:${PORT}`);
});