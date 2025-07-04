import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState({
    name: 'Kullanıcı Adı',
    email: 'kullanici@email.com',
    phone: '+90 555 123 4567',
    location: 'İstanbul, Türkiye',
    title: 'Software Developer',
    experience: '3 yıl',
  });

  const profileOptions = [
    { title: 'Kişisel Bilgiler', icon: '👤', action: 'editProfile' },
    { title: 'CV Yönetimi', icon: '📄', action: 'manageCV' },
    { title: 'Bildirimler', icon: '🔔', action: 'notifications' },
    { title: 'Gizlilik', icon: '🔒', action: 'privacy' },
    { title: 'Yardım', icon: '❓', action: 'help' },
    { title: 'Hakkında', icon: 'ℹ️', action: 'about' },
  ];

  const handleOptionPress = (action) => {
    switch (action) {
      case 'editProfile':
        Alert.alert('Bilgi', 'Profil düzenleme özelliği yakında aktif olacak');
        break;
      case 'manageCV':
        Alert.alert('Bilgi', 'CV yönetimi özelliği yakında aktif olacak');
        break;
      case 'notifications':
        Alert.alert('Bilgi', 'Bildirim ayarları yakında aktif olacak');
        break;
      case 'privacy':
        Alert.alert('Bilgi', 'Gizlilik ayarları yakında aktif olacak');
        break;
      case 'help':
        Alert.alert('Yardım', 'Sorularınız için destek@kariyer.com adresine yazabilirsiniz');
        break;
      case 'about':
        Alert.alert('Hakkında', 'Kariyer Asistanı v1.0.0\nGeliştirici: Kariyer Ekibi');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Bilgi', 'Çıkış yapma özelliği yakında aktif olacak');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userTitle}>{user.title}</Text>
        <Text style={styles.userLocation}>📍 {user.location}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Başvuru</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Kayıtlı İş</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.experience}</Text>
          <Text style={styles.statLabel}>Deneyim</Text>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
        <View style={styles.contactItem}>
          <Text style={styles.contactIcon}>📧</Text>
          <Text style={styles.contactText}>{user.email}</Text>
        </View>
        <View style={styles.contactItem}>
          <Text style={styles.contactIcon}>📱</Text>
          <Text style={styles.contactText}>{user.phone}</Text>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.sectionTitle}>Ayarlar</Text>
        {profileOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={() => handleOptionPress(option.action)}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={styles.optionTitle}>{option.title}</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  userLocation: {
    fontSize: 14,
    color: '#888',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  contactInfo: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
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
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  contactText: {
    fontSize: 16,
    color: '#555',
  },
  optionsContainer: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  optionTitle: {
    fontSize: 16,
    color: '#333',
  },
  optionArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
