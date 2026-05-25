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
  const [showAdmin, setShowAdmin] = useState(false);
  const [showJornForm, setShowJornForm] = useState(false);
  const [jornNome, setJornNome] = useState('');
  const [jornCnpj, setJornCnpj] = useState('');
  const [jornEndereco, setJornEndereco] = useState('');
  const [jornEmail, setJornEmail] = useState('');
  const [jornTelefone, setJornTelefone] = useState('');

  const preco = formato === 'fisico' ? 39.90 : 19.90;

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    if (!error && data) return data.role;
    return 'user';
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setUser({ ...session.user, role });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setUser({ ...session.user, role });
      } else {
        setUser(null);
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
        if (data.user) {
          const role = await fetchUserRole(data.user.id);
          setUser({ ...data.user, role });
        }
        setShowLoginModal(false);
      }
    } else {
      const { error } = await supabase.auth.signUp({ email: loginEmail, password: loginPassword });
      if (error) {
        alert(error.message);
      } else {
        alert('Cadastro realizado! Verifique seu e-mail.');
        setShowLoginModal(false);
      }
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };
  const handleEnderecoChange = (campo: string, valor: string) => { setEndereco({ ...endereco, [campo]: valor }); };
  const handleFinalizarPedido = () => { setPixModal(true); };
  
  const handleJornSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('jornaleiros').insert([{
        nome_banca: jornNome, cnpj_cpf: jornCnpj, endereco: jornEndereco, email: jornEmail, telefone: jornTelefone, status: 'pendente'
      }]);
      if (error) throw error;
      alert('✅ Cadastro enviado com sucesso! Entraremos em contato em até 48h.');
      setJornNome(''); setJornCnpj(''); setJornEndereco(''); setJornEmail(''); setJornTelefone(''); setShowJornForm(false);
    } catch (error: any) { alert('❌ Erro ao enviar cadastro. Tente novamente.'); }
  };

  const containerStyle = { maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' };
  const cardStyle = { background: 'rgba(10, 20, 35, 0.6)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(255,255,255,0.08)' };
  const inputStyle = { width: '100%', padding: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' };
  const buttonStyle = { width: '100%', padding: '14px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '40px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' };
  const buttonOutlineStyle = { width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '40px', color: 'white', cursor: 'pointer', marginTop: '12px' };

  // Tela ADMIN
  if (showAdmin) {
    const [jornaleiros, setJornaleiros] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const carregar = async () => {
        const { data } = await supabase.from('jornaleiros').select('*').order('created_at', { ascending: false });
        if (data) setJornaleiros(data);
        setLoading(false);
      };
      carregar();
    }, []);
    const atualizarStatus = async (id: number, novoStatus: string) => {
      await supabase.from('jornaleiros').update({ status: novoStatus }).eq('id', id);
      const { data } = await supabase.from('jornaleiros').select('*').order('created_at', { ascending: false });
      if (data) setJornaleiros(data);
    };
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh' }}>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.5)' }}>
          <h1 style={{ color: 'white' }}>👑 ADMIN - Jornaleiros</h1>
          <button onClick={() => setShowAdmin(false)} style={{ padding: '8px 20px', background: '#e60000', border: 'none', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>VOLTAR</button>
        </div>
        <div style={{ padding: '20px', overflowX: 'auto' }}>
          {loading ? <p style={{ color: 'white' }}>Carregando...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead><tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '10px' }}>ID</th><th style={{ padding: '10px' }}>Banca</th><th style={{ padding: '10px' }}>Email</th><th style={{ padding: '10px' }}>Status</th><th style={{ padding: '10px' }}>Ações</th>
              </tr></thead>
              <tbody>
                {jornaleiros.map(j => (
                  <tr key={j.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '10px' }}>{j.id}</td>
                    <td style={{ padding: '10px' }}>{j.nome_banca}</td>
                    <td style={{ padding: '10px' }}>{j.email}</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '4px 8px', borderRadius: '20px', background: j.status === 'aprovado' ? '#00ff88' : j.status === 'reprovado' ? '#ff4444' : '#ffaa00', color: '#0a0a1a' }}>{j.status}</span></td>
                    <td style={{ padding: '10px' }}><button onClick={() => atualizarStatus(j.id, 'aprovado')} style={{ marginRight: '8px', padding: '4px 12px', background: '#00ff88', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Aprovar</button><button onClick={() => atualizarStatus(j.id, 'reprovado')} style={{ padding: '4px 12px', background: '#ff4444', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Reprovar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // Tela da Loja
  if (step === 'loja' && activeTab === 'loja') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <div><h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>BANCA UFO</h1><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Revista Brasileira de Ufologia</p></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>🔍</button>
            {user && (user as any).role === 'admin' && (<button onClick={() => setShowAdmin(true)} style={{ padding: '8px 20px', background: '#00d4ff', borderRadius: '30px', color: '#0a0a1a', cursor: 'pointer' }}>👑 ADMIN</button>)}
            {user ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'white' }}>Olá, {user.email?.split('@')[0]}</span>
                <button onClick={handleLogout} style={{ padding: '8px 20px', background: '#333', borderRadius: '30px', color: 'white', cursor: 'pointer' }}>SAIR</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} style={{ padding: '8px 24px', background: '#e60000', borderRadius: '30px', color: 'white', cursor: 'pointer', boxShadow: '0 0 10px #ff0000' }}>ENTRAR</button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, textAlign: 'center', padding: '40px' }}>
          <div style={{ width: '200px', margin: '0 auto 20px', animation: 'float 4s ease-in-out infinite' }}>
            <img src="/images/edicaoatual.jpg" alt="Capa" style={{ width: '100%', borderRadius: '12px' }} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', background: 'linear-gradient(135deg, #00d4ff, #0088ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UFO Magazine</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Edição #42 · Junho 2026</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '20px auto' }}>A edição mais aguardada do ano traz uma cobertura exclusiva sobre os últimos avanços em tecnologia espacial.</p>
          <button onClick={() => setStep('formato')} style={{ padding: '12px 32px', background: '#ff4444', border: 'none', borderRadius: '40px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>COMPRAR EDIÇÃO</button>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px', textAlign: 'center', background: 'rgba(3, 12, 26, 0.95)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '8px' }}>
            <span onClick={() => { setActiveTab('loja'); setStep('loja'); }} style={{ fontWeight: 'bold', color: '#ff4444', cursor: 'pointer' }}>🛸 LOJA</span>
            <span onClick={() => setActiveTab('anunciante')} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>📢 ANUNCIANTE</span>
            <span onClick={() => setActiveTab('jornaleiro')} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>📰 JORNALEIRO</span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Banca UFO</p>
        </div>

        <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }`}</style>

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

  // Tela ANUNCIANTE (simplificada)
  if (activeTab === 'anunciante') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1 style={{ color: 'white' }}>Área do Anunciante</h1>
          <button onClick={() => setActiveTab('loja')} style={{ marginTop: '20px', padding: '8px 20px', background: '#333', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Voltar para Loja</button>
        </div>
      </div>
    );
  }

  // Tela JORNALEIRO (simplificada)
  if (activeTab === 'jornaleiro') {
    return (
      <div style={{ background: 'radial-gradient(ellipse at bottom, #030c1a 0%, #010308 100%)', minHeight: '100vh' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1 style={{ color: 'white' }}>Área do Jornaleiro</h1>
          <button onClick={() => setActiveTab('loja')} style={{ marginTop: '20px', padding: '8px 20px', background: '#333', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Voltar para Loja</button>
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
            <h2 style={{ color: 'white' }}>Escolha o formato</h2>
            <button onClick={() => setFormato('fisico')} style={{ margin: '10px', padding: '10px', background: formato === 'fisico' ? '#ff4444' : '#333', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Físico - R$ 39,90</button>
            <button onClick={() => setFormato('digital')} style={{ margin: '10px', padding: '10px', background: formato === 'digital' ? '#ff4444' : '#333', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Digital - R$ 19,90</button>
            <button onClick={() => setStep('endereco')} style={{ marginTop: '20px', padding: '10px 20px', background: '#00ff88', border: 'none', borderRadius: '10px', color: 'black', cursor: 'pointer' }}>Continuar</button>
            <button onClick={() => setStep('loja')} style={{ marginTop: '10px', padding: '10px 20px', background: '#333', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Voltar</button>
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
            <h2 style={{ color: 'white' }}>Endereço de Entrega</h2>
            <input type="text" placeholder="CEP" value={endereco.cep} onChange={(e) => handleEnderecoChange('cep', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Rua" value={endereco.rua} onChange={(e) => handleEnderecoChange('rua', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Número" value={endereco.numero} onChange={(e) => handleEnderecoChange('numero', e.target.value)} style={inputStyle} />
            <button onClick={() => setStep('pagamento')} style={{ marginTop: '20px', padding: '10px 20px', background: '#00ff88', border: 'none', borderRadius: '10px', color: 'black', cursor: 'pointer' }}>Continuar</button>
            <button onClick={() => setStep('formato')} style={{ marginTop: '10px', padding: '10px 20px', background: '#333', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Voltar</button>
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
            <h2 style={{ color: 'white' }}>Pagamento</h2>
            <p style={{ color: 'white' }}>Total: R$ {preco.toFixed(2)}</p>
            <button onClick={handleFinalizarPedido} style={{ marginTop: '20px', padding: '10px 20px', background: '#ff4444', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Pagar com Pix</button>
            <button onClick={() => setStep('endereco')} style={{ marginTop: '10px', padding: '10px 20px', background: '#333', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Voltar</button>
          </div>
        </div>
        {pixModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setPixModal(false)}>
            <div style={{ background: 'white', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
              <h2>PIX - QR Code</h2>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=teste" alt="QR Code" style={{ margin: '10px auto' }} />
              <button onClick={() => setPixModal(false)} style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default App;