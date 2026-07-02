import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { paymentService } from '../../services/api';

const PaymentScreen = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentInfos, setPaymentInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPaymentInfo();
  }, []);

  const loadPaymentInfo = async () => {
    try {
      const response = await paymentService.getPaymentInfo();
      setPaymentInfos(response.data.data.paymentInfos);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Erreur', 'Veuillez choisir une méthode de paiement.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await paymentService.create({
        amount: 500,
        method: selectedMethod,
        transactionRef,
      });
      setPaymentId(response.data.data.payment.id);
      setPaymentCreated(true);
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setSubmitting(false);
    }
  };

  const pickScreenshot = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', 'Nous avons besoin d\'accéder à vos photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) {
      setScreenshot(result.assets[0]);
    }
  };

  const handleConfirmPayment = async () => {
    if (!screenshot) {
      Alert.alert('Erreur', 'Veuillez uploader une capture d\'écran.');
      return;
    }
    setUploading(true);
    try {
      await paymentService.uploadScreenshot(paymentId, {
        screenshot: `data:image/jpeg;base64,${screenshot.base64}`,
      });
      Alert.alert(
        'Succès',
        'Votre paiement est en attente de validation.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'envoi.');
    } finally {
      setUploading(false);
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'MONCASH': return '📱';
      case 'NATCASH': return '💳';
      case 'BANK_TRANSFER': return '🏦';
      default: return '💰';
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'MONCASH': return 'MonCash';
      case 'NATCASH': return 'NatCash';
      case 'BANK_TRANSFER': return 'Virement Bancaire';
      default: return method;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (paymentCreated) {
    const selectedInfo = paymentInfos.find(p => p.method === selectedMethod);
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirmation</Text>
        </View>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>📋 Instructions de paiement</Text>
          <View style={styles.instructionCard}>
            <Text style={styles.instructionIcon}>{getMethodIcon(selectedMethod)}</Text>
            <Text style={styles.instructionMethod}>{getMethodLabel(selectedMethod)}</Text>
            {selectedInfo && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Numéro :</Text>
                  <Text style={styles.infoValue}>{selectedInfo.number}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Titulaire :</Text>
                  <Text style={styles.infoValue}>{selectedInfo.holderName}</Text>
                </View>
                {selectedInfo.bankName && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Banque :</Text>
                    <Text style={styles.infoValue}>{selectedInfo.bankName}</Text>
                  </View>
                )}
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Montant :</Text>
                  <Text style={styles.amountValue}>500 HTG</Text>
                </View>
                {selectedInfo.instructions && (
                  <Text style={styles.instructions}>{selectedInfo.instructions}</Text>
                )}
              </>
            )}
          </View>
          <Text style={styles.uploadTitle}>📸 Capture d'écran du paiement</Text>
          <Text style={styles.uploadHint}>Après avoir payé, uploadez une capture d'écran comme preuve.</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickScreenshot}>
            <Text style={styles.uploadButtonText}>
              {screenshot ? '✅ Photo sélectionnée' : '📤 Choisir une photo'}
            </Text>
          </TouchableOpacity>
          {screenshot && (
            <Image
              source={{ uri: screenshot.uri }}
              style={styles.screenshotPreview}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={[styles.confirmButton, uploading && styles.confirmButtonDisabled]}
            onPress={handleConfirmPayment}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>✅ J'ai payé - Envoyer</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Abonnement</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.priceTitle}>🎬 Abonnement HFlix</Text>
        <Text style={styles.price}>500 HTG</Text>
        <Text style={styles.priceDuration}>30 jours d'accès illimité</Text>
        <View style={styles.features}>
          <Text style={styles.feature}>✅ Films et séries en streaming</Text>
          <Text style={styles.feature}>✅ Qualité HD</Text>
          <Text style={styles.feature}>✅ Accès illimité</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Choisir une méthode de paiement</Text>
      {paymentInfos.length === 0 ? (
        <View style={styles.noMethodContainer}>
          <Text style={styles.noMethodText}>Aucune méthode disponible.</Text>
        </View>
      ) : (
        paymentInfos.map(info => (
          <TouchableOpacity
            key={info.id}
            style={[styles.methodCard, selectedMethod === info.method && styles.methodCardSelected]}
            onPress={() => setSelectedMethod(info.method)}
          >
            <Text style={styles.methodIcon}>{getMethodIcon(info.method)}</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{getMethodLabel(info.method)}</Text>
              <Text style={styles.methodNumber}>{info.number}</Text>
              <Text style={styles.methodHolder}>{info.holderName}</Text>
            </View>
            {selectedMethod === info.method && (
              <Text style={styles.methodCheck}>✅</Text>
            )}
          </TouchableOpacity>
        ))
      )}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Référence de transaction (optionnel)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: REF-123456"
          placeholderTextColor="#888"
          value={transactionRef}
          onChangeText={setTransactionRef}
        />
      </View>
      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleCreatePayment}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Continuer →</Text>
        )}
      </TouchableOpacity>
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loadingContainer: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#888', marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60 },
  backText: { color: '#E50914', fontSize: 16, marginRight: 16 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  priceContainer: { backgroundColor: '#1a1a1a', margin: 20, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E50914' },
  priceTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  price: { color: '#E50914', fontSize: 48, fontWeight: 'bold' },
  priceDuration: { color: '#888', fontSize: 14, marginTop: 4, marginBottom: 16 },
  features: { alignItems: 'flex-start', width: '100%' },
  feature: { color: '#ccc', fontSize: 14, marginBottom: 6 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 12 },
  noMethodContainer: { margin: 20, padding: 20, backgroundColor: '#1a1a1a', borderRadius: 12, alignItems: 'center' },
  noMethodText: { color: '#FFB300', fontSize: 16 },
  methodCard: { backgroundColor: '#1a1a1a', marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  methodCardSelected: { borderColor: '#E50914' },
  methodIcon: { fontSize: 28, marginRight: 16 },
  methodInfo: { flex: 1 },
  methodName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  methodNumber: { color: '#E50914', fontSize: 14, marginTop: 2 },
  methodHolder: { color: '#888', fontSize: 12, marginTop: 2 },
  methodCheck: { fontSize: 20 },
  inputContainer: { marginHorizontal: 20, marginTop: 12 },
  inputLabel: { color: '#888', fontSize: 13, marginBottom: 8 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  submitButton: { backgroundColor: '#E50914', marginHorizontal: 20, marginTop: 24, borderRadius: 8, padding: 16, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#888' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  instructionContainer: { padding: 20 },
  instructionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  instructionCard: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E50914', marginBottom: 24 },
  instructionIcon: { fontSize: 48, marginBottom: 8 },
  instructionMethod: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  infoLabel: { color: '#888', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#333' },
  amountLabel: { color: '#888', fontSize: 16 },
  amountValue: { color: '#E50914', fontSize: 24, fontWeight: 'bold' },
  instructions: { color: '#ccc', fontSize: 13, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  uploadTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  uploadHint: { color: '#888', fontSize: 13, marginBottom: 16, lineHeight: 20 },
  uploadButton: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333', marginBottom: 16 },
  uploadButtonText: { color: '#fff', fontSize: 16 },
  screenshotPreview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  confirmButton: { backgroundColor: '#E50914', borderRadius: 8, padding: 16, alignItems: 'center' },
  confirmButtonDisabled: { backgroundColor: '#888' },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bottomSpace: { height: 100 },
});

export default PaymentScreen;
