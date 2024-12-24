import { stockService } from './stockService';

interface PriceUpdate {
    symbol: string;
    price: number;
    timestamp: Date;
}

export const stockPriceService = {
    // Simulates market volatility (0-1, higher = more volatile)
    volatility: 0.02,
    
    // Update interval in milliseconds
    updateInterval: 5000,

    // Keep track of update intervals
    intervals: new Map<string, NodeJS.Timer>(),

    startPriceUpdates(symbol: string, basePrice: number) {
        if (this.intervals.has(symbol)) {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const newPrice = this.generateNextPrice(basePrice);
                await stockService.updateStockPrice(symbol, newPrice);
            } catch (error) {
                console.error('Error updating stock price:', error);
            }
        }, this.updateInterval);

        this.intervals.set(symbol, interval);
    },

    stopPriceUpdates(symbol: string) {
        const interval = this.intervals.get(symbol);
        if (interval) {
            clearInterval(interval as NodeJS.Timeout);
            this.intervals.delete(symbol);
        }
    },

    generateNextPrice(currentPrice: number): number {
        // Random walk algorithm with mean reversion
        const change = currentPrice * this.volatility * (Math.random() - 0.5);
        const newPrice = currentPrice + change;
        
        // Prevent negative prices
        return Math.max(newPrice, 0.01);
    }
}; 