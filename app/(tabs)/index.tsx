import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { gameService } from '@/lib/services/gameService';

export default function HomeScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const startGame = async () => {
        try {
            setIsLoading(true);
            // TODO: Get actual userId from auth
            const userId = 'test-user';
            const game = await gameService.startGame(userId, 'easy');
            router.push(`/game/${game.$id}`);
        } catch (error) {
            console.error('Error starting game:', error);
            // TODO: Show error toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ParallaxScrollView 
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={<View />}>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Welcome to Stock Sense!</ThemedText>
                <ThemedText type="default">Can you predict the market?</ThemedText>
                <ThemedView style={styles.buttonContainer}>
                    <Button 
                        title={isLoading ? "Loading..." : "Start Game"} 
                        onPress={startGame}
                        disabled={isLoading}
                    />
                </ThemedView>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  buttonContainer: {
    marginTop: 16,
    width: '100%',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
