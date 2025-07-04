import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

export default function JobSearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'healthy', 'unhealthy', 'unknown'

  // API durumunu kontrol et
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const isHealthy = await ApiService.checkHealth();
      setApiStatus(isHealthy ? 'healthy' : 'unhealthy');
    } catch (error) {
      setApiStatus('unhealthy');
    }
  };

  const searchJobs = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Uyarı', 'Lütfen arama terimi girin');
      return;
    }

    setLoading(true);

    try {
      const searchParams = {
        keywords: searchQuery.trim(),
        location: location.trim() || 'Türkiye',
        locale: 'tr_TR',
        sort: 'relevance',
        pagesize: 20
      };

      console.log('Searching jobs with params:', searchParams);

      const result = await ApiService.searchJobs(searchParams);

      if (result.success) {
        setJobs(result.jobs || []);

        // API durumu hakkında kullanıcıyı bilgilendir
        if (result.type === 'demo' || result.type === 'mock' || result.type === 'enhanced_mock' || result.type === 'agent' || result.type === 'fallback') {
          let alertTitle = 'Bilgi';
          let alertMessage = result.message || 'Demo veriler gösteriliyor.';

          // Farklı veri türleri için özel mesajlar
          switch (result.type) {
            case 'agent':
              alertTitle = '🤖 Career Agent';
              alertMessage = 'İş ilanları Career Agent tarafından bulundu!';
              break;
            case 'enhanced_mock':
              alertTitle = '📋 Gelişmiş Demo';
              alertMessage = 'Gelişmiş demo veriler gösteriliyor. Gerçek API bağlantısı için sunucu çalıştırın.';
              break;
            case 'demo':
              alertTitle = '🔧 Demo Modu';
              alertMessage = result.enhanced ? 'Gelişmiş demo veriler gösteriliyor.' : 'Temel demo veriler gösteriliyor.';
              break;
            case 'fallback':
              alertTitle = '⚠️ Yedek Sistem';
              alertMessage = 'Ana sistem yanıt vermedi, yedek veriler gösteriliyor.';
              break;
            default:
              alertTitle = 'Bilgi';
              alertMessage = result.message || 'Demo veriler gösteriliyor.';
          }

          Alert.alert(alertTitle, alertMessage, [{ text: 'Tamam' }]);
        } else if (result.type === 'real') {
          // Gerçek API verisi için başarı mesajı (opsiyonel)
          console.log('✅ Gerçek API verisi alındı');
        }
      } else {
        throw new Error(result.message || 'İş arama başarısız');
      }
    } catch (error) {
      console.error('Job search error:', error);
      Alert.alert(
        'Hata',
        'İş arama sırasında bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { job: item })}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobSalary}>{item.salary}</Text>
      </View>
      <Text style={styles.jobCompany}>{item.company}</Text>
      <Text style={styles.jobLocation}>📍 {item.location}</Text>
      <Text style={styles.jobDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.jobFooter}>
        <Text style={styles.jobType}>{item.type}</Text>
        <Text style={styles.jobDate}>{item.postedDate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {/* API Durum Göstergesi */}
        <View style={styles.apiStatusContainer}>
          <View style={[
            styles.apiStatusDot,
            { backgroundColor: apiStatus === 'healthy' ? '#4CAF50' : apiStatus === 'unhealthy' ? '#FF9800' : '#9E9E9E' }
          ]} />
          <Text style={styles.apiStatusText}>
            {apiStatus === 'healthy' ? 'API Bağlı' : apiStatus === 'unhealthy' ? 'Demo Mod' : 'Kontrol Ediliyor...'}
          </Text>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="İş pozisyonu, şirket veya beceri ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TextInput
          style={styles.locationInput}
          placeholder="Şehir veya lokasyon (örn: İstanbul)"
          value={location}
          onChangeText={setLocation}
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={searchJobs}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Aranıyor...' : 'İş Ara'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        {jobs.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {jobs.length} iş ilanı bulundu
            </Text>
            {apiStatus === 'unhealthy' && (
              <Text style={styles.demoModeText}>
                Demo veriler gösteriliyor
              </Text>
            )}
          </View>
        )}

        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.jobsList}
          refreshing={loading}
          onRefresh={() => {
            if (searchQuery.trim()) {
              searchJobs();
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  apiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  apiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  apiStatusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#BBBBBB',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsHeader: {
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  demoModeText: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
  },
  jobsList: {
    paddingBottom: 20,
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
  jobSalary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  jobCompany: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  jobLocation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  jobDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobType: {
    fontSize: 12,
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  jobDate: {
    fontSize: 12,
    color: '#999',
  },
});
