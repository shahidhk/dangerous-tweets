const express = require('express');
const bodyParser = require('body-parser');
const { query } = require('graphqurl');
const badWords = new require('bad-words');
const filter = new badWords();

const app = express();

const reducer = (event) => {
  const state = event.data.new;

  // Do the thingz
  const raw = state.raw;

  // The ML and the AI
  const sanitized = filter.clean(raw);
  console.log(sanitized);

  // Save modified state
  query ({
    query: `mutation($sanitized:String!, $id:uuid!) {
      update_tweets(_set:{sanitized: $sanitized}, where:{id: {_eq: $id}}) {
        affected_rows
      }
    }`,
    endpoint: 'https://skm-test.herokuapp.com/v1/graphql',
    variables: {sanitized, id: event.data.new.id}
  },
  () => {
    return sanitized;
  },
  (error) => {
    console.error(error);
  });
};

app.use(bodyParser.json());

app.post('/', function (req, res) {
  try{
    var result = reducer(req.body.event);
    res.json(result);
  } catch(e) {
    console.log(e);
    res.status(500).json(e.toString());
  }
});

app.get('/', function (req, res) {
  res.send('Hello World - For Event Triggers, try a POST request?');
});

let port = process.env.PORT || '8000';

var server = app.listen(port, function () {
  console.log(`server listening at ${port}`);
});
