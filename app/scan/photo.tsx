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
import { generateText } from '@rork-ai/toolkit-sdk';
import Colors from '@/constants/colors';
import { useProfile } from '@/contexts/ProfileContext';
import { useHistory } from '@/contexts/HistoryContext';
import { analyzeCompositionAsync } from '@/services/ingredientAnalyzer';

async function getOptimizedBase64(uri: string): Promise<string> {
  console.log('[OCR] Getting optimized base64 for:', uri.substring(0, 50));

  if (Platform.OS !== 'web') {
    try {
      const ImageManipulator = await import('expo-image-manipulator');
      console.log('[OCR] Resizing image with ImageManipulator...');
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      console.log('[OCR] Image resized. Base64 length:', manipulated.base64?.length ?? 0);
      if (manipulated.base64 && manipulated.base64.length > 0) {
        return manipulated.base64;
      }
      console.log('[OCR] ImageManipulator base64 empty, falling back to file system read');
    } catch (e) {
      console.log('[OCR] ImageManipulator failed, falling back:', e);
    }

    try {
      const { readAsStringAsync, EncodingType } = await import('expo-file-system/legacy');
      const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
      console.log('[OCR] FileSystem base64 length:', base64.length);
      return base64;
    } catch (e) {
      console.log('[OCR] FileSystem read failed:', e);
      return '';
    }
  }

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64 || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.log('[OCR] Web base64 conversion failed:', e);
    return '';
  }
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

    setIsRecognizing(true);
    setOcrStatus('Подготовка изображения...');
    console.log('[OCR] Starting text recognition...');

    try {
      const startTime = Date.now();

      const base64 = await getOptimizedBase64(photoUri);
      console.log('[OCR] Base64 ready, length:', base64.length, 'time:', Date.now() - startTime, 'ms');

      if (base64.length === 0) {
        Alert.alert('Ошибка', 'Не удалось прочитать изображение. Попробуйте ещё раз.');
        setIsRecognizing(false);
        setOcrStatus('');
        return;
      }

      setOcrStatus('Распознаю текст...');
      const imageDataUri = `data:image/jpeg;base64,${base64}`;

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('OCR_TIMEOUT')), 90000);
      });

      console.log('[OCR] Sending to AI, payload size:', Math.round(imageDataUri.length / 1024), 'KB');

      const result = await Promise.race([generateText({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: imageDataUri,
              },
              {
                type: 'text',
                text: `You are an expert OCR system specialized in reading cosmetic product ingredient lists from photos.

INSTRUCTIONS:
1. Look at this image very carefully and find the ingredients/composition list.
2. The text may be in ANY language (Russian, English, French, Korean, etc.) - read it as-is.
3. Extract ALL ingredients exactly as printed on the package - preserve the original language and spelling.
4. Return a comma-separated list of ingredients.
5. If you can identify the product name, put it on the FIRST line, then leave an empty line, then list all ingredients separated by commas.
6. Do NOT translate, rename, paraphrase or modify any ingredient names.
7. Do NOT skip any ingredients - include every single one even if hard to read.
8. If the text is blurry, do your best to read it and include your best guess.
9. If the image does not contain any ingredient/composition list at all, respond with exactly: NO_INGREDIENTS_FOUND

Common label markers to look for: "Ingredients:", "Состав:", "Composition:", "INCI:", "성분"`,
              },
            ],
          },
        ],
      }), timeoutPromise]);

      console.log('[OCR] AI result received, time:', Date.now() - startTime, 'ms');
      console.log('[OCR] Result preview:', result.substring(0, 200));

      if (result.includes('NO_INGREDIENTS_FOUND')) {
        Alert.alert(
          'Не удалось распознать',
          'На фото не найден список ингредиентов. Попробуйте сделать более чёткое фото или введите состав вручную.',
          [{ text: 'OK' }]
        );
        setIsRecognizing(false);
        setOcrStatus('');
        return;
      }

      const lines = result.trim().split('\n').filter((l: string) => l.trim().length > 0);

      if (lines.length >= 2) {
        const firstLine = lines[0].trim();
        const hasComma = firstLine.includes(',');
        const isLikelyName = !hasComma && firstLine.length < 100;

        if (isLikelyName) {
          setProductName(firstLine);
          setIngredients(lines.slice(1).join(', ').trim());
        } else {
          setIngredients(lines.join(', ').trim());
        }
      } else {
        setIngredients(result.trim());
      }

      setOcrDone(true);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (error: unknown) {
      console.log('[OCR] Recognition error:', error);
      const isTimeout = error instanceof Error && error.message === 'OCR_TIMEOUT';
      Alert.alert(
        isTimeout ? 'Превышено время ожидания' : 'Ошибка распознавания',
        isTimeout
          ? 'Распознавание заняло слишком много времени. Попробуйте сделать более чёткое фото или введите состав вручную.'
          : 'Не удалось распознать текст. Попробуйте ещё раз или введите состав вручную.',
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
