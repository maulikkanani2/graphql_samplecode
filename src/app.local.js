'use strict';
const { App } = require('./app');
const port = process.env.PORT || 3100;

const express = require('express');
const fs = require('fs');
const cors = require('cors');
const graphql = require('graphql');
const bodyParser = require('body-parser');

const server = express();
const app = new App();

server.use(cors());

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.post('/graphql', async (req, res) => {
  const toReturn = await app.graphqlHTTP(determineTenant(), req.body);

  return res.status(200).send(toReturn);
});

server.post('/clone', async (req, res) => {
  const tenant = determineTenant();
  app
    .cloneScenario(tenant, req.body)
    .then(scenario => {
      console.log(scenario);
      res.status(200).send(scenario);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error);
    });
});

server.get('/version', (req, res, next) => {
  fs.readFile('etc/revision.json', 'utf-8', (err, data) => {
    if (err) {
      return next(err);
    }
    res.json(JSON.parse(data));
  });
});

/*
require('fs').writeFileSync(
  'schema.graphql',
  graphql.printSchema(res.locals.archen.getSchema())
);
*/

server.listen(port, () => console.log(`Server is listening on port ${port}.`));

function determineTenant(req) {
  var tenant = process.env.TENANT;
  console.log(`Running in local mode. Received call from tenant ${tenant}`);
  return tenant;
}
