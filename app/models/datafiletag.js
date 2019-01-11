'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datafiletag = sequelize.define('Datafiletag', {
     tag: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      datafileId: {
        type: DataTypes.INTEGER
      },
  }, {

    classMethods: {
      associate: function(models) {
        Datafiletag.belongsTo(models.Datafile, {foreignKey: 'datafileId'});
      }
    }
  });
  return Datafiletag;
};