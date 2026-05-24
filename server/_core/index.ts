import express from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Banca UFO API funcionando!' });
});

// Rota para criar PIX (simulado - para testes)
app.post('/api/create-pix', (req, res) => {
  const { items, total } = req.body;
  
  console.log('📦 Recebendo pedido:', { items, total });
  
  // Gerar ID único para o pedido
  const transactionId = `UFO_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // Gerar QR Code de exemplo
  const qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(transactionId)}`;
  
  // Código copia e cola de exemplo
  const copyPaste = `00020126360014br.gov.bcb.pix0114${transactionId}5204000053039865404${Math.floor(total * 100)}5802BR5913Banca UFO6008Sao Paulo62070503***6304`;
  
  res.json({
    success: true,
    transactionId: transactionId,
    qrCode: qrCodeBase64,
    paymentUrl: `http://localhost:3000/success?order=${transactionId}`,
    copyPaste: copyPaste,
  });
});

// Rota de sucesso
app.get('/api/order/:id', (req, res) => {
  res.json({ 
    status: 'approved', 
    message: 'Pedido confirmado!', 
    orderId: req.params.id 
  });
});

// Rota padrão para outras requisições
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 ========================================`);
  console.log(`🚀 Servidor Banca UFO rodando!`);
  console.log(`🚀 ========================================`);
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
  console.log(`💳 PIX: http://localhost:${PORT}/api/create-pix (POST)`);
  console.log(`========================================\n`);
});