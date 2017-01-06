'use strict';

const SourceMapSource = require('webpack-sources').SourceMapSource;
const RawSource = require('webpack-sources').RawSource;
const transferSourceMap = require('multi-stage-sourcemap').transfer;

class ResourceWebpackPlugin {
    constructor(regExp, callback) {
        this.regExp = regExp;
        this.callback = callback;
    }

    apply(compiler) {
        compiler.plugin('compilation', compilation => {
            compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
                const files = [];

                chunks.forEach(chunk => {
                    chunk['files'].forEach(file => {
                        files.push(file);
                    });
                });

                compilation.additionalChunkAssets.forEach(file => {
                    files.push(file);
                });

                files.forEach(file => {
                    if (!this.regExp.test(file)) {
                        return;
                    }

                    const assets = compilation.assets[file];

                    let inputSourceMap,
                        sourceCode;

                    if (assets.sourceAndMap) {
                        const sourceAndMap = assets.sourceAndMap();

                        inputSourceMap = sourceAndMap.map;
                        sourceCode = sourceAndMap.source;
                    } else {
                        inputSourceMap = assets.map();
                        sourceCode = assets.source();
                    }

                    const data = this.callback(sourceCode);

                    let newSourceCode = null,
                        newSourceMap = null,
                        outputSourceMap = null;

                    if (typeof data === 'object' && data.sourceCode) {
                        newSourceCode = data.sourceCode;
                        newSourceMap = data.sourceMap;
                    } else {
                        newSourceCode = data;
                    }

                    if (!newSourceCode) {
                        return;
                    }

                    if (inputSourceMap) {
                        if (newSourceMap) {
                            outputSourceMap = JSON.parse(
                                transferSourceMap({
                                    fromSourceMap: newSourceMap,
                                    toSourceMap: inputSourceMap
                                })
                            );
                        } else {
                            outputSourceMap = inputSourceMap;
                        }

                        compilation.assets[file] = new SourceMapSource(
                            newSourceCode,
                            file,
                            outputSourceMap,
                            assets.source(),
                            inputSourceMap
                        );
                    }

                    compilation.assets[file] = new RawSource(newSourceCode);
                });

                callback();
            });
        });
    }
}

module.exports = ResourceWebpackPlugin;
