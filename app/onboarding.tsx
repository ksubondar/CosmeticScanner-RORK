import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, ChevronRight, Leaf, Shield, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Colors from '@/constants/colors';
import { useProfile } from '@/contexts/ProfileContext';
import { skinTypeLabels, concernLabels, preferenceLabels } from '@/constants/healthRules';
import { SkinType, Concern, Preference } from '@/types';

const { width } = Dimensions.get('window');

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
      testID={`chip-${label}`}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, toggleSkinType, toggleConcern, togglePreference, completeOnboarding } = useProfile();
  const [step, setStep] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const animateTransition = (nextStep: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep(nextStep), 150);
  };

  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (step < 2) {
      animateTransition(step + 1);
    } else {
      completeOnboarding();
      router.replace('/');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/');
  };

  const steps = [
    {
      icon: <Leaf size={32} color={Colors.primary} />,
      title: 'Тип кожи',
      subtitle: 'Выберите один или несколько вариантов',
      content: (
        <View style={styles.chipGrid}>
          {(Object.entries(skinTypeLabels) as [SkinType, string][]).map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              selected={profile.skinTypes.includes(key as SkinType)}
              onPress={() => toggleSkinType(key as SkinType)}
            />
          ))}
        </View>
      ),
    },
    {
      icon: <Shield size={32} color={Colors.primary} />,
      title: 'Проблемы кожи',
      subtitle: 'Что вас беспокоит?',
      content: (
        <View style={styles.chipGrid}>
          {(Object.entries(concernLabels) as [Concern, string][]).map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              selected={profile.concerns.includes(key as Concern)}
              onPress={() => toggleConcern(key as Concern)}
            />
          ))}
        </View>
      ),
    },
    {
      icon: <Heart size={32} color={Colors.primary} />,
      title: 'Предпочтения',
      subtitle: 'Что ищете или избегаете?',
      content: (
        <View style={styles.chipGrid}>
          {(Object.entries(preferenceLabels) as [Preference, string][]).map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              selected={profile.preferences.includes(key as Preference)}
              onPress={() => togglePreference(key as Preference)}
            />
          ))}
        </View>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Sparkles size={28} color={Colors.primary} />
          <Text style={styles.logoText}>Cosmetic Scanner</Text>
        </View>
        <TouchableOpacity onPress={handleSkip} testID="skip-button">
          <Text style={styles.skipText}>Пропустить</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i === step && styles.progressDotActive,
              i < step && styles.progressDotDone,
            ]}
          />
        ))}
      </View>

      <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
        <View style={styles.iconCircle}>{currentStep.icon}</View>
        <Text style={styles.stepTitle}>{currentStep.title}</Text>
        <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep.content}
        </ScrollView>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="next-button"
        >
          <Text style={styles.nextButtonText}>
            {step === 2 ? 'Начать' : 'Далее'}
          </Text>
          <ChevronRight size={20} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  skipText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  progressDotDone: {
    backgroundColor: Colors.primaryMuted,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.chipInactive,
    borderWidth: 1.5,
    borderColor: Colors.chipInactiveBorder,
  },
  chipActive: {
    backgroundColor: Colors.chipActive,
    borderColor: Colors.chipActive,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.chipInactiveText,
  },
  chipTextActive: {
    color: Colors.chipActiveText,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
});
