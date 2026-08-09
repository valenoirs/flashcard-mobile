import { useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useFonts } from "expo-font"
import * as SplashScreen from "expo-splash-screen"

import DeckScreen from "./screen/DeckScreen"

SplashScreen.preventAutoHideAsync()

const Stack = createNativeStackNavigator()

export default function App() {
  const [loaded, error] = useFonts({
    "NotoSansJP-Regular": require("./assets/fonts/NotoSansJP-Regular.ttf"),
    "NotoSansJP-Medium": require("./assets/fonts/NotoSansJP-Medium.ttf"),
    "NotoSansJP-Bold": require("./assets/fonts/NotoSansJP-Bold.ttf"),
  })

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync()
    }
  }, [loaded, error])

  if (!loaded && !error) return null
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Deck">
          <Stack.Screen
            name="Deck"
            component={DeckScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#fff",
//         alignItems: "center",
//         justifyContent: "center",
//     },
// });
