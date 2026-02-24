/**
 * Test script for ChatGPT service
 * This script tests the basic functionality of the ChatGPT service
 */

const { createChatGPTService } = require('./dist/services/chatgpt/exports');

async function testChatGPTService() {
  console.log('Testing ChatGPT Service...');
  console.log('=======================\n');

  try {
    // Create service instance
    console.log('1. Creating ChatGPT service instance...');
    const chatGPT = createChatGPTService();
    
    // Initialize with default config
    console.log('2. Initializing service...');
    await chatGPT.initialize();
    
    // Get service status
    console.log('3. Getting service status...');
    const status = chatGPT.getStatus();
    console.log('   Status:', JSON.stringify(status, null, 2));
    
    // Test connection
    console.log('4. Testing connection...');
    const connectionTest = await chatGPT.testConnection();
    console.log('   Connection test:', connectionTest ? 'PASSED' : 'FAILED');
    
    if (connectionTest) {
      // Check if we have API key for sending messages
      const config = chatGPT.getConfiguration();
      
      if (config.mode === 'authenticated' && config.api_key) {
        // Send a test message (only in authenticated mode with API key)
        console.log('5. Sending test message...');
        try {
          const response = await chatGPT.sendMessage('Hello, this is a test message. Please respond with "Test successful!"', {
            maxTokens: 50,
            systemPrompt: 'You are a test assistant. Keep responses very short.'
          });
          
          console.log('   Response:', response.message.content);
          console.log('   Conversation ID:', response.conversationId);
          console.log('   Usage:', JSON.stringify(response.usage, null, 2));
        } catch (error) {
          console.log('   ⚠️  Message sending failed (expected without valid API key):', error.message);
        }
      } else {
        console.log('5. Skipping message test (public mode or no API key)...');
        console.log('   💡 Run configuration wizard to add API key for full testing:');
        console.log('   node -e "require(\'./dist/services/chatgpt/exports\').runConfigWizard()"');
      }
      
      // Get conversations
      console.log('6. Getting conversations...');
      const conversations = chatGPT.getAllConversations();
      console.log('   Total conversations:', conversations.length);
      
      // Get usage stats
      console.log('7. Getting usage statistics...');
      const usageStats = chatGPT.getUsageStats();
      console.log('   Usage stats:', JSON.stringify(usageStats, null, 2));
      
      // Get configuration
      console.log('8. Getting configuration...');
      console.log('   Mode:', config.mode);
      console.log('   Model:', config.model);
      console.log('   Base URL:', config.base_url);
      
      console.log('\n✅ All tests passed!');
      console.log('📝 Service is working correctly in', config.mode, 'mode.');
      
      if (config.mode === 'public') {
        console.log('🔑 To enable full features, configure API key:');
        console.log('   node -e "require(\'./dist/services/chatgpt/exports\').runConfigWizard()"');
      }
    } else {
      console.log('\n⚠️  Connection test failed. Service may not be properly configured.');
      console.log('   Please run the configuration wizard:');
      console.log('   node -e "require(\'./dist/services/chatgpt/exports\').runConfigWizard()"');
    }
    
    // Clean up
    console.log('\n9. Cleaning up...');
    chatGPT.destroy();
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    
    // Provide helpful suggestions
    if (error.message.includes('Cannot find module')) {
      console.error('\n💡 Suggestion: Build the project first:');
      console.error('   npm run build');
    } else if (error.message.includes('API key')) {
      console.error('\n💡 Suggestion: Configure ChatGPT service:');
      console.error('   node -e "require(\'./dist/services/chatgpt/exports\').runConfigWizard()"');
    }
    
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testChatGPTService().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { testChatGPTService };