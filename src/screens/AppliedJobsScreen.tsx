import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useJobs } from '../context/JobsContext';
import EmptyState from '../components/EmptyState';

const AppliedJobsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { appliedJobs } = useJobs();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {appliedJobs.length > 0 && (
        <View style={styles.statsBar}>
          <Text style={[styles.statsText, { color: theme.text.secondary }]}>
            <Text style={[styles.statsCount, { color: theme.primary }]}>
              {appliedJobs.length}
            </Text>
            {' '}application{appliedJobs.length !== 1 ? 's' : ''} submitted
          </Text>
        </View>
      )}
      <FlatList
        data={appliedJobs}
        keyExtractor={item => item.job.id}
        renderItem={({ item }) => {
          const companyInitial = item.job.companyName.charAt(0).toUpperCase();
          return (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* Status strip */}
              <View style={[styles.statusStrip, { backgroundColor: theme.accent }]} />

              <View style={styles.cardInner}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={[styles.logo, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.logoText, { color: theme.primary }]}>{companyInitial}</Text>
                  </View>
                  <View style={styles.cardTitles}>
                    <Text style={[styles.jobTitle, { color: theme.text.primary }]} numberOfLines={1}>
                      {item.job.title}
                    </Text>
                    <Text style={[styles.company, { color: theme.text.secondary }]} numberOfLines={1}>
                      {item.job.companyName}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: theme.accentLight }]}>
                    <Ionicons name="checkmark-circle" size={13} color={theme.accent} />
                    <Text style={[styles.statusText, { color: theme.accent }]}>Sent</Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                {/* Meta row */}
                <View style={styles.metaRow}>
                  {item.job.location ? (
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={13} color={theme.text.tertiary} />
                      <Text style={[styles.metaText, { color: theme.text.secondary }]} numberOfLines={1}>
                        {item.job.location}
                      </Text>
                    </View>
                  ) : null}
                  {item.job.jobType ? (
                    <View style={styles.metaItem}>
                      <Ionicons name="briefcase-outline" size={13} color={theme.text.tertiary} />
                      <Text style={[styles.metaText, { color: theme.text.secondary }]}>
                        {item.job.jobType}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Footer */}
                <View style={[styles.footer, { borderTopColor: theme.divider }]}>
                  <View style={styles.footerItem}>
                    <Ionicons name="person-outline" size={13} color={theme.text.tertiary} />
                    <Text style={[styles.footerText, { color: theme.text.secondary }]}>
                      {item.applicantName}
                    </Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={13} color={theme.text.tertiary} />
                    <Text style={[styles.footerText, { color: theme.text.secondary }]}>
                      {formatDate(item.appliedAt)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        contentContainerStyle={[
          styles.list,
          appliedJobs.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          <EmptyState
            iconName="send-outline"
            title="No applications yet"
            subtitle="Apply to jobs and they'll appear here so you can track them easily."
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  statsText: { fontSize: 13 },
  statsCount: { fontWeight: '700', fontSize: 14 },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  listEmpty: { flex: 1 },
  card: {
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    flexDirection: 'row',
  },
  statusStrip: {
    width: 4,
  },
  cardInner: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardTitles: { flex: 1 },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  company: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AppliedJobsScreen;