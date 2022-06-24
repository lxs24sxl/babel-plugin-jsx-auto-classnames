# babel-plugin-jsx-auto-classnames

`import xxx from 'classnames'`

该插件用于拓展 `jsx` 的 `className` 属性，为属性自动添加 `classnames` 依赖


[![NPM version](https://img.shields.io/npm/v/babel-plugin-jsx-auto-classnames.svg?style=flat)](https://npmjs.org/package/babel-plugin-jsx-auto-classnames)

[English](./README.md) | 简体中文

## 📦  安装

```
npm i babel-plugin-jsx-auto-classnames --save-dev
```
or
```
pnpm add babel-plugin-jsx-auto-classnames -D
```
##  🖥 配置
### vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import JsxAutoClassnames from 'babel-plugin-jsx-auto-classnames'

export default defineConfig({
  plugins: [react({
    babel: {
      // plugins: [JsxAutoClassnames],
      plugins: [
        ['jsx-auto-classnames', {
          extensions: ['.jsx', '.tsx'],
          excludes: ['src/excludes']
        }]
      ]
    }
  })]
})
```

### .babelrc
```
{
  "plugins": [
    "jsx-auto-classnames"
  ]
}
```

## 🔨 用法

### 常规使用

```javascript
<div
  className={{
    selected: true
  }}>
</div>
```
⬇️
```javascript
import _classNames from 'classnames'
<div
  className={_classNames({
    selected: true
  })}>
</div>
```

### 自动引入依赖的别名
```javascript
import xxx from 'classnames'
function App () {
  return (
    <>
      <div
        className={xxx({
          disabled: true
        })}>
      </div>
      <div
        className={{
          selected: true
        }}>
      </div>
    </>
  )
}
```
⬇️
```javascript
import xxx from 'classnames'
function App () {
  return (
    <>
      <div
        className={xxx({
          disabled: true
        })}>
      </div>
      <div
        className={xxx({
          selected: true
        })}>
      </div>
    </>
  )
}
```

## 参数

### `extensions`

- **类型:** `string[]`
- **默认值:** `['.jsx', '.tsx']`

### `excludes`

- **类型:** `string[]`
- **默认值:** `['node_modules']`


## 待办
- [x] 避免多次导入`classnames`依赖
- [x] 找到ts的兼容方案
```javascript
declare namespace React {
  interface HTMLAttributes<any> extends AriaAttributes, DOMAttributes<any>  {
    className?: Record<string, boolean> | (string | Record<string, boolean>)[]
  }
}
```
- [x] 添加 `excludes` 排除属性
- [x] 添加 `extensions` 文件拓展属性
- [ ] 编写单元测试代码
