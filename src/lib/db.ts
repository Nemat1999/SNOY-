import { Sequelize, DataTypes } from 'sequelize';
import pg from 'pg';
import UserModel from '../../database/models/user.cjs';
import SessionModel from '../../database/models/session.cjs';
import RateLimitModel from '../../database/models/ratelimit.cjs';
import CategoryModel from '../../database/models/category.cjs';
import configJson from '../../database/config.cjs';

const env = process.env.NODE_ENV || 'development';
const config = (configJson as any)[env];

let sequelize: Sequelize;
if (config.url) {
  sequelize = new Sequelize(config.url, {
    ...config,
    dialectModule: pg
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    dialectModule: pg
  });
}

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Session = SessionModel(sequelize, DataTypes);
const RateLimit = RateLimitModel(sequelize, DataTypes);
const Category = CategoryModel(sequelize, DataTypes);

const models = { User, Session, RateLimit, Category };

// Set up associations
Object.keys(models).forEach((modelName) => {
  const model = (models as any)[modelName];
  if (model.associate) {
    model.associate(models);
  }
});

const db = {
  sequelize,
  Sequelize,
  User,
  Session,
  RateLimit,
  Category
};

export default db;
export { sequelize, Sequelize, User, Session, RateLimit, Category };
