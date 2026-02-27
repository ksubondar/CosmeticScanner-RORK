import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FlaskConical, Clipboard, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useProfile } from '@/contexts/ProfileContext';
import { useHistory } from '@/contexts/HistoryContext';
import { analyzeCompositionAsync } from '@/services/ingredientAnalyzer';

export default function PasteScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { setCurrentAnalysis } = useHistory();
  const [ingredients, setIngredients] = useState('');
  const [productName, setProductName] = useState('');
  const inputRef = useRef<TextInput>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);

  const handleAnalyze = async () => {
    const trimmed = ingredients.trim();
    if (trimmed.length < 3) {
      Alert.alert('Ошибка', 'Введите состав косметического средства (минимум 3 символа)');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    console.log('[Paste] Starting analysis...');
    setIsAnalyzing(true);
    setProgressCurrent(0);
    setProgressTotal(0);
    try {
      const result = await analyzeCompositionAsync(
        trimmed,
        profile,
        productName.trim() || undefined,
        (current, total) => {
          setProgressCurrent(current);
          setProgressTotal(total);
        }
      );
      setCurrentAnalysis(result);
      router.push('/analysis');
    } catch (error) {
      console.log('[Paste] Analysis error:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить анализ. Попробуйте ещё раз.');
    } finally {
      setIsAnalyzing(false);
      setProgressCurrent(0);
      setProgressTotal(0);
    }
  };

  const handleClear = () => {
    setIngredients('');
    setProductName('');
    inputRef.current?.focus();
  };

  const exampleIngredients = 'Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Dimethicone, Retinol, Panthenol, Hyaluronic Acid, Parfum, Phenoxyethanol, Citric Acid';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.nameInput}>
          <Text style={styles.label}>Название продукта (необязательно)</Text>
          <TextInput
            style={styles.textInputSmall}
            placeholder="Например: CeraVe Moisturizing Cream"
            placeholderTextColor={Colors.textMuted}
            value={productName}
            onChangeText={setProductName}
            testID="product-name-input"
          />
        </View>

        <View style={styles.ingredientsInput}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Состав (Ingredients)</Text>
            {ingredients.length > 0 && (
              <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            ref={inputRef}
            style={styles.textInputLarge}
            placeholder="Вставьте состав сюда&#10;&#10;Например: Aqua, Glycerin, Niacinamide..."
            placeholderTextColor={Colors.textMuted}
            value={ingredients}
            onChangeText={setIngredients}
            multiline
            textAlignVertical="top"
            autoFocus
            testID="ingredients-input"
          />
        </View>

        <TouchableOpacity
          style={styles.exampleButton}
          onPress={() => {
            setIngredients(exampleIngredients);
            setProductName('Пример — Увлажняющий крем');
          }}
        >
          <Clipboard size={14} color={Colors.primary} />
          <Text style={styles.exampleText}>Вставить пример состава</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (ingredients.trim().length < 3 || isAnalyzing) && styles.analyzeButtonDisabled,
          ]}
          onPress={handleAnalyze}
          disabled={ingredients.trim().length < 3 || isAnalyzing}
          activeOpacity={0.8}
          testID="analyze-button"
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <FlaskConical size={20} color={Colors.textInverse} />
          )}
          <Text style={styles.analyzeButtonText}>
            {isAnalyzing
              ? (progressTotal > 0 ? `Анализирую... ${progressCurrent}/${progressTotal}` : 'Анализирую...')
              : 'Анализировать'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  nameInput: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  textInputSmall: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ingredientsInput: {
    flex: 1,
    marginBottom: 12,
  },
  textInputLarge: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 200,
    maxHeight: 400,
  },
  exampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  exampleText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
});
