'use strict'

const assert = require( 'assert' )
const is = require( '@mojule/is' )
const testSchema = require( './fixtures/test.schema.json' )
const definitionsFailSchema = require( './fixtures/definitions-fail.schema.json' )
const dependenciesFailSchema = require( './fixtures/dependencies-fail.schema.json' )

const SchemaTree = require( '../src' )

describe( 'tree/schema conversion', () => {
  it( 'round trips conversion', () => {
    const schemaTree = SchemaTree.fromSchema( testSchema )
    const schema = schemaTree.toSchema()

    const fs = require( 'fs' )

    assert.deepEqual( schema, testSchema )
  })
})

describe( 'API', () => {
  it( 'Slug', () => {
    const schemaTree = SchemaTree.fromSchema( testSchema )

    const titleNode = schemaTree.subNodes.find( current =>
      current !== schemaTree &&
      current.parentNode.nodeType === SchemaTree.OBJECT_NODE &&
      current.value.propertyName === 'title'
    )

    const arrayItemNode = schemaTree.subNodes.find( current =>
      is.number( current.value.arrayIndex )
    )

    const index = String( arrayItemNode.value.arrayIndex )

    assert.equal( schemaTree.slug(), '' )
    assert.equal( titleNode.slug(), 'title' )
    assert.equal( arrayItemNode.slug(), index )
  })
})
