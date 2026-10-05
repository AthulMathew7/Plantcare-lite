const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow .onnx files to be bundled as assets (needed for iany-crop-v1 placeholder model)
config.resolver.assetExts.push('onnx');

module.exports = config;
