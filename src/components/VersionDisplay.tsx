import React from 'react'
import { Text, YStack, XStack } from 'tamagui'
import Constants from 'expo-constants'
import * as Updates from 'expo-updates'

export const VersionDisplay = () => {
  const appVersion = Constants.expoConfig?.version;
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || '1';
  const packageJsonVersion = require('../../package.json').version;

  const handleLongPress = async () => {
    try {
      // Check if updates are enabled
      if (!Updates.isEnabled) {
        console.log('Updates are not enabled');
        return;
      }

      // Check for updates
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        // Fetch the update
        await Updates.fetchUpdateAsync();

        // Reload the app to apply the update
        await Updates.reloadAsync();
      } else {
        console.log('No update available');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  return (
      <YStack
        alignItems="center"
        paddingVertical="$2"
        gap="$1"
        onLongPress={handleLongPress}
        cursor="pointer"
      >
        <XStack gap="$2" alignItems="center">
          <Text fontSize="$1" color="#6b7280">
            {appVersion} {buildNumber} ({packageJsonVersion})
          </Text>
        </XStack>
      </YStack>
  )
}
