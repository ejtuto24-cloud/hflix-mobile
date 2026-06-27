import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { paymentService } from '../../services/api';

const PaymentScreen = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount] = useState('500');
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  const paymentMethods = [
    {
      id: 'MONCASH',
      name: 'MonCash',
      icon: '📱',
      number: '509-XXXX-XXXX',
      holder: 'HFlix Haiti',
    },
    {
      id: 'NATCASH',
      name: 'NatCash',
      icon: '💳',
      number: '509-XXXX-XXXX',
      holder: 'HFlix Haiti',
    },
    {
      id: 'BANK_TRANSFER',
      name: 'Virement Bancaire',
      icon: '🏦',
      number: 'XXXXXX',
      holder: 'HFlix Haiti',
      bank: 'BNC Haiti',
    },
  ];

  const handleCreatePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Erreur', 'Veuillez choisir une méthode de paiement.');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.create({
        amount: parseFloat(amount),
        method: selectedMethod,
        transactionRef,
      });

      setPaymentId(response.data.data.payment.id);
      setPaymentCreated(true);

    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la création du paiement.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    Alert.alert(
      'Confirmer le paiement',
      'Avez-vous effectué le paiement ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, j\'ai payé',
          onPress: async () => {
            try {
              await paymentService.uploadScreenshot(paymentId, {
                screenshot: 'pending_screenshot',
              });
              Alert.alert(
                '✅ Succès',
                'Votre paiement est en attente de validation. Vous serez notifié une fois approuvé.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la confirmation.');
            }
          },
        },
      ]
    );
  };

  if (paymentCreated) {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paiement</Text>
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>📋 Instructions de paiement</Text>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionIcon}>{method.icon}</Text>
            <Text style={styles.instructionMethod}>{method.name}</Text>
            <Text style={styles.instructionLabel}>Numéro :</Text>
            <Text style={styles.instructionValue}>{method.number}</Text>
            <Text style={styles.instructionLabel}>Nom du titulaire :</Text>
            <Text style={styles.instructionValue}>{method.holder}</Text>
            {method.bank && (
              <>
                <Text style={styles.instructionLabel}>Banque :</Text>
                <Text style={styles.instructionValue}>{method.bank}</Text>
              </>
            )}
            <Text style={styles.instructionLabel}>Montant :</Text>
            <Text style={styles.instructionAmount}>{amount} HTG</Text>
          </View>

          <Text style={styles.instructionNote}>
            ⚠️ Effectuez le paiement puis cliquez sur "J'ai payé"
          </Text>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmPayment}
          >
            <Text style={styles.confirmButtonText}>✅ J'ai payé</Text>
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

      {/* Prix */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceTitle}>Abonnement mensuel</Text>
        <Text style={styles.price}>500 HTG</Text>
        <Text style={styles.priceDuration}>30 jours d'accès illimité</Text>
      </View>

      {/* Méthodes de paiement */}
      <Text style={styles.sectionTitle}>Choisir une méthode de paiement</Text>

      {paymentMethods.map(method => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            selectedMethod === method.id && styles.methodCardSelected,
          ]}
          onPress={() => setSelectedMethod(method.id)}
        >
          <Text style={styles.methodIcon}>{method.icon}</Text>
          <Text style={styles.methodName}>{method.name}</Text>
          {selectedMethod === method.id && (
            <Text style={styles.methodCheck}>✅</Text>
          )}
        </TouchableOpacity>
      ))}

      {/* Référence transaction */}
      <TextInput
        style={styles.input}
        placeholder="Référence de transaction (optionnel)"
        placeholderTextColor="#888"
        value={transactionRef}
        onChangeText={setTransactionRef}
      />

      {/* Bouton */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleCreatePayment}
        disabled={loading}
      >
        {loading ? (
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
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backText: {
    color: '#E50914',
    fontSize: 16,
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceContainer: {
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E50914',
  },
  priceTitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 8,
  },
  price: {
    color: '#E50914',
    fontSize: 48,
    fontWeight: 'bold',
  },
  priceDuration: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  methodCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  methodCardSelected: {
    borderColor: '#E50914',
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  methodName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  methodCheck: {
    fontSize: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  submitButton: {
    backgroundColor: '#E50914',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionContainer: {
    padding: 20,
  },
  instructionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E50914',
  },
  instructionIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  instructionMethod: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructionLabel: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
  instructionValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionAmount: {
    color: '#E50914',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  instructionNote: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#E50914',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 100,
  },
});

export default PaymentScreen;