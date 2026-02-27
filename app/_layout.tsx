import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Назад",
        headerTintColor: Colors.primary,
        headerStyle: { backgroundColor: Colors.surface },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="paste"
        options={{ title: "Ввод состава", presentation: "modal" }}
      />
      <Stack.Screen
        name="scan/barcode"
        options={{ title: "Сканер штрихкода", headerShown: false }}
      />
      <Stack.Screen
        name="scan/photo"
        options={{ title: "Фото состава", headerShown: false }}
      />
      <Stack.Screen
        name="analysis"
        options={{ title: "Результат анализа" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <ProfileProvider>
          <HistoryProvider>
            <RootLayoutNav />
          </HistoryProvider>
        </ProfileProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
