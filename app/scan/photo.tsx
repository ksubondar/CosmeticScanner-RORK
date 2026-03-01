import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, ImagePlus, FlaskConical, ScanText, Edit3 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import Colors from '@/constants/colors';
import { useProfile } from '@/contexts/ProfileContext';
import { useHistory } from '@/contexts/HistoryContext';
import { analyzeCompositionAsync } from '@/services/ingredientAnalyzer';

function parseOcrResult(rawText: string): { name: string; ingredients: string } {
  console.log('[OCR] Parsing OCR result, length:', rawText.length);
  console.log('[OCR] Raw text preview:', rawText.substring(0, 300));

  const compositionMarkers = [
    /(?:ingredients|состав|composition|inci|성분)\s*[:：]/i,
  ];

  let ingredientText = rawText;

  for (const marker of compositionMarkers) {
    const match = rawText.match(marker);
    if (match && match.index !== undefined) {
      ingredientText = rawText.substring(match.index + match[0].length).trim();
      console.log('[OCR] Found composition marker, extracting after it');
      break;
    }
  }

  ingredientText = ingredientText
    .replace(/\n+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim();

  return { name: '', ingredients: ingredientText };
}

export default function PhotoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { setCurrentAnalysis } = useHistory();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState('');
  const [productName, setProductName] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [ocrDone, setOcrDone] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нужен доступ к камере');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setOcrDone(false);
        setIngredients('');
      }
    } catch (error) {
      console.log('[Photo] Camera error:', error);
      Alert.alert('Ошибка', 'Не удалось открыть камеру');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setOcrDone(false);
        setIngredients('');
      }
    } catch (error) {
      console.log('[Photo] Gallery error:', error);
      Alert.alert('Ошибка', 'Не удалось открыть галерею');
    }
  };

  const recognizeText = async () => {
    if (!photoUri) {
      Alert.alert('Ошибка', 'Сначала сделайте фото или выберите из галереи');
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert('Недоступно', 'OCR через ML Kit работает только на устройстве (Android/iOS). На веб введите состав вручную.');
      return;
    }

    setIsRecognizing(true);
    setOcrStatus('Распознаю текст...');
    console.log('[OCR] Starting ML Kit text recognition...');

    try {
      const startTime = Date.now();

      const result = await TextRecognition.recognize(photoUri);
      console.log('[OCR] ML Kit result received, time:', Date.now() - startTime, 'ms');
      console.log('[OCR] Recognized text length:', result.text.length);
      console.log('[OCR] Blocks count:', result.blocks.length);
      console.log('[OCR] Text preview:', result.text.substring(0, 300));

      if (!result.text || result.text.trim().length < 3) {
        Alert.alert(
          'Не удалось распознать',
          'На фото не найден текст. Попробуйте сделать более чёткое фото или введите состав вручную.',
          [{ text: 'OK' }]
        );
        setIsRecognizing(false);
        setOcrStatus('');
        return;
      }

      const parsed = parseOcrResult(result.text);

      if (parsed.name) {
        setProductName(parsed.name);
      }
      setIngredients(parsed.ingredients);
      setOcrDone(true);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (error: unknown) {
      console.log('[OCR] ML Kit recognition error:', error);
      Alert.alert(
        'Ошибка распознавания',
        'Не удалось распознать текст. Попробуйте ещё раз или введите состав вручную.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRecognizing(false);
      setOcrStatus('');
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);

  const handleAnalyze = async () => {
    const trimmed = ingredients.trim();
    if (trimmed.length < 3) {
      Alert.alert('Ошибка', 'Введите распознанный состав (минимум 3 символа)');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

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
      console.log('[Photo] Analysis error:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить анализ. Попробуйте ещё раз.');
    } finally {
      setIsAnalyzing(false);
      setProgressCurrent(0);
      setProgressTotal(0);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          testID="back-button"
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Фото состава</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {!photoUri ? (
          <View style={styles.photoSection}>
            <View style={styles.photoPlaceholder}>
              <Camera size={48} color={Colors.textMuted} />
              <Text style={styles.photoText}>
                Сфотографируйте состав{"\n"}на упаковке
              </Text>
              <Text style={styles.photoHint}>
                Для лучшего результата сделайте чёткое фото списка ингредиентов
              </Text>
            </View>
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={takePhoto}
                testID="take-photo-button"
              >
                <Camera size={20} color={Colors.textInverse} />
                <Text style={styles.photoButtonText}>Камера</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoButton, styles.photoButtonSecondary]}
                onPress={pickImage}
                testID="pick-image-button"
              >
                <ImagePlus size={20} color={Colors.primary} />
                <Text style={[styles.photoButtonText, styles.photoButtonTextSecondary]}>
                  Из галереи
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.photoPreview}>
            <Image
              source={{ uri: photoUri }}
              style={styles.previewImage}
              contentFit="contain"
            />
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => {
                  setPhotoUri(null);
                  setOcrDone(false);
                  setIngredients('');
                  setProductName('');
                }}
              >
                <Text style={styles.retakeText}>Переснять</Text>
              </TouchableOpacity>

              {!ocrDone && (
                <TouchableOpacity
                  style={[styles.recognizeButton, isRecognizing && styles.recognizeButtonDisabled]}
                  onPress={recognizeText}
                  disabled={isRecognizing}
                  testID="recognize-button"
                >
                  {isRecognizing ? (
                    <ActivityIndicator size="small" color={Colors.textInverse} />
                  ) : (
                    <ScanText size={18} color={Colors.textInverse} />
                  )}
                  <Text style={styles.recognizeButtonText}>
                    {isRecognizing ? (ocrStatus || 'Распознаю...') : 'Распознать текст'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {ocrDone && (
          <View style={styles.ocrSuccessNote}>
            <Text style={styles.ocrSuccessTitle}>✅ Текст распознан</Text>
            <Text style={styles.ocrSuccessText}>
              Проверьте и отредактируйте результат при необходимости
            </Text>
          </View>
        )}

        {!photoUri && !ocrDone && (
          <View style={styles.ocrNote}>
            <Text style={styles.ocrNoteTitle}>💡 Как это работает</Text>
            <Text style={styles.ocrNoteText}>
              1. Сфотографируйте список ингредиентов на упаковке{'\n'}
              2. Нажмите «Распознать текст» — ИИ прочитает состав{'\n'}
              3. Проверьте результат и нажмите «Анализировать»
            </Text>
          </View>
        )}

        <View style={styles.inputSection}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Название продукта</Text>
            <Edit3 size={14} color={Colors.textMuted} />
          </View>
          <TextInput
            style={styles.textInputSmall}
            placeholder="Название..."
            placeholderTextColor={Colors.textMuted}
            value={productName}
            onChangeText={setProductName}
          />

          <View style={[styles.labelRow, { marginTop: 14 }]}>
            <Text style={styles.label}>Состав</Text>
            <Edit3 size={14} color={Colors.textMuted} />
          </View>
          <TextInput
            style={styles.textInputLarge}
            placeholder="Ингредиенты появятся здесь после распознавания или введите вручную..."
            placeholderTextColor={Colors.textMuted}
            value={ingredients}
            onChangeText={setIngredients}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  photoSection: {
    marginBottom: 20,
  },
  photoPlaceholder: {
    height: 180,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  photoText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  photoHint: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  photoButtonSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
  photoButtonTextSecondary: {
    color: Colors.primary,
  },
  photoPreview: {
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  retakeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  retakeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  recognizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  recognizeButtonDisabled: {
    opacity: 0.7,
  },
  recognizeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
  ocrNote: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ocrNoteTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  ocrNoteText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ocrSuccessNote: {
    backgroundColor: Colors.safeBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.safeBorder,
  },
  ocrSuccessTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.safe,
    marginBottom: 4,
  },
  ocrSuccessText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  inputSection: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
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
  textInputLarge: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 140,
  },
  footer: {
    padding: 20,
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
