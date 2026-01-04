import path from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: {
    'popup/popup': './extension/popup/popup.js',
    'content/content': './extension/content/content.js',
    'background/service-worker': './extension/background/service-worker.js',
    'options/options': './extension/options/options.js',
    'web-app/app': './web-app/app.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'extension/manifest.json', to: 'manifest.json' },
        { from: 'extension/popup/popup.html', to: 'popup/popup.html' },
        { from: 'extension/popup/popup.css', to: 'popup/popup.css' },
        { from: 'extension/content/content.css', to: 'content/content.css' },
        { from: 'extension/options/options.html', to: 'options/options.html' },
        { from: 'web-app/index.html', to: 'web-app/index.html' },
        { from: 'web-app/styles.css', to: 'web-app/styles.css' }
      ]
    })
  ],
  resolve: {
    extensions: ['.js']
  },
  experiments: {
    outputModule: false
  }
};
