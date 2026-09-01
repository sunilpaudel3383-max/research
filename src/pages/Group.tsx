import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, onSnapshot, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PortalLayout } from '../components/PortalLayout';
import { getDriveToken, uploadToDrive } from '../lib/drive';
import { FileText, Trash2, Upload, ExternalLink } from 'lucide-react';

interface Literature {
  id: string;
  title: string;
  driveFileId: string;
  driveLink: string;
  uploadedBy: string;
  uploaderName: string;
  uploadedAt: number;
}

export function Group() {
  const { groupId } = useParams();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);
  const [manuscript, setManuscript] = useState('');
  const [literatures, setLiteratures] = useState<Literature[]>([]);
  
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!groupId || !user) return;

    // Load group info
    const loadGroup = async () => {
      const g = await getDoc(doc(db, 'groups', groupId));
      if (g.exists()) setGroup(g.data());
    };
    loadGroup();

    // Listen to real-time manuscript
    const unsubManuscript = onSnapshot(doc(db, 'manuscripts', groupId), (docSnap) => {
      if (docSnap.exists() && docSnap.data().lastUpdatedBy !== user.uid) {
        setManuscript(docSnap.data().content || '');
      } else if (!docSnap.exists()) {
        setManuscript('');
      }
    });

    // Listen to literatures
    const q = query(collection(db, `groups/${groupId}/literatures`), orderBy('uploadedAt', 'desc'));
    const unsubLit = onSnapshot(q, (snap) => {
      const lits = snap.docs.map(d => ({ id: d.id, ...d.data() } as Literature));
      setLiteratures(lits);
    });

    return () => {
      unsubManuscript();
      unsubLit();
    };
  }, [groupId, user]);

  const handleManuscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setManuscript(newVal);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Debounce save to Firestore
    typingTimeoutRef.current = setTimeout(async () => {
      if (groupId && user) {
        await setDoc(doc(db, 'manuscripts', groupId), {
          content: newVal,
          lastUpdatedBy: user.uid
        });
      }
    }, 1000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !groupId || !user) return;
    
    setUploading(true);
    setUploadError('');
    
    try {
      const token = await getDriveToken();
      
      // Upload to Drive
      const folderName = `Research - ${group?.name || 'Group'}`;
      const driveInfo = await uploadToDrive(file, token, folderName);
      
      // Save metadata to Firestore
      const newLitRef = doc(collection(db, `groups/${groupId}/literatures`));
      await setDoc(newLitRef, {
        title: file.name,
        driveFileId: driveInfo.id,
        driveLink: driveInfo.link,
        uploadedBy: user.uid,
        uploaderName: user.email, // Can use name if fetched
        uploadedAt: Date.now()
      });
      
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteLit = async (litId: string) => {
    if (!groupId) return;
    try {
      await deleteDoc(doc(db, `groups/${groupId}/literatures`, litId));
      // Note: We don't delete from Google Drive here to keep it simple, 
      // but in a full app we could use the drive REST API to delete/trash.
    } catch (e) {
      console.error(e);
      alert('Failed to delete literature.');
    }
  };

  if (loading || !group) return null;

  return (
    <PortalLayout title={`Manuscript: '${group.name}'`}>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden border-t border-slate-200">
        
        {/* Collaborative Editor */}
        <section className="lg:col-span-8 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col overflow-auto bg-[#FAFAFA]">
            <textarea
              value={manuscript}
              onChange={handleManuscriptChange}
              className="flex-1 w-full max-w-4xl mx-auto p-8 bg-transparent font-serif leading-relaxed text-slate-800 text-sm focus:outline-none resize-none"
              placeholder="Start writing the manuscript here... (Changes sync automatically)"
            />
          </div>
          <div className="h-10 bg-white border-t border-slate-200 flex items-center px-4 justify-between text-[10px] font-medium text-slate-400 shrink-0">
            <span>Editor Active</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Real-time Sync: Active
            </span>
          </div>
        </section>

        {/* Literature Section */}
        <section className="lg:col-span-4 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Literature Repository</h3>
              <label className="cursor-pointer text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors">
                + Upload Paper
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".pdf,.doc,.docx,.txt"
                />
              </label>
            </div>
            {uploading && <div className="text-[10px] text-indigo-600 font-medium">Uploading to Drive...</div>}
            {uploadError && <div className="text-[10px] text-red-600 font-medium">{uploadError}</div>}
          </div>
          
          <div className="flex-1 overflow-auto bg-slate-50 p-2 space-y-1">
            {literatures.length === 0 ? (
              <div className="text-center text-[10px] font-medium text-slate-400 mt-10 uppercase tracking-widest">
                No literature uploaded
              </div>
            ) : (
              literatures.map(lit => (
                <div key={lit.id} className="group p-3 bg-white border border-slate-200 rounded-sm flex items-center justify-between hover:shadow-sm transition-all">
                  <div className="flex flex-col overflow-hidden pr-2">
                    <a href={lit.driveLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-700 truncate hover:text-indigo-600 transition-colors">
                      {lit.title}
                    </a>
                    <span className="text-[10px] text-slate-400 italic truncate">
                      Uploaded by: {lit.uploadedBy === user?.uid ? 'You' : lit.uploaderName}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {(isAdmin || lit.uploadedBy === user?.uid) && (
                      <button 
                        onClick={() => handleDeleteLit(lit.id)}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="h-32 bg-slate-900 p-4 flex flex-col justify-center shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Cloud Sync Status</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Literature files are automatically securely backed up to Google Drive.
            </p>
          </div>
        </section>

      </div>
    </PortalLayout>
  );
}
