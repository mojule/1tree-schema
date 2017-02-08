'use strict'

const slugPlugin = fn => {
  const originalSlug = fn.slug

  const slug = ( fn, root, node ) => {
    if( root === node ) return ''

    const parent = fn.getParent( fn, root, node )
    const nodeType = fn.nodeType( fn, parent )

    if( nodeType === 'object' ){
      const value = fn.value( node )
      const { propertyName } = value

      return propertyName
    }

    return originalSlug( fn, root, node )
  }

  slug.def = originalSlug.def

  return Object.assign( fn, { slug } )
}

module.exports = slugPlugin
