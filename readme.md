# 1tree-schema

Converts JSON schema to and from 1tree instances

```javascript
const { toTree, toJson } = require( '1tree-schema' )

const jsonSchema = require( './test.schema.json' )

const asTree = toTree( jsonData )

const newSchema = toJson( asTree )

console.log( JSON.stringify( newSchema, null, 2 ) )
```
