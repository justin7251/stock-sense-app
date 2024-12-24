import { client, databases } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

export const stockService = {
    subscribeToStockUpdates(stockSymbol: string, onUpdate: (price: number) => void) {
        return client.subscribe(
            `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.stocks}.documents`,
            (response) => {
                if (response.payload.symbol === stockSymbol) {
                    onUpdate(response.payload.currentPrice);
                }
            }
        );
    },

    async updateStockPrice(stockSymbol: string, newPrice: number) {
        if (!APPWRITE_CONFIG.databaseId) throw new Error('Database ID not configured');

        try {
            const formattedPrice = Number(newPrice.toFixed(2)); // Keep 2 decimal places
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.stocks,
                stockSymbol,
                {
                    currentPrice: formattedPrice,
                    lastUpdated: new Date().toISOString()
                }
            );
        } catch (error) {
            console.error('Error updating stock price:', error);
            throw error;
        }
    },

    async getStockPrice(stockSymbol: string): Promise<number> {
        if (!APPWRITE_CONFIG.databaseId) throw new Error('Database ID not configured');

        try {
            const stock = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.stocks,
                stockSymbol
            );
            return stock.currentPrice;
        } catch (error) {
            console.error('Error fetching stock price:', error);
            throw error;
        }
    }
}; 