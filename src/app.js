const fs = require('fs');
const { Archen } = require('archen');
const graphql = require('graphql');

class App {
  constructor() {
    const options = {
      database: {
        schemaInfo: JSON.parse(fs.readFileSync('etc/schema.json'))
      },
      schema: {
        models: [
          {
            table: 'hierarchy_scope',
            closureTable: {
              name: 'hierarchy_scope_descendant',
              fields: {
                ancestor: 'ascendant'
              }
            }
          }
        ]
      }
    };

    this.archen = new Archen(options);
  }

  graphqlHTTP(tenant, graphqlOperation) {
    console.log(
      `Received a graphql query ${JSON.stringify(
        graphqlOperation
      )} for ${tenant}`
    );
    var context = this.initialiseDBContext(
      this.initialiseDBConnectionProperties(),
      tenant
    );

    return graphql
      .graphql(
        this.archen.graphql.getSchema(),
        graphqlOperation.query,
        this.archen.graphql.getRootValue(),
        context,
        graphqlOperation.variables,
        graphqlOperation.operationName
      )
      .then(applicationResponse => {
        console.log(
          'Returning applicationResponse',
          JSON.stringify(applicationResponse, null, 2)
        );
        return applicationResponse;
      });
  }

  initialiseDBContext(connectionProperties, tenant) {
    connectionProperties.database = tenant;
    console.log(
      `Creating a connection to db  ${JSON.stringify(
        connectionProperties
      )} for tenant ${tenant}`
    );
    return this.archen.getAccessor({
      dialect: 'mysql',
      connection: connectionProperties
    });
  }

  initialiseDBConnectionProperties() {
    const props = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      timezone: 'Z',
      connectionLimit: 10
    };

    return props;
  }

  cloneScenario(tenant, data) {
    var context = this.initialiseDBContext(
      this.initialiseDBConnectionProperties(),
      tenant
    );

    const scenario = context.db.getModels().Scenario({ id: data.id });

    return scenario
      .copy(
        { name: data.name },
        {
          filter: {
            operations_definition: 'operationsDefinitionClass',
            operations_segment: 'operationsDefinition',
            operations_request: '',
            operations_request_equipment: '',
            operations_request_personnel: '',
            operations_request_profile: '',
            order: '',
            order_item: ''
          }
        }
      )
      .then(scenario => ({ id: scenario.id, name: scenario.name }));
  }
}

process.on('unhandledRejection', (reason, stack) => {
  console.log('UnhandledRejection: ', reason, stack);
});

module.exports = { App };
