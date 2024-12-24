export interface User {
    id: string;
    name: string;
    score: number;
    virtualCurrency: number;
    createdAt: Date;
}

export interface Game {
    id: string;
    userId: string;
    stockSymbol: string;
    startPrice: number;
    endPrice: number;
    prediction: 'up' | 'down';
    result: 'win' | 'lose' | 'pending';
    startTime: Date;
    endTime: Date;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
}

export interface Stock {
    symbol: string;
    name: string;
    currentPrice: number;
    lastUpdated: Date;
}

export interface Prediction {
    id: string;
    gameId: string;
    userId: string;
    prediction: 'up' | 'down';
    betAmount: number;
    status: 'pending' | 'completed';
    createdAt: Date;
}

export interface LeaderboardEntry {
    userId: string;
    userName: string;
    totalScore: number;
    winStreak: number;
    rank: number;
    updatedAt: Date;
} 