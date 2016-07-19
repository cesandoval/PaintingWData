var Sequelize = require('sequelize')

var attributes = {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-z0-9\_\-]+$/i,
    }
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  salt: {
    type: Sequelize.STRING,
    allowNull: false
  }
}

var options = {
  freezeTableName: true
}

module.exports.attributes = attributes
module.exports.options = options