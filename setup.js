/**
 * Summary. Is used for local credentials (i.e. environment variables).
 *
 * Description. When `node setup.js` is ran, creates a `.env` file in the main 
 * directory, which has credentials that the user modifies accordingly. Uses 
 * the package "dotenv".
 *
 * @link   https://medium.com/@rafaelvidaurre/managing-environment-variables-in-node-js-2cb45a55195f
 * @file   This file assists in creating `.env`, for local environment variables.
 * @author Christopher Xu
 * @since  06.07.2018
 */
'use strict';
var fs = require('fs');
fs.createReadStream('.sample-env')
  .pipe(fs.createWriteStream('.env'));
