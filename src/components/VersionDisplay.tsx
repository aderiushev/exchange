import React from 'react'
import { Text, YStack, XStack } from 'tamagui'
import Constants from 'expo-constants'
import * as Updates from 'expo-updates'

export const VersionDisplay = () => {
  const appVersion = Constants.expoConfig?.version;
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || '1';


  return (
      <YStack alignItems="center" paddingVertical="$2" gap="$1">
        <XStack gap="$2" alignItems="center">
          <Text fontSize="$1" color="#6b7280">
            {appVersion} {buildNumber}
          </Text>
        </XStack>
      </YStack>
  )
}
