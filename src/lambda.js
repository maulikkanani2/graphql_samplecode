const jwt = require('jsonwebtoken');
const Raven = require('raven-js');
const { App } = require('./app');
const app = new App();

Raven
  .config('https://99766b0fa52f46cf8234f9a51ad613af@sentry.io/291544')
  .install();

exports.handler = async function (event, context, callback) {
  try {
    const httpMethod = event.httpMethod;

    if ('OPTIONS' == httpMethod) {
      return {
        isBase64Encoded: false,
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type'
        },
        body: 'OK'
      };
    }

    const tenant = determineTenant(event.headers['Authorization']);
    const method = event.pathParameters['proxy'];
    event.tenant = tenant;

    console.log('Received event:', JSON.stringify(event, null, 2));

    let applicationResponse;
    if ('clone' === method) {
      applicationResponse = await app.cloneScenario(
        tenant,
        JSON.parse(event.body)
      );
    } else if ('graphql' == method) {
      const incomingRequestBody = JSON.parse(event.body);
      applicationResponse = await app.graphqlHTTP(tenant, incomingRequestBody);
    } else {
      throw new Error(`Unsupported request ${method}`);
    }

    return {
      isBase64Encoded: false,
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(applicationResponse)
    };
  } catch (error) {
    return {
      isBase64Encoded: false,
      statusCode: 500,
      body: error.message
    };
  }
};

function determineTenant(token) {
  // get the decoded payload ignoring signature, no secretOrPrivateKey needed
  try {
    var principle = jwt.decode(token);
    const groups = principle['cognito:groups'];
    const tenant = groups ? groups[0] : null;
    return tenant;
  } catch (error) {
    throw new Error('Unable to determine tenant');
  }
}
