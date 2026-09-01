import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PortalLayout } from '../components/PortalLayout';
import { Users, Folder } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
}

export function Portal() {
  const { user, isAdmin, loading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      loadGroups();
    }
  }, [user, loading, navigate]);

  const loadGroups = async () => {
    if (!user) return;
    
    // Check if we need to claim admin (demo purposes only)
    try {
      const adminsSnapshot = await getDocs(collection(db, 'admins'));
      if (adminsSnapshot.empty && !isAdmin) {
        await setDoc(doc(db, 'admins', user.uid), { email: user.email });
        window.location.reload(); // Reload to refresh admin claim
      }
    } catch (e) {
      console.error(e);
    }

    try {
      let q;
      if (isAdmin) {
        // Admin sees all groups
        q = query(collection(db, 'groups'));
      } else {
        // Members see groups they belong to
        q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid));
      }
      
      const snapshot = await getDocs(q);
      const groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
      setGroups(groupsData);
    } catch (error) {
      console.error("Error loading groups", error);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!user) return null;

  return (
    <PortalLayout title="My Research Groups">
      <div className="flex-1 p-8 overflow-auto bg-[#F1F5F9]">
        {groups.length === 0 ? (
          <div className="text-center rounded-lg border-2 border-dashed border-slate-300 p-12">
            <Folder className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">No groups</h3>
            <p className="mt-1 text-sm text-slate-500">
              {isAdmin 
                ? "You haven't created any research groups yet." 
                : "You haven't been added to any research groups yet."}
            </p>
            {isAdmin && (
              <div className="mt-6">
                <Link
                  to="/portal/admin"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  <Users className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                  Manage Groups & Members
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/portal/group/${group.id}`}
                className="col-span-1 bg-white border border-slate-200 rounded-sm hover:border-indigo-500 hover:shadow-sm transition-all"
              >
                <div className="flex w-full items-center justify-between p-6">
                  <div className="flex-1 truncate">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tighter truncate">{group.name}</h3>
                    <p className="mt-2 text-sm text-slate-500 truncate">{group.description}</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                    Open Workspace &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
