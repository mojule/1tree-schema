'use strict'

const is = require( '@mojule/is' )
const TreeFactory = require( '@mojule/tree' ).Factory
const defaultPlugins = require( './plugins' )

const parseState = ( Tree, value ) => {
  if( Tree.isValue( value ) || Tree.isNode( value ) || Tree.isState( value ) )
    return

  if( !is.undefined( value ) ){
    const node = Tree.fromSchema( value )
    const rawNode = node.get()

    return { node: rawNode, parent: null, root: rawNode }
  }
}

const defaultStateParsers = [ parseState ]

const Factory = ( ...plugins ) => {
  let options = {}

  if( plugins.length > 0 && is.object( plugins[ plugins.length - 1 ] ) )
    options = plugins.pop()

  if( plugins.length === 1 && is.array( plugins[ 0 ] ) )
    plugins = plugins[ 0 ]

  plugins = defaultPlugins.concat( plugins )

  if( is.array( options.stateParsers ) ){
    options.stateParsers = options.stateParsers.concat( defaultStateParsers )
  } else {
    options.stateParsers = defaultStateParsers
  }

  return TreeFactory( plugins, options )
}

const SchemaTree = Factory()

Object.assign( SchemaTree, { Factory } )

module.exports = SchemaTree
