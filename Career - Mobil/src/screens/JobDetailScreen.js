import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params;
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      'Başarılı',
      isSaved ? 'İş ilanı kayıtlı işlerden kaldırıldı' : 'İş ilanı kayıtlı işlere eklendi'
    );
  };

  const handleApply = () => {
    Alert.alert(
      'Başvuru',
      'Bu özellik yakında aktif olacak. Şimdilik şirketin web sitesinden başvuru yapabilirsiniz.',
      [
        { text: 'Tamam', style: 'default' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobCompany}>{job.company}</Text>
          <Text style={styles.jobLocation}>📍 {job.location}</Text>
          <Text style={styles.jobSalary}>💰 {job.salary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İş Tanımı</Text>
          <Text style={styles.sectionContent}>{job.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aranan Nitelikler</Text>
          {job.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İş Detayları</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Çalışma Türü:</Text>
            <Text style={styles.detailValue}>{job.type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>İlan Tarihi:</Text>
            <Text style={styles.detailValue}>{job.postedDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Şirket Hakkında</Text>
          <Text style={styles.sectionContent}>
            {job.company} sektöründe lider konumda olan bir şirkettir. 
            Çalışanlarına gelişim fırsatları sunan ve inovatif projelerde 
            yer alma imkanı veren dinamik bir çalışma ortamı sağlamaktadır.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.saveButton, isSaved && styles.savedButton]}
          onPress={handleSaveJob}
        >
          <Text style={[styles.saveButtonText, isSaved && styles.savedButtonText]}>
            {isSaved ? '✓ Kaydedildi' : '💾 Kaydet'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>Başvur</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  jobCompany: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  jobLocation: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  jobSalary: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requirementBullet: {
    fontSize: 16,
    color: '#2196F3',
    marginRight: 8,
    marginTop: 2,
  },
  requirementText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  savedButton: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  savedButtonText: {
    color: '#4caf50',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
