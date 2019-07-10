'use strict'
const express 	= require('express');
const Route 	= express.Router();

const controller = require('../controllers/categories');

Route
	.get('/', controller.getCategory)

module.exports = Route;