# clinic

## Clinic API

- API docs included Routing Execution
  - Docs API: <https://clinicx-api.herokuapp.com/api-docs>

## Setup
- Init Database. Refer at : https://sequelize.org/docs/v6/other-topics/migrations/
  - Create db 1st by workberch ...
  - Run migrate 1st by ```npx sequelize-cli db:migrate```
    - Create migration file:  ```npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string```
  - Run seeder by ```npx sequelize-cli db:seed:all```
    - Create migration file: ```npx sequelize-cli seed:generate --name user```

- Run server
    ```js
    yarn install
    yarn start
    ```

## Knowledge

- Algorithm expirated authentication d2-d1 <= 0 

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
