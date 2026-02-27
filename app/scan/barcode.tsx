import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ScanBarcode, Search, Zap, Wifi, WifiOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useProfile } from '@/contexts/ProfileContext';
import { useHistory } from '@/contexts/HistoryContext';
import { analyzeCompositionAsync } from '@/services/ingredientAnalyzer';
import { lookupBarcode } from '@/services/openBeautyFacts';

export default function BarcodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { setCurrentAnalysis } = useHistory();
  const [manualCode, setManualCode] = useState('');
  const [scanned, setScanned] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const processingRef = useRef(false);

  const handleBarcodeLookup = useCallback(async (code: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    console.log('[Barcode] Looking up:', code);
    setIsSearching(true);
    setSearchStatus('Поиск в Open Beauty Facts...');

    try {
      const product = await lookupBarcode(code);

      if (product && product.ingredients) {
        setSearchStatus('Продукт найден! Анализирую состав...');

        const result = await analyzeCompositionAsync(
          product.ingredients,
          profile,
          product.name,
          (current, total) => {
            setSearchStatus(`Анализирую состав... ${current}/${total}`);
          }
        );
        result.barcode = code;
        setCurrentAnalysis(result);
        setIsSearching(false);
        setSearchStatus('');
        router.push('/analysis');
      } else if (product && product.name && !product.ingredients) {
        setIsSearching(false);
        setSearchStatus('');
        Alert.alert(
          'Продукт найден',
          `${product.name}\n\nСостав не указан в базе. Сфотографируйте состав или введите вручную.`,
          [
            { text: 'Ввести вручную', onPress: () => router.replace('/paste') },
            { text: 'Фото состава', onPress: () => router.replace('/scan/photo') },
            { text: 'Назад', style: 'cancel', onPress: () => { setScanned(false); processingRef.current = false; } },
          ]
        );
      } else {
        setIsSearching(false);
        setSearchStatus('');
        Alert.alert(
          'Продукт не найден',
          `Штрихкод ${code} не найден в базе. Попробуйте сфотографировать состав или ввести вручную.`,
          [
            { text: 'Ввести вручную', onPress: () => router.replace('/paste') },
            { text: 'Фото состава', onPress: () => router.replace('/scan/photo') },
            { text: 'Назад', style: 'cancel', onPress: () => { setScanned(false); processingRef.current = false; } },
          ]
        );
      }
    } catch (error) {
      console.log('[Barcode] Lookup error:', error);
      setIsSearching(false);
      setSearchStatus('');
      Alert.alert(
        'Ошибка поиска',
        'Не удалось найти продукт. Проверьте подключение к интернету и попробуйте снова.',
        [
          { text: 'Повторить', onPress: () => { processingRef.current = false; setScanned(false); handleBarcodeLookup(code); } },
          { text: 'Ввести вручную', onPress: () => router.replace('/paste') },
          { text: 'Назад', style: 'cancel', onPress: () => { setScanned(false); processingRef.current = false; } },
        ]
      );
    }
  }, [router, profile, setCurrentAnalysis]);

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setScanned(true);
    console.log('[Barcode] Scanned type:', result.type, 'data:', result.data);
    handleBarcodeLookup(result.data);
  }, [handleBarcodeLookup]);

  const handleManualSearch = () => {
    const code = manualCode.trim();
    if (code.length < 4) {
      Alert.alert('Ошибка', 'Введите штрихкод (минимум 4 цифры)');
      return;
    }
    if (processingRef.current) return;
    processingRef.current = true;
    setScanned(true);
    handleBarcodeLookup(code);
  };

  const renderCamera = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.cameraPlaceholder}>
          <ScanBarcode size={48} color={Colors.textMuted} />
          <Text style={styles.cameraText}>Камера недоступна в веб-версии</Text>
          <Text style={styles.cameraSubtext}>Используйте ручной ввод ниже</Text>
        </View>
      );
    }

    if (!permission) {
      return (
        <View style={styles.cameraPlaceholder}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.cameraText}>Загрузка камеры...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.cameraPlaceholder}>
          <ScanBarcode size={48} color={Colors.textMuted} />
          <Text style={styles.cameraText}>Нужен доступ к камере</Text>
          <Text style={styles.cameraSubtext}>Разрешите доступ к камере для сканирования штрихкодов</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Разрешить камеру</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
        <View style={styles.cameraOverlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          {scanned ? (
            <View style={styles.scannedBadge}>
              <Zap size={16} color="#fff" />
              <Text style={styles.scannedText}>Обработка...</Text>
            </View>
          ) : (
            <Text style={styles.overlayHint}>Наведите камеру на штрихкод</Text>
          )}
        </View>
      </View>
    );
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
        <Text style={styles.headerTitle}>Сканер штрихкода</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        {renderCamera()}

        {isSearching && (
          <View style={styles.searchingCard}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <View style={styles.searchingInfo}>
              <Text style={styles.searchingTitle}>Поиск продукта</Text>
              <Text style={styles.searchingStatus}>{searchStatus}</Text>
            </View>
            <Wifi size={16} color={Colors.primary} />
          </View>
        )}

        <View style={styles.manualSection}>
          <Text style={styles.manualTitle}>Или введите штрихкод вручную</Text>
          <View style={styles.manualInputRow}>
            <TextInput
              style={styles.manualInput}
              placeholder="Штрихкод..."
              placeholderTextColor={Colors.textMuted}
              value={manualCode}
              onChangeText={setManualCode}
              keyboardType="numeric"
              editable={!isSearching}
              testID="barcode-input"
            />
            <TouchableOpacity
              style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
              onPress={handleManualSearch}
              disabled={isSearching}
              testID="search-barcode-button"
            >
              {isSearching ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <Search size={20} color={Colors.textInverse} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.hintText}>
            Введите штрихкод с упаковки — поиск идёт по Open Beauty Facts
          </Text>
        </View>

        <View style={styles.alternativeSection}>
          <Text style={styles.alternativeTitle}>Другие способы</Text>
          <TouchableOpacity
            style={styles.alternativeButton}
            onPress={() => router.replace('/scan/photo')}
          >
            <Text style={styles.alternativeButtonText}>📸 Сфотографировать состав</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.alternativeButton}
            onPress={() => router.replace('/paste')}
          >
            <Text style={styles.alternativeButtonText}>📋 Ввести состав вручную</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 20,
  },
  cameraContainer: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden' as const,
    marginBottom: 16,
    position: 'relative' as const,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholder: {
    height: 220,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  scanFrame: {
    width: 200,
    height: 120,
  },
  corner: {
    position: 'absolute' as const,
    width: 28,
    height: 28,
    borderColor: '#fff',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  overlayHint: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
    marginTop: 16,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scannedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  scannedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  cameraText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  cameraSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  permissionButtonText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  searchingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  searchingInfo: {
    flex: 1,
  },
  searchingTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primaryDark,
  },
  searchingStatus: {
    fontSize: 12,
    color: Colors.primaryDark,
    marginTop: 2,
  },
  manualSection: {
    marginBottom: 24,
  },
  manualTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  manualInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchButton: {
    width: 50,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  hintText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 8,
    lineHeight: 16,
  },
  alternativeSection: {
    gap: 10,
  },
  alternativeTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  alternativeButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alternativeButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
