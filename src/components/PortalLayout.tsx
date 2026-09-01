import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { Beaker, LogOut } from 'lucide-react';

export function PortalLayout({ children, title }: { children: React.ReactNode, title?: string }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <div className="h-full w-full bg-[#F1F5F9] text-slate-800 font-sans flex flex-col overflow-hidden">
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center text-white font-bold text-lg"><Beaker className="w-5 h-5"/></div>
          <span className="text-lg font-bold tracking-tight text-slate-900 uppercase">Nexus Research Lab</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/portal" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 border-b-2 border-transparent hover:border-indigo-600 pb-5 pt-5 mt-[-1px]">Research Portal</Link>
          {isAdmin && (
            <Link
              to="/portal/admin"
              className="text-sm font-semibold text-slate-500 hover:text-indigo-600 border-b-2 border-transparent hover:border-indigo-600 pb-5 pt-5 mt-[-1px]"
            >
              Admin Setup
            </Link>
          )}
          <div className="flex items-center gap-2 pl-6 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-bold uppercase text-slate-500 truncate max-w-[150px]">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="ml-2 text-slate-400 hover:text-red-500 p-1 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* We move title and children rendering into a flex container */}
        <main className="flex-1 flex flex-col min-w-0">
          {title && (
            <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
              <h2 className="text-xs font-bold text-slate-600 tracking-tight uppercase">{title}</h2>
            </div>
          )}
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
