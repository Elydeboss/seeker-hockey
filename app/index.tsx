import { useState } from 'react'
import { NetworkFeatureIndex } from '@/features/network/network-feature-index'
import { AccountFeatureIndex } from '@/features/account/account-feature-index'
import { AppConfig } from '@/constants/app-config'
import { Text, View, Button } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { appStyles } from '@/constants/app-styles'
import AirHockeyApp from '@/air-hockey/App'

export default function HomeScreen() {
  const [showGame, setShowGame] = useState(false)

  if (showGame) {
    return <AirHockeyApp />
  }

  return (
    <SafeAreaView style={appStyles.screen}>
      <View style={appStyles.stack}>
        <Text style={appStyles.title}>App Config</Text>
        <View style={appStyles.card}>
          <Text>
            Name <Text style={{ fontWeight: 'bold' }}>{AppConfig.identity.name}</Text>
          </Text>
          <Text>
            link <Text style={{ fontWeight: 'bold' }}>{AppConfig.identity.uri}</Text>
          </Text>
        </View>
        <AccountFeatureIndex />
        <NetworkFeatureIndex />

        <Button title="Play Air Hockey" onPress={() => setShowGame(true)} />
      </View>
    </SafeAreaView>
  )
}
