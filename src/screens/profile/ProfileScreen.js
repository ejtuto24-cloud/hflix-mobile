import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authService.getProfile();
      setProfile(response.data.data.user);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.deleteAccount();
              logout();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le compte.');
            }
          },
        },
      ]
    );
  };

  const getSubscriptionColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#00C851';
      case 'EXPIRED': return '#E50914';
      case 'PENDING': return '#FFB300';
      default: return '#888';
    }
  };

  const getSubscriptionText = (status) => {
    switch (status) {
      case 'ACTIVE': return '✅ Actif';
      case 'EXPIRED': return '❌ Expiré';
      case 'PENDING': return '⏳ En attente';
      default: return '❌ Inactif';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{profile?.name}</Text>
        <Text style={styles.userEmail}>{profile?.email}</Text>
        {profile?.isEmailVerified ? (
          <Text style={styles.verifiedBadge}>✅ Email vérifié</Text>
        ) : (
          <Text style={styles.unverifiedBadge}>⚠️ Email non vérifié</Text>
        )}
      </View>

      {/* Abonnement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Abonnement</Text>
        <View style={styles.subscriptionCard}>
          <Text style={[styles.subscriptionStatus, { color: getSubscriptionColor(profile?.subscription?.status) }]}>
            {getSubscriptionText(profile?.subscription?.status)}
          </Text>
          {profile?.subscription?.endDate && (
            <Text style={styles.subscriptionDate}>
              Expire le : {new Date(profile.subscription.endDate).toLocaleDateString('fr-FR')}
            </Text>
          )}
          {profile?.subscription?.status !== 'ACTIVE' && (
            <TouchableOpacity
              style={styles.renewButton}
              onPress={() => navigation.navigate('Payment')}
            >
              <Text style={styles.renewButtonText}>🔄 Renouveler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.menuItemText}>❤️ Mes favoris</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.menuItemText}>🕐 Mon historique</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyPayments')}
        >
          <Text style={styles.menuItemText}>💳 Mes paiements</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MovieRequest')}
        >
          <Text style={styles.menuItemText}>🎬 Demander un film</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Se déconnecter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>🗑️ Supprimer mon compte</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  verifiedBadge: {
    color: '#00C851',
    fontSize: 13,
    marginTop: 8,
    fontWeight: 'bold',
  },
  unverifiedBadge: {
    color: '#FFB300',
    fontSize: 13,
    marginTop: 8,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  subscriptionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  subscriptionStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subscriptionDate: {
    color: '#888',
    fontSize: 14,
  },
  renewButton: {
    backgroundColor: '#E50914',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  renewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  menuItemArrow: {
    color: '#888',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E50914',
  },
  deleteButtonText: {
    color: '#E50914',
    fontSize: 16,
  },
  bottomSpace: {
    height: 100,
  },
});

export default ProfileScreen;