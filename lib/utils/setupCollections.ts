import { ID, Permission, Role } from 'appwrite';
import { databases } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

const INITIAL_STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 150.00 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', currentPrice: 2800.00 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', currentPrice: 300.00 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: 3300.00 },
    { symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 900.00 },
];

export async function setupCollections() {
    try {
        // Users Collection
        await databases.createCollection(
            APPWRITE_CONFIG.databaseId,
            ID.unique(),
            'users',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
            ]
        );

        await databases.createStringAttribute(
            APPWRITE_CONFIG.databaseId,
            'users',
            'name',
            255,
            true
        );
        await databases.createIntegerAttribute(
            APPWRITE_CONFIG.databaseId,
            'users',
            'score',
            true,
            0
        );
        await databases.createIntegerAttribute(
            APPWRITE_CONFIG.databaseId,
            'users',
            'virtualCurrency',
            true,
            1000
        );
        await databases.createDatetimeAttribute(
            APPWRITE_CONFIG.databaseId,
            'users',
            'createdAt',
            true
        );

        // Games Collection
        await databases.createCollection(
            APPWRITE_CONFIG.databaseId,
            ID.unique(),
            'games',
            [Permission.read(Role.any()), Permission.write(Role.users())]
        );

        await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'games', 'userId', 255, true);
        await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'games', 'stockSymbol', 10, true);
        await databases.createFloatAttribute(APPWRITE_CONFIG.databaseId, 'games', 'startPrice', true);
        await databases.createFloatAttribute(APPWRITE_CONFIG.databaseId, 'games', 'endPrice', true);
        await databases.createEnumAttribute(APPWRITE_CONFIG.databaseId, 'games', 'prediction', ['up', 'down'], true);
        await databases.createEnumAttribute(APPWRITE_CONFIG.databaseId, 'games', 'result', ['win', 'lose', 'pending'], true);
        await databases.createDatetimeAttribute(APPWRITE_CONFIG.databaseId, 'games', 'startTime', true);
        await databases.createDatetimeAttribute(APPWRITE_CONFIG.databaseId, 'games', 'endTime', true);
        await databases.createEnumAttribute(APPWRITE_CONFIG.databaseId, 'games', 'difficulty', ['easy', 'medium', 'hard'], true);
        await databases.createIntegerAttribute(APPWRITE_CONFIG.databaseId, 'games', 'points', true);

        // Stocks Collection
        const stocksCollection = await databases.createCollection(
            APPWRITE_CONFIG.databaseId!,
            ID.unique(),
            APPWRITE_CONFIG.collections.stocks,
            [Permission.read(Role.any()), Permission.write(Role.users())]
        );

        // Create attributes for stocks
        await databases.createString(APPWRITE_CONFIG.databaseId!, 'stocks', 'symbol', 10, true);
        await databases.createString(APPWRITE_CONFIG.databaseId!, 'stocks', 'name', 255, true);
        await databases.createFloat(APPWRITE_CONFIG.databaseId!, 'stocks', 'currentPrice', true);
        await databases.createDateTime(APPWRITE_CONFIG.databaseId!, 'stocks', 'lastUpdated', true);

        // Add initial stocks
        for (const stock of INITIAL_STOCKS) {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId!,
                stocksCollection.$id,
                ID.unique(),
                {
                    ...stock,
                    lastUpdated: new Date().toISOString()
                }
            );
        }

        // Leaderboard Collection
        await databases.createCollection(
            APPWRITE_CONFIG.databaseId,
            ID.unique(),
            'leaderboard',
            [Permission.read(Role.any())]
        );

        await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'leaderboard', 'userId', 255, true);
        await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'leaderboard', 'userName', 255, true);
        await databases.createIntegerAttribute(APPWRITE_CONFIG.databaseId, 'leaderboard', 'totalScore', true);
        await databases.createIntegerAttribute(APPWRITE_CONFIG.databaseId, 'leaderboard', 'winStreak', true);
        await databases.createIntegerAttribute(APPWRITE_CONFIG.databaseId, 'leaderboard', 'rank', true);
        await databases.createDatetimeAttribute(APPWRITE_CONFIG.databaseId, 'leaderboard', 'updatedAt', true);

        console.log('Collections setup completed');
    } catch (error) {
        console.error('Error setting up collections:', error);
    }
} 