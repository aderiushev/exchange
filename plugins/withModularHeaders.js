const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withFirebaseConfiguration = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      let podfileContent = fs.readFileSync(podfilePath, 'utf-8');

      // Add use_frameworks! with static linkage after use_expo_modules!
      if (!podfileContent.match(/use_frameworks!\s*:linkage\s*=>\s*:static/)) {
        podfileContent = podfileContent.replace(
          /(target\s+['"]ExchangeRateTracker['"]\s+do\s+use_expo_modules!)/,
          "$1\n  use_frameworks! :linkage => :static"
        );
      }

      // No additional post_install modifications needed
      // use_frameworks! :linkage => :static handles everything

      fs.writeFileSync(podfilePath, podfileContent);

      return config;
    },
  ]);
};

module.exports = withFirebaseConfiguration;

