const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to fix React Native Firebase build errors when using use_frameworks!
 * 
 * This plugin adds CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES
 * to React Native Firebase pods in the Podfile's post_install hook.
 * 
 * This is necessary because:
 * 1. Firebase iOS SDK requires use_frameworks!
 * 2. When use_frameworks! is enabled, ALL pods become frameworks
 * 3. React Native Firebase wrapper libraries import React headers which are non-modular
 * 4. Frameworks cannot import non-modular headers by default
 * 
 * See: https://github.com/expo/expo/issues/39607
 */
module.exports = function withFirebaseNonModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfileContent = fs.readFileSync(podfilePath, 'utf-8');

      // Check if we already added the post_install hook
      if (podfileContent.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
        return config;
      }

      // Find the post_install hook or create one
      const postInstallHook = `
  post_install do |installer|
    # Fix for React Native Firebase with use_frameworks!
    # Allow non-modular includes in framework modules for RNFB pods
    installer.pods_project.targets.each do |target|
      if target.name.start_with?('RNFB')
        target.build_configurations.each do |config|
          config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        end
      end
    end
  end
`;

      // Check if there's already a post_install hook
      if (podfileContent.includes('post_install do |installer|')) {
        // Add our code inside the existing post_install hook
        podfileContent = podfileContent.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|
    # Fix for React Native Firebase with use_frameworks!
    # Allow non-modular includes in framework modules for RNFB pods
    installer.pods_project.targets.each do |target|
      if target.name.start_with?('RNFB')
        target.build_configurations.each do |config|
          config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        end
      end
    end
`
        );
      } else {
        // Add a new post_install hook at the end of the file
        podfileContent += postInstallHook;
      }

      fs.writeFileSync(podfilePath, podfileContent);
      return config;
    },
  ]);
};

