'use strict'

const is = require( '@mojule/is' )
const utils = require( '@mojule/utils' )

const { clone } = utils

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

const fromSchema = ({ statics, core, Api }) => {
  const {
    NULL_NODE, STRING_NODE, NUMBER_NODE, BOOLEAN_NODE, ARRAY_NODE, OBJECT_NODE,
    ANY_NODE, UNION_NODE
  } = statics

  const valueMapper = schema => {
    const value = clone( schema )

    if( is.array( schema.type )){
      value.type = 'union'
      value.nodeType = UNION_NODE
      value.typesUnion = schema.type.slice()
    } else if( typeof schema.type !== 'string' ){
      value.type = 'any'
      value.nodeType = ANY_NODE
    } else {
      value.nodeType = core.nodeTypes[ value.type ]
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

  const createPropertyNode = ( schema, propertyName ) => {
    const propertySchema = schema.properties[ propertyName ]
    const propertyNode = toNode( propertySchema )

    propertyNode.assign( { propertyName } )

    return propertyNode
  }

  const createAdditionalPropertiesNode = schema => {
    const additionalPropertiesSchema = schema.additionalProperties
    const additionalPropertiesNode = toNode( additionalPropertiesSchema )

    additionalPropertiesNode.assign( { additionalPropertiesSchema: true } )

    return additionalPropertiesNode
  }

  const createPatternPropertyNode = ( schema, propertyPattern ) => {
    const patternPropertySchema = schema.patternProperties[ propertyPattern ]
    const patternPropertyNode = toNode( patternPropertySchema )

    patternPropertyNode.assign( { propertyPattern } )

    return patternPropertyNode
  }

  const createCombiningNode = ( combineSchema, combineName ) => {
    const combineNode = toNode( combineSchema )

    combineNode.assign( { [ combineName ]: true } )

    return combineNode
  }

  const createItemsNode = schema => {
    const itemsSchema = schema.items
    const itemsNode = toNode( itemsSchema )

    itemsNode.assign( { arrayItem: true } )

    return itemsNode
  }

  const createItemTupleNode = ( tupleSchema, arrayIndex ) => {
    const itemTupleNode = toNode( tupleSchema )

    itemTupleNode.assign( { arrayIndex } )

    return itemTupleNode
  }

  const populate = {
    properties: ( schema, node ) => {
      const propertyNames = Object.keys( schema.properties )

      propertyNames.forEach( propertyName => {
        const propertyNode = createPropertyNode( schema, propertyName )
        node.appendChild( propertyNode )
      })
    },
    additionalProperties: ( schema, node ) => {
      if( typeof schema.additionalProperties === 'boolean' ){
        const { additionalProperties } = schema
        node.assign( { additionalProperties } )
      } else if( typeof schema.additionalProperties === 'object' ){
        const additionalPropertiesNode = createAdditionalPropertiesNode( schema )

        node.appendChild( additionalPropertiesNode )
      }
    },
    definitions: () => {
      throw Error( 'Schema definitions not supported at this time' )
    },
    dependencies: () => {
      throw Error( 'Schema dependencies not supported at this time' )
    },
    patternProperties: ( schema, node ) => {
      const patterns = Object.keys( schema.patternProperties )

      patterns.forEach( pattern => {
        const patternPropertyNode = createPatternPropertyNode( schema, pattern )

        node.appendChild( patternPropertyNode )
      })
    },
    not: ( schema, node ) => {
      const combineSchema = schema.not
      const combineNode = createCombiningNode( combineSchema, 'not' )

      node.appendChild( combineNode )
    },
    items: ( schema, node ) => {
      if( is.array( schema.items ) ){
        schema.items.forEach( ( tupleSchema, index ) => {
          const itemTupleNode = createItemTupleNode( tupleSchema, index )

          node.appendChild( itemTupleNode)
        })
      } else if( is.object( schema.items ) ){
        const itemsNode = createItemsNode( schema )

        node.appendChild( itemsNode )
      }
    }
  }

  combineArrayTypes.forEach( combineName => {
    populate[ combineName ] = ( schema, node ) => {
      const combineDef = schema[ combineName ]

      combineDef.forEach( combineSchema => {
        const combineNode = createCombiningNode( combineSchema, combineName )

        node.appendChild( combineNode )
      })
    }
  })

  const toNode = schema => {
    const schemaType = is.string( schema.type ) ? schema.type : 'any'
    const valueMapper = nodeValueMappers[ schemaType ]
    const value = valueMapper( schema )
    const node = Api( value )

    Object.keys( schema ).forEach( name => {
      if( name in populate )
        populate[ name ]( schema, node )
    })

    return node
  }

  statics.fromSchema = toNode
}

module.exports = fromSchema
