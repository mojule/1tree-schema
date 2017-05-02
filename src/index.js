'use strict'

const is = require( '@mojule/is' )
const TreeFactory = require( '@mojule/tree' ).Factory
const FactoryFactory = require( '@mojule/tree' ).FactoryFactory
const defaultPlugins = require( './plugins' )
const Factory = FactoryFactory( TreeFactory, defaultPlugins )
const SchemaTree = Factory()

Object.assign( SchemaTree, { Factory } )

module.exports = SchemaTree
