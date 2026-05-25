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
  const [showPanel, setShowPanel] = useState<'mediakit' | 'mypanel'>('mediakit');
  const [showJornPanel, setShowJornPanel] = useState<'sobre' | 'mypanel'>('sobre');

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
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '24px', textAlign: 'left' }}>A edição mais aguardada do ano traz uma cobertura exclusiva sobre os últimos avanços em tecnologia espacial.</p>

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

          {/* Edições Anteriores */}
          <div style={{ padding: '40px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, background: 'linear-gradient(135deg, #00d4ff, #0088ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '1px' }}>✦ EDIÇÕES ANTERIORES ✦</h3>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>Mostrando 2 de 5 edições</span>
            </div>
            <div style={{ display: 'flex', overflowX: 'auto', gap: '24px', scrollBehavior: 'smooth', paddingBottom: '16px', cursor: 'grab' }}>
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
              <div style={{ flex: '0 0 280px', background: 'rgba(10, 20, 35, 0.5)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', minHeight: '320px' }}>
                <span style={{ fontSize: '48px', opacity: 0.5 }}>🛸</span>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '16px' }}>Em breve</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Abas */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px', textAlign: 'center', background: 'rgba(3, 12, 26, 0.95)', backdropFilter: 'blur(10px)', position: 'sticky', bottom: 0, width: '100%', zIndex: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '8px' }}>
            <span onClick={() => { setActiveTab('loja'); setStep('loja'); }} style={{ fontWeight: 'bold', color: '#ff4444', textShadow: '0 0 8px #ff4444', cursor: 'pointer' }}>🛸 LOJA</span>
            <span onClick={() => setActiveTab('anunciante')} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>📢 ANUNCIANTE</span>
            <span onClick={() => setActiveTab('jornaleiro')} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>📰 JORNALEIRO</span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Banca UFO - Revista Brasileira de Ufologia</p>
        </div>

        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
          div::-webkit-scrollbar { height: 6px; }
          div::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 10px; }
          div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
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
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
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
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px', textAlign: 'center', background: 'rgba(3, 12, 26, 0.95)', marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '8px' }}>
            <span onClick={() => { setActiveTab('loja'); setStep('loja'); }} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>🛸 LOJA</span>
            <span onClick={() => setActiveTab('anunciante')} style={{ fontWeight: 'bold', color: '#00d4ff', cursor: 'pointer' }}>📢 ANUNCIANTE</span>
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
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
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

                            {/* Cards de Benefícios - Centralizados e com tamanho igual */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '48px' }}>
                {/* Comissão de 50% */}
                <div style={{ background: 'rgba(0, 255, 136, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0, 255, 136, 0.3)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <text x="12" y="17" textAnchor="middle" fill="#00ff88" stroke="none" fontSize="14" fontWeight="bold">$</text>
                    </svg>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff88', marginBottom: '8px' }}>Comissão de 50%</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Ganhe em cada exemplar vendido</div>
                </div>

                {/* Lotes Consignados */}
                <div style={{ background: 'rgba(0, 255, 136, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0, 255, 136, 0.3)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
                      <path d="M8 7h8"/>
                      <circle cx="12" cy="13" r="2"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff88', marginBottom: '8px' }}>Lotes Consignados</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Receba sem custo inicial</div>
                </div>

                {/* Entrega Gratuita */}
                <div style={{ background: 'rgba(0, 255, 136, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0, 255, 136, 0.3)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="15" height="13" rx="2"/>
                      <path d="M16 9h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3"/>
                      <circle cx="6" cy="17" r="2"/>
                      <circle cx="16" cy="17" r="2"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff88', marginBottom: '8px' }}>Entrega Gratuita</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Enviamos para sua banca</div>
                </div>

                {/* Suporte Total */}
                <div style={{ background: 'rgba(0, 255, 136, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0, 255, 136, 0.3)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      <circle cx="12" cy="12" r="1.5" fill="#00ff88"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff88', marginBottom: '8px' }}>Suporte Total</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Equipe dedicada para parceiros</div>
                </div>
              </div>

              {/* Como Funciona - CENTRALIZADO */}
              <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: 'white', textAlign: 'center' }}>COMO FUNCIONA</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', justifyItems: 'center', alignItems: 'start' }}>
                  <div style={{ textAlign: 'center', maxWidth: '180px' }}>
                    <div style={{ width: '56px', height: '56px', background: '#00ff88', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#0a0a1a', fontWeight: 'bold', fontSize: '22px' }}>01</div>
                    <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Cadastro</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.4' }}>Preencha o formulário de pré-cadastro</div>
                  </div>
                  <div style={{ textAlign: 'center', maxWidth: '180px' }}>
                    <div style={{ width: '56px', height: '56px', background: '#00ff88', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#0a0a1a', fontWeight: 'bold', fontSize: '22px' }}>02</div>
                    <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Aprovação</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.4' }}>Nossa equipe analisa em até 48h</div>
                  </div>
                  <div style={{ textAlign: 'center', maxWidth: '180px' }}>
                    <div style={{ width: '56px', height: '56px', background: '#00ff88', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#0a0a1a', fontWeight: 'bold', fontSize: '22px' }}>03</div>
                    <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Receba o Lote</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.4' }}>Enviamos as revistas para sua banca</div>
                  </div>
                  <div style={{ textAlign: 'center', maxWidth: '180px' }}>
                    <div style={{ width: '56px', height: '56px', background: '#00ff88', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#0a0a1a', fontWeight: 'bold', fontSize: '22px' }}>04</div>
                    <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Venda e Lucro</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.4' }}>Reporte as vendas e receba sua comissão</div>
                  </div>
                </div>
              </div>

              <button style={{ width: '100%', padding: '14px', background: '#00ff88', color: '#0a0a1a', border: 'none', borderRadius: '40px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>QUERO SER JORNALEIRO UFO</button>
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
                  {/* Ícone de caixa com traços finos */}
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
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px', textAlign: 'center', background: 'rgba(3, 12, 26, 0.95)', marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '8px' }}>
            <span onClick={() => { setActiveTab('loja'); setStep('loja'); }} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>🛸 LOJA</span>
            <span onClick={() => setActiveTab('anunciante')} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>📢 ANUNCIANTE</span>
            <span onClick={() => setActiveTab('jornaleiro')} style={{ fontWeight: 'bold', color: '#00ff88', cursor: 'pointer' }}>📰 JORNALEIRO</span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Banca UFO - Revista Brasileira de Ufologia</p>
        </div>
                {/* Modal de Login */}
        {showLoginModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowLoginModal(false)}>
            <div style={{ background: '#1a1a2a', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '90%', border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'white', textAlign: 'center' }}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</h2>
              <form onSubmit={handleLogin}>
                <input type="email" placeholder="E-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white' }} required />
                <input type="password" placeholder="Senha" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white' }} required />
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