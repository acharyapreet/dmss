const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Workflow = require('../models/Workflow');

async function addTemplateToWorkflows() {
  try {
    console.log('Adding template field to existing workflows...');
    
    // Update all workflows that don't have a template field
    const result = await Workflow.updateMany(
      { template: { $exists: false } },
      { $set: { template: 'general' } }
    );
    
    console.log(`Updated ${result.modifiedCount} workflows with template field`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addTemplateToWorkflows();