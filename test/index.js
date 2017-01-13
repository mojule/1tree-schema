'use strict'

const assert = require( 'assert' )
const testSchema = require( './fixtures/test.schema.json' )

const { toTree, toJson } = require( '../src' )

describe( '1tree/schema tests', () => {
  it( 'round trips conversion', () => {
    const schemaTree = toTree( testSchema )
    const schema = toJson( schemaTree )

    assert.deepEqual( schema, testSchema )
  })
})
