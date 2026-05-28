import { useState, useEffect } from 'react';
import { supabase, isUserAdmin } from './lib/supabase';
import AdminPanel from './components/AdminPanel'; // Adicione esta linha


function App() {
  const [activeTab, setActiveTab] = useState<'loja' | 'anunciante' | 'jornaleiro'>('loja');
  const [step, setStep] = useState<'loja' | 'formato' | 'endereco' | 'pagamento'>('loja');
  const [formato, setFormato] = useState<'fisico' | 'digital'>('fisico');
  const [endereco, setEndereco] = useState({ cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' });
  const [pixModal, setPixModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showJornForm, setShowJornForm] = useState(false);
  const [jornNome, setJornNome] = useState('');
  const [jornCnpj, setJornCnpj] = useState('');
  const [jornEndereco, setJornEndereco] = useState('');
  const [jornEmail, setJornEmail] = useState('');
  const [jornTelefone, setJornTelefone] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPanel, setShowPanel] = useState<'mediakit' | 'mypanel'>('mediakit');
  const [showJornPanel, setShowJornPanel] = useState<'sobre' | 'mypanel'>('sobre');
  const [isAdmin, setIsAdmin] = useState(false); // Adicione esta linha

  const preco = formato === 'fisico' ? 39.90 : 19.90;

   const products = [
    { id: 1, title: 'Edição 49 - 1988', price: 39.90, image: '/images/edicao49.jpg', description: 'Edição histórica com poster exclusivo' },
    { id: 2, title: 'Edição 27', price: 39.90, image: '/images/edicao27.jpg', description: 'Os segredos ufológicos do Pentágono' },
    { id: 3, title: 'Edição Atual', price: 39.90, image: '/images/edicaoatual.png', description: 'Um novo tempo se inicia!' },
  ];

     const addToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };
  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  // Limpeza de cache
useEffect(() => {
  // se já tem ?cleared=1, não faz nada
  if (window.location.search.includes('cleared=1')) return;

  // limpa tudo e recarrega adicionando o flag na URL para evitar loop
  localStorage.clear();
  sessionStorage.clear();

  const url = new URL(window.location.href);
  url.searchParams.set('cleared', '1');
  // substitui a entrada do histórico (sem criar outra) e recarrega
  window.location.replace(url.toString());
}, []);

  useEffect(() => {
  const checkAuth = async () => {
       
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setUser(session.user);
      const admin = await isUserAdmin(session.user.id);
      console.log('Admin detectado:', admin);
      setIsAdmin(admin);
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  };
  
  checkAuth();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    
    if (session?.user) {
      setUser(session.user);
      const admin = await isUserAdmin(session.user.id);
      setIsAdmin(admin);
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  });
  
  return () => subscription.unsubscribe();
}, []);

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isLogin) {
    const { error, data } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) {
      alert(error.message);
    } else {
      alert('Login realizado!');
      setUser(data.user);
      const admin = await isUserAdmin(data.user.id);
      setIsAdmin(admin);
      
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
    }
  } else {
    const { error } = await supabase.auth.signUp({ email: loginEmail, password: loginPassword });
    if (error) {
      alert(error.message);
    } else {
      alert('Cadastro realizado! Verifique seu e-mail.');
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
    }
  }
};

const handleLogout = async () => {
  try {
    // 1. Limpar o estado do Supabase
    await supabase.auth.signOut();
    
    // 2. Limpar todos os estados do React
    setUser(null);
    setIsAdmin(false);
    setShowAdmin(false);
    setShowLoginModal(false);
    setCart([]);
    setIsCartOpen(false);
    
    // 3. Limpar o cache do navegador (Supabase storage)
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
    
    // 4. Redirecionar para a página inicial
    window.location.href = '/';
  } catch (error) {
    console.error('Erro no logout:', error);
    // Fallback: limpar tudo e recarregar
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }
};

  const handleEnderecoChange = (campo: string, valor: string) => {
    setEndereco({ ...endereco, [campo]: valor });
  };

  const handleFinalizarPedido = () => { setPixModal(true); };

  const handleJornSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('jornaleiros').insert([{
        nome_banca: jornNome, cnpj_cpf: jornCnpj, endereco: jornEndereco, email: jornEmail, telefone: jornTelefone, status: 'pendente'
      }]);
      if (error) throw error;
      alert('✅ Cadastro enviado! Entraremos em contato.');
      setJornNome(''); setJornCnpj(''); setJornEndereco(''); setJornEmail(''); setJornTelefone(''); setShowJornForm(false);
    } catch (error: any) { alert('❌ Erro ao enviar.'); }
  };

  const containerStyle = { maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' };
  const cardStyle = { background: 'rgba(10, 20, 35, 0.6)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(255,255,255,0.08)' };
  const inputStyle = { width: '100%', padding: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' };
  const buttonStyle = { width: '100%', padding: '14px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '40px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' };
  const buttonOutlineStyle = { width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '40px', color: 'white', cursor: 'pointer', marginTop: '12px' };

  // Tela da Loja
  // Verificar se deve mostrar AdminPanel
if (showAdmin && isAdmin) {
  return <AdminPanel user={user} onClose={() => setShowAdmin(false)} />;
}

// Tela da Loja
  if (step === 'loja' && activeTab === 'loja') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <div><h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>BANCA UFO</h1><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Revista Brasileira de Ufologia</p></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>🔍</button>
             {/* Botão ADMIN */}
            {isAdmin && (
              <button onClick={() => setShowAdmin(true)} style={{ padding: '8px 20px', background: '#00d4ff', border: 'none', borderRadius: '30px', color: '#0a0a1a', cursor: 'pointer', fontWeight: 'bold' }}>👑 ADMIN</button>
            )}
            <button onClick={() => setIsCartOpen(true)} style={{ position: 'relative', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'white' }}>🛒 {getItemCount() > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#ff4444', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getItemCount()}</span>}</button>
            {user ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: '14px' }}>👋 {user.email?.split('@')[0]}</span>
                <button onClick={handleLogout} style={{ padding: '8px 20px', background: '#333', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>SAIR</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} style={{ padding: '8px 24px', background: '#e60000', borderRadius: '30px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px #ff0000' }}>ENTRAR</button>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, padding: '40px 24px' }}>
          {/* Capa */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <div style={{ width: '200px', animation: 'float 4s ease-in-out infinite' }}>
              <img src="/images/edicaoatual.png" alt="Capa" style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} />
            </div>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', background: 'linear-gradient(135deg, #00d4ff, #0088ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UFO Magazine</h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Ano XL Edição #001 · Junho 2026</p>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', margin: '20px 0' }}>A edição mais aguardada do ano traz uma cobertura exclusiva sobre a transição da revista UFO.</p>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center', background: 'linear-gradient(135deg, #00d4ff, #0088ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦ EDIÇÃO ATUAL ✦</h3>
              <p style={{ fontWeight: 'bold', textAlign: 'center', color: 'white', margin: '12px 0' }}>DESTAQUES DESTA EDIÇÃO:</p>
              <ul style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '400px', margin: '0 auto' }}>
                <li>Entrevista exclusiva com ex-piloto da NASA</li>
                <li>Os 10 avistamentos mais intrigantes de 2025</li>
                <li>Tecnologia alienígena: fato ou ficção?</li>
                <li>A nova corrida espacial privada</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', margin: '20px 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Físico</p><p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>R$ 39,90</p></div>
              <div><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Digital</p><p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>R$ 19,90</p></div>
            </div>

            <button onClick={() => setStep('formato')} style={{ width: '100%', padding: '14px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '40px', fontWeight: 'bold', cursor: 'pointer' }}>COMPRAR EDIÇÃO</button>
          </div>

          {/* Edições Anteriores - Carrossel */}
          <div style={{ marginTop: '60px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center', background: 'linear-gradient(135deg, #00d4ff, #0088ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '24px' }}>✦ EDIÇÕES ANTERIORES ✦</h3>
            <div style={{ display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px' }}>
              {products.slice(0, 2).map(p => (
                <div key={p.id} style={{ flex: '0 0 280px', background: 'rgba(10, 20, 35, 0.5)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <img src={p.image} alt={p.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />
                  <h4 style={{ color: 'white', marginBottom: '8px' }}>{p.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '16px' }}>{p.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>R$ {p.price}</span>
                    <button onClick={() => addToCart(p)} style={{ padding: '6px 16px', background: '#ff4444', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>COMPRAR</button>
                  </div>
                </div>
              ))}
              <div style={{ flex: '0 0 280px', background: 'rgba(10, 20, 35, 0.5)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', minHeight: '320px' }}>
                <span style={{ fontSize: '48px', opacity: 0.5 }}>🛸</span>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>Em breve</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carrinho Modal */}
        {isCartOpen && (
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', background: '#1a1a2a', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ color: 'white' }}>🛒 Carrinho</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>
            {cart.length === 0 ? <p style={{ color: 'white' }}>Carrinho vazio</p> : (
              <>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <img src={item.image} alt={item.title} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'white' }}>{item.title}</h4>
                      <p style={{ color: '#ff4444' }}>R$ {item.price}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '4px 8px', background: '#333', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>-</button>
                        <span style={{ color: 'white' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '4px 8px', background: '#333', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: 'white' }}>Total:</span>
                    <span style={{ color: '#00ff88', fontSize: '24px', fontWeight: 'bold' }}>R$ {getTotal().toFixed(2)}</span>
                  </div>
                  <button onClick={() => { setStep('formato'); setIsCartOpen(false); }} style={{ width: '100%', padding: '12px', background: '#ff4444', border: 'none', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>FINALIZAR COMPRA</button>
                </div>
              </>
            )}
          </div>
        )}
        

                {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', textAlign: 'center', background: 'rgba(3, 12, 26, 0.95)', backdropFilter: 'blur(10px)', position: 'sticky', bottom: 0, width: '100%', zIndex: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '8px', alignItems: 'center' }}>
            <img 
              src="/images/lojavermelha.png" 
              alt="LOJA" 
              style={{ height: '32px', width: 'auto', cursor: 'pointer' }}
              onClick={() => { setActiveTab('loja'); setStep('loja'); }}
            />
            <img 
              src="/images/anunciantecinza.png" 
              alt="ANUNCIANTE" 
              style={{ height: '32px', width: 'auto', cursor: 'pointer' }}
              onClick={() => setActiveTab('anunciante')}
            />
            <img 
              src="/images/jornaleirocinza.png" 
              alt="JORNALEIRO" 
              style={{ height: '32px', width: 'auto', cursor: 'pointer' }}
              onClick={() => setActiveTab('jornaleiro')}
            />
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Banca UFO - Revista Brasileira de Ufologia</p>
        </div>

<style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }`}</style>

        {/* Modal de Login */}
        {showLoginModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowLoginModal(false)}>
            <div style={{ background: '#1a1a2a', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '90%', border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'white', textAlign: 'center' }}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</h2>
              <form onSubmit={handleLogin}>
                <input type="email" placeholder="E-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={inputStyle} required />
                <input type="password" placeholder="Senha" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={inputStyle} required />
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#e60000', border: 'none', borderRadius: '30px', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', boxShadow: '0 0 10px #ff0000' }}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</button>
              </form>
              <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '100%', textAlign: 'center' }}>{isLogin ? 'Criar conta' : 'Já tenho conta'}</button>
              <button onClick={() => setShowLoginModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', marginTop: '16px', width: '100%', textAlign: 'center' }}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

      // Tela ANUNCIANTE
      // Verificar se deve mostrar AdminPanel
if (showAdmin && isAdmin) {
  return <AdminPanel user={user} onClose={() => setShowAdmin(false)} />;
}

// Tela Anunciante
  if (activeTab === 'anunciante') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <div><h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'white' }}>BANCA UFO</h1><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Revista Brasileira de Ufologia</p></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>🔍</button>
            
             {/* Botão ADMIN */}
            {isAdmin && (
              <button onClick={() => setShowAdmin(true)} style={{ padding: '8px 20px', background: '#00d4ff', border: 'none', borderRadius: '30px', color: '#0a0a1a', cursor: 'pointer', fontWeight: 'bold' }}>👑 ADMIN</button>
            )}
            
            {user ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: '14px' }}>👋 {user.email?.split('@')[0]}</span>
                <button onClick={handleLogout} style={{ padding: '8px 20px', background: '#333', border: 'none', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>SAIR</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} style={{ padding: '8px 24px', background: '#e60000', border: 'none', borderRadius: '30px', color: 'white', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px #ff0000' }}>ENTRAR</button>
            )}
          </div>
        </div>

        {/* Título */}
        <div style={{ textAlign: 'center', padding: '32px 24px 16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#00d4ff', marginBottom: '8px' }}>Área do Anunciante</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Publicidade na Banca UFO</p>
        </div>

        {/* Botões Media Kit / Meu Painel */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '0 24px 24px' }}>
          <button onClick={() => setShowPanel('mediakit')} style={{ background: showPanel === 'mediakit' ? '#00d4ff' : 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '30px', padding: '8px 28px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: showPanel === 'mediakit' ? '#0a0a1a' : '#fff' }}>Media Kit</button>
          <button onClick={() => setShowPanel('mypanel')} style={{ background: showPanel === 'mypanel' ? '#00d4ff' : 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '30px', padding: '8px 28px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: showPanel === 'mypanel' ? '#0a0a1a' : '#fff' }}>Meu Painel</button>
        </div>

        {/* Conteúdo */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 24px' }}>
          {showPanel === 'mediakit' && (
            <div style={{ background: 'rgba(10, 20, 35, 0.6)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>Media Kit</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px', lineHeight: '1.5' }}>Alcance leitores apaixonados por tecnologia, ciência e fenômenos inexplicados. A Banca UFO é a revista de maior credibilidade no segmento.</p>
              
              {/* 4 cards principais */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '48px' }}>
                <div><div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00d4ff' }}>50.000+</div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Leitores mensais</div></div>
                <div><div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00d4ff' }}>5.000</div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Tiragem impressa</div></div>
                <div><div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00d4ff' }}>18-45</div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Faixa etária</div></div>
                <div><div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00d4ff' }}>92%</div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Taxa de engajamento</div></div>
              </div>

              {/* Perfil do Leitor */}
              <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: 'white' }}>Perfil do Leitor</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: 'rgba(255,255,255,0.7)' }}>Interesse em tecnologia e ciência</span><span style={{ color: '#00d4ff', fontWeight: 'bold' }}>94%</span></div><div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: '94%', height: '100%', background: '#00d4ff', borderRadius: '3px' }}></div></div></div>
                  <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: 'rgba(255,255,255,0.7)' }}>Renda média B/C+</span><span style={{ color: '#00d4ff', fontWeight: 'bold' }}>78%</span></div><div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: '78%', height: '100%', background: '#00d4ff', borderRadius: '3px' }}></div></div></div>
                  <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: 'rgba(255,255,255,0.7)' }}>Ensino superior completo</span><span style={{ color: '#00d4ff', fontWeight: 'bold' }}>65%</span></div><div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: '65%', height: '100%', background: '#00d4ff', borderRadius: '3px' }}></div></div></div>
                  <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: 'rgba(255,255,255,0.7)' }}>Consumidores ativos online</span><span style={{ color: '#00d4ff', fontWeight: 'bold' }}>88%</span></div><div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: '88%', height: '100%', background: '#00d4ff', borderRadius: '3px' }}></div></div></div>
                </div>
              </div>

              {/* Formatos Disponíveis */}
              <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: 'white' }}>Formatos Disponíveis</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div><div style={{ color: 'white', fontWeight: 'bold' }}>Página Inteira</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>210mm x 297mm · Anúncio de página inteira na revista</div></div>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>R$ 2.500,00</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div><div style={{ color: 'white', fontWeight: 'bold' }}>Capa 4 (Contracapa)</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>210mm x 297mm · Posição de maior destaque e visibilidade</div></div>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>R$ 4.020,00</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div><div style={{ color: 'white', fontWeight: 'bold' }}>Página Dupla Central</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>420mm x 297mm · Spread central de alto impacto visual</div></div>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>R$ 3.500,00</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div><div style={{ color: 'white', fontWeight: 'bold' }}>Meia Página</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>210mm x 148mm · Anúncio de meia página</div></div>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>R$ 1.500,00</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div><div style={{ color: 'white', fontWeight: 'bold' }}>Quarta Capa Interna</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>210mm x 297mm · Página interna de alta visibilidade</div></div>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>R$ 3.200,00</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div><div style={{ color: 'white', fontWeight: 'bold' }}>Meia Página Horizontal</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>210mm x 148mm · Formato horizontal de meia página</div></div>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>R$ 1.100,00</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div><div style={{ color: 'white', fontWeight: 'bold' }}>Rodapé Duplo</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>420mm x 50mm · Faixa de rodapé em duas páginas</div></div>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>R$ 800,00</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div><div style={{ color: 'white', fontWeight: 'bold' }}>Meia Página Vertical</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>105mm x 297mm · Formato vertical de meia página</div></div>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>R$ 1.100,00</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div><div style={{ color: 'white', fontWeight: 'bold' }}>Quarto de Página</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>105mm x 148mm · Formato compacto e econômico</div></div>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>R$ 650,00</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div><div style={{ color: 'white', fontWeight: 'bold' }}>Rodapé</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>210mm x 60mm · Faixa inferior de página editorial</div></div>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>R$ 450,00</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div><div style={{ color: 'white', fontWeight: 'bold' }}>Capa 2 (Contracapa Interna)</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>210mm x 297mm · Segunda capa interna de alta visibilidade</div></div>
                    <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>R$ 2.200,00</div>
                  </div>
                </div>
              </div>

              {/* Especificações Técnicas */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: 'white' }}>Especificações Técnicas</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: 'rgba(255,255,255,0.7)' }}>Formatos aceitos</span><span style={{ color: '#00d4ff' }}>PDF X-1a, TIFF, PNG</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: 'rgba(255,255,255,0.7)' }}>Resolução mínima</span><span style={{ color: '#00d4ff' }}>300 DPI</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: 'rgba(255,255,255,0.7)' }}>Perfil de cor</span><span style={{ color: '#00d4ff' }}>CMYK</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: 'rgba(255,255,255,0.7)' }}>Sangria</span><span style={{ color: '#00d4ff' }}>3mm em todos os lados</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: 'rgba(255,255,255,0.7)' }}>Prazo de entrega</span><span style={{ color: '#00d4ff' }}>7 dias antes do fechamento</span></div>
                </div>
              </div>

              <button style={{ width: '100%', padding: '14px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '40px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>SOLICITAR MEDIA KIT</button>
            </div>
          )}

          {showPanel === 'mypanel' && (
            <div style={{ background: 'rgba(10, 20, 35, 0.6)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>Meu Painel</h3>
              {!user ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>Faça login para acessar seus anúncios e contratos</p>
                  <button onClick={() => setShowLoginModal(true)} style={{ padding: '12px 24px', background: '#e60000', border: 'none', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>ENTRAR</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Nenhum contrato ainda</p>
                  <button style={{ padding: '10px 24px', background: '#00d4ff', border: 'none', borderRadius: '30px', color: '#0a0a1a', fontWeight: 'bold', cursor: 'pointer' }}>Criar primeiro anúncio</button>
                </div>
              )}
            </div>
          )}
        </div>

                        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', textAlign: 'center', background: 'rgba(3, 12, 26, 0.95)', backdropFilter: 'blur(10px)', position: 'sticky', bottom: 0, width: '100%', zIndex: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '8px', alignItems: 'center' }}>
            <img 
              src="/images/lojacinza.png" 
              alt="LOJA" 
              style={{ height: '32px', width: 'auto', cursor: 'pointer' }}
              onClick={() => { setActiveTab('loja'); setStep('loja'); }}
            />
            <img 
              src="/images/anuncianteazul.png" 
              alt="ANUNCIANTE" 
              style={{ height: '32px', width: 'auto', cursor: 'pointer' }}
              onClick={() => setActiveTab('anunciante')}
            />
            <img 
              src="/images/jornaleirocinza.png" 
              alt="JORNALEIRO" 
              style={{ height: '32px', width: 'auto', cursor: 'pointer' }}
              onClick={() => setActiveTab('jornaleiro')}
            />
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Banca UFO - Revista Brasileira de Ufologia</p>
        </div>

        {/* Modal de Login */}
        {showLoginModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowLoginModal(false)}>
            <div style={{ background: '#1a1a2a', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '90%', border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'white', textAlign: 'center' }}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</h2>
              <form onSubmit={handleLogin}>
                <input type="email" placeholder="E-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={inputStyle} required />
                <input type="password" placeholder="Senha" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={inputStyle} required />
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#e60000', border: 'none', borderRadius: '30px', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', boxShadow: '0 0 10px #ff0000' }}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</button>
              </form>
              <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '100%', textAlign: 'center' }}>{isLogin ? 'Criar conta' : 'Já tenho conta'}</button>
              <button onClick={() => setShowLoginModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', marginTop: '16px', width: '100%', textAlign: 'center' }}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

    // Tela JORNALEIRO
    // Verificar se deve mostrar AdminPanel
if (showAdmin && isAdmin) {
  return <AdminPanel user={user} onClose={() => setShowAdmin(false)} />;
}

// Tela Jornaleiro
  if (activeTab === 'jornaleiro') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <div><h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'white' }}>BANCA UFO</h1><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Revista Brasileira de Ufologia</p></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>🔍</button>
            
            {/* Botão ADMIN */}
            {isAdmin && (
              <button onClick={() => setShowAdmin(true)} style={{ padding: '8px 20px', background: '#00d4ff', border: 'none', borderRadius: '30px', color: '#0a0a1a', cursor: 'pointer', fontWeight: 'bold' }}>👑 ADMIN</button>
            )}
            
            {user ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: '14px' }}>👋 {user.email?.split('@')[0]}</span>
                <button onClick={handleLogout} style={{ padding: '8px 20px', background: '#333', border: 'none', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>SAIR</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} style={{ padding: '8px 24px', background: '#e60000', border: 'none', borderRadius: '30px', color: 'white', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px #ff0000' }}>ENTRAR</button>
            )}
          </div>
        </div>

        {/* Título */}
        <div style={{ textAlign: 'center', padding: '32px 24px 16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88', marginBottom: '8px' }}>Área do Jornaleiro</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Rede de Distribuição UFO</p>
        </div>

        {/* Botões Sobre / Meu Painel */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '0 24px 24px' }}>
          <button onClick={() => setShowJornPanel('sobre')} style={{ background: showJornPanel === 'sobre' ? '#00ff88' : 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '30px', padding: '8px 32px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: showJornPanel === 'sobre' ? '#0a0a1a' : '#fff' }}>Sobre</button>
          <button onClick={() => setShowJornPanel('mypanel')} style={{ background: showJornPanel === 'mypanel' ? '#00ff88' : 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '30px', padding: '8px 32px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: showJornPanel === 'mypanel' ? '#0a0a1a' : '#fff' }}>Meu Painel</button>
        </div>

        {/* Conteúdo */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 24px' }}>
          {showJornPanel === 'sobre' && (
            <div style={{ background: 'rgba(10, 20, 35, 0.6)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>Seja um Jornaleiro UFO</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '500px', margin: '0 auto' }}>Faça parte da maior rede de distribuição de revistas de ficção científica e fenômenos do Brasil.</p>
              </div>

              {/* Cards de Benefícios */}
              <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '48px' }}>
                <div className="card-item" style={{ background: 'rgba(0, 255, 136, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0, 255, 136, 0.3)', textAlign: 'center' }}>
                  <div style={{ marginBottom: '12px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><text x="12" y="17" textAnchor="middle" fill="#00ff88" fontSize="14" fontWeight="bold">$</text></svg></div>
                  <div className="card-title" style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff88', marginBottom: '8px' }}>Comissão de 50%</div>
                  <div className="card-desc" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Ganhe em cada exemplar vendido</div>
                </div>
                <div className="card-item" style={{ background: 'rgba(0, 255, 136, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0, 255, 136, 0.3)', textAlign: 'center' }}>
                  <div style={{ marginBottom: '12px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.2"><path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M8 7h8"/><circle cx="12" cy="13" r="2"/></svg></div>
                  <div className="card-title" style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff88', marginBottom: '8px' }}>Lotes Consignados</div>
                  <div className="card-desc" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Receba sem custo inicial</div>
                </div>
                <div className="card-item" style={{ background: 'rgba(0, 255, 136, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0, 255, 136, 0.3)', textAlign: 'center' }}>
                  <div style={{ marginBottom: '12px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.2"><rect x="1" y="4" width="15" height="13" rx="2"/><path d="M16 9h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3"/><circle cx="6" cy="17" r="2"/><circle cx="16" cy="17" r="2"/></svg></div>
                  <div className="card-title" style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff88', marginBottom: '8px' }}>Entrega Gratuita</div>
                  <div className="card-desc" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Enviamos para sua banca</div>
                </div>
                <div className="card-item" style={{ background: 'rgba(0, 255, 136, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0, 255, 136, 0.3)', textAlign: 'center' }}>
                  <div style={{ marginBottom: '12px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><circle cx="12" cy="12" r="1.5" fill="#00ff88"/></svg></div>
                  <div className="card-title" style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff88', marginBottom: '8px' }}>Suporte Total</div>
                  <div className="card-desc" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Equipe dedicada para parceiros</div>
                </div>
              </div>

              {/* Como Funciona */}
              <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: 'white', textAlign: 'center' }}>COMO FUNCIONA</h3>
                <div className="como-funciona-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', justifyItems: 'center', alignItems: 'start' }}>
                  <div className="funciona-item" style={{ textAlign: 'center', maxWidth: '220px' }}>
                    <div className="circle-number" style={{ width: '56px', height: '56px', background: '#00ff88', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#0a0a1a', fontWeight: 'bold', fontSize: '22px' }}>01</div>
                    <div className="funciona-title" style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Cadastro</div>
                    <div className="funciona-desc" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.4' }}>Preencha o formulário de pré-cadastro</div>
                  </div>
                  <div className="funciona-item" style={{ textAlign: 'center', maxWidth: '220px' }}>
                    <div className="circle-number" style={{ width: '56px', height: '56px', background: '#00ff88', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#0a0a1a', fontWeight: 'bold', fontSize: '22px' }}>02</div>
                    <div className="funciona-title" style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Aprovação</div>
                    <div className="funciona-desc" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.4' }}>Nossa equipe analisa em até 48h</div>
                  </div>
                  <div className="funciona-item" style={{ textAlign: 'center', maxWidth: '220px' }}>
                    <div className="circle-number" style={{ width: '56px', height: '56px', background: '#00ff88', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#0a0a1a', fontWeight: 'bold', fontSize: '22px' }}>03</div>
                    <div className="funciona-title" style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Receba o Lote</div>
                    <div className="funciona-desc" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.4' }}>Enviamos as revistas para sua banca</div>
                  </div>
                  <div className="funciona-item" style={{ textAlign: 'center', maxWidth: '220px' }}>
                    <div className="circle-number" style={{ width: '56px', height: '56px', background: '#00ff88', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#0a0a1a', fontWeight: 'bold', fontSize: '22px' }}>04</div>
                    <div className="funciona-title" style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Venda e Lucro</div>
                    <div className="funciona-desc" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.4' }}>Reporte as vendas e receba sua comissão</div>
                  </div>
                </div>
              </div>

              {/* Botão / Formulário Quero ser Jornaleiro */}
              <div style={{ marginTop: '32px' }}>
                {!showJornForm ? (
                  <button onClick={() => setShowJornForm(true)} style={{ width: '100%', padding: '14px', background: '#00ff88', color: '#0a0a1a', border: 'none', borderRadius: '40px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 0 10px #00ff88' }}>QUERO SER JORNALEIRO UFO</button>
                ) : (
                  <div style={{ background: 'rgba(0, 255, 136, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: 'white', textAlign: 'center' }}>Pré-cadastro</h4>
                    <form onSubmit={handleJornSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input type="text" placeholder="Nome da Banca" value={jornNome} onChange={(e) => setJornNome(e.target.value)} style={inputStyle} required />
                      <input type="text" placeholder="CNPJ/CPF" value={jornCnpj} onChange={(e) => setJornCnpj(e.target.value)} style={inputStyle} required />
                      <input type="text" placeholder="Endereço completo" value={jornEndereco} onChange={(e) => setJornEndereco(e.target.value)} style={inputStyle} required />
                      <input type="email" placeholder="E-mail" value={jornEmail} onChange={(e) => setJornEmail(e.target.value)} style={inputStyle} required />
                      <input type="tel" placeholder="Telefone" value={jornTelefone} onChange={(e) => setJornTelefone(e.target.value)} style={inputStyle} required />
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button type="submit" style={{ flex: 1, padding: '12px', background: '#00ff88', color: '#0a0a1a', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>ENVIAR</button>
                        <button type="button" onClick={() => setShowJornForm(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>CANCELAR</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {showJornPanel === 'mypanel' && (
            <div style={{ background: 'rgba(10, 20, 35, 0.6)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>Meu Painel</h3>
              {!user ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>Faça login para acessar seus pedidos e comissões</p>
                  <button onClick={() => setShowLoginModal(true)} style={{ padding: '12px 24px', background: '#e60000', border: 'none', borderRadius: '30px', color: 'white', cursor: 'pointer', boxShadow: '0 0 10px #ff0000' }}>ENTRAR</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '16px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
                      <path d="M8 7h8"/>
                      <circle cx="12" cy="13" r="2"/>
                      <path d="M16 13h2"/>
                      <path d="M6 13h2"/>
                    </svg>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Nenhum pedido ainda</p>
                  <button style={{ padding: '10px 24px', background: '#00ff88', border: 'none', borderRadius: '30px', color: '#0a0a1a', fontWeight: 'bold', cursor: 'pointer' }}>Solicitar Lote</button>
                </div>
              )}
            </div>
          )}
        </div>

                  {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', textAlign: 'center', background: 'rgba(3, 12, 26, 0.95)', backdropFilter: 'blur(10px)', position: 'sticky', bottom: 0, width: '100%', zIndex: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '8px', alignItems: 'center' }}>
            <img 
              src="/images/lojacinza.png" 
              alt="LOJA" 
              style={{ height: '32px', width: 'auto', cursor: 'pointer' }}
              onClick={() => { setActiveTab('loja'); setStep('loja'); }}
            />
            <img 
              src="/images/anunciantecinza.png" 
              alt="ANUNCIANTE" 
              style={{ height: '32px', width: 'auto', cursor: 'pointer' }}
              onClick={() => setActiveTab('anunciante')}
            />
            <img 
              src="/images/jornaleiroverde.png" 
              alt="JORNALEIRO" 
              style={{ height: '32px', width: 'auto', cursor: 'pointer' }}
              onClick={() => setActiveTab('jornaleiro')}
            />
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Banca UFO - Revista Brasileira de Ufologia</p>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .cards-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
            .card-item { padding: 12px !important; text-align: center !important; }
            .card-item svg { width: 36px !important; height: 36px !important; }
            .card-title { font-size: 14px !important; }
            .card-desc { font-size: 11px !important; }
            .como-funciona-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
            .funciona-item { text-align: center !important; }
            .circle-number { width: 44px !important; height: 44px !important; font-size: 16px !important; margin: 0 auto 8px !important; }
            .funciona-title { font-size: 13px !important; }
            .funciona-desc { font-size: 11px !important; }
          }
        `}</style>

        {/* Modal de Login */}
        {showLoginModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowLoginModal(false)}>
            <div style={{ background: '#1a1a2a', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '90%', border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'white', textAlign: 'center' }}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</h2>
              <form onSubmit={handleLogin}>
                <input type="email" placeholder="E-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={inputStyle} required />
                <input type="password" placeholder="Senha" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={inputStyle} required />
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#e60000', border: 'none', borderRadius: '30px', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', boxShadow: '0 0 10px #ff0000' }}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</button>
              </form>
              <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '100%', textAlign: 'center' }}>{isLogin ? 'Criar conta' : 'Já tenho conta'}</button>
              <button onClick={() => setShowLoginModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', marginTop: '16px', width: '100%', textAlign: 'center' }}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default App;