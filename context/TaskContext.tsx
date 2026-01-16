
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Task } from '../types';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  addTask: (text: string, dueDate: string | null) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
      localStorage.removeItem('tasks');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text: string, dueDate: string | null) => {
    if (!user) return;
    const newTask: Task = {
      id: `TASK-${Date.now()}`,
      text,
      dueDate,
      isCompleted: false,
      userId: user.email,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const userTasks = tasks.filter(task => task.userId === user?.email);

  return (
    <TaskContext.Provider value={{ tasks: userTasks, addTask, toggleTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};