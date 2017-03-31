# schema-tree

Use [tree](https://github.com/mojule/tree) API over JSON Schema

## Install

`npm install @mojule/schema-tree`

## Example

```javascript
const SchemaTree = require( '@mojule/schema-tree' )
const jsonSchema = require( './test.schema.json' )

const tree = SchemaTree( jsonSchema )

const integerNodes = tree.findAll( n => n.nodeType() === 'integer' )

integerNodes.forEach( n => {
  n.setValue( 'minimum', 1 )
})

const newSchema = tree.toSchema()

console.log( JSON.stringify( newSchema, null, 2 ) )
```
