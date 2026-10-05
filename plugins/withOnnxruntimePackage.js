const { withMainApplication } = require('@expo/config-plugins');

const packageRegistration = 'add(ai.onnxruntime.reactnative.OnnxruntimePackage())';

module.exports = function withOnnxruntimePackage(config) {
  return withMainApplication(config, (config) => {
    const { modResults } = config;

    if (modResults.language !== 'kt') {
      throw new Error(
        'withOnnxruntimePackage requires the Kotlin Android MainApplication.',
      );
    }

    if (!modResults.contents.includes(packageRegistration)) {
      const packageListPattern = /(PackageList\(this\)\.packages\.apply\s*\{)/;
      if (!packageListPattern.test(modResults.contents)) {
        throw new Error(
          'Could not find PackageList in the Android MainApplication.',
        );
      }

      modResults.contents = modResults.contents.replace(
        packageListPattern,
        `$1\n          ${packageRegistration}`,
      );
    }

    return config;
  });
};
