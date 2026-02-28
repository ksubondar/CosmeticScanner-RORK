import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Download, Upload, RotateCcw, Shield, Heart, Leaf, Bug, Trash2, FileDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useProfile } from '@/contexts/ProfileContext';
import { useHistory } from '@/contexts/HistoryContext';
import { skinTypeLabels, concernLabels, preferenceLabels } from '@/constants/healthRules';
import { SkinType, Concern, Preference, ExportData } from '@/types';
import {
  getMissingIngredients,
  getMissingCount,
  clearMissingIngredients,
  exportMissingIngredients,
  MissingIngredient,
} from '@/services/missingIngredients';

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const DEV_TAP_COUNT = 7;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, toggleSkinType, toggleConcern, togglePreference, resetProfile, updateProfile } = useProfile();
  const { history, importHistory } = useHistory();

  const [devMode, setDevMode] = useState(false);
  const [devTapCount, setDevTapCount] = useState(0);
  const [missingCount, setMissingCount] = useState(0);
  const [missingList, setMissingList] = useState<MissingIngredient[]>([]);
  const [loadingMissing, setLoadingMissing] = useState(false);

  useEffect(() => {
    if (devMode) {
      loadMissingData();
    }
  }, [devMode]);

  const loadMissingData = useCallback(async () => {
    setLoadingMissing(true);
    try {
      const count = await getMissingCount();
      const list = await getMissingIngredients();
      setMissingCount(count);
      setMissingList(list);
    } catch (e) {
      console.log('[Profile] Error loading missing ingredients:', e);
    } finally {
      setLoadingMissing(false);
    }
  }, []);

  const handleVersionTap = useCallback(() => {
    const next = devTapCount + 1;
    setDevTapCount(next);

    if (next >= DEV_TAP_COUNT) {
      if (!devMode) {
        setDevMode(true);
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Режим разработчика', 'Активирован');
      }
      setDevTapCount(0);
    }

    setTimeout(() => {
      setDevTapCount(prev => (prev === next ? 0 : prev));
    }, 3000);
  }, [devTapCount, devMode]);

  const handleExportMissing = useCallback(async () => {
    try {
      const json = await exportMissingIngredients();

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `missing-ingredients-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('Экспорт', 'Файл скачан');
      } else {
        const FileSystem = require('expo-file-system');
        const Sharing = require('expo-sharing');
        const fileName = `missing-ingredients-${new Date().toISOString().split('T')[0]}.json`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, json);
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(filePath);
        } else {
          Alert.alert('Экспорт', 'Файл сохранён: ' + filePath);
        }
      }
    } catch (error) {
      console.log('[Profile] Export missing error:', error);
      Alert.alert('Ошибка', 'Не удалось экспортировать данные');
    }
  }, []);

  const handleClearMissing = useCallback(() => {
    Alert.alert(
      'Очистить список',
      `Удалить все ${missingCount} ненайденных ингредиентов?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            await clearMissingIngredients();
            setMissingCount(0);
            setMissingList([]);
          },
        },
      ]
    );
  }, [missingCount]);

  const handleExport = useCallback(async () => {
    try {
      const exportData: ExportData = {
        version: '1.0',
        exportDate: new Date().toISOString().split('T')[0],
        profile,
        history,
      };

      if (Platform.OS === 'web') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cosmetic-scanner-backup-${exportData.exportDate}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('Экспорт', 'Файл скачан');
      } else {
        const FileSystem = require('expo-file-system');
        const Sharing = require('expo-sharing');
        const fileName = `cosmetic-scanner-backup-${exportData.exportDate}.json`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(filePath);
        } else {
          Alert.alert('Экспорт', 'Файл сохранён: ' + filePath);
        }
      }
    } catch (error) {
      console.log('[Profile] Export error:', error);
      Alert.alert('Ошибка', 'Не удалось экспортировать данные');
    }
  }, [profile, history]);

  const handleImport = useCallback(async () => {
    try {
      const DocumentPicker = require('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file?.uri) return;

      let content: string;
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        content = await response.text();
      } else {
        const FileSystem = require('expo-file-system');
        content = await FileSystem.readAsStringAsync(file.uri);
      }

      const data = JSON.parse(content) as ExportData;

      if (!data.version || !data.profile || !data.history) {
        Alert.alert('Ошибка', 'Неверный формат файла');
        return;
      }

      Alert.alert(
        'Импорт данных',
        `Найден бэкап от ${data.exportDate}\nПрофиль и ${data.history.length} записей.\nЗаменить текущие данные?`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Импортировать',
            onPress: () => {
              updateProfile(data.profile);
              importHistory(data.history);
              Alert.alert('Готово', 'Данные успешно импортированы');
            },
          },
        ]
      );
    } catch (error) {
      console.log('[Profile] Import error:', error);
      Alert.alert('Ошибка', 'Не удалось импортировать данные');
    }
  }, [updateProfile, importHistory]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Сбросить профиль',
      'Все настройки будут сброшены. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Сбросить', style: 'destructive', onPress: resetProfile },
      ]
    );
  }, [resetProfile]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Профиль</Text>
        <Text style={styles.headerSubtitle}>Настройки персонализации анализа</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader
          icon={<Leaf size={18} color={Colors.primary} />}
          title="Тип кожи"
        />
        <View style={styles.chipGrid}>
          {(Object.entries(skinTypeLabels) as [SkinType, string][]).map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              selected={profile.skinTypes.includes(key as SkinType)}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                toggleSkinType(key as SkinType);
              }}
            />
          ))}
        </View>

        <SectionHeader
          icon={<Shield size={18} color={Colors.primary} />}
          title="Проблемы кожи"
        />
        <View style={styles.chipGrid}>
          {(Object.entries(concernLabels) as [Concern, string][]).map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              selected={profile.concerns.includes(key as Concern)}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                toggleConcern(key as Concern);
              }}
            />
          ))}
        </View>

        <SectionHeader
          icon={<Heart size={18} color={Colors.primary} />}
          title="Предпочтения"
        />
        <View style={styles.chipGrid}>
          {(Object.entries(preferenceLabels) as [Preference, string][]).map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              selected={profile.preferences.includes(key as Preference)}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                togglePreference(key as Preference);
              }}
            />
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionRow} onPress={handleExport} testID="export-button">
            <View style={[styles.actionIcon, { backgroundColor: Colors.safeBg }]}>
              <Upload size={18} color={Colors.safe} />
            </View>
            <Text style={styles.actionText}>Экспортировать данные</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleImport} testID="import-button">
            <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Download size={18} color="#3B82F6" />
            </View>
            <Text style={styles.actionText}>Импортировать данные</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleReset} testID="reset-button">
            <View style={[styles.actionIcon, { backgroundColor: Colors.dangerBg }]}>
              <RotateCcw size={18} color={Colors.danger} />
            </View>
            <Text style={[styles.actionText, { color: Colors.danger }]}>Сбросить профиль</Text>
          </TouchableOpacity>
        </View>

        {devMode && (
          <>
            <View style={styles.divider} />
            <SectionHeader
              icon={<Bug size={18} color="#E67E22" />}
              title="Пропущенные ингредиенты"
            />

            {loadingMissing ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 16 }} />
            ) : (
              <View style={styles.devSection}>
                <View style={styles.devInfoRow}>
                  <Text style={styles.devInfoLabel}>Собрано ингредиентов:</Text>
                  <Text style={styles.devInfoValue}>{missingCount}</Text>
                </View>

                {missingList.length > 0 && (
                  <View style={styles.devListPreview}>
                    {missingList.slice(0, 10).map((item, i) => (
                      <View key={i} style={styles.devListItem}>
                        <Text style={styles.devListName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.devListCount}>x{item.count}</Text>
                      </View>
                    ))}
                    {missingList.length > 10 && (
                      <Text style={styles.devListMore}>
                        и ещё {missingList.length - 10}...
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.devActions}>
                  <TouchableOpacity
                    style={[styles.devButton, styles.devButtonExport]}
                    onPress={handleExportMissing}
                    disabled={missingCount === 0}
                  >
                    <FileDown size={16} color={missingCount === 0 ? Colors.textMuted : Colors.primary} />
                    <Text style={[
                      styles.devButtonText,
                      missingCount === 0 && styles.devButtonTextDisabled,
                    ]}>Экспорт</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.devButton, styles.devButtonClear]}
                    onPress={handleClearMissing}
                    disabled={missingCount === 0}
                  >
                    <Trash2 size={16} color={missingCount === 0 ? Colors.textMuted : Colors.danger} />
                    <Text style={[
                      styles.devButtonText,
                      { color: missingCount === 0 ? Colors.textMuted : Colors.danger },
                    ]}>Очистить</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.devRefreshButton}
                  onPress={loadMissingData}
                >
                  <Text style={styles.devRefreshText}>Обновить данные</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <View style={styles.versionSection}>
          <TouchableOpacity onPress={handleVersionTap} activeOpacity={1}>
            <Text style={styles.versionText}>Cosmetic Scanner v1.0.0</Text>
          </TouchableOpacity>
          {devTapCount > 0 && devTapCount < DEV_TAP_COUNT && !devMode && (
            <Text style={styles.devHint}>{DEV_TAP_COUNT - devTapCount} нажатий до режима разработчика</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: Colors.chipInactive,
    borderWidth: 1.5,
    borderColor: Colors.chipInactiveBorder,
  },
  chipActive: {
    backgroundColor: Colors.chipActive,
    borderColor: Colors.chipActive,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.chipInactiveText,
  },
  chipTextActive: {
    color: Colors.chipActiveText,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 28,
    marginBottom: 20,
  },
  actionsSection: {
    gap: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  devSection: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0AD4E40',
  },
  devInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  devInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  devInfoValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  devListPreview: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
    marginBottom: 12,
    gap: 6,
  },
  devListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  devListName: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  devListCount: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden' as const,
  },
  devListMore: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic' as const,
    marginTop: 4,
  },
  devActions: {
    flexDirection: 'row',
    gap: 10,
  },
  devButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden' as const,
    minHeight: 42,
  },
  devButtonExport: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  devButtonClear: {
    borderColor: Colors.dangerBorder,
    backgroundColor: Colors.dangerBg,
  },
  devButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  devButtonTextDisabled: {
    color: Colors.textMuted,
  },
  devRefreshButton: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  devRefreshText: {
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'underline' as const,
  },
  versionSection: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  devHint: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
