import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, Users, CheckSquare, Settings, LogOut, 
  Menu, X, ChevronRight, CheckCircle, AlertCircle, Clock,
  Search, ExternalLink, ArrowLeft, Upload, Download, FileText,
  Hexagon, Plus, MessageCircle, Send, Bot, Trash2
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
    responsavel: "João Contador"
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
    responsavel: "Maria Contadora"
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
    responsavel: "João Contador"
  }
];

const INITIAL_OBRIGACOES: Obrigacao[] = [
  { id: 1, cliente_id: 1, nome: "DAS - Simples", competencia: "10/2023", vencimento: "2023-11-20", status: "entregue" },
  { id: 2, cliente_id: 1, nome: "Folha de Pagamento", competencia: "10/2023", vencimento: "2023-11-05", status: "entregue" },
  { id: 3, cliente_id: 1, nome: "DAS - Simples", competencia: "11/2023", vencimento: "2023-12-20", status: "pendente" },
  { id: 4, cliente_id: 2, nome: "DAS - MEI", competencia: "11/2023", vencimento: "2023-12-20", status: "atrasada" },
  { id: 5, cliente_id: 3, nome: "DCTFWeb", competencia: "11/2023", vencimento: "2023-12-15", status: "pendente" },
];

const INITIAL_DOCUMENTOS: Documento[] = [
  { id: 1, cliente_id: 1, tipo: "Contrato Social", descricao: "Contrato de constituição", data_upload: "2023-01-10" },
  { id: 2, cliente_id: 1, tipo: "Alvará", descricao: "Alvará de funcionamento 2023", data_upload: "2023-01-15" },
  { id: 4, cliente_id: 1, tipo: "Alvará", descricao: "Alvará de funcionamento 2022", data_upload: "2022-01-15" },
  { id: 3, cliente_id: 2, tipo: "CCMEI", descricao: "Certificado MEI", data_upload: "2023-02-20" },
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
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Contabil<span style={{color: 'var(--primary)'}}>App</span></span>
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
    if (id === 'clientes' && (currentView === 'client-detail' || currentView === 'new-client')) return true;
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
          <a className="sidebar-item">
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

const Dashboard = ({ clientes, obrigacoes, setView, setDetailId }: any) => {
  const pendentes = obrigacoes.filter((o:any) => o.status === 'pendente').length;
  const atrasadas = obrigacoes.filter((o:any) => o.status === 'atrasada').length;
  
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

const NewClientForm = ({ onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    regime_tributario: 'Simples Nacional'
  });

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <div className="mb-4">
        <button onClick={onCancel} className="btn btn-outline gap-2"><ArrowLeft size={16}/> Voltar</button>
      </div>
      <div className="card">
        <h2 className="text-lg font-bold mb-4">Cadastrar Novo Cliente</h2>
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
              <input className="form-input" required value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} placeholder="00.000.000/0000-00"/>
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
              <input className="form-input" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} placeholder="(00) 00000-0000"/>
            </div>
          </div>
          <div className="flex justify-between mt-6 pt-4" style={{borderTop: '1px solid var(--border-color)'}}>
             <button type="button" onClick={onCancel} className="btn btn-outline">Cancelar</button>
             <button type="submit" className="btn btn-primary">Salvar Cadastro</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Clients = ({ clientes, setDetailId, setView, setPortalId }: any) => {
  const [search, setSearch] = useState('');
  
  const filtered = clientes.filter((c:any) => 
    c.nome_fantasia.toLowerCase().includes(search.toLowerCase()) ||
    c.razao_social.toLowerCase().includes(search.toLowerCase())
  );

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
            {filtered.map((c:any) => (
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
    </div>
  );
};

const ClientDetail = ({ id, onBack, db }: any) => {
  const cliente = db.clientes.find((c:any) => c.id === id);
  const obs = db.obrigacoes.filter((o:any) => o.cliente_id === id);
  const docs = db.documentos.filter((d:any) => d.cliente_id === id);

  if (!cliente) return <div>Cliente não encontrado</div>;

  const groupedDocs = docs.reduce((acc: any, doc: any) => {
    if (!acc[doc.tipo]) acc[doc.tipo] = [];
    acc[doc.tipo].push(doc);
    return acc;
  }, {});
  const docTypes = Object.keys(groupedDocs);

  return (
    <>
      <div className="mb-4">
        <button onClick={onBack} className="btn btn-outline gap-2"><ArrowLeft size={16}/> Voltar</button>
      </div>

      <div className="grid-2-1">
        <div>
          <div className="card mb-4">
            <h2 className="text-lg font-bold mb-3">Dados Cadastrais</h2>
            <div className="grid-2-cols">
               <div><label className="text-muted text-sm">Razão Social</label><p>{cliente.razao_social}</p></div>
               <div><label className="text-muted text-sm">Nome Fantasia</label><p>{cliente.nome_fantasia}</p></div>
               <div><label className="text-muted text-sm">CNPJ</label><p>{cliente.cnpj}</p></div>
               <div><label className="text-muted text-sm">Regime</label><p>{cliente.regime_tributario}</p></div>
               <div><label className="text-muted text-sm">Email</label><p>{cliente.email}</p></div>
               <div><label className="text-muted text-sm">Responsável</label><p>{cliente.responsavel}</p></div>
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
               <button className="btn btn-sm btn-primary"><Upload size={14}/></button>
            </div>
            
            {docs.length === 0 ? (
                <div className="text-muted text-sm">Nenhum documento.</div>
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
                                        <button className="btn-icon hover:text-primary" title="Baixar">
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
          
          <div className="card">
            <h3 className="font-bold mb-3">Ações</h3>
            <div className="flex-col gap-2">
               <button className="btn btn-outline w-full justify-center">Editar Cadastro</button>
               <button className="btn btn-outline w-full justify-center">Enviar Mensagem</button>
               <button className="btn btn-danger-outline w-full justify-center">{cliente.ativo ? 'Inativar Cliente' : 'Ativar Cliente'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Obligations = ({ obrigacoes, clientes, setView, setDetailId }: any) => {
  const getClienteName = (id: number) => clientes.find((c:any) => c.id === id)?.nome_fantasia || 'Desconhecido';

  return (
    <div className="card">
      <div className="mb-3 flex gap-2">
         <select className="form-select" style={{maxWidth: '200px'}}>
            <option>Todos os Status</option>
            <option>Pendente</option>
         </select>
         <input type="month" className="form-input" style={{maxWidth: '200px'}} />
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
               <th>Cliente</th>
               <th>Obrigação</th>
               <th>Competência</th>
               <th>Vencimento</th>
               <th>Status</th>
               <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {obrigacoes.map((ob:any) => (
              <tr key={ob.id}>
                 <td><a onClick={() => { setDetailId(ob.cliente_id); setView('client-detail'); }} className="text-primary hover:underline">{getClienteName(ob.cliente_id)}</a></td>
                 <td>{ob.nome}</td>
                 <td>{ob.competencia}</td>
                 <td>{new Date(ob.vencimento).toLocaleDateString('pt-BR')}</td>
                 <td><span className={`badge badge-${ob.status === 'atrasada' ? 'danger' : ob.status === 'entregue' ? 'success' : 'warning'}`}>{ob.status}</span></td>
                 <td><button className="btn btn-sm btn-outline"><CheckCircle size={14}/></button></td>
              </tr>
            ))}
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
                                            <button className="btn-icon hover:text-primary" title="Baixar">
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

  // Mock Database State
  const [db, setDb] = useState({
    clientes: INITIAL_CLIENTES,
    obrigacoes: INITIAL_OBRIGACOES,
    documentos: INITIAL_DOCUMENTOS
  });

  const handleSaveClient = (newClientData: any) => {
    const newId = db.clientes.length > 0 ? Math.max(...db.clientes.map((c:any) => c.id)) + 1 : 1;
    const newClient = {
       id: newId,
       ...newClientData,
       ativo: true,
       responsavel: 'Contador'
    };
    
    setDb(prev => ({
      ...prev,
      clientes: [...prev.clientes, newClient]
    }));
    setView('clientes');
  };

  if (!session) {
    // If viewing portal directly (simulated route)
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
             <h2 className="font-bold text-lg">
               {view === 'dashboard' ? 'Visão Geral' : 
                view === 'clientes' ? 'Carteira de Clientes' :
                view === 'new-client' ? 'Novo Cliente' :
                view === 'obrigacoes' ? 'Controle de Obrigações' :
                view === 'client-detail' ? 'Detalhes do Cliente' : 'Painel'}
             </h2>
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
          {view === 'new-client' && <NewClientForm onSave={handleSaveClient} onCancel={() => setView('clientes')} />}
          {view === 'client-detail' && <ClientDetail id={detailId} onBack={() => setView('clientes')} db={db} />}
          {view === 'obrigacoes' && <Obligations obrigacoes={db.obrigacoes} clientes={db.clientes} setView={setView} setDetailId={setDetailId} />}
        </div>
      </main>

      {/* ChatBot Component Integration */}
      <ChatBot />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);