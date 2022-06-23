# babel-plugin-jsx-auto-classnames

`import xxx from 'classnames'`

This plugin is used to automatically add and supplement `xxx()` to the `className` property of jsx

[![NPM version](https://img.shields.io/npm/v/babel-plugin-jsx-auto-classnames.svg?style=flat)](https://npmjs.org/package/babel-plugin-jsx-auto-classnames)

## 📦  Install

```
npm i babel-plugin-jsx-auto-classnames --save-dev
```
or
```
pnpm add babel-plugin-jsx-auto-classnames -D
```
##  🖥 config
### vite-config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import JsxAutoClassnames from 'babel-plugin-jsx-auto-classnames'

export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [JsxAutoClassnames]
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

## 🔨 Usage

### normal

```javascript
<div
  className={{
    selected: true
  }}>
</div>
```
⬇️
```javascript
<div
  className={classNames({
    selected: true
  })}>
</div>
```

### Reuse the alias of the imported package
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

## TODO
- [x] Avoid multiple imports of classnames' dependency packages
- [ ] Find a compatible solution for TS
