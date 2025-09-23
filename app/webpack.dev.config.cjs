'use strict'

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
require('dotenv').config({ path: '../server/.env' })

module.exports = (env) => {
  return {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: path.join(__dirname, 'src/index.js'),
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'build'),
      publicPath: '/'
    },
    devServer: {
      port: 3000,
      compress: false,
      proxy: [{
        context: [ '/' ],
        target: `http://[::1]:${ process.env.DB_PORT }`,
        secure: false,
        changeOrigin: true
      }],
      static: {
        directory: path.join(__dirname, 'public')
      },
      devMiddleware: {
        index: './src/index.html',
        writeToDisk: true
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/i,
          loader: 'babel-loader',
          exclude: path.join(__dirname, 'node_modules'),
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false
              }],
              ['@babel/preset-react', {
                runtime: 'automatic'
              }],
            ],
          }
        },
        {
          test: /\.(scss|css)$/i,
          use: [ 'style-loader', 'css-loader', 'postcss-loader', 'sass-loader' ]
        },
        {
          test: /\.(jpg|jpeg|gif|png|ico|svg)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.html$/i,
          use: [ 'html-loader' ]
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        'process.env.PORT': JSON.stringify(env.PORT),
        'process.env.NODE_VER': JSON.stringify(env.NODE_VER),
        'process.env.NPM_VER': JSON.stringify(env.NPM_VER)
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'public/index.html'),
        filename: './index.html',
        title: 'EPA Business',
        favicon: path.join(__dirname, 'public/favicon.ico'),
        manifest: path.join(__dirname, 'public/manifest.json')
      }),
      // new webpack.HotModuleReplacementPlugin(),
    ],
  }
}