import { useState, useEffect } from 'react';

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
  description: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'loja' | 'anunciante' | 'jornaleiro'>('loja');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [stars, setStars] = useState<JSX.Element[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState({ qrCode: '', copyPaste: '', paymentUrl: '' });

  const products = [
    { id: 1, title: 'Edição 49 - 1988', price: 39.90, image: '/images/edicao49.jpg', description: 'Edição Histórica + Poster' },
    { id: 2, title: 'Edição 27', price: 39.90, image: '/images/edicao27.jpg', description: 'Os segredos do Pentágono' },
    { id: 3, title: 'Edição Atual', price: 39.90, image: '/images/edicaoatual.jpg', description: 'Um novo tempo se inicia!' },
  ];

  useEffect(() => {
    const starElements = [];
    for (let i = 0; i < 150; i++) {
      const size = Math.random() * 2 + 1;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = Math.random() * 3 + 1;
      const delay = Math.random() * 5;
      
      starElements.push(
        <div
          key={i}
          className="star-dynamic"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
            animation: `twinkle ${duration}s ease-in-out infinite`,
            animationDelay: `${delay}s`,
          }}
        />
      );
    }
    setStars(starElements);
  }, []);

  const addToCart = (product: typeof products[0]) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, image: product.image }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/create-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
          total: getTotal(),
          description: `Compra Banca UFO - ${cart.length} itens`,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPixData({
          qrCode: data.qrCode,
          copyPaste: data.copyPaste,
          paymentUrl: data.paymentUrl,
        });
        setShowPixModal(true);
        setIsCartOpen(false);
      } else {
        alert('Erro ao gerar pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">{stars}</div>
      
      <header className="sticky top-0 z-50">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="/images/logo.png" 
                alt="Banca UFO Logo" 
                className="ufo-logo w-12 h-12 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div>
                <h1 className="neon-text text-3xl md:text-4xl">
                  BANCA <span className="text-white">UFO</span>
                </h1>
                <p className="text-white/60 text-sm">Revista Brasileira de Ufologia</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative btn-neon flex items-center gap-2 px-4 py-2"
            >
              🛒
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-neon-green text-black rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  {getItemCount()}
                </span>
              )}
              <span className="hidden md:inline">Carrinho</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom">
        <div className="tab-nav">
          <button onClick={() => setActiveTab('loja')} className={`tab-button ${activeTab === 'loja' ? 'active' : ''}`}>🛸 LOJA</button>
          <button onClick={() => setActiveTab('anunciante')} className={`tab-button announcer ${activeTab === 'anunciante' ? 'active' : ''}`}>📢 ANUNCIANTE</button>
          <button onClick={() => setActiveTab('jornaleiro')} className={`tab-button newsstand ${activeTab === 'jornaleiro' ? 'active' : ''}`}>📰 JORNALEIRO</button>
        </div>

        {activeTab === 'loja' && (
          <div className="tab-content">
            <div className="text-center mb-12">
              <h2 className="neon-text text-4xl">✨ EDIÇÃO ATUAL ✨</h2>
              <p className="text-white/60 mt-2">A revista mais aguardada do ano está aqui!</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="magazine-card">
                  <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-white/5 flex items-center justify-center">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; const p = e.currentTarget.parentElement; if(p) p.innerHTML = '<span class="text-6xl">🛸</span>'; }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
                  <p className="text-white/50 text-sm mb-4">{product.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <span className="text-2xl font-bold text-neon-green">R$ {product.price.toFixed(2)}</span>
                    <button onClick={() => addToCart(product)} className="btn-neon text-sm px-4 py-2">ADICIONAR</button>
                  </div>
                  <p className="text-xs text-white/30 mt-3">📦 Frete grátis</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'anunciante' && (
          <div className="tab-content announcer">
            <div className="text-center mb-8">
              <h2 className="neon-text-red text-3xl">📢 PUBLIQUE NA UFO</h2>
              <p className="text-white/60">Alcance milhares de leitores apaixonados por ufologia</p>
            </div>
            <div className="glass-effect rounded-xl p-6">
              <h3 className="font-bold text-2xl text-neon-red mb-6 text-center">Media Kit</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10"><span>📱 Leitores mensais</span><span className="font-bold text-2xl text-neon-red">50.000+</span></div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10"><span>📰 Tiragem impressa</span><span className="font-bold text-2xl text-neon-red">5.000</span></div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10"><span>🎯 Alcance digital</span><span className="font-bold text-2xl text-neon-red">100.000+</span></div>
              </div>
              <button className="w-full mt-8 btn-neon-red py-3 rounded-full font-bold">SOLICITAR MEDIA KIT</button>
            </div>
          </div>
        )}

        {activeTab === 'jornaleiro' && (
          <div className="tab-content newsstand">
            <div className="text-center mb-8">
              <h2 className="neon-text-blue text-3xl">📰 SEJA UM JORNALEIRO PARCEIRO</h2>
              <p className="text-white/60">Faça parte da maior rede de distribuição de revistas UFO</p>
            </div>
            <div className="glass-effect rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10"><div className="text-4xl mb-2">💰</div><div className="font-bold text-xl text-neon-blue">50% de comissão</div></div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10"><div className="text-4xl mb-2">📦</div><div className="font-bold text-xl text-neon-blue">Lotes consignados</div></div>
              </div>
              <form className="space-y-4">
                <input type="text" placeholder="Nome da Banca" className="neon-input neon-input-blue w-full" />
                <input type="text" placeholder="CNPJ/CPF" className="neon-input neon-input-blue w-full" />
                <input type="text" placeholder="Endereço completo" className="neon-input neon-input-blue w-full" />
                <input type="email" placeholder="E-mail" className="neon-input neon-input-blue w-full" />
                <button className="w-full btn-neon-blue py-3 rounded-full font-bold">QUERO SER PARCEIRO</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal do Carrinho */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}>
          <div className="glass-effect w-full max-w-md h-full overflow-y-auto rounded-l-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="neon-text text-2xl">🛒 SEU CARRINHO</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-white/60 hover:text-white text-2xl">✕</button>
              </div>
              {cart.length === 0 ? (
                <div className="text-center py-12"><p className="text-white/60 text-lg">Seu carrinho está vazio</p><p className="text-white/40 text-sm mt-2">Adicione algumas revistas!</p></div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0"><img src={item.image} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /></div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold">{item.title}</h3>
                          <p className="text-neon-green text-sm">R$ {item.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn-neon text-xs px-2 py-1">-</button>
                            <span className="text-white w-8 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn-neon text-xs px-2 py-1">+</button>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-400 text-xs ml-auto hover:text-red-300">Remover</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between mb-4"><span className="text-white/80">Total:</span><span className="neon-text text-2xl">R$ {getTotal().toFixed(2)}</span></div>
                    <button onClick={handleCheckout} disabled={isLoading} className="btn-neon w-full py-3 text-lg font-bold disabled:opacity-50">
                      {isLoading ? '🔄 GERANDO PIX...' : '💚 FINALIZAR COMPRA'}
                    </button>
                    <p className="text-xs text-white/30 text-center mt-4">Aceitamos PIX, Cartão de Crédito e Boleto</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal do PIX */}
      {showPixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPixModal(false)}>
          <div className="glass-effect rounded-2xl p-8 max-w-md w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="neon-text text-2xl mb-4">💚 PAGAR COM PIX</h2>
            {pixData.qrCode && (
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <img src={pixData.qrCode} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
              </div>
            )}
            <p className="text-white/60 text-sm mb-4">Escaneie o QR Code com seu banco ou use o código abaixo:</p>
            <div className="bg-black/50 p-3 rounded-lg mb-4">
              <code className="text-neon-green text-xs break-all">{pixData.copyPaste}</code>
            </div>
            <button onClick={() => navigator.clipboard.writeText(pixData.copyPaste)} className="btn-neon w-full mb-3 py-2">📋 COPIAR CÓDIGO</button>
            <a href={pixData.paymentUrl} target="_blank" rel="noopener noreferrer" className="btn-neon w-full py-2 text-center inline-block">💳 PAGAR NO MERCADO PAGO</a>
            <button onClick={() => setShowPixModal(false)} className="text-white/40 text-sm mt-4 hover:text-white/60">Fechar</button>
          </div>
        </div>
      )}

      <style>{`
        .star-dynamic { position: absolute; background: white; border-radius: 50%; pointer-events: none; opacity: 0.5; }
        @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.8; } }
        .text-neon-green { color: var(--neon-green); }
      `}</style>
    </div>
  );
}

export default App;