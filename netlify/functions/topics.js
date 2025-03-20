const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');

// Add CORS headers helper function
const addCorsHeaders = () => {
  return {
    'Access-Control-Allow-Origin': '*', // Or restrict to your domain
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
};

// Function to find the content directory
const findContentDirectory = () => {
  // List of potential paths to try
  const potentialPaths = [
    // Netlify function specific paths
    path.join(process.cwd(), 'content/articles'),
    path.join(process.cwd(), '..', '..', 'content/articles'),
    path.join(process.cwd(), '..', 'content/articles'),
    // Absolute fallback paths for Netlify
    '/var/task/content/articles',
    '/opt/build/repo/content/articles',
    '/opt/build/content/articles'
  ];

  console.log('Current working directory:', process.cwd());
  
  // Try each path until we find one that exists
  for (const dirPath of potentialPaths) {
    try {
      console.log('Trying path:', dirPath);
      fs.accessSync(dirPath, fs.constants.R_OK);
      console.log('Found valid content directory at:', dirPath);
      return dirPath;
    } catch (err) {
      console.log(`Directory not found at ${dirPath}`);
    }
  }

  // If we get here, we couldn't find any valid path
  console.error('Could not find a valid content directory!');
  return null;
};

// Same function as in utils/mdx.js but adapted for Netlify Functions
const getAllPosts = () => {
  try {
    // Find a valid content directory
    const postsDirectory = findContentDirectory();
    
    // If no directory found, return empty array
    if (!postsDirectory) {
      return [];
    }
    
    const filenames = fs.readdirSync(postsDirectory);
    console.log(`Found ${filenames.length} files in directory`);

    if (filenames.length === 0) {
      console.log('No files found in directory');
      return [];
    }

    const posts = filenames.map((filename) => {
      try {
        const filePath = path.join(postsDirectory, filename);
        
        // Skip directories - check if it's a file before processing
        const fileStats = fs.statSync(filePath);
        if (!fileStats.isFile()) {
          console.log(`Skipping directory: ${filename}`);
          return null;
        }
        
        const fileContents = fs.readFileSync(filePath, 'utf8');
        
        // Try to parse the frontmatter
        let data;
        try {
          const result = matter(fileContents, { excerpt: true });
          data = result.data;
        } catch (parseError) {
          console.error(`Error parsing frontmatter in ${filename}:`, parseError);
          
          // Use placeholder data for error case
          data = {
            title: `Error parsing ${filename}`,
            date: new Date().toISOString(),
            slug: filename.replace(/\.md$/, ''),
            category: 'Tech',
            categories: []
          };
        }

        // Ensure date is properly formatted as ISO string
        const date = typeof data.date === 'string' ? data.date : 
                    data.date instanceof Date ? data.date.toISOString() :
                    new Date().toISOString();

        return {
          slug: data.slug || filename.replace(/\.md$/, ''),
          title: data.title || filename.replace(/\.md$/, ''),
          date,
          category: data.category || 'Tech',
          categories: data.categories || []
        };
      } catch (fileError) {
        // If there's an error with this specific file, log it but continue with other files
        console.error(`Error processing file ${filename}:`, fileError);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from files with errors

    return posts;
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
};

// Get all topics/categories from the posts
const getAllTopicsAndCategories = () => {
  const posts = getAllPosts();
  
  // Extract all categories and count occurrences
  const categoryCounts = {};
  const topicCounts = {};
  
  posts.forEach(post => {
    // Count primary category
    if (post.category) {
      const category = post.category.toLowerCase();
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
    
    // Count categories from the categories array
    if (Array.isArray(post.categories)) {
      post.categories.forEach(cat => {
        if (cat && cat.name) {
          const topic = cat.name.toLowerCase();
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
          
          // Also record the type if available
          if (!topicCounts[`${topic}_type`] && cat.type) {
            topicCounts[`${topic}_type`] = cat.type;
          }
        }
      });
    }
  });
  
  // Convert to array format
  const categories = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
    slug: name.toLowerCase().replace(/\s+/g, '-')
  }));
  
  const topics = Object.entries(topicCounts)
    .filter(([key]) => !key.includes('_type')) // Filter out the type metadata
    .map(([name, count]) => ({
      name,
      count,
      type: topicCounts[`${name}_type`] || 'default',
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }));
  
  return {
    categories,
    topics,
    // Include posts for a specific category/topic if requested
    getPostsByCategory: (categoryName) => {
      const lowercaseName = categoryName.toLowerCase();
      return posts.filter(post => {
        // Check primary category
        const matchesPrimaryCategory = post.category?.toLowerCase() === lowercaseName;
        
        // Check categories array
        const matchesInCategoriesArray = post.categories?.some(
          cat => cat.name?.toLowerCase() === lowercaseName
        );
        
        return matchesPrimaryCategory || matchesInCategoriesArray;
      });
    }
  };
};

// Netlify function handler
exports.handler = async (event, context) => {
  console.log('Topics function invoked with query parameters:', event.queryStringParameters);
  
  // Set CORS headers to allow all origins
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    // Parse the queryStringParameters
    const { category, topic } = event.queryStringParameters || {};
    const topicsData = getAllTopicsAndCategories();
    
    // If a specific category or topic is requested, return posts for that category/topic
    if (category || topic) {
      const categoryName = category || topic;
      const posts = topicsData.getPostsByCategory(categoryName);
      
      return {
        statusCode: 200,
        headers: addCorsHeaders(),
        body: JSON.stringify({
          posts,
          category: categoryName,
          count: posts.length
        })
      };
    }
    
    // Otherwise return all topics and categories
    return {
      statusCode: 200,
      headers: addCorsHeaders(),
      body: JSON.stringify({
        categories: topicsData.categories,
        topics: topicsData.topics
      })
    };
  } catch (error) {
    console.error('Error in topics API:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error fetching topics and categories',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}; 