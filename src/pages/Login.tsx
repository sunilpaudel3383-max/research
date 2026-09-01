import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { Beaker } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if any admins exist to determine if we are in first-setup mode
    const checkSetup = async () => {
      try {
        const snap = await getDocs(collection(db, 'admins'));
        if (snap.empty) {
          setIsFirstSetup(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkSetup();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isFirstSetup) {
        // Create the first admin
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'admins', cred.user.uid), { email });
        await setDoc(doc(db, 'users', cred.user.uid), { email, name: 'Admin User' });
      } else {
        // Normal login
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/portal');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-[#F1F5F9] font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-sm flex items-center justify-center text-white font-bold text-2xl"><Beaker className="w-6 h-6"/></div>
        </div>
        <h2 className="mt-6 text-center text-xl font-bold leading-9 tracking-tight text-slate-900 uppercase">
          {isFirstSetup ? 'Setup Administrator' : 'Member Portal Login'}
        </h2>
        <p className="text-center text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
          {isFirstSetup 
            ? 'Create the first admin account to manage the portal.' 
            : 'Use the credentials provided by your administrator.'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-sm shadow-sm border border-slate-200">
        <form className="space-y-6" onSubmit={handleAuth}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-sm text-[10px] font-bold uppercase tracking-widest text-center border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold leading-6 text-slate-400 uppercase tracking-widest">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-sm border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] font-bold leading-6 text-slate-400 uppercase tracking-widest">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-sm border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 bg-slate-50"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-sm bg-slate-900 px-3 py-3 text-[11px] font-bold tracking-wider uppercase text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : isFirstSetup ? 'Create Admin Account' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
