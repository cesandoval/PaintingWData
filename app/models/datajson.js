'use strict';
module.exports = function(sequelize, DataTypes) {
    var Datajson = sequelize.define('Datajson', {
        layername: {
            type: DataTypes.STRING,
            allowNull: false,

        },
        layerids: {
            type: DataTypes.STRING,
            allowNull: false,

        },
        geojson: DataTypes.JSON,
        epsg: DataTypes.INTEGER,
        color1: {
            type: DataTypes.STRING,
            defaultValue: '#00ff00'
        },
        color2: {
            type: DataTypes.STRING,
            defaultValue: '#0000ff'
        }
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
            }
        }
    });
    return Datajson;
};
