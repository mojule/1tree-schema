'use strict'

const is = require( '@mojule/is' )

const fromSchemaModule = node => {
  const $fromSchema = schema => toNode( schema, node )

  const toNode = schema => {
    const schemaType = typeof schema.type === 'string' ? schema.type : 'any'
    const valueMapper = nodeValueMappers[ schemaType ]
    const value = valueMapper( schema )
    const node = Node( value )

    if( containerNodeTypes.includes( schemaType ) ){
      const childrenPopulator = childrenPopulators[ schemaType ]

      childrenPopulator( schema, node )
    }

    return node
  }

  const Node = value => {
    const rawNode = node.createNode( value )

    const state = {
      root: rawNode,
      node: rawNode,
      parent: null
    }

    return node( state )
  }

  const createPropertyNode = ( schema, node, propertyName ) => {
    const propertySchema = schema.properties[ propertyName ]
    const propertyNode = toNode( propertySchema, node )

    propertyNode.assign( { propertyName } )

    return propertyNode
  }

  const createAdditionalPropertiesNode = ( schema, node ) => {
    const additionalPropertiesSchema = schema.additionalProperties
    const additionalPropertiesNode = toNode( additionalPropertiesSchema, node )

    additionalPropertiesNode.assign( { additionalPropertiesSchema: true } )

    return additionalPropertiesNode
  }

  const createPatternPropertyNode = ( schema, node, pattern ) => {
    const patternPropertySchema = schema.patternProperties[ pattern ]
    const patternPropertyNode = toNode( patternPropertySchema, node )

    patternPropertyNode.assign( { propertyPattern: pattern } )

    return patternPropertyNode
  }

  const createCombiningNode = ( combineSchema, node, combineName ) => {
    const combineNode = toNode( combineSchema, node )

    combineNode.assign( { [ combineName ]: true } )

    return combineNode
  }

  const createItemsNode = ( schema, node ) => {
    const itemsSchema = schema.items
    const itemsNode = toNode( itemsSchema, node )

    itemsNode.assign( { arrayItem: true } )

    return itemsNode
  }

  const createItemTupleNode = ( tupleSchema, node, index ) => {
    const itemTupleNode = toNode( tupleSchema, node )

    itemTupleNode.assign( { arrayIndex: index } )

    return itemTupleNode
  }

  const childrenPopulators = {
    object: ( schema, node ) => {
      if( schema.properties ){
        const propertyNames = Object.keys( schema.properties )

        propertyNames.forEach( propertyName => {
          const propertyNode = createPropertyNode( schema, node, propertyName )
          node.append( propertyNode )
        })
      }

      if( typeof schema.additionalProperties === 'boolean' ){
        node.setValue( 'additionalProperties', schema.additionalProperties )
      } else if( typeof schema.additionalProperties === 'object' ){
        const additionalPropertiesNode = createAdditionalPropertiesNode( schema, node )

        node.append( additionalPropertiesNode )
      }

      if( schema.definitions )
        throw new Error( 'definitions not supported' )

      if( schema.patternProperties ){
        const patterns = Object.keys( schema.patternProperties )

        patterns.forEach( pattern => {
          const patternPropertyNode = createPatternPropertyNode( schema, node, pattern )

          node.append( patternPropertyNode )
        })
      }

      if( schema.dependencies )
        throw new Error( 'dependencies not supported' )

      combineArrayTypes.forEach( combineName => {
        if( schema[ combineName ] ){
          const combineDef = schema[ combineName ]

          combineDef.forEach( combineSchema => {
            const combineNode = createCombiningNode( combineSchema, node, combineName )

            node.append( combineNode )
          })
        }
      })

      if( schema.not ){
        const combineSchema = schema.not
        const combineNode = createCombiningNode( combineSchema, node, 'not' )

        node.append( combineNode )
      }
    },
    array: ( schema, node ) => {
      if( Array.isArray( schema.items ) ){
        schema.items.forEach( ( tupleSchema, index ) => {
          const itemTupleNode = createItemTupleNode( tupleSchema, node, index )

          node.append( itemTupleNode)
        })
      } else if( typeof schema.items === 'object' ){
        const itemsNode = createItemsNode( schema, node )

        node.append( itemsNode )
      }
    },
    any: ( schema, node ) => {
      childrenPopulators.object( schema, node )
      childrenPopulators.array( schema, node )
    }
  }

  const containerNodeTypes = Object.keys( childrenPopulators )

  return { $fromSchema }
}

const combineArrayTypes = [ 'anyOf', 'allOf', 'oneOf' ]

const createsNesting = {
  object: [
    'properties', 'additionalProperties', 'definitions', 'patternProperties',
    'dependencies', 'allOf', 'anyOf', 'oneOf', 'not'
  ],
  array: [
    'items'
  ]
}

createsNesting.any = createsNesting.object.concat( createsNesting.array )
createsNesting.union = createsNesting.any

const valueMapper = schema => {
  const value = Object.assign( {}, schema )

  if( Array.isArray( schema.type )){
    value.type = 'union'
    value.typesUnion = schema.type.slice()
  } else if( typeof schema.type !== 'string' ){
    value.type = 'any'
  }

  return value
}

const nestingMapper = schema => {
  const value = valueMapper( schema )

  const createsNestingDef = createsNesting[ value.type ]

  createsNestingDef.forEach( propertyName => {
    delete value[ propertyName ]
  })

  return value
}

const nodeValueMappers = {
  string: valueMapper,
  number: valueMapper,
  integer: valueMapper,
  boolean: valueMapper,
  null: valueMapper,
  object: nestingMapper,
  array: nestingMapper,
  any: nestingMapper
}

module.exports = fromSchemaModule
