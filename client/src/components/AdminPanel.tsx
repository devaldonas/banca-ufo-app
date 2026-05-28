import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  user: any;
  onClose: () => void;
}

interface Jornaleiro {
  id: number;
  nome_banca: string;
  cnpj_cpf: string;
  endereco: string;
  email: string;
  telefone: string;
  status: string;
  created_at: string;
}

interface Pedido {
  id: number;
  cliente: string;
  valor: number;
  metodo: string;
  status: string;
  rastreio?: string;
  pago_em?: string;
  created_at: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expedicao' | 'anuncios' | 'jornaleiro'>('dashboard');
  const [jornaleiros, setJornaleiros] = useState<Jornaleiro[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para os pedidos
  const [pedidosAguardandoPagamento, setPedidosAguardandoPagamento] = useState<Pedido[]>([]);
  const [pedidosPagos, setPedidosPagos] = useState<Pedido[]>([]);
  const [pedidosAguardandoPostagem, setPedidosAguardandoPostagem] = useState<Pedido[]>([]);
  const [pedidosPostados, setPedidosPostados] = useState<Pedido[]>([]);
  
  const [stats, setStats] = useState({
    receitaPix: 0,
    receitaBdm: 0,
    paraExpedir: 0,
    totalAnuncios: 0,
    totalJornaleiros: 0,
    totalPedidos: 0
  });

  // Funcoes de acao
  const marcarComoPago = async (pedidoId: number) => {
    alert(`Pedido #${pedidoId} marcado como PAGO`);
    carregarDados();
  };

  const marcarComoPostado = async (pedidoId: number) => {
    alert(`Pedido #${pedidoId} marcado como POSTADO`);
    carregarDados();
  };

  const gerarEtiqueta = async (pedidoId: number) => {
    alert(`Gerando etiqueta para pedido #${pedidoId}`);
  };

  const gerarEtiquetasEmLote = async () => {
    alert('Gerando etiquetas dos Correios para todos os pedidos pagos');
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    
    // Carregar jornaleiros
    const { data: jornaleirosData, error: jornaleirosError } = await supabase
      .from('jornaleiros')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (jornaleirosError) {
      console.error('Erro ao carregar jornaleiros:', jornaleirosError);
    }
    
    if (jornaleirosData) {
      setJornaleiros(jornaleirosData);
      setStats(prev => ({
        ...prev,
        totalJornaleiros: jornaleirosData.length
      }));
    }
    
    // Carregar pedidos (mock - substituir pela sua tabela real depois)
    const pedidosMock: Pedido[] = [
      { id: 1, cliente: 'Ed toretta', valor: 60.80, metodo: 'PIX', status: 'Aguardando Pagamento', created_at: new Date().toISOString() },
      { id: 2, cliente: 'Joao Silva', valor: 39.90, metodo: 'PIX', status: 'Pago', pago_em: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: 3, cliente: 'Maria Santos', valor: 19.90, metodo: 'BDM', status: 'Aguardando Postagem', created_at: new Date().toISOString() },
      { id: 4, cliente: 'Carlos Lima', valor: 39.90, metodo: 'PIX', status: 'Postado', rastreio: 'CD123456789BR', created_at: new Date().toISOString() }
    ];
    
    setPedidosAguardandoPagamento(pedidosMock.filter(p => p.status === 'Aguardando Pagamento'));
    setPedidosPagos(pedidosMock.filter(p => p.status === 'Pago'));
    setPedidosAguardandoPostagem(pedidosMock.filter(p => p.status === 'Aguardando Postagem'));
    setPedidosPostados(pedidosMock.filter(p => p.status === 'Postado'));
    
    setStats(prev => ({
      ...prev,
      totalPedidos: pedidosMock.length,
      paraExpedir: pedidosMock.filter(p => p.status === 'Pago' || p.status === 'Aguardando Postagem').length
    }));
    
    setLoading(false);
  };

  const atualizarStatusJornaleiro = async (id: number, novoStatus: string) => {
    const { error } = await supabase
      .from('jornaleiros')
      .update({ status: novoStatus })
      .eq('id', id);
    
    if (!error) {
      carregarDados();
      alert(`Jornaleiro ${novoStatus} com sucesso!`);
    } else {
      alert('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'aprovado': return '#00ff00';
      case 'reprovado': return '#ff4444';
      default: return '#ffaa00';
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'expedicao', label: 'EXPEDICAO' },
    { id: 'anuncios', label: 'ANUNCIOS' },
    { id: 'jornaleiro', label: 'JORNALEIRO' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#030c1a',
      zIndex: 2000,
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#0a0a2a',
        padding: '20px 24px',
        borderBottom: '2px solid #00d4ff',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ color: '#00d4ff', margin: 0, fontSize: '24px' }}>Painel Administrativo</h1>
            <p style={{ color: '#888', margin: '4px 0 0', fontSize: '12px' }}>Banca UFO - Controle Interno</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ color: '#ccc', fontSize: '14px' }}>{user?.email}</span>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#ff4444',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              FECHAR PAINEL
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        borderBottom: '1px solid #333',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'thin'
      }}>
        <div style={{ display: 'inline-flex', gap: '8px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 28px',
                backgroundColor: activeTab === tab.id ? '#00d4ff' : 'transparent',
                border: activeTab === tab.id ? 'none' : '1px solid #00d4ff',
                borderRadius: '8px 8px 0 0',
                color: activeTab === tab.id ? '#030c1a' : '#00d4ff',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteudo */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,212,255,0.2)' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>RECEITA PIX</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00ff88' }}>R$ {stats.receitaPix.toFixed(2)}</div>
              </div>
              
              <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,212,255,0.2)' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>RECEITA BDM</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00ff88' }}>R$ {stats.receitaBdm.toFixed(2)}</div>
              </div>
              
              <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,212,255,0.2)' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>PARA EXPEDIR</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00d4ff' }}>{stats.paraExpedir}</div>
              </div>
              
              <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,212,255,0.2)' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>ANUNCIOS</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00d4ff' }}>{stats.totalAnuncios}</div>
              </div>
              
              <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,212,255,0.2)' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>JORNALEIROS</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00d4ff' }}>{stats.totalJornaleiros}</div>
              </div>
              
              <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,212,255,0.2)' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>TOTAL PEDIDOS</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00d4ff' }}>{stats.totalPedidos}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,212,255,0.2)' }}>
              <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '18px' }}>ULTIMOS PEDIDOS</h3>
              {pedidosAguardandoPagamento.length === 0 && pedidosPagos.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Nenhum pedido encontrado</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                        <th style={{ padding: '12px', color: '#888' }}>PEDIDO</th>
                        <th style={{ padding: '12px', color: '#888' }}>CLIENTE</th>
                        <th style={{ padding: '12px', color: '#888' }}>PAGAMENTO</th>
                        <th style={{ padding: '12px', color: '#888' }}>STATUS</th>
                       </tr>
                    </thead>
                    <tbody>
                      {[...pedidosAguardandoPagamento, ...pedidosPagos].slice(0, 5).map(pedido => (
                        <tr key={pedido.id} style={{ borderBottom: '1px solid #222' }}>
                          <td style={{ padding: '12px', color: 'white' }}>#{pedido.id}</td>
                          <td style={{ padding: '12px', color: 'white' }}>{pedido.cliente}</td>
                          <td style={{ padding: '12px', color: '#00ff88' }}>{pedido.metodo} R$ {pedido.valor.toFixed(2)}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              backgroundColor: pedido.status === 'Aguardando Pagamento' ? '#ffaa0020' : '#00ff0020',
                              color: pedido.status === 'Aguardando Pagamento' ? '#ffaa00' : '#00ff00',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px'
                            }}>
                              {pedido.status}
                            </span>
                          </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXPEDICAO */}
        {activeTab === 'expedicao' && (
          <div>
            {/* AGUARDANDO PAGAMENTO */}
            <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(255,68,68,0.3)' }}>
              <h3 style={{ color: '#ff6666', marginBottom: '20px', fontSize: '18px' }}>AGUARDANDO PAGAMENTO ({pedidosAguardandoPagamento.length})</h3>
              {pedidosAguardandoPagamento.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Nenhum pedido aguardando pagamento</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pedidosAguardandoPagamento.map(pedido => (
                    <div key={pedido.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,68,68,0.1)', borderRadius: '12px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>#{pedido.id} - {pedido.cliente}</div>
                        <div style={{ color: '#ff8888', fontSize: '13px' }}>{pedido.metodo} · R$ {pedido.valor.toFixed(2)}</div>
                      </div>
                      <button onClick={() => marcarComoPago(pedido.id)} style={{ backgroundColor: '#00ff88', border: 'none', padding: '8px 20px', borderRadius: '8px', color: '#030c1a', fontWeight: 'bold', cursor: 'pointer' }}>
                        MARCAR PAGO
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PEDIDOS PAGOS - CENTRAL DE EXPEDICAO */}
            <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(0,212,255,0.3)' }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '20px', fontSize: '18px' }}>PEDIDOS PAGOS - CENTRAL DE EXPEDICAO ({pedidosPagos.length})</h3>
              {pedidosPagos.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Nenhum pedido pago aguardando postagem</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pedidosPagos.map(pedido => (
                    <div key={pedido.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,212,255,0.1)', borderRadius: '12px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>#{pedido.id} - {pedido.cliente}</div>
                        <div style={{ color: '#88ccff', fontSize: '13px' }}>{pedido.metodo} · R$ {pedido.valor.toFixed(2)}</div>
                      </div>
                      <button onClick={() => gerarEtiqueta(pedido.id)} style={{ backgroundColor: '#00d4ff', border: 'none', padding: '8px 20px', borderRadius: '8px', color: '#030c1a', fontWeight: 'bold', cursor: 'pointer' }}>
                        GERAR ETIQUETA
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AGUARDANDO POSTAGEM */}
            <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(255,170,0,0.3)' }}>
              <h3 style={{ color: '#ffaa00', marginBottom: '20px', fontSize: '18px' }}>AGUARDANDO POSTAGEM ({pedidosAguardandoPostagem.length})</h3>
              {pedidosAguardandoPostagem.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Nenhum pedido aguardando postagem</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pedidosAguardandoPostagem.map(pedido => (
                    <div key={pedido.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,170,0,0.1)', borderRadius: '12px', flexWrap: 'wrap', gap: '12px' }}>
                      <button onClick={gerarEtiquetasEmLote} style={{ backgroundColor: '#00d4ff', border: 'none', padding: '8px 20px', borderRadius: '8px', color: '#030c1a', fontWeight: 'bold', cursor: 'pointer' }}>
                  GERAR ETIQUETAS DOS CORREIOS
                </button>
                
                      <div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>#{pedido.id} - {pedido.cliente}</div>
                        <div style={{ color: '#ffaa88', fontSize: '13px' }}>{pedido.metodo} · R$ {pedido.valor.toFixed(2)}</div>
                      </div>
                      <button onClick={() => marcarComoPostado(pedido.id)} style={{ backgroundColor: '#ffaa00', border: 'none', padding: '8px 20px', borderRadius: '8px', color: '#030c1a', fontWeight: 'bold', cursor: 'pointer' }}>
                        MARCAR POSTADO
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PEDIDOS POSTADOS */}
            <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,255,136,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ color: '#00ff88', margin: 0, fontSize: '18px' }}>PEDIDOS POSTADOS ({pedidosPostados.length})</h3>
                
              </div>
              {pedidosPostados.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Nenhum pedido postado</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pedidosPostados.map(pedido => (
                    <div key={pedido.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,255,136,0.05)', borderRadius: '12px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>#{pedido.id} - {pedido.cliente}</div>
                        <div style={{ color: '#88ff88', fontSize: '13px' }}>{pedido.metodo} · R$ {pedido.valor.toFixed(2)}</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Codigo de rastreio: {pedido.rastreio || '---'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANUNCIOS */}
        {activeTab === 'anuncios' && (
          <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid rgba(0,212,255,0.2)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📢</div>
            <h3 style={{ color: 'white', marginBottom: '12px' }}>Gestao de Anuncios</h3>
            <p style={{ color: '#888', marginBottom: '24px' }}>Anuncios aguardando aprovacao: 0</p>
            <button style={{ backgroundColor: '#00d4ff', border: 'none', padding: '12px 30px', borderRadius: '8px', color: '#030c1a', fontWeight: 'bold', cursor: 'pointer' }}>
              VER ARQUIVOS PENDENTES
            </button>
          </div>
        )}

        {/* JORNALEIRO */}
        {activeTab === 'jornaleiro' && (
          <div style={{ background: 'rgba(10, 20, 35, 0.6)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,212,255,0.2)' }}>
            <h3 style={{ color: 'white', marginBottom: '20px' }}>Cadastros de Jornaleiros</h3>
            {loading ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Carregando...</p>
            ) : jornaleiros.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Nenhum jornaleiro cadastrado</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                      <th style={{ padding: '12px', color: '#888' }}>BANCA</th>
                      <th style={{ padding: '12px', color: '#888' }}>CNPJ/CPF</th>
                      <th style={{ padding: '12px', color: '#888' }}>CONTATO</th>
                      <th style={{ padding: '12px', color: '#888' }}>STATUS</th>
                      <th style={{ padding: '12px', color: '#888' }}>ACOES</th>
                     </tr>
                  </thead>
                  <tbody>
                    {jornaleiros.map(j => (
                      <tr key={j.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '12px', color: 'white' }}>{j.nome_banca}</td>
                        <td style={{ padding: '12px', color: 'white' }}>{j.cnpj_cpf}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ color: 'white' }}>{j.email}</div>
                          <div style={{ color: '#888', fontSize: '12px' }}>{j.telefone}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            backgroundColor: `${getStatusColor(j.status)}20`,
                            color: getStatusColor(j.status),
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px'
                          }}>
                            {j.status?.toUpperCase() || 'PENDENTE'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {j.status !== 'aprovado' && (
                            <button onClick={() => atualizarStatusJornaleiro(j.id, 'aprovado')} style={{ backgroundColor: '#00ff00', color: '#030c1a', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginRight: '8px' }}>
                              APROVAR
                            </button>
                          )}
                          {j.status !== 'reprovado' && (
                            <button onClick={() => atualizarStatusJornaleiro(j.id, 'reprovado')} style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                              REPROVAR
                            </button>
                          )}
                        </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;