import { app } from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 BizReport Backend Server running at http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
});
