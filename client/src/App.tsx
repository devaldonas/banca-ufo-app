import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

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

  const preco = formato === 'fisico' ? 39.90 : 19.90;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) alert(error.message);
      else setShowLoginModal(false);
    } else {
      const { error } = await supabase.auth.signUp({ email: loginEmail, password: loginPassword });
      if (error) alert(error.message);
      else { alert('Cadastro realizado! Verifique seu e-mail.'); setShowLoginModal(false); }
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleEnderecoChange = (campo: string, valor: string) => {
    setEndereco({ ...endereco, [campo]: valor });
  };

  const handleFinalizarPedido = () => { setPixModal(true); };

  const containerStyle = { maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' };
  const cardStyle = { background: 'rgba(10, 20, 35, 0.6)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(255,255,255,0.08)' };
  const inputStyle = { width: '100%', padding: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' };
  const buttonStyle = { width: '100%', padding: '14px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '40px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' };
  const buttonOutlineStyle = { width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '40px', color: 'white', cursor: 'pointer', marginTop: '12px' };

  // Tela da Loja
  if (step === 'loja' && activeTab === 'loja') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/logo.png" alt="Banca UFO Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div><h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'white' }}>BANCA UFO</h1><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Revista Brasileira de Ufologia</p></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>🔍</button>
            {user ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: '14px' }}>Olá, {user.email?.split('@')[0]}</span>
                <button onClick={handleLogout} style={{ padding: '8px 20px', background: '#333', border: 'none', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>SAIR</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} style={{ padding: '8px 24px', background: '#e60000', border: 'none', borderRadius: '30px', color: 'white', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px #ff0000' }}>ENTRAR</button>
            )}
          </div>
        </div>

        {/* Conteúdo principal */}
        <div style={{ flex: 1 }}>
          {/* Capa centralizada */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 24px 20px' }}>
            <div style={{ width: '200px', animation: 'float 4s ease-in-out infinite' }}>
              <img src="/images/edicaoatual.jpg" alt="Capa" style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} />
            </div>
          </div>

          {/* Título e Destaques */}
          <div style={{ padding: '0 24px' }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', background: 'linear-gradient(135deg, #00d4ff, #0088ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textAlign: 'left' }}>UFO Magazine</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '20px', textAlign: 'left' }}>Edição #42 · Junho 2026</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '24px', textAlign: 'left' }}>
                A edição mais aguardada do ano traz uma cobertura exclusiva sobre os últimos avanços em tecnologia espacial.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', background: 'linear-gradient(135deg, #00d4ff, #0088ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '2px', textAlign: 'left' }}>✦ EDIÇÃO ATUAL ✦</h3>
                <p style={{ fontWeight: 'bold', marginBottom: '12px', color: 'white', textAlign: 'left' }}>DESTAQUES DESTA EDIÇÃO:</p>
                <ul style={{ color: 'rgba(255,255,255,0.6)', paddingLeft: '20px', lineHeight: '1.6', textAlign: 'left' }}>
                  <li>Entrevista exclusiva com ex-piloto da NASA</li>
                  <li>Os 10 avistamentos mais intrigantes de 2025</li>
                  <li>Tecnologia alienígena: fato ou ficção?</li>
                  <li>A nova corrida espacial privada</li>
                </ul>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', gap: '32px', marginBottom: '20px' }}>
                  <div><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Físico</p><p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>R$ 39,90</p></div>
                  <div><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Digital</p><p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>R$ 19,90</p></div>
                </div>
                <button onClick={() => setStep('formato')} style={{ width: '100%', padding: '14px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '40px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>COMPRAR EDIÇÃO</button>
              </div>
            </div>
          </div>

          {/* Edições Anteriores - Carrossel Horizontal */}
          <div style={{ padding: '40px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, background: 'linear-gradient(135deg, #00d4ff, #0088ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '1px' }}>✦ EDIÇÕES ANTERIORES ✦</h3>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>Mostrando 2 de 5 edições</span>
            </div>
            
            <div style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '24px',
              scrollBehavior: 'smooth',
              paddingBottom: '16px',
              cursor: 'grab'
            }}>
              <div style={{ flex: '0 0 280px', background: 'rgba(10, 20, 35, 0.5)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                  <img src="/images/edicao49.jpg" alt="Edição 49" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: 'white' }}>Edição 49 - 1988</h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>Edição histórica com poster exclusivo</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>R$ 39,90</span>
                  <button onClick={() => setStep('formato')} style={{ padding: '8px 20px', background: 'rgba(255,68,68,0.9)', color: 'white', border: 'none', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>COMPRAR</button>
                </div>
              </div>

              <div style={{ flex: '0 0 280px', background: 'rgba(10, 20, 35, 0.5)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                  <img src="/images/edicao27.jpg" alt="Edição 27" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: 'white' }}>Edição 27</h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>Os segredos ufológicos do Pentágono</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>R$ 39,90</span>
                  <button onClick={() => setStep('formato')} style={{ padding: '8px 20px', background: 'rgba(255,68,68,0.9)', color: 'white', border: 'none', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>COMPRAR</button>
                </div>
              </div>

              <div style={{ flex: '0 0 280px', background: 'rgba(10, 20, 35, 0.5)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '48px', opacity: 0.5 }}>🛸</span>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: 'white' }}>Edição 45</h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>Em breve</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>R$ 39,90</span>
                  <button style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', cursor: 'not-allowed' }}>EM BREVE</button>
                </div>
              </div>

              <div style={{ flex: '0 0 280px', background: 'rgba(10, 20, 35, 0.5)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '48px', opacity: 0.5 }}>🛸</span>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: 'white' }}>Edição 44</h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>Em breve</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>R$ 39,90</span>
                  <button style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', cursor: 'not-allowed' }}>EM BREVE</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Fixo */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px', textAlign: 'center', background: 'rgba(3, 12, 26, 0.95)', backdropFilter: 'blur(10px)', position: 'sticky', bottom: 0, width: '100%', zIndex: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '8px' }}>
            <span onClick={() => { setActiveTab('loja'); setStep('loja'); }} style={{ fontWeight: 'bold', color: 'white', cursor: 'pointer' }}>🛸 LOJA</span>
            <span onClick={() => setActiveTab('anunciante')} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>📢 ANUNCIANTE</span>
            <span onClick={() => setActiveTab('jornaleiro')} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>📰 JORNALEIRO</span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Banca UFO - Revista Brasileira de Ufologia</p>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          div::-webkit-scrollbar {
            height: 6px;
          }
          div::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
          }
          div::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.3);
            border-radius: 10px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.5);
          }
        `}</style>

        {/* Modal de Login */}
        {showLoginModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowLoginModal(false)}>
            <div style={{ background: '#1a1a2a', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '90%', border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'white', textAlign: 'center' }}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</h2>
              <form onSubmit={handleLogin}>
                <input type="email" placeholder="E-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white' }} required />
                <input type="password" placeholder="Senha" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white' }} required />
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#e60000', border: 'none', borderRadius: '30px', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' }}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</button>
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
  if (activeTab === 'anunciante') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <div><h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'white' }}>BANCA UFO</h1><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Revista Brasileira de Ufologia</p></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>🔍</button>
            {user ? <div style={{ display: 'flex', gap: '12px' }}><span style={{ color: 'white' }}>Olá, {user.email?.split('@')[0]}</span><button onClick={handleLogout} style={{ padding: '8px 20px', background: '#333', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>SAIR</button></div> : <button onClick={() => setShowLoginModal(true)} style={{ padding: '8px 24px', background: '#e60000', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>ENTRAR</button>}
          </div>
        </div>
        <div style={{ flex: 1, ...containerStyle }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', background: 'linear-gradient(135deg, #00d4ff, #0088ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Área do Anunciante</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>Publique sua marca na revista de maior credibilidade do segmento.</p>
            <div style={{ display: 'grid', gap: '24px', marginBottom: '32px' }}>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}><div style={{ fontSize: '32px' }}>📊</div><div style={{ fontWeight: 'bold', color: 'white' }}>50.000+ leitores mensais</div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Alcance nacional</div></div>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}><div style={{ fontSize: '32px' }}>📰</div><div style={{ fontWeight: 'bold', color: 'white' }}>Tiragem de 5.000 exemplares</div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Distribuição em todo Brasil</div></div>
            </div>
            <button style={buttonStyle}>SOLICITAR MEDIA KIT</button>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px', textAlign: 'center', background: 'rgba(3, 12, 26, 0.95)', backdropFilter: 'blur(10px)', position: 'sticky', bottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '8px' }}>
            <span onClick={() => { setActiveTab('loja'); setStep('loja'); }} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>🛸 LOJA</span>
            <span onClick={() => setActiveTab('anunciante')} style={{ fontWeight: 'bold', color: 'white', cursor: 'pointer' }}>📢 ANUNCIANTE</span>
            <span onClick={() => setActiveTab('jornaleiro')} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>📰 JORNALEIRO</span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Banca UFO - Revista Brasileira de Ufologia</p>
        </div>
      </div>
    );
  }

  // Tela JORNALEIRO
  if (activeTab === 'jornaleiro') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <div><h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'white' }}>BANCA UFO</h1><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Revista Brasileira de Ufologia</p></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>🔍</button>
            {user ? <div style={{ display: 'flex', gap: '12px' }}><span style={{ color: 'white' }}>Olá, {user.email?.split('@')[0]}</span><button onClick={handleLogout} style={{ padding: '8px 20px', background: '#333', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>SAIR</button></div> : <button onClick={() => setShowLoginModal(true)} style={{ padding: '8px 24px', background: '#e60000', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>ENTRAR</button>}
          </div>
        </div>
        <div style={{ flex: 1, ...containerStyle }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', background: 'linear-gradient(135deg, #00d4ff, #0088ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Área do Jornaleiro</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>Faça parte da maior rede de distribuição de revistas UFO.</p>
            <div style={{ display: 'grid', gap: '24px', marginBottom: '32px' }}>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}><div style={{ fontSize: '32px' }}>💰</div><div style={{ fontWeight: 'bold', color: 'white' }}>50% de comissão</div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Ganhe em cada exemplar vendido</div></div>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}><div style={{ fontSize: '32px' }}>📦</div><div style={{ fontWeight: 'bold', color: 'white' }}>Lotes consignados</div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Receba sem custo inicial</div></div>
            </div>
            <button style={buttonStyle}>QUERO SER PARCEIRO</button>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px', textAlign: 'center', background: 'rgba(3, 12, 26, 0.95)', backdropFilter: 'blur(10px)', position: 'sticky', bottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '8px' }}>
            <span onClick={() => { setActiveTab('loja'); setStep('loja'); }} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>🛸 LOJA</span>
            <span onClick={() => setActiveTab('anunciante')} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>📢 ANUNCIANTE</span>
            <span onClick={() => setActiveTab('jornaleiro')} style={{ fontWeight: 'bold', color: 'white', cursor: 'pointer' }}>📰 JORNALEIRO</span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Banca UFO - Revista Brasileira de Ufologia</p>
        </div>
      </div>
    );
  }

  // Tela de Formato
  if (step === 'formato') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh' }}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
              <img src="/images/edicaoatual.jpg" alt="Capa" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
              <div><h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, background: 'linear-gradient(135deg, #00d4ff, #0088ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>UFO Magazine</h2><p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>Edição #42 · Junho 2026</p></div>
            </div>
            <p style={{ fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>FORMATO</p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <button onClick={() => setFormato('fisico')} style={{ flex: 1, padding: '20px', border: formato === 'fisico' ? '2px solid #ff4444' : '1px solid rgba(255,255,255,0.15)', background: formato === 'fisico' ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '16px', cursor: 'pointer' }}>
                <div style={{ fontSize: '32px' }}>📖</div><div style={{ fontWeight: 'bold', color: formato === 'fisico' ? '#ff4444' : 'white' }}>Físico</div><div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>R$ 39,90</div>
              </button>
              <button onClick={() => setFormato('digital')} style={{ flex: 1, padding: '20px', border: formato === 'digital' ? '2px solid #ff4444' : '1px solid rgba(255,255,255,0.15)', background: formato === 'digital' ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '16px', cursor: 'pointer' }}>
                <div style={{ fontSize: '32px' }}>💻</div><div style={{ fontWeight: 'bold', color: formato === 'digital' ? '#ff4444' : 'white' }}>Digital</div><div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>R$ 19,90</div>
              </button>
            </div>
            <p style={{ fontWeight: 'bold', marginBottom: '12px', color: 'white' }}>DESTAQUES</p>
            <ul style={{ color: 'rgba(255,255,255,0.6)', paddingLeft: '20px', lineHeight: '1.6', marginBottom: '32px' }}>
              <li>Entrevista exclusiva com ex-piloto da NASA</li><li>Os 10 avistamentos mais intrigantes de 2025</li><li>Tecnologia alienígena: fato ou ficção?</li><li>A nova corrida espacial privada</li><li>Missão Artemis: bastidores revelados</li>
            </ul>
            <button onClick={() => setStep('endereco')} style={buttonStyle}>COMPRAR POR R$ {preco.toFixed(2)}</button>
            <button onClick={() => { setStep('loja'); setActiveTab('loja'); }} style={buttonOutlineStyle}>← Voltar</button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de Endereço
  if (step === 'endereco') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh' }}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', background: 'linear-gradient(135deg, #00d4ff, #0088ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Endereço de Entrega</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="CEP" value={endereco.cep} onChange={(e) => handleEnderecoChange('cep', e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Rua / Avenida" value={endereco.rua} onChange={(e) => handleEnderecoChange('rua', e.target.value)} style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" placeholder="Número" value={endereco.numero} onChange={(e) => handleEnderecoChange('numero', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Complemento" value={endereco.complemento} onChange={(e) => handleEnderecoChange('complemento', e.target.value)} style={inputStyle} />
              </div>
              <input type="text" placeholder="Bairro" value={endereco.bairro} onChange={(e) => handleEnderecoChange('bairro', e.target.value)} style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" placeholder="Cidade" value={endereco.cidade} onChange={(e) => handleEnderecoChange('cidade', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="UF" value={endereco.uf} onChange={(e) => handleEnderecoChange('uf', e.target.value)} style={inputStyle} />
              </div>
            </div>
            <button onClick={() => setStep('pagamento')} style={{ ...buttonStyle, marginTop: '32px' }}>CONTINUAR</button>
            <button onClick={() => setStep('formato')} style={buttonOutlineStyle}>← Voltar</button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de Pagamento
  if (step === 'pagamento') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh' }}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', background: 'linear-gradient(135deg, #00d4ff, #0088ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pagamento</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>UFO Magazine - {formato === 'fisico' ? 'Físico' : 'Digital'}</p>
            <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}><span style={{ fontSize: '24px' }}>💳</span><div><div style={{ fontWeight: 'bold', color: 'white' }}>Pix</div><div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>QR Code + Cópia e Cola</div></div></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}><span>Subtotal</span><span>R$ {preco.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}><span>Frete (PAC)</span><span>R$ 0,00</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px' }}><span style={{ fontWeight: 'bold' }}>Total</span><span style={{ fontWeight: 'bold' }}>R$ {preco.toFixed(2)}</span></div>
            </div>
            <button onClick={handleFinalizarPedido} style={buttonStyle}>CONFIRMAR PEDIDO · R$ {preco.toFixed(2)}</button>
            <button onClick={() => setStep('endereco')} style={buttonOutlineStyle}>← Voltar</button>
          </div>
        </div>
        {pixModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setPixModal(false)}>
            <div style={{ background: '#0a0f1a', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: '22px', marginBottom: '16px', background: 'linear-gradient(135deg, #00d4ff, #0088ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>💚 PAGAR COM PIX</h2>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}><img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=teste" alt="QR Code" style={{ width: '160px' }} /></div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Escaneie o QR Code com seu banco</p>
              <button style={{ width: '100%', padding: '12px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>📋 COPIAR CÓDIGO</button>
              <button onClick={() => setPixModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', marginTop: '16px', cursor: 'pointer' }}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default App;