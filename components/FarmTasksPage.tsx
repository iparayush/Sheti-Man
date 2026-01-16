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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            addTask(newTaskText.trim(), newDueDate || null);
            setNewTaskText('');
            setNewDueDate('');
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
        <div className="container mx-auto px-4 py-10 animate-fade-in max-w-lg pb-28">
            <div className="flex items-center gap-5 mb-10">
                <div className="bg-primary/10 p-4 rounded-2xl">
                    <ClipboardListIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-secondary tracking-tighter leading-none">{t('farmTasksPage.title')}</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1.5">Manage your daily work</p>
                </div>
            </div>

            <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 mb-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex-grow">
                        <label htmlFor="task-text" className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2.5">{t('farmTasksPage.addTaskPlaceholder')}</label>
                        <input
                            id="task-text"
                            type="text"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder={t('farmTasksPage.addTaskPlaceholder')}
                            className="w-full px-5 py-4.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all text-lg font-semibold"
                        />
                    </div>
                    <div className="flex items-end gap-5">
                        <div className="flex-grow">
                             <label htmlFor="due-date" className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2.5">{t('farmTasksPage.dueDateLabel')}</label>
                            <input
                                id="due-date"
                                type="date"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:outline-none transition-all text-lg font-bold text-dark"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!newTaskText.trim()}
                            className="bg-primary text-white p-5 rounded-xl hover:bg-secondary transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center disabled:opacity-30 disabled:shadow-none min-w-[65px]"
                        >
                            <PlusIcon className="w-7 h-7" />
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-5">
                {sortedTasks.length > 0 ? (
                    sortedTasks.map(task => (
                        <div 
                            key={task.id} 
                            className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between transition-all group ${task.isCompleted ? 'opacity-50' : ''}`}
                        >
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                <button 
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border-2 transition-all duration-300 ${task.isCompleted ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-gray-200 bg-white text-transparent group-hover:border-primary/40'}`}
                                >
                                    <CheckSquareIcon className="w-7 h-7" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-lg font-bold tracking-tight truncate ${task.isCompleted ? 'line-through text-gray-400' : 'text-dark'}`}>{task.text}</p>
                                    {task.dueDate && (
                                        <div className="text-sm flex items-center gap-2 mt-1.5">
                                             <span className={`font-black uppercase tracking-tighter ${!task.isCompleted && isOverdue(task.dueDate) ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                {!task.isCompleted && isOverdue(task.dueDate) && ` • ${t('farmTasksPage.overdue')}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => deleteTask(task.id)} 
                                className="text-gray-300 hover:text-red-500 p-3.5 rounded-xl transition-all active:scale-90" 
                                aria-label="Delete task"
                            >
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 px-10 bg-white/50 border border-dashed border-gray-200 rounded-2xl">
                        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ClipboardListIcon className="w-12 h-12 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold text-lg mb-3">{t('farmTasksPage.noTasks')}</p>
                        <p className="text-sm text-gray-400 font-black uppercase tracking-widest">Organize your work better</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmTasksPage;