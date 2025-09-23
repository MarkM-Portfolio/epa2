'use strict'

const webpack = require('webpack')
const webpackObfuscator = require('webpack-obfuscator')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const RemovePlugin = require('remove-files-webpack-plugin')
const Dotenv = require('dotenv-webpack')
// const { ModuleFederationPlugin } = require('webpack').container
const path = require('path')
require('dotenv').config({ path: '../server/.env' })


module.exports = (env) => {
  return {
    mode: 'production',
    devtool: false,
    entry: path.join(__dirname, 'src/index.js'),
    output: {
      filename: '[name].[contenthash].min.js',
      path: path.resolve(__dirname, 'build'),
      publicPath: '/'
    },
    stats: { errorDetails: true },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/i,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false,
                },
              ],
              [ '@babel/preset-react', { runtime: 'automatic' } ]
            ],
          },
        },
        {
          test: /\.(scss|css)$/i,
          use: [ MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader' ]
        },
        {
          test: /\.(json)$/i,
          include: path.resolve(__dirname, 'public'),
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[contenthash][ext][query]'
          },
        },
        {
          test: /\.(jpg|jpeg|gif|png|ico|svg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[contenthash][ext][query]'
          },
        },
        {
          test: /\.html$/i,
          loader: 'html-loader'
        },
      ],
    },
    plugins: [
      new Dotenv({
        path: '../server/.env'
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
        'process.env.NODE_ENV': JSON.stringify(env && env.NODE_ENV),
        'process.env.PORT': JSON.stringify(env && env.PORT),
        'process.env.NODE_VER': JSON.stringify(env && env.NODE_VER),
        'process.env.NPM_VER': JSON.stringify(env && env.NPM_VER)
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash].min.css'
      }),
      new RemovePlugin({
        after: {
          include: [ './build/*.js', './build/css/*.css' ]
        },
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'public/index.html'),
        filename: './index.html',
        title: 'EPA Business',
        favicon: path.join(__dirname, 'public/favicon.ico'),
        manifest: path.join(__dirname, 'public/manifest.json'),
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        },
        scriptLoading: 'defer',
        templateParameters: {
          bundle: '[name].[contenthash].min.js'
        },
        debug: true
      }),
      // new ModuleFederationPlugin({
      //   // name: 'app',
      //   // filename: 'remoteEntry.js',
      //   exposes: {
      //     './App': './src/App', // Expose the App component
      //   },
      //   shared: ['react', 'react-dom'], // Define shared dependencies
      // }),
    ],
    optimization: {
      minimizer: [ 
        new TerserPlugin(),
        new webpackObfuscator({
          rotateUnicodeArray: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          numbersToExpressions: true,
          simplify: true,
          shuffleStringArray: true,
          splitStrings: true,
          splitStringsChunkLength: 3
        })
      ],
      splitChunks: { chunks: 'all' }
    },
    performance: { maxAssetSize: 300000 },
    node: {
      __dirname: false,
      __filename: false,
      global: true
    },
  }
}