
import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useLocalization } from '../context/LocalizationContext';
import { TrashIcon, CheckSquareIcon, PlusIcon, ClipboardListIcon } from './icons';
import { Task } from '../types';

const FarmTasksPage: React.FC = () => {
    const { tasks, addTask, toggleTask, deleteTask } = useTasks();
    const { t } = useLocalization();
    const [newTaskText, setNewTaskText] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            addTask(newTaskText.trim(), newDueDate || null);
            setNewTaskText('');
            setNewDueDate('');
            setIsExpanded(false);
        }
    };

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) {
                return a.isCompleted ? 1 : -1;
            }
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            return a.dueDate ? -1 : 1;
        });
    }, [tasks]);
    
    const isOverdue = (dueDate: string | null) => {
        if (!dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [year, month, day] = dueDate.split('-').map(Number);
        const taskDate = new Date(year, month - 1, day);
        return taskDate < today;
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in max-w-lg pb-40">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-cyan-50 p-3 rounded-2xl">
                    <ClipboardListIcon className="w-7 h-7 text-cyan-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-secondary tracking-tighter leading-none">{t('farmTasksPage.title')}</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Farm Activity Logs</p>
                </div>
            </div>

            <div className="space-y-3">
                {sortedTasks.length > 0 ? (
                    sortedTasks.map(task => (
                        <div 
                            key={task.id} 
                            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all group ${task.isCompleted ? 'opacity-50' : ''}`}
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <button 
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${task.isCompleted ? 'bg-primary border-primary text-white' : 'border-gray-200 bg-white text-transparent'}`}
                                >
                                    <CheckSquareIcon className="w-5 h-5" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold tracking-tight truncate ${task.isCompleted ? 'line-through text-gray-400' : 'text-dark'}`}>{task.text}</p>
                                    {task.dueDate && (
                                        <div className="text-[10px] mt-0.5">
                                             <span className={`font-black uppercase tracking-tighter ${!task.isCompleted && isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-400'}`}>
                                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                {!task.isCompleted && isOverdue(task.dueDate) && ` • ${t('farmTasksPage.overdue')}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => deleteTask(task.id)} 
                                className="text-gray-200 hover:text-red-500 p-2 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 px-6 bg-white border border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-400 font-bold text-sm">{t('farmTasksPage.noTasks')}</p>
                    </div>
                )}
            </div>

            {/* Bottom Add Note Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 z-30 pointer-events-none">
                <div className="max-w-lg mx-auto pointer-events-auto">
                    {isExpanded ? (
                        <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 animate-slide-up mb-2">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('farmTasksPage.addNote')}</h3>
                                <button onClick={() => setIsExpanded(false)} className="text-gray-400 text-2xl leading-none">&times;</button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    autoFocus
                                    type="text"
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    placeholder={t('farmTasksPage.addTaskPlaceholder')}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all text-base font-bold"
                                />
                                <div className="flex gap-3">
                                    <input
                                        type="date"
                                        value={newDueDate}
                                        onChange={(e) => setNewDueDate(e.target.value)}
                                        className="flex-1 px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white outline-none text-xs font-black uppercase"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!newTaskText.trim()}
                                        className="bg-primary text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-30 active:scale-95 transition-all"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsExpanded(true)}
                            className="w-full h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-between px-6 hover:bg-secondary transition-all active:scale-95 mb-4"
                        >
                            <span className="font-black text-[10px] uppercase tracking-[0.2em]">{t('farmTasksPage.addNote')}</span>
                            <div className="bg-white/20 p-2 rounded-full">
                                <PlusIcon className="w-4 h-4" />
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmTasksPage;
