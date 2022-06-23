import { addDefault } from "@babel/helper-module-imports"

const CLASS_NAME_TYPES = ['CallExpression', 'ObjectExpression', 'ArrayExpression', 'Identifier']

const CLASS_NAME_MAP = CLASS_NAME_TYPES.reduce((map, type) => {
  map[type] = true
  return map
}, {})

const DEFAULT_CLASSNAMES_IMPORT_KEY = 'classNames'
const DEFAULT_CLASSNAMES_IMPORT_VALUE = 'classnames'

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

export default function (babel) {
  const { types: t } = babel
  let classNamesKey = null

  const visitor = {
    Program: {
      enter () {
        classNamesKey = null
      },
      exit () {
        classNamesKey = null
      }
    },
    ImportDeclaration (path) {
      if (path.isImportDeclaration()) {
        const source = path.get('source')
        if (source.isStringLiteral() && source.node.value === DEFAULT_CLASSNAMES_IMPORT_VALUE) {
          const program = getProgram(t, path)
          classNamesKey = getImportKeyByPackageName(t, program, DEFAULT_CLASSNAMES_IMPORT_VALUE)
        }
      }
    },
    JSXAttribute (path) {
      const { type, expression } = path.node.value

      if (
        // 判断属性是classNames
        path.node.name.name === 'className' &&
        // 判断是否是JSX语法
        type === 'JSXExpressionContainer' &&
        // 判断是否要
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
