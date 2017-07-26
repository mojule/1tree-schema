'use strict'

const { Factory } = require( '@mojule/tree' )
const plugins = require( './plugins' )

const SchemaTree = Factory( plugins )

module.exports = SchemaTree
