const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const CaseFile = require('../models/CaseFile');

async function checkCaseFileCategories() {
  try {
    console.log('Checking case file categories...');
    
    // Get all unique categories
    const categories = await CaseFile.distinct('category');
    console.log('Existing categories:', categories);
    
    // Get sample case files
    const sampleCaseFiles = await CaseFile.find().limit(5).select('title category');
    console.log('Sample case files:');
    sampleCaseFiles.forEach(cf => {
      console.log(`- ${cf.title}: "${cf.category}"`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('Check completed');
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

checkCaseFileCategories();