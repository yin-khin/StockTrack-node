
// const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize("fullstacks", "root", "", {
//   host: "localhost",
//   dialect: "mysql",
//   port: 3306,
//   logging: false, 
// });

// module.exports = sequelize;


require("dotenv").config();
const { Sequelize } = require("sequelize");

// Check if DATABASE_URL is provided (for production/Render)
if (process.env.DATABASE_URL) {
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
  module.exports = sequelize;
} else {
  // Fallback to individual environment variables
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "mysql",
      port: Number(process.env.DB_PORT),
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }
  );
  module.exports = sequelize;
}