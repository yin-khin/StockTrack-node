'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Config:', JSON.stringify(config, null, 2));

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_DATABASE_URL;
const useEnvVariable = dbUrl || config.use_env_variable;

if (useEnvVariable) {
  console.log('Using DATABASE_URL approach');
  sequelize = new Sequelize(dbUrl || process.env[config.use_env_variable], {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  console.log('Using individual DB variables approach');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_PORT:', process.env.DB_PORT);

  const dbName = config.database || process.env.DB_NAME;
  const dbUser = config.username || process.env.DB_USER;
  const dbPassword = config.password || process.env.DB_PASSWORD;
  const dbHost = config.host || process.env.DB_HOST;
  const dbPort = config.port || process.env.DB_PORT;

  console.log('Final values - Name:', dbName, 'User:', dbUser, 'Host:', dbHost, 'Port:', dbPort);

  if (!dbName || !dbUser || !dbHost) {
    console.error('Missing required database configuration!');
    throw new Error('Database configuration incomplete');
  }

  sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
      host: dbHost,
      dialect: config.dialect,
      port: dbPort,
      logging: config.logging !== undefined ? config.logging : false,
      dialectOptions: config.dialectOptions || {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }
  );
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    try {
      const modelExport = require(path.join(__dirname, file));
      let model;
      
      if (typeof modelExport === 'function') {
        model = modelExport(sequelize, Sequelize.DataTypes);
      } else {
        model = modelExport;
      }
      
      if (model && model.name) {
        db[model.name] = model;
      }
    } catch (error) {
      // console.error(`Error loading model ${file}:`, error.message);
    }
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    try {
      db[modelName].associate(db);
    } catch (error) {
      // console.error(`Error associating model ${modelName}:`, error.message);
    }
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;