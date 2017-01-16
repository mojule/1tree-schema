'use strict'

const assert = require( 'assert' )
const testSchema = require( './fixtures/test.schema.json' )

const { toTree, toJson, pathFromNode, nodeFromPath } = require( '../dist' )

describe( '1tree/schema tests', () => {
  it( 'round trips conversion', () => {
    const schemaTree = toTree( testSchema )
    const schema = toJson( schemaTree )

    assert.deepEqual( schema, testSchema )
  })

  it( 'can get a path and find a path', () => {
    const schemaTree = toTree( testSchema )
    const schemaPaths = []

    schemaTree.walk( n => {
      const nodePath = pathFromNode( n )

      if( nodePath ) schemaPaths.push( nodePath )
    })

    const pathToNodeMap = schemaPaths.reduce( ( map, nodePath ) => {
      map[ nodePath ] = nodeFromPath( schemaTree, nodePath )

      return map
    }, {} )

    Object.keys( pathToNodeMap ).forEach( key => {
      assert( pathToNodeMap[ key ] !== undefined )
    })
  })
})
