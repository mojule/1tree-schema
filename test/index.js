'use strict'

const assert = require( 'assert' )
const testSchema = require( './fixtures/test.schema.json' )

const Tree = require( '../dist' )

describe( '1tree/schema tests', () => {
  it( 'round trips conversion', () => {
    const schemaTree = Tree( testSchema )
    const schema = schemaTree.toSchema()

    assert.deepEqual( schema, testSchema )
  })
})
