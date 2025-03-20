// API endpoint for newsletter subscriptions
import fs from 'fs';
import path from 'path';

// Simple storage solution using a JSON file
// In a production environment, you would use a database instead
const subscribersFilePath = path.join(process.cwd(), 'data', 'subscribers.json');

// Ensure the subscribers file exists
function ensureSubscribersFileExists() {
  const dataDir = path.join(process.cwd(), 'data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create subscribers file if it doesn't exist
  if (!fs.existsSync(subscribersFilePath)) {
    fs.writeFileSync(subscribersFilePath, JSON.stringify({ 
      subscribers: [],
      categories: {
        daily: [],
        ai: [],
        tech: []
      } 
    }));
  }
}

// Get existing subscribers
function getSubscribers() {
  ensureSubscribersFileExists();
  const fileContents = fs.readFileSync(subscribersFilePath, 'utf8');
  return JSON.parse(fileContents);
}

// Save subscribers
function saveSubscribers(data) {
  fs.writeFileSync(subscribersFilePath, JSON.stringify(data, null, 2));
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, categories = [] } = req.body;

    // Simple validation
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get existing subscribers
    const data = getSubscribers();
    
    // Check if email already exists
    if (data.subscribers.includes(email)) {
      return res.status(200).json({ 
        message: 'You are already subscribed!',
        alreadySubscribed: true 
      });
    }

    // Add email to subscribers list
    data.subscribers.push(email);
    
    // Add email to selected categories
    categories.forEach(category => {
      if (data.categories[category] && !data.categories[category].includes(email)) {
        data.categories[category].push(email);
      }
    });

    // Save updated subscribers
    saveSubscribers(data);

    // Return success response
    return res.status(200).json({ 
      message: 'Successfully subscribed!',
      success: true 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 