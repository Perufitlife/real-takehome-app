import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { isTablet, MAX_CONTENT_WIDTH } from '../src/constants/theme';

export default function PayExplainerScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>How we calculated your pay</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BASED ON</Text>
        <Text style={styles.item}>$65,000 income</Text>
        <Text style={styles.item}>40h/week</Text>
        <Text style={styles.item}>Texas · Single filer</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INCLUDES</Text>
        <Text style={styles.item}>Federal tax, FICA & Medicare</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Bi-weekly pay period</Text>
        <Text style={styles.infoText}>Texas has no state tax</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    ...(isTablet ? {
      maxWidth: MAX_CONTENT_WIDTH,
      alignSelf: 'center' as const,
      width: '100%',
    } : {}),
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
    color: '#000000',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999999',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  item: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  infoText: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 8,
  },
});
