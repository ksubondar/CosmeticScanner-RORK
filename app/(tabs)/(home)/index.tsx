import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScanBarcode, Camera, ClipboardPaste, Sparkles, FlaskConical } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Colors from '@/constants/colors';
import { useProfile } from '@/contexts/ProfileContext';
import { getIngredientCount } from '@/constants/ingredientsDB';

function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
  color,
  testID,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
  testID: string;
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.actionCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        testID={testID}
      >
        <View style={[styles.actionIconCircle, { backgroundColor: color + '18' }]}>
          {icon}
        </View>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (!profile.isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  const handlePress = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}>
            <FlaskConical size={22} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Cosmetic Scanner</Text>
            <Text style={styles.headerSubtitle}>
              {getIngredientCount()} ингредиентов в базе
            </Text>
          </View>
        </View>
        <View style={styles.headerBadge}>
          <Sparkles size={14} color={Colors.primary} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Анализ состава</Text>
        <Text style={styles.sectionSubtitle}>
          Выберите способ ввода состава косметического средства
        </Text>

        <View style={styles.cardList}>
          <ActionCard
            icon={<ScanBarcode size={28} color="#3B82F6" />}
            title="Сканировать штрихкод"
            subtitle="Найти продукт по штрихкоду"
            onPress={() => handlePress('/scan/barcode')}
            color="#3B82F6"
            testID="scan-barcode-button"
          />
          <ActionCard
            icon={<Camera size={28} color="#8B5CF6" />}
            title="Сфотографировать состав"
            subtitle="Распознать текст с упаковки"
            onPress={() => handlePress('/scan/photo')}
            color="#8B5CF6"
            testID="scan-photo-button"
          />
          <ActionCard
            icon={<ClipboardPaste size={28} color={Colors.primary} />}
            title="Вставить состав"
            subtitle="Вставить скопированный текст"
            onPress={() => handlePress('/paste')}
            color={Colors.primary}
            testID="paste-button"
          />
        </View>
      </View>

      <View style={styles.tipContainer}>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Совет</Text>
          <Text style={styles.tipText}>
            Состав обычно указан на обратной стороне упаковки мелким шрифтом после слова «Ingredients»
          </Text>
        </View>
      </View>
    </View>
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
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  cardList: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tipContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tipCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: Colors.primaryDark,
    lineHeight: 18,
  },
});
