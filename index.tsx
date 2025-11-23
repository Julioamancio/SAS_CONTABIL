
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, Users, FileText, CheckSquare, Settings, LogOut, 
  Menu, Bell, Search, X, ChevronDown, ChevronUp, Filter, Download, 
  Upload, Plus, Trash2, MessageCircle, Send, Bot, FileSpreadsheet, 
  ExternalLink, ChevronLeft, ChevronRight, Printer, Mail, Copy,
  AlertCircle, CheckCircle, DollarSign, BarChart3, PieChart,
  RefreshCw, Calculator, TrendingUp, TrendingDown, Calendar, Lock,
  ArrowUpRight, ArrowDownRight, Briefcase, Eye, EyeOff
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// ==========================================
// MOCK DATA & UTILS
// ==========================================
const initialClientes = [
  { id: 1, razao_social: "Tech Solutions Ltda", nome_fantasia: "TechSol", cnpj: "12.345.678/0001-90", email: "contato@techsol.com", telefone: "(11) 99999-9999", regime_tributario: "Simples Nacional", ativo: true, responsavel: "João Contador", certificado_vencimento: "2024-12-31", valor_honorarios: 1500.00 },
  { id: 2, razao_social: "Padaria do Seu Zé MEI", nome_fantasia: "Pão Quentinho", cnpj: "98.765.432/0001-10", email: "jose@padaria.com", telefone: "(11) 88888-8888", regime_tributario: "MEI", ativo: true, responsavel: "Maria Contadora", certificado_vencimento: "2023-10-15", valor_honorarios: 250.00 },
  { id: 3, razao_social: "Consultoria Empresarial S.A.", nome_fantasia: "Grupo Consult", cnpj: "11.222.333/0001-55", email: "financas@grupoconsult.com", telefone: "(21) 77777-7777", regime_tributario: "Lucro Presumido", ativo: true, responsavel: "João Contador", certificado_vencimento: "2024-05-20", valor_honorarios: 3200.00 },
  { id: 4, razao_social: "Mercado Silva Ltda", nome_fantasia: "Mercado Silva", cnpj: "22.333.444/0001-22", email: "silva@mercado.com", telefone: "(31) 99999-1111", regime_tributario: "Simples Nacional", ativo: true, responsavel: "Maria Contadora", certificado_vencimento: "2024-08-10", valor_honorarios: 1800.00 },
  { id: 5, razao_social: "Construtora Forte", nome_fantasia: "Forte Engenharia", cnpj: "33.444.555/0001-33", email: "eng@forte.com", telefone: "(41) 88888-2222", regime_tributario: "Lucro Presumido", ativo: true, responsavel: "João Contador", certificado_vencimento: "2023-11-30", valor_honorarios: 4500.00 },
];

const initialObrigacoes = [
  { id: 1, cliente_id: 1, nome: "DAS - Simples", competencia: "10/2023", vencimento: "2023-11-20", status: "entregue", tipo: "fiscal" },
  { id: 2, cliente_id: 1, nome: "Folha de Pagamento", competencia: "10/2023", vencimento: "2023-11-05", status: "entregue", tipo: "fiscal" },
  { id: 3, cliente_id: 1, nome: "DAS - Simples", competencia: "11/2023", vencimento: "2023-12-20", status: "pendente", tipo: "fiscal" },
  { id: 4, cliente_id: 2, nome: "DAS - MEI", competencia: "11/2023", vencimento: "2023-12-20", status: "atrasada", tipo: "fiscal" },
  { id: 5, cliente_id: 3, nome: "DCTFWeb", competencia: "11/2023", vencimento: "2023-12-15", status: "pendente", tipo: "fiscal" },
  // Dados simulados de meses anteriores para o gráfico
  { id: 6, cliente_id: 1, nome: "Honorários", competencia: "09/2023", vencimento: "2023-10-10", status: "entregue", tipo: "honorario", valor: 1500.00 },
  { id: 7, cliente_id: 3, nome: "Honorários", competencia: "09/2023", vencimento: "2023-10-10", status: "entregue", tipo: "honorario", valor: 3200.00 },
  { id: 8, cliente_id: 1, nome: "Honorários", competencia: "10/2023", vencimento: "2023-11-10", status: "entregue", tipo: "honorario", valor: 1500.00 },
  { id: 9, cliente_id: 3, nome: "Honorários", competencia: "10/2023", vencimento: "2023-11-10", status: "atrasada", tipo: "honorario", valor: 3200.00 },
  { id: 10, cliente_id: 5, nome: "Honorários", competencia: "10/2023", vencimento: "2023-11-10", status: "entregue", tipo: "honorario", valor: 4500.00 },
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

const Login = ({ onLogin }: { onLogin: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="login-bg">
            <div className="login-card">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                        <Calculator size={36} />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">ContabilApp</h1>
                    <p className="text-[var(--text-muted)] mt-2 text-sm">Gestão inteligente para seu escritório</p>
                </div>
                <div className="flex flex-col gap-5">
                    <div className="form-group">
                        <label className="text-xs font-semibold uppercase tracking-wide">Email</label>
                        <input type="email" className="form-input" placeholder="admin@contabil.com" value={email} onChange={e=>setEmail(e.target.value)}/>
                    </div>
                    <div className="form-group">
                        <label className="text-xs font-semibold uppercase tracking-wide">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 input-icon" size={18} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-input pl-10 pr-10" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={e=>setPassword(e.target.value)}
                            />
                            <button 
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 btn-eye"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button className="btn btn-primary w-full h-12 font-bold text-base mt-2 shadow-lg" onClick={onLogin}>
                        Acessar Painel
                    </button>
                    <div className="text-center mt-6 pt-4 border-t border-[var(--border-color)]">
                        <p className="text-xs text-[var(--text-muted)]">
                            Esqueceu sua senha? <a className="text-blue-500 hover:underline">Recuperar acesso</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

const Sidebar = ({ activeView, setView, collapsed, toggleSidebar, mobileOpen, closeMobileSidebar, onLogout }: any) => {
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
          <div className="logo-container" style={{color: 'var(--text-main)'}}>
             <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white shrink-0 logo-icon">
                <Calculator size={20} />
             </div>
             <span className={`logo-text ${collapsed ? 'hidden' : ''}`}>ContabilApp</span>
          </div>
          <button onClick={toggleSidebar} className="btn-icon hidden-mobile btn-toggle-desktop">
             {collapsed ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
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
            <a className="sidebar-item" onClick={onLogout} style={{padding: collapsed ? '0.5rem 0' : '0.5rem 1rem', justifyContent: collapsed ? 'center' : 'flex-start'}}>
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

// --- CHART COMPONENTS (SVG Based for Zero Dependency) ---

const SimpleBarChart = ({ data, color = "#3b82f6" }: { data: { label: string, value: number }[], color?: string }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end justify-between h-48 gap-2 pt-6">
            {data.map((d, i) => {
                const height = (d.value / maxValue) * 100;
                return (
                    <div key={i} className="flex flex-col items-center flex-1 group cursor-pointer">
                        <div className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-[var(--text-main)] bg-[var(--bg-card)] px-1 rounded shadow border border-[var(--border-color)]">
                            {formatCurrency(d.value)}
                        </div>
                        <div 
                            className="w-full rounded-t transition-all duration-500 hover:opacity-80 relative" 
                            style={{ height: `${height}%`, backgroundColor: color }}
                        ></div>
                        <span className="text-[10px] sm:text-xs text-muted mt-2 truncate w-full text-center">{d.label}</span>
                    </div>
                )
            })}
        </div>
    )
};

const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let cumulativeAngle = 0;

    return (
        <div className="flex items-center gap-6 flex-wrap justify-center">
            <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    {data.map((d, i) => {
                        const percentage = total === 0 ? 0 : (d.value / total) * 100;
                        const strokeDasharray = `${percentage} 100`;
                        const offset = cumulativeAngle;
                        cumulativeAngle -= percentage; // SVG stroke-dashoffset is counter-clockwise, but we rotate chart. Simplified logic:
                        
                        // Better approach for SVG segments
                        const circumference = 2 * Math.PI * 15.9155; // Radius 15.9155 makes circumference ~100
                        const dashVal = (d.value / total) * circumference;
                        const dashOffset = data.slice(0, i).reduce((acc, curr) => acc + ((curr.value / total) * circumference), 0) * -1;

                        return (
                            <circle
                                key={i}
                                cx="50" cy="50" r="15.9155"
                                fill="transparent"
                                stroke={d.color}
                                strokeWidth="8"
                                strokeDasharray={`${dashVal} ${circumference}`}
                                strokeDashoffset={dashOffset}
                                className="transition-all duration-500 hover:opacity-80"
                            />
                        );
                    })}
                    {/* Inner Text */}
                    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="var(--text-main)" className="text-[8px] font-bold">
                         {total} Total
                    </text>
                </svg>
            </div>
            <div className="flex flex-col gap-2">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></span>
                        <span className="text-muted">{d.label}</span>
                        <span className="font-bold ml-auto">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ReportsView = ({ clientes, obrigacoes }: any) => {
    // --- KPI CALCULATIONS ---
    const totalReceita = clientes.reduce((acc:number, c:any) => acc + (c.valor_honorarios || 0), 0);
    const ticketMedio = clientes.length ? totalReceita / clientes.length : 0;
    const inadimplenciaTotal = obrigacoes.filter((o:any) => o.status === 'atrasada' && o.tipo === 'honorario').reduce((acc:number, o:any) => acc + (o.valor || 0), 0);
    
    // --- CHART DATA PREPARATION ---
    // 1. Regimes Tributários (Donut)
    const regimes = clientes.reduce((acc:any, c:any) => {
        acc[c.regime_tributario] = (acc[c.regime_tributario] || 0) + 1;
        return acc;
    }, {});
    const dataRegimes = Object.keys(regimes).map((key, i) => ({
        label: key,
        value: regimes[key],
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 4]
    }));

    // 2. Evolução de Receita (Simulada com dados históricos + projeção)
    const meses = ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];
    // Simulando uma variação pequena para parecer real
    const dataReceita = meses.map((m, i) => ({
        label: m,
        value: totalReceita * (0.85 + (i * 0.03) + (Math.random() * 0.05)) // Simula crescimento
    }));

    // 3. Status Obrigações
    const statusCount = obrigacoes.reduce((acc:any, o:any) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});
    const dataStatus = [
        { label: 'Entregue', value: statusCount['entregue'] || 0, color: '#10b981' },
        { label: 'Pendente', value: statusCount['pendente'] || 0, color: '#f59e0b' },
        { label: 'Atrasado', value: statusCount['atrasada'] || 0, color: '#ef4444' }
    ];

    return (
        <div className="flex-col gap-6">
            {/* TOOLBAR */}
            <div className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-color)]">
                <div>
                    <h1 className="text-xl font-bold">Relatórios Gerenciais</h1>
                    <p className="text-sm text-muted">Visão 360º do escritório</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-outline" onClick={()=>window.print()}><Printer size={18}/> Imprimir PDF</button>
                    <button className="btn btn-primary"><Download size={18}/> Exportar Excel</button>
                </div>
            </div>

            {/* SUMMARY CARDS (KPIs) */}
            <div className="grid-cards">
                <div className="card p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-muted uppercase">Receita Recorrente (MRR)</p>
                            <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalReceita)}</h3>
                        </div>
                        <div className="p-2 bg-green-100 text-green-600 rounded-full"><TrendingUp size={20}/></div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-green-500 font-bold">
                        <ArrowUpRight size={14} className="mr-1"/> +5.2% vs mês anterior
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-muted uppercase">Ticket Médio</p>
                            <h3 className="text-2xl font-bold mt-1">{formatCurrency(ticketMedio)}</h3>
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Users size={20}/></div>
                    </div>
                    <div className="mt-4 text-xs text-muted">
                        Baseado em {clientes.length} clientes ativos
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-muted uppercase">Inadimplência Total</p>
                            <h3 className="text-2xl font-bold mt-1 text-red-500">{formatCurrency(inadimplenciaTotal)}</h3>
                        </div>
                        <div className="p-2 bg-red-100 text-red-600 rounded-full"><AlertCircle size={20}/></div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-red-500 font-bold">
                        <ArrowUpRight size={14} className="mr-1"/> +1.2% vs mês anterior
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-muted uppercase">Eficiência Operacional</p>
                            <h3 className="text-2xl font-bold mt-1">
                                {Math.round((statusCount['entregue'] / obrigacoes.length) * 100)}%
                            </h3>
                        </div>
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><CheckSquare size={20}/></div>
                    </div>
                    <div className="mt-4 text-xs text-muted">
                        Obrigações entregues no prazo
                    </div>
                </div>
            </div>

            {/* MAIN CHARTS SECTION */}
            <div className="grid-2-1">
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2"><BarChart3 size={18}/> Evolução de Faturamento</h3>
                        <select className="form-select w-32 h-8 text-xs"><option>Semestral</option><option>Anual</option></select>
                    </div>
                    <SimpleBarChart data={dataReceita} />
                </div>
                <div className="card">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><PieChart size={18}/> Carteira de Clientes</h3>
                    <DonutChart data={dataRegimes} />
                    <div className="mt-6 pt-4 border-t border-[var(--border-color)] text-center text-xs text-muted">
                        Distribuição por Regime Tributário
                    </div>
                </div>
            </div>

             <div className="grid-2-1">
                <div className="card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase size={18}/> Status das Obrigações</h3>
                    <div className="flex items-center justify-around">
                        <DonutChart data={dataStatus} />
                    </div>
                </div>
                 <div className="card">
                    <h3 className="font-bold text-lg mb-4 text-red-500 flex items-center gap-2"><AlertCircle size={18}/> Top Devedores</h3>
                    <div className="overflow-y-auto max-h-60">
                        <table className="table">
                            <thead><tr><th>Cliente</th><th>Valor</th></tr></thead>
                            <tbody>
                                {clientes
                                    .filter((c:any) => c.valor_honorarios > 2000) // Simulando filtro de risco
                                    .slice(0, 5)
                                    .map((c:any) => (
                                    <tr key={c.id}>
                                        <td><div className="font-bold text-sm">{c.nome_fantasia}</div></td>
                                        <td className="text-red-500 font-bold">{formatCurrency(c.valor_honorarios)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Clients = ({ clientes, setDetailId, setView, setPortalId, onImport, onToggleStatus }: any) => {
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
                <td>
                    <div className="flex items-center gap-2">
                        <label className="switch">
                            <input type="checkbox" checked={c.ativo} onChange={() => onToggleStatus(c.id)} />
                            <span className="slider"></span>
                        </label>
                        <span className={`text-xs font-medium ${c.ativo ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                            {c.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                </td>
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
                        <label>Certificado Digital</label>
                        {isEditing ? (
                            <input type="date" className="form-input" value={formData.certificado_vencimento || ''} onChange={e=>setFormData({...formData, certificado_vencimento: e.target.value})} />
                        ) : (
                            (() => {
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                const venc = formData.certificado_vencimento ? new Date(formData.certificado_vencimento) : null;
                                let status = { color: 'var(--text-muted)', bg: 'transparent', text: 'Não informado', days: null };
                                
                                if(venc) {
                                    venc.setHours(0,0,0,0);
                                    const diffTime = venc.getTime() - today.getTime();
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    
                                    if(diffDays < 0) status = { color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', text: 'Expirado', days: diffDays };
                                    else if(diffDays <= 30) status = { color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)', text: 'Vence em breve', days: diffDays };
                                    else status = { color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)', text: 'Válido', days: diffDays };
                                }

                                return (
                                    <div className="flex items-center justify-between p-2 rounded border border-[var(--border-color)]" style={{backgroundColor: status.bg, borderColor: status.bg !== 'transparent' ? status.color : 'var(--border-color)'}}>
                                        <div className="flex items-center gap-2" style={{color: status.color}}>
                                            {status.days !== null && status.days < 0 ? <AlertCircle size={18}/> : status.days !== null && status.days <= 30 ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm leading-tight">{status.text}</span>
                                                <span className="text-xs opacity-80">{formData.certificado_vencimento ? formatDate(formData.certificado_vencimento) : '-'}</span>
                                            </div>
                                        </div>
                                        {status.days !== null && (
                                            <span className="text-xs font-bold px-2 py-1 rounded bg-white/50" style={{color: status.color}}>
                                                {status.days < 0 ? `${Math.abs(status.days)} dias atrás` : `${status.days} dias`}
                                            </span>
                                        )}
                                    </div>
                                );
                            })()
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
                                        {/* Pay Now Button for overdue obligations */}
                                        {ob.status === 'atrasada' && (
                                            <button className="btn btn-sm btn-primary" onClick={() => {
                                                const paymentLink = `https://pagamento.exemplo.com/${ob.id}`;
                                                const msg = `Olá ${cliente.responsavel}, segue o link para pagamento da obrigação atrasada ${ob.nome}: ${paymentLink}`;
                                                if(confirm(`Gerar link de pagamento para ${ob.nome}?\n\nLink simulado: ${paymentLink}`)) {
                                                    // Simulate sharing options
                                                    const method = prompt("Enviar via: 1-WhatsApp, 2-Email", "1");
                                                    if(method === "1") {
                                                        const phone = cliente.telefone.replace(/\D/g, '');
                                                        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                                                    }
                                                    else if(method === "2") window.open(`mailto:${cliente.email}?subject=Pagamento&body=${encodeURIComponent(msg)}`);
                                                }
                                            }}><DollarSign size={14}/> Pagar Agora</button>
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
                                    <td>{ob.status==='entregue' ? <button className="btn btn-sm btn-primary" onClick={()=>alert(`Baixando guia ${ob.nome}...`)}><Download size={14}/> Baixar</button> : <span className="text-xs text-muted">Aguarde</span>}</td>
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
                             <button className="btn-icon" onClick={()=>alert(`Baixando ${doc.descricao}...`)}><Download size={16}/></button>
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
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Login State
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
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => { setIsAuthenticated(false); setView('dashboard'); };

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
  
  const handleToggleStatus = (id: number) => {
      setClientes(clientes.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c));
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

  // View Logic
  if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
  }

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
        <Sidebar 
            activeView={view} 
            setView={setView} 
            collapsed={sidebarCollapsed} 
            toggleSidebar={()=>setSidebarCollapsed(!sidebarCollapsed)} 
            mobileOpen={mobileOpen} 
            closeMobileSidebar={()=>setMobileOpen(false)} 
            onLogout={handleLogout}
        />
        
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
                {view === 'clientes' && <Clients clientes={clientes} setDetailId={setDetailId} setView={setView} setPortalId={setPortalId} onImport={(novos:any)=>setClientes([...clientes, ...novos])} onToggleStatus={handleToggleStatus} />}
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
