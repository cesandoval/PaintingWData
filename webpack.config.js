const path = require('path')
const webpack = require('webpack')

module.exports = {
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    // The first two entry points enable "hot" CSS and auto-refreshes for JS.
    entry: [
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
        './private/jsx/entry.js',
    ],
    output: {
        path: path.resolve(__dirname, './public/javascripts/'),
        publicPath: '/javascripts/',
        // publicPath: 'CDN.../javascripts/',
        // In development Environment:
        // This does not produce a real file. It's just the virtual path that is
        // serve in development. This is the JS bundle
        // containing code from all our entry points, and the Webpack runtime.
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.json', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, './private/jsx'),
        },
    },
    module: {
        loaders: [
            // Process JS with Babel.
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                enforce: 'pre',
                options: {
                    fix: true,
                    cache: true,
                    emitError: true,
                    // failOnError: true,
                },
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'react-hot-loader',
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015', 'react'],
                            plugins: [
                                'transform-runtime',
                                'transform-class-properties',
                                [
                                    'import',
                                    { libraryName: 'antd', style: 'css' },
                                ],
                                [
                                    'styled-jsx/babel',
                                    {
                                        plugins: ['styled-jsx-plugin-sass'],
                                    },
                                ],
                            ],
                            // This is a feature of `babel-loader` for webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
            // ** ADDING/UPDATING LOADERS **
            // The "file" loader handles all assets unless explicitly excluded.
            // The `exclude` list *must* be updated with every change to loader extensions.
            // When adding a new loader, you must add its `test`
            // as a new entry in the `exclude` list for "file" loader.

            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            {
                exclude: [
                    /\.html$/,
                    /\.(js|jsx)$/,
                    /\.css$/,
                    /\.json$/,
                    /\.bmp$/,
                    /\.gif$/,
                    /\.jpe?g$/,
                    /\.png$/,
                ],
                loader: require.resolve('file-loader'),
                options: {
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            },
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: require.resolve('url-loader'),
                options: {
                    limit: 10000,
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            },
        ],
    },
    plugins: [
        // this provide hot-reload function
        new webpack.HotModuleReplacementPlugin(),
        // no reload page when any error (optional)
        new webpack.NoEmitOnErrorsPlugin(), // webpack.NoErrorsPlugin() is deprecated
        // new webpack.optimize.OccurenceOrderPlugin(), it is now enabled by default
        new webpack.ProvidePlugin({
            turf: '@turf/turf',
            _: 'lodash',
        }),
    ],
    performance: {
        hints: false,
    },
    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    devtool: '#eval-source-map',
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"',
            },
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false,
            },
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ])
}
