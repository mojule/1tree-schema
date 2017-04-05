'use strict'

const assert = require( 'assert' )
const is = require( '@mojule/is' )
const testSchema = require( './fixtures/test.schema.json' )
const definitionsFailSchema = require( './fixtures/definitions-fail.schema.json' )
const dependenciesFailSchema = require( './fixtures/dependencies-fail.schema.json' )

const SchemaTree = require( '../src' )

describe( 'tree/schema conversion', () => {
  it( 'round trips conversion', () => {
    const schemaTree = SchemaTree( testSchema )
    const schema = schemaTree.toSchema()

    assert.deepEqual( schema, testSchema )
  })
})

describe( 'Bad data', () => {
  it( 'Bad nodeType', () => {
    const badNode = SchemaTree( { nodeType: 'nope' } )

    assert.throws( () => badNode.toSchema() )
  })

  it( 'No value', () => {
    assert.throws( () => SchemaTree() )
  })

  it( 'Has definitions', () => {
    assert.throws( () => SchemaTree( definitionsFailSchema ) )
  })

  it( 'Has dependencies', () => {
    assert.throws( () => SchemaTree( dependenciesFailSchema ) )
  })
})

describe( 'Plugins', () => {
  it( 'Slug', () => {
    const schemaTree = SchemaTree( testSchema )

    const titleNode = schemaTree.find( current =>
      current !== schemaTree && current.getParent().nodeType() === 'object' &&
      current.getValue( 'propertyName' ) === 'title'
    )

    const arrayItemNode = schemaTree.find( current =>
      is.number( current.getValue( 'arrayIndex' ) )
    )

    const index = String( arrayItemNode.getValue( 'arrayIndex' ) )

    assert.equal( schemaTree.slug(), '' )
    assert.equal( titleNode.slug(), 'title' )
    assert.equal( arrayItemNode.slug(), index )
  })
})

describe( 'Factory', () => {
  const Factory = SchemaTree.Factory

  it( 'Can override options', () => {
    const Tree = Factory( { exposeState: true } )

    const tree = Tree( {} )

    assert( is.object( tree.state ) )
  })

  it( 'Takes plugins as an array', () => {
    const plugin = () => ({
      x: () => 'x'
    })

    const Tree = Factory( [ plugin ] )

    const tree = Tree( {} )

    assert.equal( tree.x(), 'x' )
  })

  it( 'Takes stateParsers', () => {
    const parser = ( Tree, value ) => {
      if( is.undefined( value ) ){
        const node = Tree.fromSchema( { "type": "null" } )
        const rawNode = node.get()

        return { node: rawNode, parent: null, root: rawNode }
      }
    }

    const Tree = Factory( { stateParsers: [ parser ] } )

    const tree = Tree()

    assert.equal( tree.nodeType(), 'null' )
  })
})