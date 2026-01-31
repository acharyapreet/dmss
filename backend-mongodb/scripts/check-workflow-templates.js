const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const Workflow = require('../models/Workflow');

async function checkWorkflowTemplates() {
  try {
    console.log('Checking workflow templates...');
    
    // Get all unique templates
    const templates = await Workflow.distinct('template');
    console.log('Existing templates:', templates);
    
    // Get sample workflows
    const sampleWorkflows = await Workflow.find().limit(5).select('name template');
    console.log('Sample workflows:');
    sampleWorkflows.forEach(wf => {
      console.log(`- ${wf.name}: "${wf.template}"`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('Check completed');
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

checkWorkflowTemplates();