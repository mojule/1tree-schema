'use strict'

const assert = require( 'assert' )

const testSchema = require( './fixtures/test.schema.json' )

const { toTree, toJson } = require( '../src' )

describe( '1tree/schema tests', () => {
  it( 'does not crash lol', () => {
    const schemaTree = toTree( testSchema )

    console.log( JSON.stringify( schemaTree.serialize(), null, 2 ) )
  })
})
