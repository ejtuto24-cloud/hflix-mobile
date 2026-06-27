import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { movieService, userService } from '../../services/api';

const MovieDetailScreen = ({ route, navigation }) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadMovie();
  }, []);

  const loadMovie = async () => {
    try {
      const response = await movieService.getById(movieId);
      setMovie(response.data.data.movie);

      // Ajouter à l'historique
      await userService.addToHistory(movieId);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le film.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await userService.removeFromFavorites(movieId);
        setIsFavorite(false);
        Alert.alert('✅', 'Retiré des favoris.');
      } else {
        await userService.addToFavorites(movieId);
        setIsFavorite(true);
        Alert.alert('✅', 'Ajouté aux favoris.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier les favoris.');
    }
  };

  const handleWatch = () => {
    if (!movie.videoUrl) {
      Alert.alert('Info', 'La vidéo n\'est pas encore disponible.');
      return;
    }
    navigation.navigate('VideoPlayer', { movie });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie) return null;

  return (
    <ScrollView style={styles.container}>

      {/* Image bannière */}
      {movie.banner || movie.thumbnail ? (
        <Image
          source={{ uri: movie.banner || movie.thumbnail }}
          style={styles.banner}
        />
      ) : (
        <View style={styles.bannerPlaceholder}>
          <Text style={styles.bannerPlaceholderText}>🎬</Text>
        </View>
      )}

      {/* Bouton retour */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      {/* Informations */}
      <View style={styles.infoContainer}>

        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.metaContainer}>
          <Text style={styles.meta}>{movie.category?.name}</Text>
          {movie.releaseYear && (
            <Text style={styles.meta}>• {movie.releaseYear}</Text>
          )}
          {movie.duration && (
            <Text style={styles.meta}>• {Math.floor(movie.duration / 60)}h {movie.duration % 60}min</Text>
          )}
        </View>

        {movie.description && (
          <Text style={styles.description}>{movie.description}</Text>
        )}

        {/* Boutons */}
        <TouchableOpacity style={styles.watchButton} onPress={handleWatch}>
          <Text style={styles.watchButtonText}>▶ Regarder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
          onPress={toggleFavorite}
        >
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? '❤️ Dans les favoris' : '🤍 Ajouter aux favoris'}
          </Text>
        </TouchableOpacity>

      </View>
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
  banner: {
    width: '100%',
    height: 250,
    backgroundColor: '#1a1a1a',
  },
  bannerPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPlaceholderText: {
    fontSize: 80,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  meta: {
    color: '#888',
    fontSize: 14,
    marginRight: 8,
  },
  description: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },
  watchButton: {
    backgroundColor: '#E50914',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  watchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  favoriteButtonActive: {
    borderColor: '#E50914',
  },
  favoriteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MovieDetailScreen;