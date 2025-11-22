
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, Users, CheckSquare, Settings, LogOut, 
  Menu, X, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Clock,
  Search, ExternalLink, ArrowLeft, Upload, Download, FileText,
  Hexagon, Plus, MessageCircle, Send, Bot, Trash2, ChevronDown, Edit, Save, Paperclip,
  Calendar, ShieldAlert, Check, Palette, Monitor, Moon, Sun
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// ====================================================
// 1. MOCK DATA & TYPES
// ====================================================

interface Cliente {
  id: number;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  regime_tributario: string;
  ativo: boolean;
  responsavel: string;
  certificado_vencimento?: string; // Novo campo
}

interface Obrigacao {
  id: number;
  cliente_id: number;
  nome: string;
  competencia: string;
  vencimento: string;
  status: 'pendente' | 'entregue' | 'atrasada';
}

interface Documento {
  id: number;
  cliente_id: number;
  tipo: string;
  descricao: string;
  data_upload: string;
}

interface Anotacao {
  id: number;
  cliente_id: number;
  texto: string;
  data: string;
  autor: string;
}

const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 1,
    razao_social: "Tech Solutions Ltda",
    nome_fantasia: "TechSol",
    cnpj: "12.345.678/0001-90",
    email: "contato@techsol.com",
    telefone: "(11) 99999-9999",
    regime_tributario: "Simples Nacional",
    ativo: true,
    responsavel: "João Contador",
    certificado_vencimento: "2024-12-31"
  },
  {
    id: 2,
    razao_social: "Padaria do Seu Zé MEI",
    nome_fantasia: "Pão Quentinho",
    cnpj: "98.765.432/0001-10",
    email: "jose@padaria.com",
    telefone: "(11) 88888-8888",
    regime_tributario: "MEI",
    ativo: true,
    responsavel: "Maria Contadora",
    certificado_vencimento: "2023-11-15" // Vencido para teste
  },
  {
    id: 3,
    razao_social: "Consultoria Empresarial S.A.",
    nome_fantasia: "Grupo Consult",
    cnpj: "11.222.333/0001-55",
    email: "financas@grupoconsult.com",
    telefone: "(21) 77777-7777",
    regime_tributario: "Lucro Presumido",
    ativo: false,
    responsavel: "João Contador",
    certificado_vencimento: "2025-05-20"
  },
  {
    id: 4,
    razao_social: "Mercadinho da Esquina Ltda",
    nome_fantasia: "Mercadinho Esquina",
    cnpj: "22.333.444/0001-22",
    email: "contato@mercadinho.com",
    telefone: "(31) 3333-3333",
    regime_tributario: "Simples Nacional",
    ativo: true,
    responsavel: "Pedro Contador",
    certificado_vencimento: "2024-06-10"
  },
  {
    id: 5,
    razao_social: "Advocacia Silva & Associados",
    nome_fantasia: "Silva Advogados",
    cnpj: "33.444.555/0001-33",
    email: "juridico@silva.com",
    telefone: "(41) 4444-4444",
    regime_tributario: "Lucro Presumido",
    ativo: true,
    responsavel: "Maria Contadora"
  },
  {
    id: 6,
    razao_social: "Mecânica Veloz Ltda",
    nome_fantasia: "Mecânica Veloz",
    cnpj: "44.555.666/0001-44",
    email: "oficina@veloz.com",
    telefone: "(51) 5555-5555",
    regime_tributario: "Simples Nacional",
    ativo: true,
    responsavel: "João Contador"
  }
];

const INITIAL_OBRIGACOES: Obrigacao[] = [
  { id: 1, cliente_id: 1, nome: "DAS - Simples", competencia: "10/2023", vencimento: "2023-11-20", status: "entregue" },
  { id: 2, cliente_id: 1, nome: "Folha de Pagamento", competencia: "10/2023", vencimento: "2023-11-05", status: "entregue" },
  { id: 3, cliente_id: 1, nome: "DAS - Simples", competencia: "11/2023", vencimento: "2023-12-20", status: "pendente" },
  { id: 4, cliente_id: 2, nome: "DAS - MEI", competencia: "11/2023", vencimento: "2023-12-20", status: "atrasada" },
  { id: 5, cliente_id: 3, nome: "DCTFWeb", competencia: "11/2023", vencimento: "2023-12-15", status: "pendente" },
  { id: 6, cliente_id: 4, nome: "DAS - Simples", competencia: "11/2023", vencimento: "2023-12-20", status: "pendente" },
  { id: 7, cliente_id: 6, nome: "DAS - Simples", competencia: "11/2023", vencimento: "2023-12-20", status: "pendente" },
];

const INITIAL_DOCUMENTOS: Documento[] = [
  { id: 1, cliente_id: 1, tipo: "Contrato Social", descricao: "Contrato de constituição", data_upload: "2023-01-10" },
  { id: 2, cliente_id: 1, tipo: "Alvará", descricao: "Alvará de funcionamento 2023", data_upload: "2023-01-15" },
  { id: 4, cliente_id: 1, tipo: "Alvará", descricao: "Alvará de funcionamento 2022", data_upload: "2022-01-15" },
  { id: 3, cliente_id: 2, tipo: "CCMEI", descricao: "Certificado MEI", data_upload: "2023-02-20" },
];

const INITIAL_ANOTACOES: Anotacao[] = [
  { id: 1, cliente_id: 1, texto: "Cliente solicitou recálculo do DAS de 09/2023.", data: "2023-10-15T14:30:00", autor: "João Contador" }
];

// ====================================================
// 2. COMPONENTS
// ====================================================

const Login = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            <Hexagon size={32} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Contabil<span style={{color: 'var(--primary)'}}>App</span></span>
          </div>
          <p className="text-muted">Acesse o painel do contador</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" className="form-input" placeholder="seu@email.com" defaultValue="admin@contabil.com" />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input type="password" className="form-input" placeholder="******" defaultValue="123456" />
          </div>
          <button type="submit" className="btn btn-primary w-full justify-center">Entrar</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
           <a className="text-muted text-sm">Esqueceu a senha?</a>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ 
  currentView, 
  setView, 
  collapsed, 
  mobileOpen, 
  setMobileOpen, 
  onLogout
}: any) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'obrigacoes', label: 'Obrigações', icon: CheckSquare },
  ];

  const sidebarClasses = `sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`;

  const isActive = (id: string) => {
    if (currentView === id) return true;
    if (id === 'clientes' && (currentView === 'client-detail' || currentView === 'new-client' || currentView === 'edit-client')) return true;
    return false;
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`mobile-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      
      <aside className={sidebarClasses}>
        <div className="sidebar-header">
          {!collapsed || mobileOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.2rem' }}>
              <Hexagon size={24} color="var(--primary)" />
              <span>Contabil<span style={{color: 'var(--primary)'}}>App</span></span>
            </div>
          ) : (
             <Hexagon size={24} color="var(--primary)" />
          )}
          <button onClick={() => setMobileOpen(false)} className="btn-icon hidden-desktop"><X size={20} /></button>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          {menuItems.map(item => (
            <a 
              key={item.id}
              onClick={() => { setView(item.id); setMobileOpen(false); }}
              className={`sidebar-item ${isActive(item.id) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span className="sidebar-label">{item.label}</span>
            </a>
          ))}
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem 1.5rem' }}></div>
          <a 
            onClick={() => { setView('settings'); setMobileOpen(false); }}
            className={`sidebar-item ${isActive('settings') ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span className="sidebar-label">Configurações</span>
          </a>
          <a onClick={onLogout} className="sidebar-item">
            <LogOut size={20} />
            <span className="sidebar-label">Sair</span>
          </a>
        </nav>
      </aside>
    </>
  );
};

const SettingsView = ({ currentTheme, setTheme }: { currentTheme: string, setTheme: (t: string) => void }) => {
  return (
    <div className="card">
       <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
         <Palette size={20}/> Aparência do Sistema
       </h2>
       <p className="text-muted mb-6">Escolha o tema que melhor se adapta ao seu ambiente de trabalho.</p>
       
       <div className="grid-cards">
          {/* Theme Option: Dark (Default) */}
          <button 
            onClick={() => setTheme('dark')}
            style={{
              border: `2px solid ${currentTheme === 'dark' ? 'var(--primary)' : 'var(--border-color)'}`,
              backgroundColor: '#0f172a',
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              textAlign: 'left',
              color: '#f8fafc',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
             <div className="flex justify-between mb-2">
                <Moon size={24} />
                {currentTheme === 'dark' && <CheckCircle className="text-success" size={20}/>}
             </div>
             <div className="font-bold text-lg">Original (Escuro)</div>
             <div className="text-sm text-muted opacity-70">Tema padrão com alto contraste para ambientes com pouca luz.</div>
          </button>

          {/* Theme Option: Light */}
          <button 
            onClick={() => setTheme('light')}
            style={{
              border: `2px solid ${currentTheme === 'light' ? 'var(--primary)' : 'var(--border-color)'}`,
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              textAlign: 'left',
              color: '#0f172a',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
             <div className="flex justify-between mb-2">
                <Sun size={24} color="#fbbf24"/>
                {currentTheme === 'light' && <CheckCircle className="text-success" size={20}/>}
             </div>
             <div className="font-bold text-lg">Branco (Claro)</div>
             <div className="text-sm" style={{color: '#64748b'}}>Interface limpa e clássica, ideal para ambientes iluminados.</div>
          </button>

           {/* Theme Option: Gray */}
           <button 
            onClick={() => setTheme('gray')}
            style={{
              border: `2px solid ${currentTheme === 'gray' ? 'var(--primary)' : 'var(--border-color)'}`,
              backgroundColor: '#27272a',
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              textAlign: 'left',
              color: '#f4f4f5',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
             <div className="flex justify-between mb-2">
                <Monitor size={24} />
                {currentTheme === 'gray' && <CheckCircle className="text-success" size={20}/>}
             </div>
             <div className="font-bold text-lg">Cinza (Suave)</div>
             <div className="text-sm" style={{color: '#a1a1aa'}}>Um tom intermediário, confortável para longas jornadas.</div>
          </button>
       </div>
    </div>
  );
};

const Dashboard = ({ clientes, obrigacoes, setView, setDetailId }: any) => {
  const pendentes = obrigacoes.filter((o:any) => o.status === 'pendente').length;
  const atrasadas = obrigacoes.filter((o:any) => o.status === 'atrasada').length;
  
  // Check certificate expirations (30 days)
  const today = new Date();
  const expiringCertificates = clientes.filter((c: Cliente) => {
    if (!c.certificado_vencimento) return false;
    const venc = new Date(c.certificado_vencimento);
    const diffTime = venc.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  const proximas = [...obrigacoes]
    .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
    .slice(0, 5);

  const getClienteName = (id: number) => clientes.find((c:any) => c.id === id)?.nome_fantasia || 'Desconhecido';

  return (
    <div>
      <div className="grid-cards mb-4">
        <div className="card">
          <div className="flex justify-between mb-2">
             <h3>Total Clientes</h3>
             <Users className="text-muted" />
          </div>
          <div className="text-xl font-bold">{clientes.length}</div>
          <p className="text-muted text-sm mt-2">Empresas ativas</p>
        </div>
        <div className="card">
          <div className="flex justify-between mb-2">
             <h3>Pendências</h3>
             <Clock className="text-warning" />
          </div>
          <div className="text-xl font-bold">{pendentes}</div>
          <p className="text-muted text-sm mt-2">Aguardando envio</p>
        </div>
        <div className="card">
          <div className="flex justify-between mb-2">
             <h3>Certif. Vencendo</h3>
             <ShieldAlert className={expiringCertificates > 0 ? "text-danger" : "text-success"} />
          </div>
          <div className={`text-xl font-bold ${expiringCertificates > 0 ? "text-danger" : ""}`}>{expiringCertificates}</div>
          <p className="text-muted text-sm mt-2">Vencem em 30 dias</p>
        </div>
        <div className="card">
          <div className="flex justify-between mb-2">
             <h3>Em Atraso</h3>
             <AlertCircle className="text-danger" />
          </div>
          <div className="text-xl font-bold text-danger">{atrasadas}</div>
          <p className="text-muted text-sm mt-2">Atenção necessária</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-3">Próximas Obrigações</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Obrigação</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {proximas.map((ob: any) => (
                <tr key={ob.id}>
                  <td><strong>{getClienteName(ob.cliente_id)}</strong></td>
                  <td>{ob.nome} <span className="text-muted text-sm">({ob.competencia})</span></td>
                  <td>{new Date(ob.vencimento).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`badge badge-${ob.status === 'atrasada' ? 'danger' : ob.status === 'entregue' ? 'success' : 'warning'}`}>
                      {ob.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => { setDetailId(ob.cliente_id); setView('client-detail'); }}
                    >Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ClientForm = ({ onSave, onCancel, initialData }: any) => {
  const [formData, setFormData] = useState(initialData || {
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    regime_tributario: 'Simples Nacional',
    certificado_vencimento: ''
  });

  const isEditing = !!initialData;

  // Masks
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length > 10) { // Mobile with 9
        return v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
    }
    return v.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').slice(0, 14);
  };

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <div className="mb-4">
        <button onClick={onCancel} className="btn btn-outline gap-2"><ArrowLeft size={16}/> Voltar</button>
      </div>
      <div className="card">
        <h2 className="text-lg font-bold mb-4">{isEditing ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="grid-2-cols mb-4">
            <div className="form-group">
              <label>Nome Fantasia</label>
              <input className="form-input" required value={formData.nome_fantasia} onChange={e => setFormData({...formData, nome_fantasia: e.target.value})} placeholder="Ex: TechSol"/>
            </div>
            <div className="form-group">
              <label>Razão Social</label>
              <input className="form-input" required value={formData.razao_social} onChange={e => setFormData({...formData, razao_social: e.target.value})} placeholder="Ex: Tech Solutions Ltda"/>
            </div>
            <div className="form-group">
              <label>CNPJ</label>
              <input 
                className="form-input" 
                required 
                value={formData.cnpj} 
                onChange={e => setFormData({...formData, cnpj: formatCNPJ(e.target.value)})} 
                placeholder="00.000.000/0000-00" 
                maxLength={18}
              />
            </div>
            <div className="form-group">
              <label>Regime Tributário</label>
              <select className="form-select" value={formData.regime_tributario} onChange={e => setFormData({...formData, regime_tributario: e.target.value})}>
                <option>Simples Nacional</option>
                <option>Lucro Presumido</option>
                <option>Lucro Real</option>
                <option>MEI</option>
              </select>
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input className="form-input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contato@empresa.com"/>
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input 
                className="form-input" 
                value={formData.telefone} 
                onChange={e => setFormData({...formData, telefone: formatPhone(e.target.value)})} 
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
            <div className="form-group">
              <label>Vencimento Certificado Digital</label>
              <div style={{position: 'relative'}}>
                 <input 
                   type="date" 
                   className="form-input" 
                   value={formData.certificado_vencimento || ''} 
                   onChange={e => setFormData({...formData, certificado_vencimento: e.target.value})} 
                 />
                 <ShieldAlert size={16} style={{position: 'absolute', right: '10px', top: '12px', color: 'var(--text-muted)'}} />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6 pt-4" style={{borderTop: '1px solid var(--border-color)'}}>
             <button type="button" onClick={onCancel} className="btn btn-outline">Cancelar</button>
             <button type="submit" className="btn btn-primary">{isEditing ? 'Salvar Alterações' : 'Criar Cadastro'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Clients = ({ clientes, setDetailId, setView, setPortalId }: any) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  const filtered = clientes.filter((c:any) => 
    c.nome_fantasia.toLowerCase().includes(search.toLowerCase()) ||
    c.razao_social.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4" style={{flexWrap: 'wrap', gap: '1rem'}}>
        <div className="flex gap-2" style={{flex: 1, minWidth: '200px'}}>
           <input 
             type="text" 
             className="form-input" 
             placeholder="Buscar cliente..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" title="Exportar CSV" onClick={() => alert('Exportando lista de clientes (CSV)...')}>
            <Download size={18} />
            <span className="hidden-mobile">CSV</span>
          </button>
          <button className="btn btn-outline" title="Exportar PDF" onClick={() => alert('Exportando lista de clientes (PDF)...')}>
            <FileText size={18} />
            <span className="hidden-mobile">PDF</span>
          </button>
          <button className="btn btn-primary" onClick={() => setView('new-client')}>
            <Plus size={18} />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Empresa</th>
              <th>CNPJ</th>
              <th>Regime</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClients.map((c:any) => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>
                  <div className="flex-col">
                    <strong>{c.nome_fantasia}</strong>
                    <span className="text-muted text-sm">{c.razao_social}</span>
                  </div>
                </td>
                <td>{c.cnpj}</td>
                <td>{c.regime_tributario}</td>
                <td>
                   {c.ativo ? <span className="badge badge-success">Ativo</span> : <span className="badge badge-danger">Inativo</span>}
                </td>
                <td className="flex gap-2">
                   <button className="btn btn-sm btn-primary" onClick={() => { setDetailId(c.id); setView('client-detail'); }}>Detalhes</button>
                   <button className="btn btn-icon" title="Ver Portal do Cliente" onClick={() => { setPortalId(c.id); setView('portal'); }}>
                     <ExternalLink size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-2" style={{borderTop: '1px solid var(--border-color)'}}>
           <span className="text-sm text-muted">
              Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
           </span>
           <div className="flex gap-2 items-center">
              <button 
                className="btn btn-sm btn-outline" 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{opacity: currentPage === 1 ? 0.5 : 1}}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium">
                Página {currentPage} de {totalPages}
              </span>
              <button 
                className="btn btn-sm btn-outline" 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{opacity: currentPage === totalPages ? 0.5 : 1}}
              >
                <ChevronRight size={16} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

const ClientDetail = ({ id, onBack, db, onEdit, onAddNote, onAddDocument, onDeleteClient }: any) => {
  const cliente = db.clientes.find((c:any) => c.id === id);
  const obs = db.obrigacoes.filter((o:any) => o.cliente_id === id);
  const docs = db.documentos.filter((d:any) => d.cliente_id === id);
  const notas = db.anotacoes ? db.anotacoes.filter((n:any) => n.cliente_id === id) : [];

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [newNote, setNewNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!cliente) return <div>Cliente não encontrado</div>;

  const groupedDocs = docs.reduce((acc: any, doc: any) => {
    if (!acc[doc.tipo]) acc[doc.tipo] = [];
    acc[doc.tipo].push(doc);
    return acc;
  }, {});
  const docTypes = Object.keys(groupedDocs);

  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({...prev, [type]: !prev[type]}));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Simulate upload
        onAddDocument(id, file.name);
    }
  };

  const getCertStatus = () => {
      if (!cliente.certificado_vencimento) return { text: 'Não informado', color: 'text-muted' };
      const today = new Date();
      const venc = new Date(cliente.certificado_vencimento);
      const diffDays = Math.ceil((venc.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { text: `Venceu em ${venc.toLocaleDateString('pt-BR')}`, color: 'text-danger font-bold' };
      if (diffDays < 30) return { text: `Vence em ${diffDays} dias (${venc.toLocaleDateString('pt-BR')})`, color: 'text-warning font-bold' };
      return { text: venc.toLocaleDateString('pt-BR'), color: 'text-success' };
  };
  
  const certStatus = getCertStatus();

  return (
    <>
      <div className="mb-4">
        <button onClick={onBack} className="btn btn-outline gap-2"><ArrowLeft size={16}/> Voltar</button>
      </div>

      <div className="grid-2-1">
        <div>
          <div className="card mb-4">
            <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-bold">Dados Cadastrais</h2>
                <button className="btn btn-sm btn-outline gap-2" onClick={() => onEdit(cliente)}>
                    <Edit size={14}/> Editar
                </button>
            </div>
            <div className="grid-2-cols">
               <div><label className="text-muted text-sm">Razão Social</label><p>{cliente.razao_social}</p></div>
               <div><label className="text-muted text-sm">Nome Fantasia</label><p>{cliente.nome_fantasia}</p></div>
               <div><label className="text-muted text-sm">CNPJ</label><p>{cliente.cnpj}</p></div>
               <div><label className="text-muted text-sm">Regime</label><p>{cliente.regime_tributario}</p></div>
               <div><label className="text-muted text-sm">Email</label><p>{cliente.email}</p></div>
               <div><label className="text-muted text-sm">Responsável</label><p>{cliente.responsavel}</p></div>
               <div>
                   <label className="text-muted text-sm flex items-center gap-1">Certificado Digital <ShieldAlert size={12}/></label>
                   <p className={certStatus.color}>{certStatus.text}</p>
               </div>
            </div>
          </div>

          {/* ANOTAÇÕES / TIMELINE */}
          <div className="card mb-4">
             <h2 className="text-lg font-bold mb-3">Anotações Internas</h2>
             <div className="flex gap-2 mb-4">
                <input 
                    className="form-input" 
                    placeholder="Adicionar nota (ex: Cliente ligou pedindo 2ª via...)"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newNote.trim()) {
                                onAddNote(id, newNote);
                                setNewNote('');
                            }
                        }
                    }}
                />
                <button 
                    className="btn btn-primary" 
                    onClick={() => {
                        if (newNote.trim()) {
                            onAddNote(id, newNote);
                            setNewNote('');
                        }
                    }}
                >
                    <Send size={16}/>
                </button>
             </div>
             <div className="flex-col gap-3" style={{maxHeight: '250px', overflowY: 'auto'}}>
                {notas.length === 0 && <div className="text-muted text-sm text-center">Nenhuma anotação registrada.</div>}
                {notas.map((nota: any) => (
                    <div key={nota.id} style={{padding: '0.75rem', backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--primary)'}}>
                        <div className="text-sm">{nota.texto}</div>
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-muted font-bold">{nota.autor}</span>
                            <span className="text-xs text-muted">{new Date(nota.data).toLocaleString('pt-BR')}</span>
                        </div>
                    </div>
                )).reverse()}
             </div>
          </div>

          <div className="card">
             <div className="flex justify-between mb-3">
               <h2 className="text-lg font-bold">Histórico de Obrigações</h2>
               <button className="btn btn-sm btn-outline">+ Nova</button>
             </div>
             <div className="table-container">
                <table className="table">
                <thead><tr><th>Obrigação</th><th>Vencimento</th><th>Status</th></tr></thead>
                <tbody>
                    {obs.map((o:any) => (
                    <tr key={o.id}>
                        <td>{o.nome} - {o.competencia}</td>
                        <td>{new Date(o.vencimento).toLocaleDateString('pt-BR')}</td>
                        <td><span className={`badge badge-${o.status === 'atrasada' ? 'danger' : o.status === 'entregue' ? 'success' : 'warning'}`}>{o.status}</span></td>
                    </tr>
                    ))}
                </tbody>
                </table>
             </div>
          </div>
        </div>

        <div>
          <div className="card mb-4">
            <div className="flex justify-between mb-3 items-center">
               <h3 className="font-bold">Documentos</h3>
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{display: 'none'}} 
                  onChange={handleFileUpload}
               />
               <button 
                  className="btn btn-sm btn-primary gap-2" 
                  onClick={() => fileInputRef.current?.click()}
               >
                   <Upload size={14}/> Upload
               </button>
            </div>
            
            {docs.length === 0 ? (
                <div className="text-muted text-sm">Nenhum documento.</div>
            ) : (
                <div className="flex-col" style={{gap: '1rem'}}>
                    {docTypes.map(type => (
                        <div key={type} className="mb-2" style={{border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', overflow: 'hidden'}}>
                             <div
                                onClick={() => toggleSection(type)}
                                className="flex items-center justify-between p-3 cursor-pointer"
                                style={{backgroundColor: 'var(--bg-hover)'}}
                            >
                                 <div className="flex items-center gap-2">
                                     {expandedSections[type] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                                     <span className="text-sm font-bold text-primary">{type}</span>
                                 </div>
                                 <span className="text-xs text-muted px-2 py-0.5 rounded-full" style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>{groupedDocs[type].length}</span>
                            </div>
                            {expandedSections[type] && (
                                <div className="p-3" style={{backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)'}}>
                                    <ul className="flex-col gap-2">
                                        {groupedDocs[type].map((d: any) => (
                                            <li key={d.id} className="flex items-center gap-3 p-3 doc-item" style={{backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', transition: 'background-color 0.2s'}}>
                                                <div style={{minWidth: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    <FileText size={16} className="text-primary"/>
                                                </div>
                                                <div style={{flex:1}}>
                                                    <div className="font-semibold text-sm">{d.descricao}</div>
                                                    <div className="text-muted text-xs">{new Date(d.data_upload).toLocaleDateString('pt-BR')}</div>
                                                </div>
                                                <button 
                                                    className="btn-icon hover:text-primary" 
                                                    title="Baixar documento" 
                                                    onClick={() => alert(`Iniciando download: ${d.descricao}...`)}
                                                >
                                                    <Download size={20}/>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
          </div>
          
          <div className="card">
            <h3 className="font-bold mb-3">Ações</h3>
            <div className="flex-col gap-2">
               <button className="btn btn-outline w-full justify-center">Enviar Mensagem</button>
               <button className="btn btn-danger-outline w-full justify-center" onClick={() => onDeleteClient(id)}>
                   <Trash2 size={16} style={{marginRight: '6px'}}/> Excluir Cliente
               </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Obligations = ({ obrigacoes, clientes, setView, setDetailId, onUpdateStatus }: any) => {
  const [statusFilter, setStatusFilter] = useState('Todos os Status');
  const [monthFilter, setMonthFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const getClienteName = (id: number) => clientes.find((c:any) => c.id === id)?.nome_fantasia || 'Desconhecido';

  const filteredObrigacoes = obrigacoes.filter((ob: any) => {
    const matchesStatus = statusFilter === 'Todos os Status' || ob.status === statusFilter.toLowerCase();
    
    let matchesMonth = true;
    if (monthFilter) {
      const [year, month] = monthFilter.split('-');
      // ob.competencia is "MM/YYYY"
      const [obMonth, obYear] = ob.competencia.split('/');
      matchesMonth = year === obYear && month === obMonth;
    }

    return matchesStatus && matchesMonth;
  });

  const toggleSelectAll = () => {
      if (selectedIds.size === filteredObrigacoes.length && filteredObrigacoes.length > 0) {
          setSelectedIds(new Set());
      } else {
          const allIds = new Set<number>(filteredObrigacoes.map((o:any) => o.id));
          setSelectedIds(allIds);
      }
  };

  const toggleSelect = (id: number) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedIds(newSet);
  };

  const handleBulkUpdate = (newStatus: string) => {
      onUpdateStatus(Array.from(selectedIds), newStatus);
      setSelectedIds(new Set());
  };

  return (
    <div className="card" style={{position: 'relative'}}>
      <div className="filter-bar">
         <select 
            className="form-select filter-input" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
         >
            <option>Todos os Status</option>
            <option>Pendente</option>
            <option>Entregue</option>
            <option>Atrasada</option>
         </select>
         <input 
            type="month" 
            className="form-input filter-input" 
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
         />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
          <div style={{
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              left: '10px', 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
              <span className="font-bold text-sm">{selectedIds.size} item(s) selecionado(s)</span>
              <div className="flex gap-2">
                  <button 
                    className="btn btn-sm" 
                    style={{backgroundColor: 'white', color: 'var(--primary)'}}
                    onClick={() => handleBulkUpdate('entregue')}
                  >
                      <Check size={14}/> Marcar como Entregue
                  </button>
                  <button 
                    className="btn-icon" 
                    style={{color: 'white'}}
                    onClick={() => setSelectedIds(new Set())}
                  >
                      <X size={18}/>
                  </button>
              </div>
          </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
               <th style={{width: '40px'}}>
                   <input 
                        type="checkbox" 
                        checked={filteredObrigacoes.length > 0 && selectedIds.size === filteredObrigacoes.length}
                        onChange={toggleSelectAll}
                   />
               </th>
               <th>Cliente</th>
               <th>Obrigação</th>
               <th>Competência</th>
               <th>Vencimento</th>
               <th>Status</th>
               <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredObrigacoes.map((ob:any) => (
              <tr key={ob.id} style={selectedIds.has(ob.id) ? {backgroundColor: 'rgba(59, 130, 246, 0.1)'} : {}}>
                 <td>
                     <input 
                        type="checkbox" 
                        checked={selectedIds.has(ob.id)}
                        onChange={() => toggleSelect(ob.id)}
                     />
                 </td>
                 <td><a onClick={() => { setDetailId(ob.cliente_id); setView('client-detail'); }} className="text-primary hover:underline">{getClienteName(ob.cliente_id)}</a></td>
                 <td>{ob.nome}</td>
                 <td>{ob.competencia}</td>
                 <td>{new Date(ob.vencimento).toLocaleDateString('pt-BR')}</td>
                 <td><span className={`badge badge-${ob.status === 'atrasada' ? 'danger' : ob.status === 'entregue' ? 'success' : 'warning'}`}>{ob.status}</span></td>
                 <td><button className="btn btn-sm btn-outline" onClick={() => onUpdateStatus([ob.id], 'entregue')}><CheckCircle size={14}/></button></td>
              </tr>
            ))}
            {filteredObrigacoes.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted">Nenhuma obrigação encontrada com os filtros selecionados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Portal = ({ id, db, onExit }: any) => {
  const cliente = db.clientes.find((c:any) => c.id === id);
  const obs = db.obrigacoes.filter((o:any) => o.cliente_id === id);
  const docs = db.documentos.filter((d:any) => d.cliente_id === id);

  if(!cliente) return <div>Erro</div>;

  const groupedDocs = docs.reduce((acc: any, doc: any) => {
    if (!acc[doc.tipo]) acc[doc.tipo] = [];
    acc[doc.tipo].push(doc);
    return acc;
  }, {});
  const docTypes = Object.keys(groupedDocs);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-body)', overflow: 'hidden' }}>
       <header className="portal-header">
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold">Área do Cliente</h1>
             <span className="badge badge-primary">{cliente.nome_fantasia}</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-muted hidden-mobile">{cliente.email}</span>
             <button onClick={onExit} className="btn btn-sm btn-outline">Sair do Portal</button>
          </div>
       </header>

       <div className="portal-body">
          <div className="grid-2-1">
             <div className="card">
                <h2 className="text-lg font-bold mb-3">Minhas Guias e Impostos</h2>
                <div className="table-container">
                    <table className="table">
                    <thead><tr><th>Descrição</th><th>Vencimento</th><th>Status</th><th>Ação</th></tr></thead>
                    <tbody>
                        {obs.map((o:any) => (
                        <tr key={o.id}>
                            <td>{o.nome} <small className="text-muted">{o.competencia}</small></td>
                            <td>{new Date(o.vencimento).toLocaleDateString('pt-BR')}</td>
                            <td><span className={`badge badge-${o.status === 'atrasada' ? 'danger' : o.status === 'entregue' ? 'success' : 'warning'}`}>{o.status}</span></td>
                            <td>{o.status === 'entregue' ? <button className="btn btn-sm btn-outline gap-2"><Download size={14}/> Baixar</button> : <span className="text-muted text-sm">Aguarde</span>}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
             </div>

             <div className="card" style={{height: 'fit-content'}}>
                <h2 className="text-lg font-bold mb-3">Documentos da Empresa</h2>
                {docs.length === 0 ? (
                    <div className="text-muted text-sm">Nenhum documento disponível.</div>
                ) : (
                    <div className="flex-col" style={{gap: '1.5rem'}}>
                        {docTypes.map(type => (
                            <div key={type}>
                                <div className="flex items-center justify-between mb-2 pb-1" style={{borderBottom: '1px solid var(--border-color)'}}>
                                    <h4 className="text-sm font-bold text-primary">{type}</h4>
                                    <span className="text-xs text-muted px-2 py-0.5 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>{groupedDocs[type].length}</span>
                                </div>
                                <ul className="flex-col gap-2 mt-2">
                                    {groupedDocs[type].map((d: any) => (
                                        <li key={d.id} className="flex items-center gap-3 p-3 doc-item" style={{backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', transition: 'background-color 0.2s'}}>
                                            <div style={{minWidth: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <FileText size={16} className="text-primary"/>
                                            </div>
                                            <div style={{flex:1}}>
                                                <div className="font-semibold text-sm">{d.descricao}</div>
                                                <div className="text-muted text-xs">{new Date(d.data_upload).toLocaleDateString('pt-BR')}</div>
                                            </div>
                                            <button 
                                                className="btn-icon hover:text-primary" 
                                                title="Baixar"
                                                onClick={() => alert(`Baixando ${d.descricao}...`)}
                                            >
                                                <Download size={18}/>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string, groundingChunks?: any[]}[]>([]);
  const [loading, setLoading] = useState(false);
  const chatSession = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatSession.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { 
          systemInstruction: "You are an AI assistant for ContabilApp, a SaaS for accountants. Help users with accounting questions, tax information, and navigating the app.",
          tools: [{googleSearch: {}}]
        }
      });
    } catch (e) {
      console.error("Failed to initialize AI", e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const result = await chatSession.current.sendMessage({ message: userMsg });
      const responseText = result.text;
      const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
      const groundingChunks = groundingMetadata?.groundingChunks;

      setMessages(prev => [...prev, { role: 'model', text: responseText, groundingChunks }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, tive um problema ao processar sua solicitação." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
      setMessages([]);
  }

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={() => setOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="flex items-center gap-2 font-semibold">
              <Bot size={20} className="text-primary" />
              <span>Assistente IA</span>
            </div>
            <div className="flex gap-1">
                <button onClick={clearChat} className="btn-icon" title="Limpar conversa">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setOpen(false)} className="btn-icon">
                  <X size={18} />
                </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="text-center text-muted text-sm mt-4">
                Olá! Como posso ajudar você hoje?
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div>{msg.text}</div>
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="text-xs font-bold mb-1 opacity-75">Fontes:</div>
                    {msg.groundingChunks.map((chunk: any, i: number) => {
                        if (chunk.web) {
                            return (
                                <a key={i} href={chunk.web.uri} target="_blank" className="block text-xs hover:underline truncate opacity-90 mb-0.5" title={chunk.web.title} style={{color: 'inherit'}}>
                                    {chunk.web.title || chunk.web.uri}
                                </a>
                            );
                        }
                        return null;
                    })}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-message model" style={{borderBottomLeftRadius: 0}}>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted font-semibold flex items-center gap-1">
                        <Bot size={12}/> Analisando...
                    </span>
                    <div className="flex gap-1.5 px-1">
                      <span className="animate-bounce" style={{width: 6, height: 6, backgroundColor: 'var(--text-main)', borderRadius: '50%'}}></span>
                      <span className="animate-bounce" style={{width: 6, height: 6, backgroundColor: 'var(--text-main)', borderRadius: '50%', animationDelay: '0.15s'}}></span>
                      <span className="animate-bounce" style={{width: 6, height: 6, backgroundColor: 'var(--text-main)', borderRadius: '50%', animationDelay: '0.3s'}}></span>
                    </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input 
              className="form-input" 
              style={{borderRadius: '20px'}}
              placeholder="Digite sua pergunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button 
              className="btn btn-primary" 
              style={{borderRadius: '50%', padding: '0.6rem', width: '40px', height: '40px', display: 'flex', justifyContent: 'center'}}
              onClick={handleSend}
              disabled={loading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ====================================================
// 3. MAIN APP
// ====================================================

const App = () => {
  const [session, setSession] = useState<{user: string} | null>(null);
  const [view, setView] = useState('dashboard');
  const [detailId, setDetailId] = useState<number | null>(null);
  const [portalId, setPortalId] = useState<number | null>(null);
  
  // Layout State
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Apply theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Database State with LocalStorage Persistence
  const [db, setDb] = useState(() => {
      const saved = localStorage.getItem('contabil-app-db');
      return saved ? JSON.parse(saved) : {
        clientes: INITIAL_CLIENTES,
        obrigacoes: INITIAL_OBRIGACOES,
        documentos: INITIAL_DOCUMENTOS,
        anotacoes: INITIAL_ANOTACOES
      };
  });

  // Save to LocalStorage on change
  useEffect(() => {
      localStorage.setItem('contabil-app-db', JSON.stringify(db));
  }, [db]);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: any) => {
          if (searchRef.current && !searchRef.current.contains(event.target)) {
              setSearchResults(null);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      
      if (term.length < 2) {
          setSearchResults(null);
          return;
      }
      
      const lower = term.toLowerCase();
      const clients = db.clientes.filter((c:any) => c.nome_fantasia.toLowerCase().includes(lower) || c.razao_social.toLowerCase().includes(lower));
      const obligations = db.obrigacoes.filter((o:any) => o.nome.toLowerCase().includes(lower));
      const documents = db.documentos.filter((d:any) => d.descricao.toLowerCase().includes(lower) || d.tipo.toLowerCase().includes(lower));
      
      if (clients.length || obligations.length || documents.length) {
          setSearchResults({ clients, obligations, documents });
      } else {
          setSearchResults(null);
      }
  };

  const goToResult = (clientId: number) => {
      setDetailId(clientId);
      setView('client-detail');
      setSearchTerm('');
      setSearchResults(null);
  };

  const handleSaveClient = (clientData: any) => {
    if (clientData.id) {
        // Edit existing
        setDb((prev: any) => ({
            ...prev,
            clientes: prev.clientes.map((c:any) => c.id === clientData.id ? {...c, ...clientData} : c)
        }));
        setView('client-detail'); // Redirect back to detail view after edit
    } else {
        // Create new
        const newId = db.clientes.length > 0 ? Math.max(...db.clientes.map((c:any) => c.id)) + 1 : 1;
        const newClient = {
           id: newId,
           ...clientData,
           ativo: true,
           responsavel: 'Contador'
        };
        setDb((prev: any) => ({
          ...prev,
          clientes: [...prev.clientes, newClient]
        }));
        setView('clientes');
    }
  };

  const handleDeleteClient = (id: number) => {
      if (confirm('Tem certeza que deseja excluir este cliente? Todas as informações serão perdidas.')) {
          setDb((prev: any) => ({
              ...prev,
              clientes: prev.clientes.filter((c:any) => c.id !== id),
              obrigacoes: prev.obrigacoes.filter((o:any) => o.cliente_id !== id),
              documentos: prev.documentos.filter((d:any) => d.cliente_id !== id),
              anotacoes: prev.anotacoes?.filter((n:any) => n.cliente_id !== id)
          }));
          setView('clientes');
          setDetailId(null);
      }
  };

  const handleAddNote = (clienteId: number, texto: string) => {
      const newNote = {
          id: Date.now(),
          cliente_id: clienteId,
          texto: texto,
          data: new Date().toISOString(),
          autor: 'Contador'
      };
      setDb((prev: any) => ({
          ...prev,
          anotacoes: [...(prev.anotacoes || []), newNote]
      }));
  };

  const handleAddDocument = (clienteId: number, filename: string) => {
      const newDoc = {
          id: Date.now(),
          cliente_id: clienteId,
          tipo: "Outros",
          descricao: filename,
          data_upload: new Date().toISOString()
      };
      setDb((prev: any) => ({
          ...prev,
          documentos: [...prev.documentos, newDoc]
      }));
      alert("Documento enviado com sucesso!");
  };

  const handleUpdateObligationStatus = (ids: number[], status: string) => {
      setDb((prev: any) => ({
          ...prev,
          obrigacoes: prev.obrigacoes.map((o:any) => ids.includes(o.id) ? {...o, status} : o)
      }));
  };

  if (!session) {
    if (view === 'portal' && portalId) {
      return <Portal id={portalId} db={db} onExit={() => { setView('login'); setPortalId(null); }} />;
    }
    return <Login onLogin={() => setSession({ user: 'Contador' })} />;
  }

  if (view === 'portal' && portalId) {
     return <Portal id={portalId} db={db} onExit={() => { setView('clientes'); setPortalId(null); }} />;
  }

  const mainClasses = `main-content ${collapsed ? 'expanded' : ''}`;

  return (
    <div className="app-container">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={() => setSession(null)}
      />

      <main className={mainClasses}>
        {/* Topbar */}
        <header className="topbar">
          <div className="flex items-center gap-4">
             <button className="btn-icon" onClick={() => window.innerWidth <= 768 ? setMobileOpen(true) : setCollapsed(!collapsed)}>
               <Menu />
             </button>
             <h2 className="font-bold text-lg hidden-mobile-xs">
               {view === 'dashboard' ? 'Visão Geral' : 
                view === 'clientes' ? 'Carteira de Clientes' :
                view === 'new-client' ? 'Novo Cliente' :
                view === 'edit-client' ? 'Editar Cliente' :
                view === 'obrigacoes' ? 'Controle de Obrigações' :
                view === 'client-detail' ? 'Detalhes do Cliente' : 
                view === 'settings' ? 'Configurações' : 'Painel'}
             </h2>
          </div>

          {/* Global Search */}
          <div className="topbar-search" ref={searchRef}>
              <div style={{position: 'relative'}}>
                  <Search size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} />
                  <input 
                    className="form-input" 
                    placeholder="Buscar..." 
                    style={{paddingLeft: '2.5rem', borderRadius: '20px', backgroundColor: 'var(--bg-body)'}}
                    value={searchTerm}
                    onChange={handleSearch}
                    onFocus={(e) => e.target.value.length >= 2 && handleSearch(e)}
                  />
              </div>
              {searchResults && (
                  <div className="search-dropdown">
                      {searchResults.clients.length > 0 && (
                          <>
                            <div className="search-group-title">Clientes</div>
                            {searchResults.clients.map((c:any) => (
                                <div key={c.id} className="search-result-item" onClick={() => goToResult(c.id)}>
                                    <div className="font-bold text-sm">{c.nome_fantasia}</div>
                                    <div className="text-xs text-muted">{c.razao_social}</div>
                                </div>
                            ))}
                          </>
                      )}
                      {searchResults.obligations.length > 0 && (
                          <>
                            <div className="search-group-title">Obrigações</div>
                            {searchResults.obligations.map((o:any) => (
                                <div key={o.id} className="search-result-item" onClick={() => goToResult(o.cliente_id)}>
                                    <div className="font-bold text-sm">{o.nome}</div>
                                    <div className="text-xs text-muted">{db.clientes.find((c:any)=>c.id===o.cliente_id)?.nome_fantasia} • {o.competencia}</div>
                                </div>
                            ))}
                          </>
                      )}
                       {searchResults.documents.length > 0 && (
                          <>
                            <div className="search-group-title">Documentos</div>
                            {searchResults.documents.map((d:any) => (
                                <div key={d.id} className="search-result-item" onClick={() => goToResult(d.cliente_id)}>
                                    <div className="font-bold text-sm">{d.descricao}</div>
                                    <div className="text-xs text-muted">{db.clientes.find((c:any)=>c.id===d.cliente_id)?.nome_fantasia} • {d.tipo}</div>
                                </div>
                            ))}
                          </>
                      )}
                  </div>
              )}
          </div>

          <div className="flex items-center gap-3">
             <div className="text-right hidden-mobile">
                <div className="font-semibold text-sm">Olá, Contador</div>
                <div className="text-muted text-xs">Admin</div>
             </div>
             <div style={{width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight: 'bold'}}>C</div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          {view === 'dashboard' && <Dashboard clientes={db.clientes} obrigacoes={db.obrigacoes} setView={setView} setDetailId={setDetailId} />}
          {view === 'clientes' && <Clients clientes={db.clientes} setDetailId={setDetailId} setView={setView} setPortalId={setPortalId} />}
          {view === 'new-client' && <ClientForm onSave={handleSaveClient} onCancel={() => setView('clientes')} />}
          {view === 'edit-client' && <ClientForm onSave={handleSaveClient} onCancel={() => setView('client-detail')} initialData={db.clientes.find((c:any) => c.id === detailId)} />}
          {view === 'client-detail' && 
            <ClientDetail 
                id={detailId} 
                onBack={() => setView('clientes')} 
                db={db} 
                onEdit={(c: any) => { setDetailId(c.id); setView('edit-client'); }}
                onAddNote={handleAddNote}
                onAddDocument={handleAddDocument}
                onDeleteClient={handleDeleteClient}
            />
          }
          {view === 'obrigacoes' && 
            <Obligations 
                obrigacoes={db.obrigacoes} 
                clientes={db.clientes} 
                setView={setView} 
                setDetailId={setDetailId} 
                onUpdateStatus={handleUpdateObligationStatus}
            />
          }
          {view === 'settings' && <SettingsView currentTheme={theme} setTheme={setTheme} />}
        </div>
      </main>

      {/* ChatBot Component Integration */}
      <ChatBot />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
