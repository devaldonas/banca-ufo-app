import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface AdminPanelProps {
  user: any
  onClose: () => void
}

interface Jornaleiro {
  id: number
  nome_banca: string
  cnpj_cpf: string
  endereco: string
  email: string
  telefone: string
  status: 'pendente' | 'aprovado' | 'reprovado'
  created_at: string
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onClose }) => {
  const [jornaleiros, setJornaleiros] = useState<Jornaleiro[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'jornaleiros' | 'vendas' | 'anuncios'>('jornaleiros')

  useEffect(() => {
    carregarJornaleiros()
  }, [])

  const carregarJornaleiros = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('jornaleiros')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setJornaleiros(data)
    }
    setLoading(false)
  }

  const atualizarStatus = async (id: number, novoStatus: string) => {
    const { error } = await supabase
      .from('jornaleiros')
      .update({ status: novoStatus })
      .eq('id', id)

    if (!error) {
      carregarJornaleiros()
    } else {
      alert('Erro ao atualizar status')
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'aprovado': return '#00ff00'
      case 'reprovado': return '#ff4444'
      default: return '#ffaa00'
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#030c1a',
        zIndex: 1000,
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div style={{
        backgroundColor: '#0a0a2a',
        padding: '20px',
        borderBottom: '1px solid #00d4ff',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#00d4ff', margin: 0 }}>👑 Painel Administrativo</h1>
          <div>
            <span style={{ color: '#ccc', marginRight: '16px' }}>👤 {user.email}</span>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#ff4444',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Fechar Painel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('jornaleiros')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'jornaleiros' ? '#00d4ff' : 'transparent',
              border: activeTab === 'jornaleiros' ? 'none' : '1px solid #00d4ff',
              borderRadius: '8px',
              color: activeTab === 'jornaleiros' ? '#030c1a' : '#00d4ff',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            📰 Jornaleiros ({jornaleiros.length})
          </button>
          <button
            onClick={() => setActiveTab('vendas')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'vendas' ? '#00d4ff' : 'transparent',
              border: activeTab === 'vendas' ? 'none' : '1px solid #00d4ff',
              borderRadius: '8px',
              color: activeTab === 'vendas' ? '#030c1a' : '#00d4ff',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🛒 Vendas
          </button>
          <button
            onClick={() => setActiveTab('anuncios')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'anuncios' ? '#00d4ff' : 'transparent',
              border: activeTab === 'anuncios' ? 'none' : '1px solid #00d4ff',
              borderRadius: '8px',
              color: activeTab === 'anuncios' ? '#030c1a' : '#00d4ff',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            📢 Anúncios
          </button>
        </div>

        {/* Conteúdo - Jornaleiros */}
        {activeTab === 'jornaleiros' && (
          <div>
            <h3 style={{ color: 'white' }}>📋 Cadastros de Jornaleiros</h3>
            {loading ? (
              <p style={{ color: '#ccc' }}>Carregando...</p>
            ) : jornaleiros.length === 0 ? (
              <p style={{ color: '#ccc' }}>Nenhum jornaleiro cadastrado ainda.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #00d4ff', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Banca</th>
                      <th style={{ padding: '12px' }}>CNPJ/CPF</th>
                      <th style={{ padding: '12px' }}>Endereço</th>
                      <th style={{ padding: '12px' }}>Contato</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jornaleiros.map((j) => (
                      <tr key={j.id} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '12px' }}>{j.nome_banca}</td>
                        <td style={{ padding: '12px' }}>{j.cnpj_cpf}</td>
                        <td style={{ padding: '12px' }}>{j.endereco?.substring(0, 40)}...</td>
                        <td style={{ padding: '12px' }}>
                          {j.email}<br/>
                          <small>{j.telefone}</small>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            backgroundColor: `${getStatusColor(j.status)}20`,
                            color: getStatusColor(j.status),
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}>
                            {j.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {j.status === 'pendente' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => atualizarStatus(j.id, 'aprovado')}
                                style={{
                                  backgroundColor: '#00ff00',
                                  color: '#030c1a',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                }}
                              >
                                ✅ Aprovar
                              </button>
                              <button
                                onClick={() => atualizarStatus(j.id, 'reprovado')}
                                style={{
                                  backgroundColor: '#ff4444',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                              >
                                ❌ Reprovar
                              </button>
                            </div>
                          )}
                          {(j.status === 'aprovado' || j.status === 'reprovado') && (
                            <button
                              onClick={() => atualizarStatus(j.id, 'pendente')}
                              style={{
                                backgroundColor: '#ffaa00',
                                color: '#030c1a',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              🔄 Resetar
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

        {/* Conteúdo - Vendas */}
        {activeTab === 'vendas' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#ccc' }}>📊 Dashboard de vendas em desenvolvimento</p>
            <p style={{ color: '#666', fontSize: '14px' }}>Total de pedidos: 0 | Faturamento: R$ 0,00</p>
            <div style={{ marginTop: '20px' }}>
              <button style={{
                backgroundColor: '#00d4ff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}>
                🏷️ Gerar Etiquetas dos Correios
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo - Anúncios */}
        {activeTab === 'anuncios' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#ccc' }}>📢 Gestão de anúncios em desenvolvimento</p>
            <p style={{ color: '#666', fontSize: '14px' }}>Aguardando upload de materiais dos anunciantes</p>
            <div style={{ marginTop: '20px' }}>
              <button style={{
                backgroundColor: '#00d4ff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}>
                📁 Ver arquivos pendentes (0)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel