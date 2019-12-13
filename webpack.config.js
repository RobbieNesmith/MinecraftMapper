// This library allows us to combine paths easily
const path = require('path');

module.exports = {
   entry: path.resolve(__dirname, 'src', 'minecraftitems.jsx'),
   output: {
      path: path.resolve(__dirname, 'static/js'),
      filename: 'minecraftitems.js'
   },
   resolve: {
      extensions: ['.js', '.jsx']
   },
   module: {
      rules: [
         {
             test: /\.jsx/,
             use: {
                loader: 'babel-loader',
                options: { presets: ['@babel/preset-react'] }
             }
         }
      ]
   }
};