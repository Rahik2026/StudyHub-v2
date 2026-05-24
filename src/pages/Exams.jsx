import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { subscribeToCollection, addExam, deleteExam } from '../services/db';
import { where, orderBy } from 'firebase/firestore';
import { Calendar, Plus, Trash2, Clock, MapPin } from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';

const Exams = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: '', topic: '', date: '', time: '', location: '' });

  useEffect(() => {
    if (!user) return;
    return subscribeToCollection(
      'exams',
      [where('userId', '==', user.uid), orderBy('date', 'asc')],
      setExams
    );
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addExam({ ...formData, userId: user.uid });
    setFormData({ subject: '', topic: '', date: '', time: '', location: '' });
    setIsModalOpen(false);
  };

  const getCountdown = (date) => {
    const diff = differenceInDays(parseISO(date), new Date());
    if (diff === 0) return 'Today!';
    if (diff < 0) return 'Passed';
    return `${diff} days left`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exams</h1>
          <p className="text-slate-500">Track your upcoming tests and exams</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Schedule Exam
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => {
          const countdown = getCountdown(exam.date);
          const isSoon = countdown !== 'Passed' && parseInt(countdown) < 7;

          return (
            <div key={exam.id} className="glass-card rounded-2xl overflow-hidden flex flex-col">
              <div className={`p-1 ${isSoon ? 'bg-amber-500' : 'bg-blue-600'}`}></div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${isSoon ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                    {exam.subject}
                  </span>
                  <button onClick={() => deleteExam(exam.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-1">{exam.topic}</h3>
                <p className="text-3xl font-black text-slate-900 mb-6">{countdown}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{format(parseISO(exam.date), 'MMMM do, yyyy')}</span>
                  </div>
                  {exam.time && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{exam.time}</span>
                    </div>
                  )}
                  {exam.location && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{exam.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Schedule New Exam</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input type="text" className="input-field" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required placeholder="e.g. Physics" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                  <input type="text" className="input-field" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} required placeholder="e.g. Quantum" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input type="time" className="input-field" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location / Link</label>
                <input type="text" className="input-field" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Room 204 or Zoom link" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 font-medium">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
