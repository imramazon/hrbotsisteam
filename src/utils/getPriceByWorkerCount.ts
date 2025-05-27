import * as fs from 'fs';
import * as path from 'path';

export interface WorkerPrice {
  count: number;
  price: number;
}

// Function to get price by worker count
export function getPriceByWorkerCount(count: number): number {
  try {
    // Read the JSON file
    const filePath = path.join(__dirname, '../config/worker-prices.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const priceData = JSON.parse(fileContent);
    
    // Find the exact count match
    const exactMatch = priceData.prices.find((item: WorkerPrice) => item.count === count);
    if (exactMatch) {
      return exactMatch.price;
    }
    
    // If no exact match, calculate based on the base price (10,000 per worker)
    return count * 10000;
  } catch (error) {
    console.error('Error reading worker prices:', error);
    // Default price if file cannot be read
    return count * 10000;
  }
}
