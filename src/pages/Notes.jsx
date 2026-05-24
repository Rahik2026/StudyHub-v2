import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { subscribeToCollection, addNote, updateNote, deleteNote } from '../services/db';
import { where, orderBy } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { Plus, Search, Edit3, Trash2, X, Save, Eye } from 'lucide-react';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: null, title: '', content: '', subject: '' });

  useEffect(() => {
    if (!user) return;
    return subscribeToCollection(
      'notes',
      [where('userId', '==', user.uid), orderBy('updatedAt', 'desc')],
      setNotes
    );
  }, [user]);

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!currentNote.title || !currentNote.content) return;
    
    if (currentNote.id) {
      await updateNote(currentNote.id, { 
        title: currentNote.title, 
        content: currentNote.content, 
        subject: currentNote.subject 
      });
    } else {
      await addNote({ 
        ...currentNote, 
        userId: user.uid 
      });
    }
    closeEditor();
  };

  const openEditor = (note = { id: null, title: '', content: '', subject: '' }) => {
    setCurrentNote(note);
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setIsPreview(false);
    setCurrentNote({ id: null, title: '', content: '', subject: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notes</h1>
          <p className="text-slate-500">Study notes and resources in Markdown</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => openEditor()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> New Note
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div key={note.id} className="glass-card p-6 rounded-2xl group relative overflow-hidden h-64 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-bold uppercase">
                {note.subject || 'General'}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditor(note)} className="p-1 text-slate-400 hover:text-blue-600">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteNote(note.id)} className="p-1 text-slate-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">{note.title}</h3>
            <div className="flex-1 text-slate-500 text-sm overflow-hidden prose prose-slate line-clamp-6">
               <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex gap-4 flex-1 mr-4">
                <input 
                  type="text" 
                  placeholder="Note Title" 
                  className="bg-transparent border-none text-xl font-bold focus:ring-0 w-full"
                  value={currentNote.title}
                  onChange={e => setCurrentNote({...currentNote, title: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Subject" 
                  className="bg-transparent border-none text-sm font-medium text-slate-500 focus:ring-0 w-32"
                  value={currentNote.subject}
                  onChange={e => setCurrentNote({...currentNote, subject: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsPreview(!isPreview)} 
                  className={`p-2 rounded-lg transition-colors ${isPreview ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-200'}`}
                  title="Toggle Preview"
                >
                  {isPreview ? <Edit3 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={closeEditor} className="p-2 hover:bg-slate-200 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
              {!isPreview ? (
                <textarea 
                  className="w-full h-full p-6 outline-none resize-none font-mono text-sm leading-relaxed"
                  placeholder="Write your note in Markdown here..."
                  value={currentNote.content}
                  onChange={e => setCurrentNote({...currentNote, content: e.target.value})}
                />
              ) : (
                <div className="w-full h-full p-8 overflow-y-auto prose max-w-none">
                  <ReactMarkdown>{currentNote.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
