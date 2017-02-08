'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var TreeFactory = require('1tree-factory');
var plugins = require('./plugins');
var createTree = require('./plugins/createTree');

var SchemaTree = TreeFactory.apply(undefined, _toConsumableArray(plugins));

SchemaTree.plugin(createTree);

module.exports = SchemaTree;