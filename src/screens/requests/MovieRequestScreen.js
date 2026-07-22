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
} from 'react-native';
import api from '../../services/api';

const MovieRequestScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [remaining, setRemaining] = useState(3);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    try {
      const response = await api.get('/movie-requests/my');
      setRequests(response.data.data.requests);
      setRemaining(response.data.data.remaining);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmit = async () => {
    if (!title) {
      Alert.alert('Erreur', 'Veuillez entrer le titre du film.');
      return;
    }

    if (remaining <= 0) {
      Alert.alert('Limite atteinte', 'Vous avez atteint la limite de 3 demandes par mois.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/movie-requests', { title, description });
      Alert.alert('✅ Succès', response.data.message);
      setTitle('');
      setDescription('');
      loadMyRequests();
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la demande.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#00C851';
      case 'REJECTED': return '#E50914';
      default: return '#FFB300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'APPROVED': return '✅ Approuvée';
      case 'REJECTED': return '❌ Refusée';
      default: return '⏳ En attente';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demande de film</Text>
      </View>

      {/* Compteur de demandes */}
      <View style={styles.counterCard}>
        <Text style={styles.counterTitle}>Demandes restantes ce mois</Text>
        <View style={styles.counterRow}>
          {[1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                styles.counterDot,
                i <= remaining ? styles.counterDotActive : styles.counterDotInactive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.counterText}>{remaining} / 3 demandes disponibles</Text>
      </View>

      {/* Formulaire */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>🎬 Demander un film</Text>

        <TextInput
          style={styles.input}
          placeholder="Titre du film *"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optionnel) - Acteurs, année, etc."
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.submitButton, (loading || remaining <= 0) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || remaining <= 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {remaining <= 0 ? '❌ Limite atteinte' : '📤 Envoyer la demande'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Mes demandes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes demandes</Text>

        {loadingRequests ? (
          <ActivityIndicator color="#E50914" />
        ) : requests.length === 0 ? (
          <Text style={styles.emptyText}>Aucune demande pour l'instant.</Text>
        ) : (
          requests.map(request => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestTitle}>{request.title}</Text>
                <Text style={[styles.requestStatus, { color: getStatusColor(request.status) }]}>
                  {getStatusLabel(request.status)}
                </Text>
              </View>
              {request.description && (
                <Text style={styles.requestDescription}>{request.description}</Text>
              )}
              <Text style={styles.requestDate}>
                {new Date(request.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60 },
  backText: { color: '#E50914', fontSize: 16, marginRight: 16 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  counterCard: { backgroundColor: '#1a1a1a', margin: 20, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  counterTitle: { color: '#888', fontSize: 14, marginBottom: 16 },
  counterRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  counterDot: { width: 20, height: 20, borderRadius: 10 },
  counterDotActive: { backgroundColor: '#E50914' },
  counterDotInactive: { backgroundColor: '#333' },
  counterText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  formCard: { backgroundColor: '#1a1a1a', marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 24 },
  formTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#2a2a2a', borderRadius: 8, padding: 16, color: '#fff', fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#E50914', borderRadius: 8, padding: 16, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#555' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { color: '#888', textAlign: 'center', padding: 20 },
  requestCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  requestTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1 },
  requestStatus: { fontSize: 13, fontWeight: 'bold' },
  requestDescription: { color: '#888', fontSize: 14, marginBottom: 8 },
  requestDate: { color: '#555', fontSize: 12 },
  bottomSpace: { height: 100 },
});

export default MovieRequestScreen;