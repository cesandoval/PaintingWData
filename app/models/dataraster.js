var Sequelize = require('sequelize')

var attributes = {
  id: {
    autoIncrement: true,
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  layerId: {
    type: Sequelize.INTEGER,
    references: {
      // This is a reference to another model
      model: Datalayer,
      // This is the column name of the referenced model
      key: 'id',
      // This declares when to check the foreign key constraint. PostgreSQL only.
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  layerName: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  raster: {
    type: Sequelize.RASTER,
    allowNull: false
  },
  srs: {
    type: Sequelize.INTEGER,
  },
  getterMethods: {
    layerRelationship: function()  { 
        return 'DataRaster ' + this.layerName + ' is related to DataLayer' + this.layerId 
    }
  },
}

var options = {
  freezeTableName: true
}

module.exports.attributes = attributes
module.exports.options = options