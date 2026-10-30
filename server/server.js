const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SkillSwap Web Application running!`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`✨ Peer-to-Peer Skill Exchange & Knowledge Sharing`);
  console.log(`====================================================`);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
