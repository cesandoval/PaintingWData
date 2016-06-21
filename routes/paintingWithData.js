var recipies = require('../data/recipiesData.js');

var express = require('express');
var router = express.Router();

exports.list = function (req, res) {
    var kind = req.params.id;

    res.render('recipes', {
        recipes: {
            list: recipes[kind],
            kind: recipes.recipeTypeName[kind]
        }
    });
}