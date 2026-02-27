import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { HistoryItem, AnalysisResult } from '@/types';

const HISTORY_KEY = 'cosmetic_scanner_history';

export const [HistoryProvider, useHistory] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);

  const historyQuery = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored) as HistoryItem[];
      }
      return [] as HistoryItem[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (items: HistoryItem[]) => {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items));
      return items;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['history'], data);
    },
  });

  useEffect(() => {
    if (historyQuery.data) {
      setHistory(historyQuery.data);
    }
  }, [historyQuery.data]);

  const saveToHistory = useCallback((analysis: AnalysisResult, productName?: string) => {
    const item: HistoryItem = {
      id: analysis.id,
      date: analysis.date,
      productName: productName || analysis.productName || 'Без названия',
      overallRating: analysis.overallRating,
      analysis,
    };
    const updated = [item, ...history.filter(h => h.id !== item.id)];
    setHistory(updated);
    saveMutation.mutate(updated);
  }, [history, saveMutation]);

  const removeFromHistory = useCallback((id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    saveMutation.mutate(updated);
  }, [history, saveMutation]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveMutation.mutate([]);
  }, [saveMutation]);

  const getHistoryItem = useCallback((id: string): HistoryItem | undefined => {
    return history.find(h => h.id === id);
  }, [history]);

  const importHistory = useCallback((items: HistoryItem[]) => {
    setHistory(items);
    saveMutation.mutate(items);
  }, [saveMutation]);

  return {
    history,
    isLoading: historyQuery.isLoading,
    currentAnalysis,
    setCurrentAnalysis,
    saveToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryItem,
    importHistory,
  };
});
