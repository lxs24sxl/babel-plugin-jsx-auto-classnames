import { addDefault } from "@babel/helper-module-imports"
import _path from 'path'

const CLASS_NAME_TYPES = ['CallExpression', 'ObjectExpression', 'ArrayExpression', 'Identifier']

const CLASS_NAME_MAP = CLASS_NAME_TYPES.reduce((map, type) => {
  map[type] = true
  return map
}, {})

const DEFAULT_CLASSNAMES_IMPORT_KEY = 'classNames'
const DEFAULT_CLASSNAMES_IMPORT_VALUE = 'classnames'

const DEFAULT_OPTIONS = Object.freeze({
  EXTENSIONS: ['.jsx', '.tsx'],
  EXCLUDES: ['node_modules']
})

function getProgram (t, path) {
	if (t.isProgram(path.parent)) return path.parent
  return getProgram(path.parent)
}

function getImportKeyByPackageName (t, program, name = 'classnames') {
  let sourceName = ''

  program.body.forEach(node => {
    if (!t.isImportDeclaration(node) && !t.isImportNamespaceSpecifier(node)) return null
    const { specifiers, source } = node

    if (source.value !== name) return false

    const temp = specifiers.find(specifier => t.isImportDefaultSpecifier(specifier) && t.isIdentifier(specifier.local))

    if (temp && !sourceName) {
      sourceName = temp.local.name
    }
  })
  return sourceName
}

function checkExtensions (state) {
  const opts = state && state.opts ? state.opts : {}
  const filename = state && state.filename ? state.filename : ''
  if (!filename) return false
  const extensions = opts.extensions || DEFAULT_OPTIONS.EXTENSIONS
  const extname = _path.extname(filename)
  return extensions.includes(extname)
}

function checkExcludes (state) {
  const opts = state && state.opts ? state.opts : {}
  const filename = state && state.filename ? state.filename : ''
  if (!filename) return false
  const excludes = opts.excludes || DEFAULT_OPTIONS.EXCLUDES
  const suffixFilePath = filename.replace(process.cwd(), '')
  return !excludes.some(key => suffixFilePath.indexOf(key) > -1)
}

export default function (babel) {
  const { types: t } = babel
  let classNamesKey = null
  const visitor = {
    Program: {
      enter () {
        classNamesKey = null
        return false
      },
      exit () {
        classNamesKey = null
        return false
      }
    },
    ImportDeclaration (path, state) {
      if (!checkExtensions(state)) return
      if (!checkExcludes(state)) return

      if (path.isImportDeclaration()) {
        const source = path.get('source')
        if (source.isStringLiteral() && source.node.value === DEFAULT_CLASSNAMES_IMPORT_VALUE) {
          const program = getProgram(t, path)
          classNamesKey = getImportKeyByPackageName(t, program, DEFAULT_CLASSNAMES_IMPORT_VALUE)
        }
      }
    },
    JSXAttribute (path, state) {
      const value = path.node.value
      if (!value) return

      if (!checkExtensions(state)) return
      if (!checkExcludes(state)) return

      const { type, expression } = value
      if (
        // Determine the className property
        path.node.name.name === 'className' &&
        // Make sure it's a JSXExpressionContainer
        type === 'JSXExpressionContainer' &&
        // Determined to be within manageable limits
        expression &&
        CLASS_NAME_MAP[expression.type]
      ) {
        const calleeName = expression.callee ? expression.callee.name: ''

        if (calleeName !== DEFAULT_CLASSNAMES_IMPORT_KEY) {
          path.node.value = t.JSXExpressionContainer(
            t.callExpression(
              classNamesKey ? t.identifier(classNamesKey) : addDefault(path, DEFAULT_CLASSNAMES_IMPORT_VALUE, { nameHint: DEFAULT_CLASSNAMES_IMPORT_KEY }),
              [expression]
            )
          )
        }

        if (!classNamesKey) {
          classNamesKey = `_${DEFAULT_CLASSNAMES_IMPORT_KEY}`
        }
      }
    }
  }

  return {
    visitor
  }
}
