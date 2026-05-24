import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { subscribeToCollection } from '../services/db';
import { where, orderBy, limit } from 'firebase/firestore';
import { 
  CheckSquare, 
  Calendar, 
  BookOpen, 
  Clock, 
  TrendingUp,
  ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [exams, setExams] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!user) return;

    const unsubHW = subscribeToCollection(
      'homework', 
      [where('userId', '==', user.uid), where('status', '==', 'pending'), orderBy('dueDate', 'asc'), limit(3)],
      setHomework
    );

    const unsubExams = subscribeToCollection(
      'exams', 
      [where('userId', '==', user.uid), orderBy('date', 'asc'), limit(3)],
      setExams
    );

    const unsubNotes = subscribeToCollection(
      'notes', 
      [where('userId', '==', user.uid), orderBy('updatedAt', 'desc'), limit(3)],
      setNotes
    );

    return () => {
      unsubHW();
      unsubExams();
      unsubNotes();
    };
  }, [user]);

  const stats = [
    { label: 'Pending Tasks', value: homework.length, icon: CheckSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Upcoming Exams', value: exams.length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Total Notes', value: notes.length, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Hello, {user?.displayName?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500">Here's what's happening today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={`${stat.color} w-6 h-6`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Homework Preview */}
        <section className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              Recent Homework
            </h2>
            <Link to="/homework" className="text-blue-600 text-sm font-medium hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {homework.length > 0 ? homework.map((hw) => (
              <div key={hw.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <h3 className="font-medium text-slate-800">{hw.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Due {hw.dueDate}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs uppercase font-semibold">
                    {hw.subject}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400">No pending homework</div>
            )}
          </div>
        </section>

        {/* Exams Preview */}
        <section className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Upcoming Exams
            </h2>
            <Link to="/exams" className="text-purple-600 text-sm font-medium hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {exams.length > 0 ? exams.map((exam) => (
              <div key={exam.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <h3 className="font-medium text-slate-800">{exam.subject}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {exam.date}
                  </span>
                  <span className="text-purple-600 font-medium italic">
                    {exam.topic}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400">No upcoming exams</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
