# fbdc

## FBDC API

- API docs included Routing Execution
  - Docs API: <https://fbdc-api.herokuapp.com/api-docs>

## Setup
- Init Database. Refer at : https://sequelize.org/docs/v6/other-topics/migrations/
  - Create db woth name **```fbdc```**
  - Create migiration files :
  
      ```npx sequelize-cli model:generate --name User --attributes username:string,password:string```

      ```npx sequelize-cli model:generate --name Customer --attributes fullName:string,email:string,phone: string,gender:boolean,birthday:dateonly,address:string,career:string,note:string```

      ```npx sequelize-cli model:generate --name Subscription --attributes customerId:integer,totalAmount:real,totalDays:integer,expiredDate:date```

       ```npx sequelize-cli model:generate --name SubscriptionDetail --attributes subscriptionId:integer,amount:real,subscriptionDate:date```

  - Create reference keys at migration files, the key will show at Diagram Relationship DB
    ```js
    customerId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    ```
  - Create associate between models at model files (Models/*). Example **Customer** and **Subscription** table :
    ```js
      class Customer extends Model {
        static associate(models) {
          this.hasMany(models.subscription);
        }
      }
    ```
    ```js
      class Subscription extends Model {
          static associate(models) {
            this.belongsTo(models.customer, {
              foreignKey: 'customerId',
            })
          }
        }
    ```
    - This one will be used for some query statements example :
    ```js
      Subscription.findAll({
        include: [
          {
            model: db.customer,
            required: true,
          },
        ],
      })
    ```
      - More demo at here : https://sebhastian.com/sequelize-nested-include/

     - Must call all ```associate()``` methods on init modal at Models/index.js file :
    ```js
      Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
          db[modelName].associate(db)
        }
      })
    ```
    - Should import all models by dynamic function instead manual function
    ```js
      // Dynamic import all model files at Models/ folder
      fs.readdirSync(__dirname)
        .filter(file => {
          return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
        })
        .forEach(file => {
          var model = sequelize['import'](path.join(__dirname, file))
          db[model.name] = model
        })
      ```  
      ```js
      // Manual import all model files
      db.customer = require('./customer.js')(sequelize, Sequelize);
      db.user = require('./user.js')(sequelize, Sequelize);
      db.subscription = require('./subscription.js')(sequelize, Sequelize);
      ```

  - Create seeder files :

    ```npx sequelize-cli seed:generate --name user-demo```

    ```npx sequelize-cli seed:generate --name customer-demo```

    ```npx sequelize-cli seed:generate --name subscription-demo```

  - Create 1000 record demo data by ```faker``` lib at generated seeder files
    ```js
        var { faker } = require('@faker-js/faker');
        Array.prototype.random = function () {
          return this[Math.floor(Math.random() * this.length)];
        };
        var customers = [];
        Array.from({ length: 1000 }).forEach(() => {
          customers.push({
            fullName: faker.internet.userName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            gender: [true, false].random(),
            birthday: faker.date.birthdate(),
            address: faker.address.city(),
            career: faker.word.adjective(),
            note: faker.lorem.paragraph().substring(0,100),
            createdAt: faker.date.birthdate(),
            updatedAt: faker.date.birthdate(),
          });
        });
        await queryInterface.bulkInsert('customers', customers, {});
    ```

  - Run migrate ```npx sequelize-cli db:migrate```
  - Run seeder by ```npx sequelize-cli db:seed:all```

- Run server
    ```js
    yarn install
    yarn start
    ```

## Knowledges

- Algorithm expirated authentication d2-d1 <= 0 
- Paging toolbar has record per page selectbox 
- Paging request ajax must config : 
    ```js 
      reader: {
          type: 'json',
          root: 'records',
          totalProperty: 'totalCount',
      },
    ```
    in ```store proxy```
    ```js
    let storeCustomer = Ext.create('Ext.data.Store', {
    model: 'Customer',
    proxy: {
      type: 'ajax',
      url: hostAPI + '/customer/list',
      reader: {
        type: 'json',
        root: 'records',
        totalProperty: 'totalCount',
      },
    },
    listeners: {
      load: function (_, records, successful, operation, eOpts) {
        data = records;
        Groups = storeCustomer.getGroups();
      },
    },
    autoLoad: true,
  });
    ```

## Common Bugs

- Route is not specify (wrong inside function)

## Notes
- Must keep original ```config/config.json```

## Use Sequelize-cli

  npm install --save-dev sequelize-cli

## Cpanel hosting

- Create db
- Create user
- Add privileges [bieudoxy_clinic](http://prntscr.com/vr4esa)
- Add remote if need

## Refs
- https://sebhastian.com/sequelize-nested-include/ full demo db
