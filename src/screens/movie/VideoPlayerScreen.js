import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenCapture from 'expo-screen-capture';

const { width } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { movie } = route.params;
  const ref = useRef(null);

  const player = useVideoPlayer(movie.videoUrl, (player) => {
    player.play();
  });

  useEffect(() => {
    // ===== BLOQUER LE SCREEN RECORDING =====
    const blockScreenCapture = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
      } catch (error) {
        console.log('Screen capture prevention:', error);
      }
    };

    blockScreenCapture();

    // ===== DÉBLOQUER QUAND ON QUITTE =====
    return async () => {
      try {
        await ScreenCapture.allowScreenCaptureAsync();
      } catch (error) {
        console.log('Screen capture allow:', error);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* ===== LECTEUR VIDÉO ===== */}
      <View style={styles.videoWrapper}>

        <VideoView
          ref={ref}
          style={styles.video}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
          nativeControls
        />

        {/* Bouton retour */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

      </View>

      {/* ===== INFORMATIONS ===== */}
      <ScrollView style={styles.infoScroll} showsVerticalScrollIndicator={false}>

        <View style={styles.infoContainer}>

          {/* Badge */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NOUVEAU</Text>
            </View>
            {movie.releaseYear && (
              <Text style={styles.year}>{movie.releaseYear}</Text>
            )}
            {movie.duration && (
              <Text style={styles.duration}>
                {Math.floor(movie.duration / 60)}h {movie.duration % 60}min
              </Text>
            )}
          </View>

          {/* Titre */}
          <Text style={styles.movieTitle}>{movie.title}</Text>

          {/* Catégorie */}
          <Text style={styles.category}>{movie.category?.name}</Text>

          {/* Boutons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => player.play()}
            >
              <Text style={styles.playButtonText}>▶  Lire</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pauseButton}
              onPress={() => player.pause()}
            >
              <Text style={styles.pauseButtonText}>⏸  Pause</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          {movie.description && (
            <Text style={styles.description}>{movie.description}</Text>
          )}

          {/* Séparateur */}
          <View style={styles.separator} />

          {/* Détails */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Détails</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Genre :</Text>
              <Text style={styles.detailValue}>{movie.category?.name}</Text>
            </View>
            {movie.releaseYear && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Année :</Text>
                <Text style={styles.detailValue}>{movie.releaseYear}</Text>
              </View>
            )}
            {movie.duration && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Durée :</Text>
                <Text style={styles.detailValue}>
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}min
                </Text>
              </View>
            )}
            {/* Badge sécurité */}
            <View style={styles.secureRow}>
              <Text style={styles.secureText}>🔒 Contenu protégé contre l'enregistrement</Text>
            </View>
          </View>

        </View>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoWrapper: {
    width: width,
    height: width * 9 / 16,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoScroll: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  infoContainer: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  badge: {
    backgroundColor: '#E50914',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  year: {
    color: '#aaa',
    fontSize: 14,
  },
  duration: {
    color: '#aaa',
    fontSize: 14,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 32,
  },
  category: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  playButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: '#222',
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
  },
  detailsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#888',
    fontSize: 14,
    width: 80,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  secureRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  secureText: {
    color: '#555',
    fontSize: 12,
  },
});

export default VideoPlayerScreen;