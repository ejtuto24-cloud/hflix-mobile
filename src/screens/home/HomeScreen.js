import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { movieService, categoryService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [featuredRes, newRes, popularRes, categoriesRes] = await Promise.all([
        movieService.getFeatured(),
        movieService.getNew(),
        movieService.getPopular(),
        categoryService.getAll(),
      ]);

      setFeaturedMovies(featuredRes.data.data.movies);
      setNewMovies(newRes.data.data.movies);
      setPopularMovies(popularRes.data.data.movies);
      setCategories(categoriesRes.data.data.categories);
    } catch (error) {
      if (error.response?.data?.code === 'SUBSCRIPTION_EXPIRED') {
        Alert.alert(
          'Abonnement expiré',
          'Votre abonnement est expiré. Veuillez renouveler votre abonnement.',
          [{ text: 'Renouveler', onPress: () => navigation.navigate('Payment') }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const MovieCard = ({ movie }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => navigation.navigate('MovieDetail', { movieId: movie.id })}
    >
      {movie.thumbnail ? (
        <Image source={{ uri: movie.thumbnail }} style={styles.movieThumbnail} />
      ) : (
        <View style={styles.moviePlaceholder}>
          <Text style={styles.moviePlaceholderText}>🎬</Text>
        </View>
      )}
      <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
      <Text style={styles.movieCategory}>{movie.category?.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E50914" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🎬 HFlix</Text>
        <Text style={styles.greeting}>Bonjour, {user?.name} 👋</Text>
      </View>

      {/* Films en vedette */}
      {featuredMovies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ En vedette</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Nouveautés */}
      {newMovies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🆕 Nouveautés</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {newMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Films populaires */}
      {popularMovies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Populaires</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Catégories */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📂 Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('MovieList', { categoryId: category.id, categoryName: category.name })}
              >
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category._count?.movies || 0} films</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Message si aucun film */}
      {featuredMovies.length === 0 && newMovies.length === 0 && popularMovies.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🎬</Text>
          <Text style={styles.emptyTitle}>Aucun film disponible</Text>
          <Text style={styles.emptySubtitle}>Les films seront bientôt disponibles</Text>
        </View>
      )}

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
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
  },
  greeting: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  movieCard: {
    width: 140,
    marginLeft: 20,
  },
  movieThumbnail: {
    width: 140,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  moviePlaceholder: {
    width: 140,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moviePlaceholderText: {
    fontSize: 40,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 8,
  },
  movieCategory: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  categoryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginLeft: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  categoryName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryCount: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
  bottomSpace: {
    height: 100,
  },
});

export default HomeScreen;