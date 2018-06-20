'use strict';
module.exports = function(sequelize, DataTypes) {
    var Datajson = sequelize.define('Datajson', {
        layername: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        geojson: DataTypes.JSON,
        epsg: DataTypes.INTEGER,
        userId: {
            type: DataTypes.INTEGER
        },
        datafileId: {
            type: DataTypes.INTEGER
        },
        datavoxelId: {
            type: DataTypes.INTEGER
        },
        hashVoxelId: {
            type: DataTypes.STRING
        },
        color1: {
            type: DataTypes.STRING,
            defaultValue: '#00ff00'
        },
        color2: {
            type: DataTypes.STRING,
            defaultValue: '#0000ff'
        },
        layerKey:{
            type: DataTypes.STRING,
        },
        rasterProperty: {
            type: DataTypes.STRING,
        }

    }, {
        classMethods: {
            associate: function(models) {
                Datajson.belongsTo(models.User, {foreignKey: 'userId'});
                Datajson.belongsTo(models.Datafile, {foreignKey: 'datafileId'});
                Datajson.belongsTo(models.Datavoxel, {foreignKey: 'datavoxelId'});
            }
        }
    });
    return Datajson;
};
