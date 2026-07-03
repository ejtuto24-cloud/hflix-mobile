import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const { register } = useAuth();

  const checkIfInHaiti = async () => {
    try {
      setCheckingLocation(true);

      // Demander la permission GPS
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          '📍 Permission refusée',
          'HFlix est disponible uniquement en Haiti. Nous avons besoin d\'accéder à votre position pour vérifier votre localisation.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Obtenir la position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Vérifier si les coordonnées sont en Haiti
      // Haiti est entre : lat 18.0-20.1, lon -74.5 à -71.6
      const isInHaiti = (
        latitude >= 18.0 &&
        latitude <= 20.1 &&
        longitude >= -74.5 &&
        longitude <= -71.6
      );

      if (!isInHaiti) {
        Alert.alert(
          '🌍 Service non disponible',
          'HFlix est disponible uniquement en Haiti. Votre position actuelle ne correspond pas à Haiti.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;

    } catch (error) {
      console.error('Erreur GPS:', error);
      Alert.alert(
        'Erreur',
        'Impossible de vérifier votre position. Assurez-vous que le GPS est activé.',
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setCheckingLocation(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    // Vérifier que l'utilisateur est en Haiti
    const isInHaiti = await checkIfInHaiti();

    if (!isInHaiti) {
      setLoading(false);
      return;
    }

    const result = await register(name, email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erreur', result.message);
    } else {
      navigation.navigate('VerifyEmail', { email });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎬 HFlix</Text>
          <Text style={styles.tagline}>Rejoignez HFlix aujourd'hui</Text>
        </View>

        {/* Badge Haiti */}
        <View style={styles.haitiBadge}>
          <Text style={styles.haitiBadgeText}>🇭🇹 Service disponible uniquement en Haiti</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Créer un compte</Text>

          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {/* Note GPS */}
          <View style={styles.gpsNote}>
            <Text style={styles.gpsNoteText}>
              📍 Votre position GPS sera vérifiée pour confirmer que vous êtes en Haiti.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, (loading || checkingLocation) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading || checkingLocation}
          >
            {checkingLocation ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>Vérification position...</Text>
              </View>
            ) : loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Créer mon compte</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Déjà un compte ? <Text style={styles.link}>Se connecter</Text>
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E50914',
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  haitiBadge: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E50914',
  },
  haitiBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  gpsNote: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  gpsNoteText: {
    color: '#888',
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#E50914',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#888',
    fontSize: 14,
  },
  link: {
    color: '#E50914',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;