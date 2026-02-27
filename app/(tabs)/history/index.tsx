import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Trash2, XCircle, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useHistory } from '@/contexts/HistoryContext';
import { HistoryItem, OverallRating } from '@/types';

const ratingColors: Record<OverallRating, string> = {
  green: Colors.safe,
  yellow: Colors.caution,
  red: Colors.danger,
  gray: Colors.marketing,
};

const ratingLabels: Record<OverallRating, string> = {
  green: 'Рекомендуется',
  yellow: 'Осторожно',
  red: 'Не рекомендуется',
  gray: 'Неэффективно',
};

function HistoryCard({ item, onPress, onDelete }: {
  item: HistoryItem;
  onPress: () => void;
  onDelete: () => void;
}) {
  const date = new Date(item.date);
  const dateStr = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const ingredientCount = item.analysis?.ingredients?.length ?? 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`history-item-${item.id}`}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.ratingDot, { backgroundColor: ratingColors[item.overallRating] }]} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.productName || 'Без названия'}
          </Text>
          <Text style={styles.cardMeta}>
            {dateStr} · {ingredientCount} компонентов
          </Text>
          <View style={[styles.ratingBadge, { backgroundColor: ratingColors[item.overallRating] + '18' }]}>
            <Text style={[styles.ratingBadgeText, { color: ratingColors[item.overallRating] }]}>
              {ratingLabels[item.overallRating]}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.deleteButton}
          testID={`delete-${item.id}`}
        >
          <Trash2 size={16} color={Colors.textMuted} />
        </TouchableOpacity>
        <ChevronRight size={18} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { history, removeFromHistory, clearHistory, setCurrentAnalysis } = useHistory();

  const handlePress = useCallback((item: HistoryItem) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentAnalysis(item.analysis);
    router.push({ pathname: '/analysis', params: { fromHistory: '1' } });
  }, [setCurrentAnalysis, router]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Удалить запись',
      'Вы уверены, что хотите удалить эту запись?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => removeFromHistory(id),
        },
      ]
    );
  }, [removeFromHistory]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Очистить историю',
      'Вы уверены, что хотите удалить всю историю?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  }, [clearHistory]);

  const renderItem = useCallback(({ item }: { item: HistoryItem }) => (
    <HistoryCard
      item={item}
      onPress={() => handlePress(item)}
      onDelete={() => handleDelete(item.id)}
    />
  ), [handlePress, handleDelete]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>История</Text>
          <Text style={styles.headerSubtitle}>
            {history.length > 0 ? `${history.length} проверок` : 'Нет проверок'}
          </Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            style={styles.clearButton}
            testID="clear-history-button"
          >
            <XCircle size={16} color={Colors.danger} />
            <Text style={styles.clearText}>Очистить</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Clock size={48} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>История пуста</Text>
          <Text style={styles.emptyText}>
            Проверьте состав косметического средства, и результат появится здесь
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.dangerBg,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.danger,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ratingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  ratingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
