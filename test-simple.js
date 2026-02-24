/**
 * 简单测试ChatGPT服务
 */

const { createChatGPTService } = require('./dist/services/chatgpt/exports');

async function testSimple() {
  console.log('简单测试ChatGPT服务...\n');
  
  try {
    // 1. 创建服务实例
    console.log('1. 创建ChatGPT服务实例...');
    const chatGPT = createChatGPTService();
    
    // 2. 初始化
    console.log('2. 初始化服务...');
    await chatGPT.initialize();
    
    // 3. 获取配置
    console.log('3. 获取当前配置...');
    const config = chatGPT.getConfiguration();
    console.log('   模式:', config.mode);
    console.log('   基础URL:', config.base_url);
    console.log('   模型:', config.model);
    
    // 4. 测试连接（不使用实际API调用）
    console.log('4. 测试基本功能...');
    
    // 测试获取状态
    const status = chatGPT.getStatus();
    console.log('   服务状态:', status.initialized ? '已初始化' : '未初始化');
    console.log('   认证状态:', status.authenticated ? '已认证' : '未认证');
    
    // 测试获取对话
    const conversations = chatGPT.getAllConversations();
    console.log('   对话数量:', conversations.length);
    
    // 测试获取使用统计
    const usage = chatGPT.getUsageStats();
    console.log('   使用统计:', JSON.stringify(usage, null, 2));
    
    // 5. 清理资源
    console.log('\n5. 清理资源...');
    chatGPT.destroy();
    
    console.log('\n✅ 基本功能测试通过！');
    console.log('💡 提示: 要使用完整功能，请配置API密钥:');
    console.log('   node -e "require(\'./dist/services/chatgpt/exports\').runConfigWizard()"');
    
  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error(error.message);
    
    if (error.stack) {
      console.error('\n堆栈跟踪:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testSimple().catch(error => {
    console.error('未处理的错误:', error);
    process.exit(1);
  });
}

module.exports = { testSimple };