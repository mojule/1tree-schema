# schema-tree

Use [tree](https://github.com/mojule/tree) API over JSON Schema

## Install

`npm install @mojule/schema-tree`

## Example

```javascript
const SchemaTree = require( '@mojule/schema-tree' )
const jsonSchema = require( './test.schema.json' )

const tree = SchemaTree.fromSchema( jsonSchema )

const integerNodes = tree.subNodes.filter( n =>
  n.nodeType === SchemaTree.INTEGER_NODE
)

integerNodes.forEach( n => n.value.minimum = 1 )

const newSchema = tree.toSchema()

console.log( JSON.stringify( newSchema, null, 2 ) )
```
