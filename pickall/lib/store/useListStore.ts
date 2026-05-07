import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NameList {
  id: string;
  name: string;
  items: string[];
  createdAt: number;
  updatedAt: number;
}

interface ListState {
  lists: NameList[];
  currentListId: string | null;
  addList: (list: Omit<NameList, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateList: (id: string, updates: Partial<Omit<NameList, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteList: (id: string) => void;
  setCurrentList: (id: string | null) => void;
}

export const useListStore = create<ListState>()(
  persist(
    (set) => ({
      lists: [],
      currentListId: null,

      addList: (listData) => set((state) => {
        const newList: NameList = {
          ...listData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const updatedLists = [...state.lists, newList];
        return {
          lists: updatedLists,
          currentListId: newList.id,
        };
      }),

      updateList: (id, updates) => set((state) => ({
        lists: state.lists.map((list) =>
          list.id === id ? { ...list, ...updates, updatedAt: Date.now() } : list
        ),
      })),

      deleteList: (id) => set((state) => ({
        lists: state.lists.filter((list) => list.id !== id),
        currentListId: state.currentListId === id ? null : state.currentListId,
      })),

      setCurrentList: (id) => set({ currentListId: id }),
    }),
    {
      name: 'pickall-lists-storage',
    }
  )
);
