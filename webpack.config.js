const path = require('path')
const webpack = require('webpack')


// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = '';


// Source: http://blog.techbridge.cc/2016/07/30/react-dev-enviroment-webpack-browserify/

// Using HtmlWebpackPlugin，insert bundle <script> into html 
const HtmlWebpackPlugin = require('html-webpack-plugin');

const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: `${__dirname}/app/index.html`,
    filename: 'index.html',
    inject: 'body',
});


module.exports = {
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    // The first two entry points enable "hot" CSS and auto-refreshes for JS.
    entry: [
        // './app/index.js',
        // 'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
        // 'webpack-dev-server/client?http://localhost:3000/',
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
        './private/jsx/entry.js',
        // 'webpack-dev-server/client?http://localhost:8080/',
    ],
    // entry: './src/main.js',
    output: {
        // path: path.resolve(__dirname, './dist'),
        // publicPath: '/dist/',
        path: path.resolve(__dirname, './public/'),
        publicPath: '/javascripts/',
        filename: 'javascripts/bundle.js'
    },
    /*
    output: {
        // Next line is not used in dev but WebpackDevServer crashes without it:
        path: paths.appBuild,
        // Add / [filename] / comments to generated require()s in the output.
        pathinfo: true,
        // This does not produce a real file. It's just the virtual path that is
        // served by WebpackDevServer in development. This is the JS bundle
        // containing code from all our entry points, and the Webpack runtime.
        filename: 'static/js/bundle.js',
        // There are also additional JS chunk files if you use code splitting.
        chunkFilename: 'static/js/[name].chunk.js',
        // This is the URL that app is served from. We use "/" in development.
        publicPath: publicPath,

        // // // //
        path: `${__dirname}/dist`,
        filename: 'index_bundle.js',
    },
    */
    resolve: {
        extensions: ['.js', '.json', '.jsx'],
    },
    module: {
        loaders: [
            // Process JS with Babel.
            {
                test: /\.jsx?$/,
                loaders: ['react-hot-loader', 'babel-loader'],
                exclude: /node_modules/,
                /*
                query: {
                    presets: ['es2015', 'react'],
                    cacheDirectory: findCacheDir({
                        name: 'react-scripts'
                    }),
                    plugins: [
                        'react-hot-loader/babel'
                    ]
                },
                options: {
                    // This is a feature of `babel-loader` for webpack (not Babel itself).
                    // It enables caching results in ./node_modules/.cache/babel-loader/
                    // directory for faster rebuilds.
                    cacheDirectory: true,
                },
                */
            },

            // { test: /\.css$/, loader: "style!css" },
            // { test: /\.less/, loader: 'style-loader!css-loader!less-loader' },

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
        // HTMLWebpackPluginConfig,
        // This is necessary to emit hot updates (currently CSS only):
        
        // this provide hot-reload function
        new webpack.HotModuleReplacementPlugin(),
        // no reload page when any error (optional)
        new webpack.NoEmitOnErrorsPlugin(), // webpack.NoErrorsPlugin() is deprecated
        // new webpack.optimize.OccurenceOrderPlugin(), it is now enabled by default
    ],
    resolve: {
        alias: {}
    },
    // devServer: {
    //     inline: true,
    //     port: 3000,
    //     hot: true,
    //     historyApiFallback: true,
    //     noInfo: true,
    //     contentBase: './public/',
    // },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map',
    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
};