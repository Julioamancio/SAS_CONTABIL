
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, Users, FileText, CheckSquare, Settings, LogOut, 
  Menu, Bell, Search, X, ChevronDown, ChevronUp, Filter, Download, 
  Upload, Plus, Trash2, MessageCircle, Send, Bot, FileSpreadsheet, 
  ExternalLink, ChevronLeft, ChevronRight, Printer, Mail, Copy,
  AlertCircle, CheckCircle, DollarSign, BarChart3, PieChart,
  RefreshCw
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// ==========================================
// MOCK DATA & UTILS
// ==========================================
const initialClientes = [
  { id: 1, razao_social: "Tech Solutions Ltda", nome_fantasia: "TechSol", cnpj: "12.345.678/0001-90", email: "contato@techsol.com", telefone: "(11) 99999-9999", regime_tributario: "Simples Nacional", ativo: true, responsavel: "João Contador", certificado_vencimento: "2024-12-31", valor_honorarios: 1500.00 },
  { id: 2, razao_social: "Padaria do Seu Zé MEI", nome_fantasia: "Pão Quentinho", cnpj: "98.765.432/0001-10", email: "jose@padaria.com", telefone: "(11) 88888-8888", regime_tributario: "MEI", ativo: true, responsavel: "Maria Contadora", certificado_vencimento: "2023-10-15", valor_honorarios: 250.00 },
  { id: 3, razao_social: "Consultoria Empresarial S.A.", nome_fantasia: "Grupo Consult", cnpj: "11.222.333/0001-55", email: "financas@grupoconsult.com", telefone: "(21) 77777-7777", regime_tributario: "Lucro Presumido", ativo: true, responsavel: "João Contador", certificado_vencimento: "2024-05-20", valor_honorarios: 3200.00 },
];

const initialObrigacoes = [
  { id: 1, cliente_id: 1, nome: "DAS - Simples", competencia: "10/2023", vencimento: "2023-11-20", status: "entregue", tipo: "fiscal" },
  { id: 2, cliente_id: 1, nome: "Folha de Pagamento", competencia: "10/2023", vencimento: "2023-11-05", status: "entregue", tipo: "fiscal" },
  { id: 3, cliente_id: 1, nome: "DAS - Simples", competencia: "11/2023", vencimento: "2023-12-20", status: "pendente", tipo: "fiscal" },
  { id: 4, cliente_id: 2, nome: "DAS - MEI", competencia: "11/2023", vencimento: "2023-12-20", status: "atrasada", tipo: "fiscal" },
  { id: 5, cliente_id: 3, nome: "DCTFWeb", competencia: "11/2023", vencimento: "2023-12-15", status: "pendente", tipo: "fiscal" },
];

const initialDocumentos = [
  { id: 1, cliente_id: 1, tipo: "Contrato Social", descricao: "Contrato de constituição", data_upload: "2023-01-10" },
  { id: 2, cliente_id: 1, tipo: "Alvará", descricao: "Alvará de funcionamento 2023", data_upload: "2023-01-15" },
  { id: 3, cliente_id: 2, tipo: "CCMEI", descricao: "Certificado MEI", data_upload: "2023-02-20" },
];

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// ==========================================
// COMPONENTS
// ==========================================

const CSVImportModal = ({ onClose, onImport }: { onClose: () => void; onImport: (data: any) => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[var(--z-modal)]">
      <div className="bg-[var(--bg-card)] p-6 rounded-lg shadow-lg max-w-md w-full border border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Importar Clientes (CSV)</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
          <p className="text-gray-500">Arraste e solte o arquivo CSV aqui</p>
          <p className="text-xs text-gray-400 mt-2">ou clique para selecionar</p>
          <p className="text-xs text-gray-400 mt-4">Formato: Razão Social, Fantasia, CNPJ, Email...</p>
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            const novosClientes = [
               { id: Date.now(), razao_social: "Cliente Importado A", nome_fantasia: "Importado A", cnpj: "00.000.000/0001-00", email: "a@teste.com", telefone: "11999999999", regime_tributario: "Simples Nacional", ativo: true, responsavel: "Sistema", certificado_vencimento: "2024-12-31", valor_honorarios: 1000 },
               { id: Date.now() + 1, razao_social: "Cliente Importado B", nome_fantasia: "Importado B", cnpj: "11.111.111/0001-11", email: "b@teste.com", telefone: "11888888888", regime_tributario: "Lucro Presumido", ativo: true, responsavel: "Sistema", certificado_vencimento: "2024-11-30", valor_honorarios: 2000 }
            ];
            onImport(novosClientes);
          }}>Importar Simulado</button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ activeView, setView, collapsed, toggleSidebar, mobileOpen, closeMobileSidebar }: any) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'obrigacoes', label: 'Obrigações', icon: CheckSquare },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      <div className={`mobile-overlay ${mobileOpen ? 'active' : ''}`} onClick={closeMobileSidebar}></div>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className={`flex items-center gap-2 font-bold text-lg ${collapsed ? 'hidden' : ''}`} style={{color: 'var(--text-main)'}}>
             <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white">C</div>
             <span>ContabilApp</span>
          </div>
          <button onClick={toggleSidebar} className="btn-icon hidden-mobile">
             {collapsed ? <Menu size={20}/> : <ChevronLeft size={20}/>}
          </button>
          <button onClick={closeMobileSidebar} className="btn-icon hidden-desktop">
             <X size={20}/>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map(item => (
            <a key={item.id} onClick={() => { setView(item.id); closeMobileSidebar(); }} 
               className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}>
              <item.icon size={20} />
              <span className="sidebar-label">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--border-color)]">
            <a className="sidebar-item" style={{padding: collapsed ? '0.5rem 0' : '0.5rem 1rem', justifyContent: collapsed ? 'center' : 'flex-start'}}>
                <LogOut size={20} />
                <span className="sidebar-label">Sair</span>
            </a>
        </div>
      </aside>
    </>
  );
};

const Dashboard = ({ clientes, obrigacoes, setView }: any) => {
  const totalClientes = clientes.length;
  const obsPendentes = obrigacoes.filter((o:any) => o.status === 'pendente').length;
  const obsAtrasadas = obrigacoes.filter((o:any) => o.status === 'atrasada').length;
  const proximasObs = [...obrigacoes].sort((a:any, b:any) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime()).slice(0, 5);
  
  // Financeiro
  const faturamentoTotal = obrigacoes.filter((o:any) => o.tipo === 'honorario' && o.status === 'entregue').reduce((acc:number, curr:any) => acc + (curr.valor || 0), 0);
  const aReceber = obrigacoes.filter((o:any) => o.tipo === 'honorario' && o.status !== 'entregue').reduce((acc:number, curr:any) => acc + (curr.valor || 0), 0);
  const inadimplencia = obrigacoes.filter((o:any) => o.tipo === 'honorario' && o.status === 'atrasada').reduce((acc:number, curr:any) => acc + (curr.valor || 0), 0);

  // Certificados Vencendo (30 dias)
  const hoje = new Date();
  const trintaDias = new Date(); trintaDias.setDate(hoje.getDate() + 30);
  const certsVencendo = clientes.filter((c:any) => {
      if(!c.certificado_vencimento) return false;
      const venc = new Date(c.certificado_vencimento);
      return venc >= hoje && venc <= trintaDias;
  }).length;

  return (
    <div className="flex-col gap-4">
        {/* Financeiro */}
        <div className="grid-cards">
             <div className="card">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-muted font-semibold uppercase">Faturamento (Mês)</h3>
                    <DollarSign className="text-green-500" size={20}/>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(faturamentoTotal)}</div>
                <p className="text-xs text-muted mt-1">Baixado este mês</p>
             </div>
             <div className="card">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-muted font-semibold uppercase">A Receber</h3>
                    <DollarSign className="text-blue-500" size={20}/>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(aReceber)}</div>
                <p className="text-xs text-muted mt-1">Fluxo previsto</p>
             </div>
             <div className="card">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-muted font-semibold uppercase">Inadimplência</h3>
                    <DollarSign className="text-red-500" size={20}/>
                </div>
                <div className="text-2xl font-bold text-red-500">{formatCurrency(inadimplencia)}</div>
                <p className="text-xs text-muted mt-1">Atrasados</p>
             </div>
        </div>

        {/* Operacional */}
        <div className="grid-cards mt-4">
            <div className="card">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-muted font-semibold uppercase">Total Clientes</h3>
                    <Users className="text-blue-500" size={20}/>
                </div>
                <div className="text-2xl font-bold">{totalClientes}</div>
                <p className="text-xs text-muted mt-1">Empresas ativas</p>
            </div>
            <div className="card">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-muted font-semibold uppercase">Pendências</h3>
                    <CheckCircle className="text-yellow-500" size={20}/>
                </div>
                <div className="text-2xl font-bold">{obsPendentes}</div>
                <p className="text-xs text-muted mt-1">Obrigações a entregar</p>
            </div>
            <div className="card">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-muted font-semibold uppercase">Atrasadas</h3>
                    <AlertCircle className="text-red-500" size={20}/>
                </div>
                <div className="text-2xl font-bold text-red-500">{obsAtrasadas}</div>
                <p className="text-xs text-muted mt-1">Atenção necessária</p>
            </div>
             <div className="card">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-muted font-semibold uppercase">Certificados</h3>
                    <FileText className="text-orange-500" size={20}/>
                </div>
                <div className="text-2xl font-bold text-orange-500">{certsVencendo}</div>
                <p className="text-xs text-muted mt-1">Vencendo em 30 dias</p>
            </div>
        </div>

        <div className="card mt-4">
            <h2 className="font-bold text-lg mb-4">Próximas Obrigações</h2>
            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Cliente</th><th>Obrigação</th><th>Vencimento</th><th>Status</th></tr></thead>
                    <tbody>
                        {proximasObs.map((ob:any) => {
                            const cli = clientes.find((c:any)=>c.id===ob.cliente_id);
                            return (
                                <tr key={ob.id}>
                                    <td><strong>{cli?.nome_fantasia}</strong></td>
                                    <td>{ob.nome} <span className="text-xs text-muted">({ob.competencia})</span></td>
                                    <td>{formatDate(ob.vencimento)}</td>
                                    <td><span className={`badge badge-${ob.status === 'entregue' ? 'success' : ob.status === 'atrasada' ? 'danger' : 'warning'}`}>{ob.status}</span></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

const Clients = ({ clientes, setDetailId, setView, setPortalId, onImport }: any) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const ITEMS_PER_PAGE = 5;
  
  const filtered = clientes.filter((c:any) => c.nome_fantasia.toLowerCase().includes(search.toLowerCase()) || c.razao_social.toLowerCase().includes(search.toLowerCase()));
  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="card">
      {showImportModal && <CSVImportModal onClose={() => setShowImportModal(false)} onImport={(data: any) => { onImport(data); setShowImportModal(false); }} />}
      
      <div className="card-header-actions">
        <div className="flex-1 min-w-[200px]">
           <input type="text" className="form-input" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="actions-group">
          <button className="btn btn-outline" title="Importar CSV" onClick={() => setShowImportModal(true)}><FileSpreadsheet size={18} /><span>Importar</span></button>
          <button className="btn btn-outline" title="Exportar PDF" onClick={() => window.print()}><Printer size={18} /><span>PDF</span></button>
          <button className="btn btn-primary" onClick={() => setView('new-client')}><Plus size={18} /><span>Novo Cliente</span></button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead><tr><th>ID</th><th>Empresa</th><th>CNPJ</th><th>Regime</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {paginatedClients.map((c:any) => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td><div className="flex-col"><strong>{c.nome_fantasia}</strong><span className="text-muted text-sm">{c.razao_social}</span></div></td>
                <td>{c.cnpj}</td>
                <td>{c.regime_tributario}</td>
                <td>{c.ativo ? <span className="badge badge-success">Ativo</span> : <span className="badge badge-danger">Inativo</span>}</td>
                <td className="flex gap-2">
                   <button className="btn btn-sm btn-primary" onClick={() => { setDetailId(c.id); setView('client-detail'); }}>Detalhes</button>
                   <button className="btn btn-icon" title="Ver Portal do Cliente" onClick={() => { setPortalId(c.id); setView('portal'); }}><ExternalLink size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-2" style={{borderTop: '1px solid var(--border-color)'}}>
           <span className="text-sm text-muted">Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} de {filtered.length}</span>
           <div className="flex gap-2 items-center">
              <button className="btn btn-sm btn-outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={16} /></button>
              <span className="text-sm font-medium">Página {currentPage} de {totalPages}</span>
              <button className="btn btn-sm btn-outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={16} /></button>
           </div>
        </div>
      )}
    </div>
  );
};

const ClientDetail = ({ cliente, obrigacoes, documentos, onBack, onSave, onDelete, onAddDoc, onUpdateOb }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...cliente});
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState('');
  const [timeline, setTimeline] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [expandedDocs, setExpandedDocs] = useState<{[key:string]:boolean}>({ 'Contrato Social': true, 'Alvará': true, 'Outros': true });

  if(!cliente) return <div>Cliente não encontrado</div>;

  const handleSave = () => {
      onSave(formData);
      setIsEditing(false);
      setTimeline([`Cadastro atualizado em ${new Date().toLocaleString()}`, ...timeline]);
  };

  const handleAddNote = () => {
      if(note.trim()) {
          setTimeline([`${note} - ${new Date().toLocaleString()}`, ...timeline]);
          setNote('');
      }
  };

  const generateWhatsAppLink = (ob: any) => {
    const phone = cliente.telefone.replace(/\D/g, '');
    const msg = `Olá ${cliente.responsavel}, referente à empresa ${cliente.nome_fantasia}: a guia ${ob.nome} (${ob.competencia}) vence dia ${formatDate(ob.vencimento)}. Favor regularizar.`;
    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Agrupar documentos
  const docsByType = documentos.reduce((acc:any, doc:any) => {
      acc[doc.tipo] = acc[doc.tipo] || [];
      acc[doc.tipo].push(doc);
      return acc;
  }, {});

  return (
    <div className="flex-col gap-4">
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[var(--z-modal)]">
            <div className="bg-[var(--bg-card)] p-6 rounded-lg shadow-lg max-w-md w-full border border-[var(--border-color)]">
                <h3 className="font-bold mb-4">Enviar E-mail: {emailType}</h3>
                <textarea className="form-input h-32 mb-4" readOnly defaultValue={`Olá ${cliente.responsavel},\n\nSegue em anexo a guia referente a ${emailType}.\n\nAtt,\nContabilidade.`}></textarea>
                <div className="flex justify-end gap-2">
                    <button className="btn btn-outline" onClick={() => setShowEmailModal(false)}>Fechar</button>
                    <button className="btn btn-outline" onClick={() => alert('Texto copiado!')}><Copy size={16}/> Copiar</button>
                    <a href={`mailto:${cliente.email}`} className="btn btn-primary">Abrir Email</a>
                </div>
            </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
         <button onClick={onBack} className="btn btn-outline"><ChevronLeft size={16}/> Voltar</button>
         <div className="flex gap-2">
             <button className="btn btn-danger-outline" onClick={() => { if(confirm('Tem certeza?')) onDelete(cliente.id); }}><Trash2 size={16}/> Excluir</button>
             <button className="btn btn-primary" onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancelar' : 'Editar'}</button>
         </div>
      </div>

      <div className="grid-2-1">
         <div className="flex-col gap-4">
            <div className="card">
                <h3 className="font-bold mb-4">Dados Cadastrais</h3>
                <div className="grid-2-cols">
                    <div className="form-group">
                        <label>Razão Social</label>
                        <input className="form-input" disabled={!isEditing} value={formData.razao_social} onChange={e=>setFormData({...formData, razao_social: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Nome Fantasia</label>
                        <input className="form-input" disabled={!isEditing} value={formData.nome_fantasia} onChange={e=>setFormData({...formData, nome_fantasia: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>CNPJ</label>
                        <input className="form-input" disabled={!isEditing} value={formData.cnpj} onChange={e=>setFormData({...formData, cnpj: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Responsável</label>
                        <input className="form-input" disabled={!isEditing} value={formData.responsavel} onChange={e=>setFormData({...formData, responsavel: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input className="form-input" disabled={!isEditing} value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Telefone</label>
                        <input className="form-input" disabled={!isEditing} value={formData.telefone} onChange={e=>setFormData({...formData, telefone: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Certificado Digital (Vencimento)</label>
                        <input type="date" className="form-input" disabled={!isEditing} value={formData.certificado_vencimento || ''} onChange={e=>setFormData({...formData, certificado_vencimento: e.target.value})} />
                        {!isEditing && formData.certificado_vencimento && (
                            <span className="text-xs mt-1 block" style={{color: new Date(formData.certificado_vencimento) < new Date() ? 'var(--danger)' : 'var(--success)'}}>
                                {new Date(formData.certificado_vencimento) < new Date() ? 'Expirado!' : 'Válido'}
                            </span>
                        )}
                    </div>
                </div>
                {isEditing && <button className="btn btn-primary w-full mt-4" onClick={handleSave}>Salvar Alterações</button>}
            </div>

            <div className="card">
                <h3 className="font-bold mb-4">Obrigações</h3>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Obrigação</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>
                            {obrigacoes.map((ob:any) => (
                                <tr key={ob.id}>
                                    <td>{ob.nome} ({ob.competencia})</td>
                                    <td>{formatDate(ob.vencimento)}</td>
                                    <td><span className={`badge badge-${ob.status === 'entregue' ? 'success' : ob.status === 'atrasada' ? 'danger' : 'warning'}`}>{ob.status}</span></td>
                                    <td className="flex gap-2">
                                        {ob.status !== 'entregue' && (
                                            <>
                                            <button className="btn btn-sm btn-success-outline" onClick={() => {
                                                const protocolo = prompt("Digite o protocolo de entrega:");
                                                if(protocolo) onUpdateOb(ob.id, 'entregue');
                                            }}>Baixar</button>
                                            <a href={generateWhatsAppLink(ob)} target="_blank" className="btn btn-sm btn-outline text-green-600 border-green-600"><MessageCircle size={14}/> Cobrar</a>
                                            <button onClick={() => { setEmailType(ob.nome); setShowEmailModal(true); }} className="btn btn-sm btn-outline"><Mail size={14}/></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
         </div>

         <div className="flex-col gap-4">
             <div className="card">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Documentos</h3>
                    <button className="btn btn-sm btn-primary" onClick={() => {
                        // Simula upload
                        onAddDoc({ id: Date.now(), cliente_id: cliente.id, tipo: "Outros", descricao: "Novo Doc", data_upload: new Date().toISOString().split('T')[0] });
                    }}><Upload size={16}/></button>
                 </div>
                 {Object.keys(docsByType).map(tipo => (
                     <div key={tipo} className="mb-2 border border-[var(--border-color)] rounded overflow-hidden">
                         <div className="bg-[var(--bg-hover)] p-2 flex justify-between items-center cursor-pointer" onClick={() => setExpandedDocs({...expandedDocs, [tipo]: !expandedDocs[tipo]})}>
                             <span className="font-semibold text-sm">{tipo} ({docsByType[tipo].length})</span>
                             {expandedDocs[tipo] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                         </div>
                         {expandedDocs[tipo] && (
                             <div className="p-2 bg-[var(--bg-card)]">
                                 {docsByType[tipo].map((doc:any) => (
                                     <div key={doc.id} className="flex justify-between items-center py-2 border-b border-[var(--border-color)] last:border-0">
                                         <div className="flex flex-col">
                                             <span className="text-sm font-medium">{doc.descricao}</span>
                                             <span className="text-xs text-muted">{formatDate(doc.data_upload)}</span>
                                         </div>
                                         <button className="btn-icon" onClick={() => alert(`Baixando ${doc.descricao}...`)}><Download size={16}/></button>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                 ))}
             </div>

             <div className="card">
                 <h3 className="font-bold mb-2">Timeline / Anotações</h3>
                 <div className="flex gap-2 mb-4">
                     <input className="form-input" placeholder="Nova anotação..." value={note} onChange={e=>setNote(e.target.value)} />
                     <button className="btn btn-primary" onClick={handleAddNote}><Plus/></button>
                 </div>
                 <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                     {timeline.length === 0 && <p className="text-sm text-muted">Nenhuma atividade recente.</p>}
                     {timeline.map((t, i) => (
                         <div key={i} className="text-sm p-2 bg-[var(--bg-hover)] rounded">{t}</div>
                     ))}
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

const Obligations = ({ obrigacoes, clientes, onUpdateStatus, onGenerateBatch }: any) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('');
    const [selectedObs, setSelectedObs] = useState<number[]>([]);

    const filtered = obrigacoes.filter((ob:any) => {
        if(statusFilter !== 'all' && ob.status !== statusFilter) return false;
        if(monthFilter && ob.competencia !== monthFilter) return false;
        return true;
    });

    const toggleSelect = (id: number) => {
        if(selectedObs.includes(id)) setSelectedObs(selectedObs.filter(i => i !== id));
        else setSelectedObs([...selectedObs, id]);
    };

    const handleMassAction = () => {
        if(confirm(`Marcar ${selectedObs.length} obrigações como entregues?`)) {
            selectedObs.forEach(id => onUpdateStatus(id, 'entregue'));
            setSelectedObs([]);
        }
    };

    return (
        <div className="card">
            <div className="card-header-actions">
                <div className="flex gap-2 filter-bar">
                    <select className="form-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                        <option value="all">Todos Status</option>
                        <option value="pendente">Pendente</option>
                        <option value="entregue">Entregue</option>
                        <option value="atrasada">Atrasada</option>
                    </select>
                    <input type="text" placeholder="Ex: 10/2023" className="form-input" value={monthFilter} onChange={e=>setMonthFilter(e.target.value)}/>
                </div>
                <div className="actions-group">
                   <button className="btn btn-primary" onClick={onGenerateBatch}><RefreshCw size={16}/> Gerar Lote</button>
                </div>
            </div>

            {selectedObs.length > 0 && (
                <div className="bg-blue-100 text-blue-800 p-2 rounded mb-4 flex justify-between items-center">
                    <span>{selectedObs.length} selecionados</span>
                    <button className="btn btn-sm btn-primary" onClick={handleMassAction}>Baixar Selecionados</button>
                </div>
            )}

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{width: 40}}><input type="checkbox" onChange={(e) => {
                                if(e.target.checked) setSelectedObs(filtered.map((o:any)=>o.id));
                                else setSelectedObs([]);
                            }}/></th>
                            <th>Cliente</th>
                            <th>Obrigação</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((ob:any) => {
                             const cli = clientes.find((c:any)=>c.id===ob.cliente_id);
                             return (
                                <tr key={ob.id}>
                                    <td><input type="checkbox" checked={selectedObs.includes(ob.id)} onChange={()=>toggleSelect(ob.id)}/></td>
                                    <td>{cli?.nome_fantasia}</td>
                                    <td>{ob.nome} ({ob.competencia})</td>
                                    <td>{formatDate(ob.vencimento)}</td>
                                    <td><span className={`badge badge-${ob.status === 'entregue' ? 'success' : ob.status === 'atrasada' ? 'danger' : 'warning'}`}>{ob.status}</span></td>
                                    <td>{ob.valor ? formatCurrency(ob.valor) : '-'}</td>
                                </tr>
                             )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ReportsView = ({ clientes, obrigacoes }: any) => {
    const entregues = obrigacoes.filter((o:any)=>o.status==='entregue').length;
    const total = obrigacoes.length;
    const percent = total ? Math.round((entregues/total)*100) : 0;

    return (
        <div className="flex-col gap-4">
            <div className="card">
                <h2 className="font-bold text-lg mb-4">Relatório de Performance</h2>
                <div className="flex items-center gap-8 flex-wrap">
                    <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-blue-100">
                         <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{clipPath: `polygon(0 0, 100% 0, 100% ${percent}%, 0 ${percent}%)`}}></div>
                         <span className="text-xl font-bold">{percent}%</span>
                    </div>
                    <div>
                        <p className="text-muted">Obrigações Entregues: <strong>{entregues}</strong></p>
                        <p className="text-muted">Total Obrigações: <strong>{total}</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Portal = ({ clienteId, clientes, obrigacoes, documentos, onBack }: any) => {
    const cliente = clientes.find((c:any)=>c.id===clienteId);
    if(!cliente) return <div>Erro</div>;
    
    const obsCliente = obrigacoes.filter((o:any)=>o.cliente_id===clienteId);
    const docsCliente = documentos.filter((d:any)=>d.cliente_id===clienteId);

    return (
        <div className="portal-body">
            <div className="portal-header rounded-lg mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Portal do Cliente</h1>
                    <p>{cliente.nome_fantasia}</p>
                </div>
                <button onClick={onBack} className="btn btn-outline">Sair do Portal</button>
            </div>
            <div className="grid-2-1">
                <div className="card">
                    <h2 className="font-bold mb-4">Minhas Guias</h2>
                    <table className="table">
                        <thead><tr><th>Guia</th><th>Vencimento</th><th>Status</th><th>Download</th></tr></thead>
                        <tbody>
                            {obsCliente.map((ob:any) => (
                                <tr key={ob.id}>
                                    <td>{ob.nome}</td>
                                    <td>{formatDate(ob.vencimento)}</td>
                                    <td><span className={`badge badge-${ob.status}`}>{ob.status}</span></td>
                                    <td>{ob.status==='entregue' ? <button className="btn btn-sm btn-primary"><Download size={14}/> Baixar</button> : <span className="text-xs text-muted">Aguarde</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="card">
                    <h2 className="font-bold mb-4">Documentos</h2>
                    {docsCliente.map((doc:any) => (
                         <div key={doc.id} className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                             <div className="flex items-center gap-2">
                                <FileText size={16} className="text-blue-500"/>
                                <span className="text-sm">{doc.tipo}</span>
                             </div>
                             <button className="btn-icon" onClick={()=>alert('Baixando...')}><Download size={16}/></button>
                         </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{text:string, isUser:boolean, sources?:any[]}[]>([
    { text: "Olá! Sou a IA Contábil. Posso ajudar a analisar contratos, verificar leis ou tirar dúvidas.", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isOpen]);

  const handleSend = async () => {
    if(!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
    setInput("");
    setLoading(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMsg,
            config: { tools: [{googleSearch: {}}] }
        });
        const text = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        setMessages(prev => [...prev, { text: text || "Sem resposta.", isUser: false, sources }]);
    } catch (e) {
        setMessages(prev => [...prev, { text: "Erro ao conectar com Gemini.", isUser: false }]);
    }
    setLoading(false);
  };

  if (!isOpen) return <button className="chat-fab" onClick={()=>setIsOpen(true)}><MessageCircle/></button>;

  return (
      <div className="chat-window">
          <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-hover)] flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold"><Bot size={18}/> Assistente IA</div>
              <div className="flex gap-1">
                  <button onClick={()=>setMessages([])} className="btn-icon"><Trash2 size={16}/></button>
                  <button onClick={()=>setIsOpen(false)} className="btn-icon"><X size={16}/></button>
              </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" ref={scrollRef}>
              {messages.map((m,i) => (
                  <div key={i} className={`p-3 rounded-lg max-w-[85%] text-sm ${m.isUser ? 'bg-blue-500 text-white self-end' : 'bg-[var(--bg-hover)] self-start'}`}>
                      {m.text}
                      {m.sources && (
                          <div className="mt-2 pt-2 border-t border-gray-300 text-xs">
                              <strong>Fontes:</strong>
                              {m.sources.map((s:any, idx:number) => (
                                  <a key={idx} href={s.web?.uri} target="_blank" className="block text-blue-300 underline truncate">{s.web?.title}</a>
                              ))}
                          </div>
                      )}
                  </div>
              ))}
              {loading && <div className="self-start text-xs text-muted animate-pulse">Digitando...</div>}
          </div>
          <div className="p-3 border-t border-[var(--border-color)] flex gap-2">
              <input className="form-input text-sm" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="Pergunte algo..." />
              <button className="btn btn-primary" onClick={handleSend}><Send size={16}/></button>
          </div>
      </div>
  );
};

// ==========================================
// MAIN APP
// ==========================================

const App = () => {
  const [view, setView] = useState('dashboard'); // dashboard, clientes, client-detail, obrigacoes, settings, portal, new-client, reports
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState('dark'); // dark, light, gray
  
  // Data State
  const [clientes, setClientes] = useState(initialClientes);
  const [obrigacoes, setObrigacoes] = useState(initialObrigacoes);
  const [documentos, setDocumentos] = useState(initialDocumentos);
  
  const [detailId, setDetailId] = useState<number|null>(null);
  const [portalId, setPortalId] = useState<number|null>(null);

  // Persist Theme
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  // Handlers
  const handleSaveClient = (client: any) => {
     if(client.id) {
         setClientes(clientes.map(c => c.id === client.id ? client : c));
     } else {
         setClientes([...clientes, { ...client, id: Date.now(), ativo: true }]);
     }
     setView('clientes');
  };

  const handleDeleteClient = (id: number) => {
      setClientes(clientes.filter(c => c.id !== id));
      setView('clientes');
  };

  const handleGenerateBatch = () => {
      const tipo = prompt("Digite o tipo (fiscal ou honorario):", "fiscal");
      const comp = prompt("Digite a competência (ex: 11/2023):");
      if(comp && tipo) {
          const novasObs: any[] = [];
          clientes.filter(c=>c.ativo).forEach(c => {
              if(tipo === 'fiscal') {
                novasObs.push({ id: Date.now() + Math.random(), cliente_id: c.id, nome: "DAS - Simples", competencia: comp, vencimento: "2023-12-20", status: "pendente", tipo: 'fiscal' });
              } else {
                novasObs.push({ id: Date.now() + Math.random(), cliente_id: c.id, nome: "Honorários", competencia: comp, vencimento: "2023-12-10", status: "pendente", tipo: 'honorario', valor: c.valor_honorarios });
              }
          });
          setObrigacoes([...obrigacoes, ...novasObs]);
          alert(`${novasObs.length} obrigações geradas!`);
      }
  };

  // Portal View Mode
  if (view === 'portal' && portalId) {
      return <Portal clienteId={portalId} clientes={clientes} obrigacoes={obrigacoes} documentos={documentos} onBack={() => setView('clientes')} />;
  }

  // New Client Form Component (Inline for simplicity)
  const NewClientForm = () => {
      const [form, setForm] = useState({ razao_social: '', nome_fantasia: '', cnpj: '', email: '', telefone: '', regime_tributario: 'Simples Nacional', responsavel: '', valor_honorarios: 0 });
      
      const handleSmartFill = async () => {
         const text = prompt("Cole o texto com dados da empresa aqui:");
         if(!text) return;
         try {
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
             const promptText = `Extraia JSON deste texto: ${text}. Campos: razao_social, nome_fantasia, cnpj, email, telefone, responsavel.`;
             const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: promptText });
             const jsonStr = resp.text.replace(/```json|```/g, '').trim();
             const data = JSON.parse(jsonStr);
             setForm({ ...form, ...data });
         } catch(e) { alert("Erro ao processar IA"); }
      };

      return (
          <div className="card max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Novo Cliente</h2>
                <button className="btn btn-outline text-purple-500 border-purple-500" onClick={handleSmartFill}><Bot size={16}/> Smart Fill (IA)</button>
              </div>
              <div className="grid-2-cols">
                  <div className="form-group"><label>CNPJ</label><input className="form-input" maxLength={18} value={form.cnpj} onChange={e=>setForm({...form, cnpj: e.target.value})}/></div>
                  <div className="form-group"><label>Razão Social</label><input className="form-input" value={form.razao_social} onChange={e=>setForm({...form, razao_social: e.target.value})}/></div>
                  <div className="form-group"><label>Nome Fantasia</label><input className="form-input" value={form.nome_fantasia} onChange={e=>setForm({...form, nome_fantasia: e.target.value})}/></div>
                  <div className="form-group"><label>Regime</label><select className="form-select" value={form.regime_tributario} onChange={e=>setForm({...form, regime_tributario: e.target.value})}><option>Simples Nacional</option><option>Lucro Presumido</option><option>MEI</option></select></div>
                  <div className="form-group"><label>Email</label><input className="form-input" value={form.email} onChange={e=>setForm({...form, email: e.target.value})}/></div>
                  <div className="form-group"><label>Responsável</label><input className="form-input" value={form.responsavel} onChange={e=>setForm({...form, responsavel: e.target.value})}/></div>
                  <div className="form-group"><label>Honorários (R$)</label><input className="form-input" type="number" value={form.valor_honorarios} onChange={e=>setForm({...form, valor_honorarios: parseFloat(e.target.value)})}/></div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                  <button className="btn btn-outline" onClick={()=>setView('clientes')}>Cancelar</button>
                  <button className="btn btn-primary" onClick={()=>handleSaveClient(form)}>Salvar Cliente</button>
              </div>
          </div>
      );
  };

  return (
    <div className="app-container">
        <Sidebar activeView={view} setView={setView} collapsed={sidebarCollapsed} toggleSidebar={()=>setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} closeMobileSidebar={()=>setMobileOpen(false)} />
        
        <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
            <header className="topbar">
                <div className="flex items-center gap-4">
                    <button className="btn-icon hidden-desktop" onClick={()=>setMobileOpen(true)}><Menu/></button>
                    <h1 className="font-bold text-lg capitalize">{view.replace('-', ' ')}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden-mobile-xs">
                        <Search className="absolute left-3 top-2.5 text-muted" size={16}/>
                        <input className="form-input pl-10 w-64" placeholder="Buscar global..."/>
                    </div>
                    <button className="btn-icon"><Bell size={20}/></button>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">U</div>
                </div>
            </header>

            <div className="content-wrapper">
                {view === 'dashboard' && <Dashboard clientes={clientes} obrigacoes={obrigacoes} setView={setView} />}
                {view === 'clientes' && <Clients clientes={clientes} setDetailId={setDetailId} setView={setView} setPortalId={setPortalId} onImport={(novos:any)=>setClientes([...clientes, ...novos])} />}
                {view === 'client-detail' && <ClientDetail cliente={clientes.find(c=>c.id===detailId)} obrigacoes={obrigacoes.filter(o=>o.cliente_id===detailId)} documentos={documentos.filter(d=>d.cliente_id===detailId)} onBack={()=>setView('clientes')} onSave={handleSaveClient} onDelete={handleDeleteClient} onAddDoc={(d:any)=>setDocumentos([...documentos, d])} onUpdateOb={(id:number, st:string)=>setObrigacoes(obrigacoes.map(o=>o.id===id?{...o, status:st}:o))} />}
                {view === 'new-client' && <NewClientForm />}
                {view === 'obrigacoes' && <Obligations obrigacoes={obrigacoes} clientes={clientes} onUpdateStatus={(id:number, st:string)=>setObrigacoes(obrigacoes.map(o=>o.id===id?{...o, status:st}:o))} onGenerateBatch={handleGenerateBatch}/>}
                {view === 'reports' && <ReportsView clientes={clientes} obrigacoes={obrigacoes} />}
                {view === 'settings' && (
                    <div className="card max-w-lg">
                        <h2 className="font-bold mb-4">Aparência</h2>
                        <div className="flex gap-4">
                            {['dark', 'light', 'gray'].map(t => (
                                <button key={t} onClick={()=>setTheme(t)} className={`p-4 border rounded capitalize ${theme===t?'border-blue-500 bg-blue-50 text-blue-700':''}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
        <ChatBot />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
