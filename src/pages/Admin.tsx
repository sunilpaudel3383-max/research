import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db, secondaryAuth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PortalLayout } from '../components/PortalLayout';

interface UserData {
  id: string;
  email: string;
  name: string;
}

export function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserData[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/portal');
    } else if (isAdmin) {
      loadData();
    }
  }, [user, isAdmin, loading, navigate]);

  const loadData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as UserData)));

      const groupsSnap = await getDocs(collection(db, 'groups'));
      setGroups(groupsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Use secondaryAuth to prevent logging out the current admin
      const credential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const uid = credential.user.uid;
      
      // Store in our users collection
      await setDoc(doc(db, 'users', uid), {
        email: newEmail,
        name: newName
      });
      
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      loadData();
    } catch (e: any) {
      setError(e.message || 'Error creating user');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'groups'), {
        name: groupName,
        description: groupDesc,
        members: [] // admin is implicit, so members start empty
      });
      setGroupName('');
      setGroupDesc('');
      loadData();
    } catch (e: any) {
      setError(e.message || 'Error creating group');
    }
  };

  const toggleGroupMember = async (groupId: string, memberId: string, isMember: boolean) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    let updatedMembers = [...(group.members || [])];
    if (isMember) {
      updatedMembers = updatedMembers.filter(m => m !== memberId);
    } else {
      updatedMembers.push(memberId);
    }
    
    await updateDoc(doc(db, 'groups', groupId), {
      members: updatedMembers
    });
    
    loadData();
  };

  if (loading || !isAdmin) return null;

  return (
    <PortalLayout title="Admin Console">
      <div className="flex-1 p-8 overflow-auto bg-[#F1F5F9]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Create Member */}
          <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tighter mb-4">Create Member Credentials</h2>
            {error && <div className="mb-4 text-red-600 text-[10px] uppercase font-bold">{error}</div>}
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} className="mt-1 block w-full rounded-sm border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm px-3 py-2 border bg-slate-50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="mt-1 block w-full rounded-sm border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm px-3 py-2 border bg-slate-50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <input type="text" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full rounded-sm border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm px-3 py-2 border bg-slate-50" />
              </div>
              <button type="submit" className="w-full justify-center rounded-sm border border-transparent bg-slate-900 py-2 px-4 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-slate-800 transition-colors">
                Generate Credentials
              </button>
            </form>
          </div>

          {/* Create Group */}
          <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tighter mb-4">Create Research Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Name</label>
                <input type="text" required value={groupName} onChange={e => setGroupName(e.target.value)} className="mt-1 block w-full rounded-sm border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm px-3 py-2 border bg-slate-50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <input type="text" required value={groupDesc} onChange={e => setGroupDesc(e.target.value)} className="mt-1 block w-full rounded-sm border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm px-3 py-2 border bg-slate-50" />
              </div>
              <button type="submit" className="w-full justify-center rounded-sm border border-transparent bg-indigo-600 py-2 px-4 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-indigo-500 transition-colors mt-auto">
                Create Group
              </button>
            </form>
          </div>

          {/* Manage Groups & Members */}
          <div className="md:col-span-2 bg-white p-6 rounded-sm shadow-sm border border-slate-200 mt-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tighter mb-4">Group Memberships</h2>
            <div className="space-y-4">
              {groups.map(group => (
                <div key={group.id} className="border border-slate-200 rounded-sm p-4 bg-slate-50 flex flex-col gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tighter">{group.name}</h3>
                    <p className="text-[10px] font-medium text-slate-500">{group.description}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-sm border border-slate-200">
                    {users.map(u => {
                      const isMember = (group.members || []).includes(u.id);
                      return (
                        <label key={u.id} className="flex items-center space-x-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={isMember}
                            onChange={() => toggleGroupMember(group.id, u.id, isMember)}
                            className="h-3.5 w-3.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors truncate">{u.name}</span>
                        </label>
                      );
                    })}
                    {users.length === 0 && <span className="text-[10px] text-slate-400 font-medium uppercase">No members created yet.</span>}
                  </div>
                </div>
              ))}
              {groups.length === 0 && <p className="text-[10px] text-slate-400 font-medium uppercase">No groups created yet.</p>}
            </div>
          </div>

        </div>
      </div>
    </PortalLayout>
  );
}
