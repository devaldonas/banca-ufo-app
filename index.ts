import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Servir arquivos estáticos do frontend (após build)
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Rota de teste da API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Banca UFO API funcionando!' });
});

// Rota para gerar Pix (mock para teste)
app.post('/api/create-pix', (req, res) => {
  const { amount, description } = req.body;
  
  // Mock do QR Code - em produção integraria com Mercado Pago
  res.json({
    qrCode: 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=00020126360014br.gov.bcb.pix0114+551199999999952040000530398654040.005802BR5913Banca UFO6008Sao Paulo62070503***6304B24F',
    copyPaste: '00020126360014br.gov.bcb.pix0114551999999999520400005303986540100.005802BR5913Banca UFO6008Sao Paulo62070503***6304E8A3',
    transactionId: 'mock_' + Date.now()
  });
});

// Todas as outras rotas redirecionam para o index.html (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});