import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { databases } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/lib/appwrite.config';
import { gameService } from '@/lib/services/gameService';
import { stockPriceService } from '@/lib/services/stockPriceService';
import { Game } from '@/lib/types/database';

export default function GameScreen() {
    const { id } = useLocalSearchParams();
    const [game, setGame] = useState<Game | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [prediction, setPrediction] = useState<'up' | 'down' | null>(null);
    const [stats, setStats] = useState<GameStats | null>(null);

    useEffect(() => {
        if (!id || typeof id !== 'string') return;

        const fetchGame = async () => {
            try {
                const gameDoc = await databases.getDocument(
                    APPWRITE_CONFIG.databaseId!,
                    APPWRITE_CONFIG.collections.games,
                    id
                );
                setGame(gameDoc as unknown as Game);
                setCurrentPrice(gameDoc.startPrice);
            } catch (error) {
                console.error('Error fetching game:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGame();
    }, [id]);

    useEffect(() => {
        if (!game?.stockSymbol || !game.startPrice) return;

        // Start price updates when game starts
        stockPriceService.startPriceUpdates(game.stockSymbol, game.startPrice);

        // Cleanup when component unmounts
        return () => {
            stockPriceService.stopPriceUpdates(game.stockSymbol);
        };
    }, [game?.stockSymbol, game?.startPrice]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // TODO: Get actual userId from auth
                const playerStats = await gameService.getPlayerStats('test-user');
                setStats(playerStats);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    const getPriceChangeIndicator = () => {
        if (!game?.startPrice || !currentPrice) return '';
        const change = currentPrice - game.startPrice;
        const percentage = ((change / game.startPrice) * 100).toFixed(2);
        const isPositive = change > 0;
        
        return `${isPositive ? '📈' : '📉'} ${isPositive ? '+' : ''}${percentage}%`;
    };

    const makePrediction = async (predictionType: 'up' | 'down') => {
        if (!id || typeof id !== 'string') return;
        
        try {
            setIsLoading(true);
            await gameService.makePrediction(id, predictionType);
            setPrediction(predictionType);
        } catch (error) {
            console.error('Error making prediction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <ThemedView style={styles.container}>
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    if (!game) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText type="title">Game not found</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {stats && (
                <ThemedView style={styles.statsContainer}>
                    <ThemedText type="default">Win Rate: {stats.winRate.toFixed(1)}%</ThemedText>
                    <ThemedView style={styles.statsRow}>
                        <ThemedView style={styles.statItem}>
                            <ThemedText type="default">🎯 Games</ThemedText>
                            <ThemedText type="title">{stats.totalGames}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.statItem}>
                            <ThemedText type="default">🔥 Streak</ThemedText>
                            <ThemedText type="title">{stats.currentStreak}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.statItem}>
                            <ThemedText type="default">⭐️ Best</ThemedText>
                            <ThemedText type="title">{stats.bestStreak}</ThemedText>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
            )}

            <ThemedText type="title">Stock: {game.stockSymbol}</ThemedText>
            <ThemedView style={styles.priceContainer}>
                <ThemedText type="title">
                    ${currentPrice?.toFixed(2) ?? game.startPrice.toFixed(2)}
                </ThemedText>
                <ThemedText type="default" style={styles.priceChange}>
                    {getPriceChangeIndicator()}
                </ThemedText>
            </ThemedView>
            
            {!prediction ? (
                <ThemedView style={styles.buttonContainer}>
                    <Button 
                        title="Price Will Go Up" 
                        onPress={() => makePrediction('up')}
                    />
                    <View style={styles.buttonSpacer} />
                    <Button 
                        title="Price Will Go Down" 
                        onPress={() => makePrediction('down')}
                    />
                </ThemedView>
            ) : (
                <ThemedText type="title">
                    Your prediction: {prediction === 'up' ? '📈 Up' : '📉 Down'}
                </ThemedText>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    priceContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    priceChange: {
        marginTop: 8,
    },
    buttonContainer: {
        marginTop: 32,
        width: '100%',
    },
    buttonSpacer: {
        height: 16,
    },
    statsContainer: {
        width: '100%',
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 8,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    }
}); 