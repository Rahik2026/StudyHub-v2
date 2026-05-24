import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { subscribeToCollection, addHomework, updateHomework, deleteHomework } from '../services/db';
import { where, orderBy } from 'firebase/firestore';
import { Plus, Trash2, CheckCircle, Circle, Link as LinkIcon, ExternalLink } from 'lucide-react';

const Homework = () => {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', subject: '', dueDate: '', driveLink: '' });

  useEffect(() => {
    if (!user) return;
    return subscribeToCollection(
      'homework',
      [where('userId', '==', user.uid), orderBy('createdAt', 'desc')],
      setHomework
    );
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.driveLink && !formData.driveLink.includes('drive.google.com')) {
      alert('Please enter a valid Google Drive link');
      return;
    }
    await addHomework({ ...formData, userId: user.uid });
    setFormData({ title: '', subject: '', dueDate: '', driveLink: '' });
    setIsModalOpen(false);
  };

  const toggleStatus = async (id, currentStatus) => {
    await updateHomework(id, { status: currentStatus === 'done' ? 'pending' : 'done' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Homework</h1>
          <p className="text-slate-500">Manage your assignments and tasks</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homework.map((hw) => (
          <div key={hw.id} className={`glass-card p-6 rounded-2xl border-l-4 ${hw.status === 'done' ? 'border-emerald-500' : 'border-blue-500'}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase">
                {hw.subject}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleStatus(hw.id, hw.status)} className="text-slate-400 hover:text-emerald-500 transition-colors">
                  {hw.status === 'done' ? <CheckCircle className="text-emerald-500" /> : <Circle />}
                </button>
                <button onClick={() => deleteHomework(hw.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${hw.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
              {hw.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <span>Due: {hw.dueDate}</span>
            </div>
            {hw.driveLink && (
              <a 
                href={hw.driveLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
              >
                <LinkIcon className="w-4 h-4" /> Google Drive <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Homework</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    placeholder="e.g. Math"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Google Drive Link (Optional)</label>
                <input 
                  type="url" 
                  className="input-field" 
                  value={formData.driveLink}
                  onChange={e => setFormData({...formData, driveLink: e.target.value})}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 font-medium">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homework;
