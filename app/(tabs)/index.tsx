import { Button, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { databases } from '@/lib/appwrite';

export default function HomeScreen() {
  const startGame = async () => {
    try {
      // Example Appwrite usage
      const response = await databases.listDocuments(
        'YOUR_DATABASE_ID',
        'YOUR_COLLECTION_ID'
      );
      console.log(response);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <ParallaxScrollView 
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<View />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to the Stock Sense!</ThemedText>
        <ThemedText type="default">Can you guess if the stock will go up or down?</ThemedText>
        <ThemedView style={styles.buttonContainer}>
          <Button title="Start Game" onPress={startGame} />
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
