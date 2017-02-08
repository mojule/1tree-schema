# 1tree-schema

Converts JSON schema to and from 1tree instances

```javascript
const SchemaTree = require( '1tree-schema' )
const jsonSchema = require( './test.schema.json' )

const tree = SchemaTree( jsonSchema )

const integerNodes = tree.findAll( n => n.nodeType() === 'integer' )

integerNodes.forEach( n => {
  const value = n.value()

  value.minimum = 1

  n.value( value )
})

const newSchema = tree.toSchema()

console.log( JSON.stringify( newSchema, null, 2 ) )
```
