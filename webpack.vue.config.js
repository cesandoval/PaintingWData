const path = require('path')
const webpack = require('webpack')
const glob = require('glob')

let entries = {}
// get VueJS files
glob.sync('./private/vue/!(Vue).js').map(filepath => {
    const filename = filepath
        .split('/')
        .pop()
        .split('.')
        .shift()
    entries[filename] = filepath
})

module.exports = {
    entry: entries,
    output: {
        path: path.resolve(__dirname, './public/javascripts/vue/'),
        publicPath: '/',
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(js|vue)$/,
                loader: 'eslint-loader',
                exclude: /node_modules/,
                enforce: 'pre',
                options: {
                    configFile: './private/vue/.eslintrc_vue.js',
                    ignorePath: '.gitignore',
                    fix: true,
                    cache: true,
                },
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this necessary.
                        scss: ['vue-style-loader', 'css-loader', 'sass-loader'],
                        sass: [
                            'vue-style-loader',
                            'css-loader',
                            'sass-loader?indentedSyntax',
                        ],
                    },
                    // other vue-loader options go here
                },
            },
            {
                test: /\.css$/,
                loader: 'vue-style-loader!css-loader',
            },
            {
                test: /\.scss$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.sass$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader?indentedSyntax',
                ],
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    plugins: [
                        'transform-runtime',
                        /*
                        [
                            'import',
                            { libraryName: 'vue-antd-ui', style: 'css' },
                        ],
                        */
                    ],
                    // This is a feature of `babel-loader` for webpack (not Babel itself).
                    // It enables caching results in ./node_modules/.cache/babel-loader/
                    // directory for faster rebuilds.
                    cacheDirectory: true,
                },
            },
            {
                test: /\.(png|jpg|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    name: 'assets/[name].[ext]?[hash:7]',
                    limit: 10000,
                },
            },
            {
                test: /\.(json|geojson)$/,
                loader: 'json-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
            '@': path.resolve(__dirname, './private/vue'),
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            turf: '@turf/turf',
        }),
        new webpack.NamedModulesPlugin(),
    ],
    devServer: {
        historyApiFallback: true,
        noInfo: true,
        overlay: true,
    },
    performance: {
        hints: false,
    },
    devtool: '#eval-source-map',
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"',
            },
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ])
}
