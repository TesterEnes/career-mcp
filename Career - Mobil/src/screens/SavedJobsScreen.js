import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

export default function SavedJobsScreen({ navigation }) {
  // Şimdilik boş liste - gerçek uygulamada AsyncStorage veya veritabanından gelecek
  const [savedJobs, setSavedJobs] = useState([]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💾</Text>
      <Text style={styles.emptyTitle}>Henüz kayıtlı iş yok</Text>
      <Text style={styles.emptyDescription}>
        İş ilanlarını kaydetmek için iş detay sayfasında "Kaydet" butonunu kullanın
      </Text>
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => navigation.navigate('JobSearch')}
      >
        <Text style={styles.searchButtonText}>İş Ara</Text>
      </TouchableOpacity>
    </View>
  );

  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { job: item })}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <TouchableOpacity style={styles.removeButton}>
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.jobCompany}>{item.company}</Text>
      <Text style={styles.jobLocation}>📍 {item.location}</Text>
      <Text style={styles.jobSalary}>💰 {item.salary}</Text>
      <Text style={styles.savedDate}>Kaydedilme: {new Date().toLocaleDateString('tr-TR')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kayıtlı İşler</Text>
        <Text style={styles.headerSubtitle}>
          {savedJobs.length} kayıtlı iş
        </Text>
      </View>

      <FlatList
        data={savedJobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={savedJobs.length === 0 ? styles.emptyList : styles.jobsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  emptyList: {
    flex: 1,
  },
  jobsList: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 20,
    color: '#f44336',
    fontWeight: 'bold',
  },
  jobCompany: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  jobLocation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  jobSalary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  savedDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
