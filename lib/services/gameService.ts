import { ID } from 'appwrite';
import { databases } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';
import { Game } from '../types/database';

interface GameStats {
    totalGames: number;
    winRate: number;
    currentStreak: number;
    bestStreak: number;
    averagePoints: number;
}

export const gameService = {
    async startGame(userId: string, difficulty: Game['difficulty']) {
        if (!APPWRITE_CONFIG.databaseId) throw new Error('Database ID not configured');
        
        try {
            // Get a random stock
            const stocks = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.stocks
            );
            
            const randomStock = stocks.documents[Math.floor(Math.random() * stocks.documents.length)];
            const endTime = calculateEndTime(difficulty);
            
            // Create new game
            const game = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.games,
                ID.unique(),
                {
                    userId,
                    stockSymbol: randomStock.symbol,
                    startPrice: randomStock.currentPrice,
                    startTime: new Date().toISOString(),
                    endTime,
                    difficulty,
                    prediction: null,
                    result: 'pending',
                    points: 0
                }
            );
            
            return game;
        } catch (error) {
            console.error('Error starting game:', error);
            throw error;
        }
    },

    async makePrediction(gameId: string, prediction: 'up' | 'down') {
        if (!APPWRITE_CONFIG.databaseId) throw new Error('Database ID not configured');
        
        try {
            return await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.games,
                gameId,
                { prediction }
            );
        } catch (error) {
            console.error('Error making prediction:', error);
            throw error;
        }
    },

    async getPlayerStats(userId: string): Promise<GameStats> {
        if (!APPWRITE_CONFIG.databaseId) throw new Error('Database ID not configured');
        
        try {
            const games = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.games,
                [
                    // Query only completed games for this user
                    databases.createQuery().equal('userId', userId),
                    databases.createQuery().notEqual('result', 'pending')
                ]
            );

            const stats = games.documents.reduce((acc, game) => {
                acc.totalGames++;
                if (game.result === 'win') {
                    acc.totalWins++;
                    acc.currentStreak++;
                    acc.bestStreak = Math.max(acc.bestStreak, acc.currentStreak);
                    acc.totalPoints += game.points;
                } else {
                    acc.currentStreak = 0;
                }
                return acc;
            }, {
                totalGames: 0,
                totalWins: 0,
                currentStreak: 0,
                bestStreak: 0,
                totalPoints: 0
            });

            return {
                totalGames: stats.totalGames,
                winRate: stats.totalGames ? (stats.totalWins / stats.totalGames) * 100 : 0,
                currentStreak: stats.currentStreak,
                bestStreak: stats.bestStreak,
                averagePoints: stats.totalGames ? stats.totalPoints / stats.totalGames : 0
            };
        } catch (error) {
            console.error('Error fetching player stats:', error);
            throw error;
        }
    }
};

function calculateEndTime(difficulty: Game['difficulty']): string {
    const now = new Date();
    switch (difficulty) {
        case 'easy':
            now.setMinutes(now.getMinutes() + 5);
            break;
        case 'medium':
            now.setMinutes(now.getMinutes() + 2);
            break;
        case 'hard':
            now.setMinutes(now.getMinutes() + 1);
            break;
    }
    return now.toISOString();
} 