import dotenv from 'dotenv'
import { Options, Dialect, Sequelize } from 'sequelize'
import dbConfig from '../config/config.js'
import appConfig from '../config/app'

dotenv.config()

type SequelizeOptions = Options & {
  username: string
  password: string
  database: string
  host: string
  dialect: Dialect
}

const config = dbConfig[appConfig.NODE_ENV] as SequelizeOptions

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
)

// Only attempt database connection if not in build mode
if (
  process.env.NODE_ENV !== 'production' ||
  process.env.SKIP_DB_CONNECTION !== 'true'
) {
  sequelize
    .authenticate()
    .then(() => {
      console.log('Database connection established successfully.')
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err)
    })
}

export { sequelize, Sequelize }
