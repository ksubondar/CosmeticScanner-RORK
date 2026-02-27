import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Share,
  Platform,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import {
  Save,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Lightbulb,
  CheckCircle,
  XCircle,
  HelpCircle,
  MinusCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useHistory } from '@/contexts/HistoryContext';
import { AnalysisResult, AnalyzedIngredient, OverallRating, IngredientColor } from '@/types';

const ratingConfig: Record<OverallRating, { color: string; bg: string; border: string; label: string; icon: React.ReactNode }> = {
  green: {
    color: Colors.safe, bg: Colors.safeBg, border: Colors.safeBorder,
    label: 'Рекомендуется',
    icon: <CheckCircle size={24} color={Colors.safe} />,
  },
  yellow: {
    color: Colors.caution, bg: Colors.cautionBg, border: Colors.cautionBorder,
    label: 'С осторожностью',
    icon: <AlertTriangle size={24} color={Colors.caution} />,
  },
  red: {
    color: Colors.danger, bg: Colors.dangerBg, border: Colors.dangerBorder,
    label: 'Не рекомендуется',
    icon: <XCircle size={24} color={Colors.danger} />,
  },
  gray: {
    color: Colors.marketing, bg: Colors.marketingBg, border: Colors.marketingBorder,
    label: 'Неэффективно',
    icon: <MinusCircle size={24} color={Colors.marketing} />,
  },
};

const ingredientColorMap: Record<IngredientColor, string> = {
  green: Colors.safe,
  yellow: Colors.caution,
  red: Colors.danger,
  gray: Colors.marketing,
};

const colorEmoji: Record<IngredientColor, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
  gray: '⚪',
};

function IngredientRow({ item, expanded, onToggle }: {
  item: AnalyzedIngredient;
  expanded: boolean;
  onToggle: () => void;
}) {
  const dotColor = ingredientColorMap[item.color];

  return (
    <TouchableOpacity
      style={styles.ingredientRow}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.ingredientHeader}>
        <View style={[styles.ingredientDot, { backgroundColor: dotColor }]} />
        <View style={styles.ingredientInfo}>
          <Text style={styles.ingredientName}>{item.name}</Text>
          <Text style={styles.ingredientDesc} numberOfLines={expanded ? undefined : 1}>
            {item.descriptionRu}
          </Text>
        </View>
        {(item.warningsRu.length > 0 || item.personalWarnings.length > 0) && (
          expanded ? <ChevronUp size={16} color={Colors.textMuted} /> : <ChevronDown size={16} color={Colors.textMuted} />
        )}
      </View>

      {expanded && (
        <View style={styles.ingredientDetails}>
          <View style={styles.detailTags}>
            <View style={[styles.detailTag, { backgroundColor: dotColor + '18' }]}>
              <Text style={[styles.detailTagText, { color: dotColor }]}>{item.categoryRu}</Text>
            </View>
            {item.comedogenicity > 0 && (
              <View style={[styles.detailTag, { backgroundColor: item.comedogenicity >= 3 ? Colors.dangerBg : Colors.cautionBg }]}>
                <Text style={[styles.detailTagText, { color: item.comedogenicity >= 3 ? Colors.danger : Colors.caution }]}>
                  Комедогенность: {item.comedogenicity}/5
                </Text>
              </View>
            )}
            {item.allergenicity && (
              <View style={[styles.detailTag, { backgroundColor: Colors.dangerBg }]}>
                <Text style={[styles.detailTagText, { color: Colors.danger }]}>Аллерген</Text>
              </View>
            )}
          </View>
          {item.warningsRu.map((w, i) => (
            <Text key={i} style={styles.warningText}>⚠️ {w}</Text>
          ))}
          {item.personalWarnings.map((w, i) => (
            <Text key={`p-${i}`} style={styles.personalWarningText}>👤 {w}</Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

function InfoSection({ icon, title, color, children }: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.section, { borderLeftColor: color }]}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function AnalysisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fromHistory?: string }>();
  const { currentAnalysis, saveToHistory } = useHistory();
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const [saved, setSaved] = useState(params.fromHistory === '1');
  const [editingName, setEditingName] = useState(false);
  const [productName, setProductName] = useState('');

  const analysis = currentAnalysis;

  const toggleIngredient = useCallback((name: string) => {
    setExpandedIngredient(prev => prev === name ? null : name);
  }, []);

  const handleSave = useCallback(() => {
    if (!analysis) return;

    const name = productName.trim() || analysis.productName || '';

    if (!name) {
      setEditingName(true);
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    saveToHistory(analysis, name);
    setSaved(true);
    Alert.alert('Сохранено', 'Результат добавлен в историю');
  }, [analysis, productName, saveToHistory]);

  const handleShare = useCallback(async () => {
    if (!analysis) return;

    const lines = [
      `📋 Анализ: ${analysis.productName || 'Без названия'}`,
      `Оценка: ${analysis.overallText}`,
      '',
      'Состав:',
      ...analysis.ingredients.map(i => `${colorEmoji[i.color]} ${i.name} — ${i.descriptionRu}`),
    ];

    if (analysis.warnings.length > 0) {
      lines.push('', '⚠️ Предупреждения:', ...analysis.warnings.map(w => `• ${w}`));
    }

    if (analysis.recommendations.length > 0) {
      lines.push('', '💡 Рекомендации:', ...analysis.recommendations.map(r => `• ${r}`));
    }

    const text = lines.join('\n');

    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          Alert.alert('Скопировано', 'Текст скопирован в буфер обмена');
        }
      } else {
        await Share.share({ message: text });
      }
    } catch (error) {
      console.log('[Analysis] Share error:', error);
    }
  }, [analysis]);

  const stats = useMemo(() => {
    if (!analysis) return null;
    const total = analysis.ingredients.length;
    const green = analysis.ingredients.filter(i => i.color === 'green').length;
    const yellow = analysis.ingredients.filter(i => i.color === 'yellow').length;
    const red = analysis.ingredients.filter(i => i.color === 'red').length;
    const gray = analysis.ingredients.filter(i => i.color === 'gray').length;
    const unknown = analysis.ingredients.filter(i => i.isUnknown).length;
    return { total, green, yellow, red, gray, unknown };
  }, [analysis]);

  if (!analysis) {
    return (
      <View style={[styles.container, styles.center]}>
        <HelpCircle size={48} color={Colors.textMuted} />
        <Text style={styles.emptyText}>Нет данных для отображения</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.back()}
        >
          <Text style={styles.emptyButtonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rating = ratingConfig[analysis.overallRating];

  return (
    <>
      <Stack.Screen options={{ title: analysis.productName || 'Результат анализа' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.ratingCard, { backgroundColor: rating.bg, borderColor: rating.border }]}>
          {rating.icon}
          <Text style={[styles.ratingLabel, { color: rating.color }]}>{rating.label}</Text>
          {analysis.productName ? (
            <Text style={styles.ratingProduct}>{analysis.productName}</Text>
          ) : null}
        </View>

        {editingName && (
          <View style={styles.nameEditSection}>
            <Text style={styles.nameEditLabel}>Введите название продукта</Text>
            <TextInput
              style={styles.nameEditInput}
              placeholder="Название..."
              placeholderTextColor={Colors.textMuted}
              value={productName}
              onChangeText={setProductName}
              autoFocus
            />
            <TouchableOpacity
              style={styles.nameEditSave}
              onPress={() => {
                setEditingName(false);
                handleSave();
              }}
            >
              <Text style={styles.nameEditSaveText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        )}

        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Всего</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.safe }]}>{stats.green}</Text>
              <Text style={styles.statLabel}>Хорошо</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.caution }]}>{stats.yellow}</Text>
              <Text style={styles.statLabel}>Осторожно</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.danger }]}>{stats.red}</Text>
              <Text style={styles.statLabel}>Плохо</Text>
            </View>
            {stats.unknown > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: Colors.marketing }]}>{stats.unknown}</Text>
                  <Text style={styles.statLabel}>Неизвестно</Text>
                </View>
              </>
            )}
          </View>
        )}

        {analysis.actives.length > 0 && (
          <InfoSection
            icon={<Sparkles size={18} color={Colors.primary} />}
            title="Важные компоненты"
            color={Colors.primary}
          >
            <View style={styles.activesList}>
              {analysis.actives.map((a, i) => (
                <View key={i} style={styles.activeItem}>
                  <View style={[styles.activeDot, { backgroundColor: ingredientColorMap[a.color] }]} />
                  <View style={styles.activeInfo}>
                    <Text style={styles.activeName}>{a.name}</Text>
                    <Text style={styles.activeDesc}>{a.descriptionRu}</Text>
                  </View>
                </View>
              ))}
            </View>
          </InfoSection>
        )}

        {analysis.warnings.length > 0 && (
          <InfoSection
            icon={<AlertTriangle size={18} color={Colors.caution} />}
            title="Осторожно"
            color={Colors.caution}
          >
            {analysis.warnings.map((w, i) => (
              <Text key={i} style={styles.sectionItem}>⚠️ {w}</Text>
            ))}
          </InfoSection>
        )}

        {analysis.personalWarnings.length > 0 && (
          <InfoSection
            icon={<UserCheck size={18} color="#8B5CF6" />}
            title="С учётом вашего профиля"
            color="#8B5CF6"
          >
            {analysis.personalWarnings.map((w, i) => (
              <Text key={i} style={styles.sectionItem}>👤 {w}</Text>
            ))}
          </InfoSection>
        )}

        {analysis.recommendations.length > 0 && (
          <InfoSection
            icon={<Lightbulb size={18} color={Colors.safe} />}
            title="Рекомендации"
            color={Colors.safe}
          >
            {analysis.recommendations.map((r, i) => (
              <Text key={i} style={styles.sectionItem}>💡 {r}</Text>
            ))}
          </InfoSection>
        )}

        <View style={styles.ingredientsSection}>
          <Text style={styles.ingredientsSectionTitle}>
            Все ингредиенты ({analysis.ingredients.length})
          </Text>
          {analysis.ingredients.map((item, index) => (
            <IngredientRow
              key={`${item.name}-${index}`}
              item={item}
              expanded={expandedIngredient === `${item.name}-${index}`}
              onToggle={() => toggleIngredient(`${item.name}-${index}`)}
            />
          ))}
        </View>

        <View style={styles.actionsRow}>
          {!saved && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              testID="save-button"
            >
              <Save size={18} color={Colors.textInverse} />
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.shareButton, saved && styles.shareButtonFull]}
            onPress={handleShare}
            testID="share-button"
          >
            <Share2 size={18} color={Colors.primary} />
            <Text style={styles.shareButtonText}>Поделиться</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  scrollContent: {
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
  ratingCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 22,
    fontWeight: '800' as const,
  },
  ratingProduct: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  nameEditSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  nameEditLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  nameEditInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nameEditSave: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  nameEditSaveText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.borderLight,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderLeftWidth: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sectionItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  activesList: {
    gap: 10,
  },
  activeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  activeInfo: {
    flex: 1,
  },
  activeName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  activeDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  ingredientsSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  ingredientsSectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  ingredientRow: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ingredientHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  ingredientDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  ingredientDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  ingredientDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  detailTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detailTagText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  warningText: {
    fontSize: 12,
    color: Colors.caution,
    marginBottom: 4,
    lineHeight: 17,
  },
  personalWarningText: {
    fontSize: 12,
    color: '#8B5CF6',
    marginBottom: 4,
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  shareButtonFull: {
    flex: 1,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  bottomSpacer: {
    height: 40,
  },
});
