import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, Text, Modal, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useJobs } from '../context/JobsContext';
import { RootStackParamList, Job } from '../types';
import JobCard from '../components/JobCard';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const SavedJobsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { savedJobs, removeJob } = useJobs();
  const navigation = useNavigation<Nav>();

  const [pendingJob, setPendingJob] = useState<Job | null>(null);

  const handleViewDetail = useCallback(
    (job: Job) => navigation.navigate('JobDetail', { job, fromSaved: true }),
    [navigation],
  );

  const handleRemoveRequest = useCallback((job: Job) => {
    setPendingJob(job);
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (pendingJob) {
      removeJob(pendingJob.id);
      setPendingJob(null);
    }
  }, [pendingJob, removeJob]);

  const handleCancelRemove = useCallback(() => {
    setPendingJob(null);
  }, []);

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {savedJobs.length > 0 && (
        <View style={styles.statsBar}>
          <Text style={[styles.statsText, { color: theme.text.secondary }]}>
            <Text style={[styles.statsCount, { color: theme.primary }]}>
              {savedJobs.length}
            </Text>
            {' '}saved job{savedJobs.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={savedJobs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onViewDetail={() => handleViewDetail(item)}
            showRemove
            onRemove={() => handleRemoveRequest(item)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          savedJobs.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          <EmptyState
            iconName="bookmark-outline"
            title="No saved jobs yet"
            subtitle="Tap the bookmark icon on any job to save it here for later."
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Confirmation Modal */}
      <Modal
        visible={!!pendingJob}
        transparent
        animationType="fade"
        onRequestClose={handleCancelRemove}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>

            {/* Icon */}
            <View style={[styles.iconWrap, { backgroundColor: theme.dangerLight }]}>
              <Ionicons name="trash-outline" size={32} color={theme.danger} />
            </View>

            {/* Text */}
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              Remove Saved Job?
            </Text>
            <Text style={[styles.modalMessage, { color: theme.text.secondary }]}>
              Are you sure you want to remove{' '}
              <Text style={{ fontWeight: '700', color: theme.text.primary }}>
                {pendingJob?.title}
              </Text>
              {' '}at{' '}
              <Text style={{ fontWeight: '700', color: theme.text.primary }}>
                {pendingJob?.companyName}
              </Text>
              {' '}from your saved jobs?
            </Text>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            {/* Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}
                onPress={handleCancelRemove}
                activeOpacity={0.8}>
                <Text style={[styles.cancelBtnText, { color: theme.text.secondary }]}>
                  Keep It
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: theme.danger }]}
                onPress={handleConfirmRemove}
                activeOpacity={0.85}>
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.confirmBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: { flex: 1 },
    statsBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    statsText: { fontSize: 13 },
    statsCount: { fontWeight: '700', fontSize: 14 },
    list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
    listEmpty: { flex: 1 },

    // Modal
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    modal: {
      width: '100%',
      borderRadius: 24,
      padding: 28,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 10,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    modalMessage: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 20,
    },
    divider: {
      height: 1,
      width: '100%',
      marginBottom: 20,
    },
    btnRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1.5,
    },
    cancelBtnText: {
      fontWeight: '700',
      fontSize: 15,
    },
    confirmBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingVertical: 14,
      borderRadius: 12,
    },
    confirmBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },
  });

export default SavedJobsScreen;