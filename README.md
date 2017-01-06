# resource-webpack-plugin
A webpack plugin for edit resource when building webpack.



## Installation

```js
$ npm install resource-webpack-plugin --save-dev
```

## Example

```js
const ResourceWebpackPlugin = require('resource-webpack-plugin');

var webpackConfig = {
    // ... config settings here ...
    plugins: [
        new ResourceWebpackPlugin(/\.js$/, function(sourceCode) {
            sourceCode = sourceCode.replace('DEBUG', 'false');
            return sourceCode;
        })
    ]
};
```
## License

  MIT