'use strict'

const slugPlugin = fn => {
  const originalSlug = fn.slug

  const slug = ( fn, root, node ) => {
    if( root === node ) return ''

    const value = fn.value( node )
    const { propertyName } = value

    return propertyName || originalSlug( fn, root, node )
  }

  slug.def = originalSlug.def

  return Object.assign( fn, { slug } )
}

module.exports = slugPlugin
