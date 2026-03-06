import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { useJobs } from '../context/JobsContext';
import { RootStackParamList, Job } from '../types';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const JobFinderScreen: React.FC = () => {
  const { theme } = useTheme();
  const { jobs, loading, error, fetchJobs, appliedJobs } = useJobs();
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const filtered = useMemo(() => {
    // Exclude jobs the user has already applied for
    const appliedIds = new Set(appliedJobs.map(a => a.job.id));
    const unapplied  = jobs.filter(j => !appliedIds.has(j.id));

    const q = search.toLowerCase().trim();
    if (!q) return unapplied;
    return unapplied.filter(
      j =>
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q),
    );
  }, [jobs, appliedJobs, search]);

  const handleViewDetail = useCallback(
    (job: Job) => navigation.navigate('JobDetail', { job, fromSaved: false }),
    [navigation],
  );

  if (loading && jobs.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
          Fetching latest jobs...
        </Text>
      </View>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <EmptyState
          iconName="cloud-offline-outline"
          title="Something went wrong"
          subtitle={error}
        />
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: theme.primary }]}
          onPress={fetchJobs}>
          <Ionicons name="refresh-outline" size={16} color="#fff" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SearchBar value={search} onChangeText={setSearch} />

      {jobs.length > 0 && (
        <View style={styles.statsBar}>
          <Text style={[styles.statsText, { color: theme.text.secondary }]}>
            <Text style={[styles.statsCount, { color: theme.primary }]}>
              {filtered.length}
            </Text>
            {' '}job{filtered.length !== 1 ? 's' : ''} available
          </Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onViewDetail={() => handleViewDetail(item)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            iconName={search ? 'search-outline' : 'briefcase-outline'}
            title={search ? 'No jobs found' : 'All caught up!'}
            subtitle={
              search
                ? `No results for "${search}". Try a different keyword.`
                : 'You have applied to all available jobs.'
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchJobs}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  statsBar: { paddingHorizontal: 20, paddingBottom: 8 },
  statsText: { fontSize: 13 },
  statsCount: { fontWeight: '700', fontSize: 14 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 12,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default JobFinderScreen;