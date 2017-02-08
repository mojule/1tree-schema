'use strict'

const TreeFactory = require( '1tree-factory' )
const plugins = require( './plugins' )
const createTree = require( './plugins/createTree' )

const SchemaTree = TreeFactory( ...plugins )

SchemaTree.plugin( createTree )

module.exports = SchemaTree
