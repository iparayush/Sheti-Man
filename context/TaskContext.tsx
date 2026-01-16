
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Task } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabaseClient';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (text: string, dueDate: string | null) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('is_completed', { ascending: true })
        .order('due_date', { ascending: true });

      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        // Map DB snake_case to JS camelCase
        const mapped = (data || []).map((t: any) => ({
          id: t.id,
          text: t.text,
          dueDate: t.due_date,
          isCompleted: t.is_completed,
          userId: t.user_id
        }));
        setTasks(mapped);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [user]);

  const addTask = async (text: string, dueDate: string | null) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newTaskData = {
      id: `TASK-${Date.now()}`,
      text,
      due_date: dueDate,
      is_completed: false,
      user_id: session.user.id,
    };

    const { error } = await supabase.from('tasks').insert([newTaskData]);
    
    if (error) {
      console.error("Error adding task:", error);
    } else {
      setTasks(prev => [...prev, {
        id: newTaskData.id,
        text: newTaskData.text,
        dueDate: newTaskData.due_date,
        isCompleted: newTaskData.is_completed,
        userId: session.user.id
      }]);
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !task.isCompleted })
      .eq('id', taskId);

    if (error) {
      console.error("Error toggling task:", error);
    } else {
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
      );
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error("Error deleting task:", error);
    } else {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, toggleTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
