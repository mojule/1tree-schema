'use strict'

const is = require( '@mojule/is' )

const createStatePlugin = api => {
  const { createState } = api

  return {
    $createState: value => {
      if( api.isValue( value ) || api.isNode( value ) || api.isState( value ) )
        return createState( value )

      if( !is.undefined( value ) ){
        const node = api.fromSchema( value )
        const rawNode = node.get()

        return { node: rawNode, parent: null, root: rawNode }
      }
    }
  }
}

module.exports = createStatePlugin
