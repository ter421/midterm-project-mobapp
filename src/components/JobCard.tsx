import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useJobs } from '../context/JobsContext';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onViewDetail: () => void;
  showRemove?: boolean;
  onRemove?: () => void;
}

const COMPANY_COLORS = [
  '#0A6EBD', '#06B6D4', '#8B5CF6', '#F59E0B',
  '#EF4444', '#10B981', '#EC4899', '#6366F1',
];

const getCompanyColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
};

const CompanyLogo: React.FC<{ job: Job; size: number; theme: any }> = ({ job, size, theme }) => {
  const [imgError, setImgError] = React.useState(false);
  const companyColor = getCompanyColor(job.companyName);
  const borderRadius = size * 0.28;

  if (job.companyLogo && !imgError) {
    return (
      <Image
        source={{ uri: job.companyLogo }}
        style={{
          width: size,
          height: size,
          borderRadius,
          backgroundColor: theme.cardAlt,
        }}
        resizeMode="contain"
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback to colored initial
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius,
      backgroundColor: companyColor + '18',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ fontSize: size * 0.44, fontWeight: '800', color: companyColor }}>
        {job.companyName.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

const JobCard: React.FC<JobCardProps> = ({ job, onViewDetail, showRemove, onRemove }) => {
  const { theme } = useTheme();
  const { saveJob, isJobSaved, isJobApplied } = useJobs();
  const saved   = isJobSaved(job.id);
  const applied = isJobApplied(job.id);
  const styles  = createStyles(theme);

  return (
    <View style={styles.card}>

      {/* Applied badge */}
      {applied && (
        <View style={styles.appliedBadge}>
          <Ionicons name="checkmark-circle" size={12} color={theme.accent} />
          <Text style={[styles.appliedBadgeText, { color: theme.accent }]}>Applied</Text>
        </View>
      )}

      {/* Header row */}
      <View style={styles.header}>
        <CompanyLogo job={job} size={50} theme={theme} />

        <View style={styles.headerText}>
          <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
          <Text style={styles.company}  numberOfLines={1}>{job.companyName}</Text>
        </View>

        <TouchableOpacity
          style={[styles.bookmarkBtn, saved && { backgroundColor: theme.primaryLight }]}
          onPress={() => !saved && saveJob(job)}
          activeOpacity={saved ? 1 : 0.7}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={saved ? theme.primary : theme.text.tertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      {/* Tags */}
      <View style={styles.tagsRow}>
        {job.locations && job.locations.length > 0 ? (
          <View style={styles.tag}>
            <Ionicons name="location-outline" size={12} color={theme.text.tertiary} />
            <Text style={styles.tagText} numberOfLines={1}>
              {job.locations.join(', ')}
            </Text>
          </View>
        ) : job.location ? (
          <View style={styles.tag}>
            <Ionicons name="location-outline" size={12} color={theme.text.tertiary} />
            <Text style={styles.tagText} numberOfLines={1}>{job.location}</Text>
          </View>
        ) : null}

        {job.workModel ? (
          <View style={styles.tag}>
            <Ionicons name="laptop-outline" size={12} color={theme.text.tertiary} />
            <Text style={styles.tagText}>{job.workModel}</Text>
          </View>
        ) : null}

        {job.jobType ? (
          <View style={[styles.tag, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '30' }]}>
            <Ionicons name="briefcase-outline" size={12} color={theme.primary} />
            <Text style={[styles.tagText, { color: theme.primary }]}>{job.jobType}</Text>
          </View>
        ) : null}

        {job.seniorityLevel ? (
          <View style={styles.tag}>
            <Ionicons name="trending-up-outline" size={12} color={theme.text.tertiary} />
            <Text style={styles.tagText}>{job.seniorityLevel}</Text>
          </View>
        ) : null}

        {job.salary ? (
          <View style={[styles.tag, { backgroundColor: theme.accentLight, borderColor: theme.accent + '30' }]}>
            <Ionicons name="cash-outline" size={12} color={theme.accent} />
            <Text style={[styles.tagText, { color: theme.accent }]}>{job.salary}</Text>
          </View>
        ) : null}

        {job.mainCategory ? (
          <View style={styles.tag}>
            <Ionicons name="grid-outline" size={12} color={theme.text.tertiary} />
            <Text style={styles.tagText}>{job.mainCategory}</Text>
          </View>
        ) : null}
      </View>

      {/* Skills preview — first 3 tags */}
      {job.tags && job.tags.length > 0 && (
        <View style={styles.skillsRow}>
          {job.tags.slice(0, 3).map((tag, i) => (
            <View key={i} style={[styles.skillChip, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '25' }]}>
              <Text style={[styles.skillChipText, { color: theme.primary }]}>{tag}</Text>
            </View>
          ))}
          {job.tags.length > 3 && (
            <View style={[styles.skillChip, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
              <Text style={[styles.skillChipText, { color: theme.text.tertiary }]}>
                +{job.tags.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={onViewDetail}
          activeOpacity={0.85}>
          <Ionicons name="eye-outline" size={15} color={theme.primary} />
          <Text style={[styles.viewBtnText, { color: theme.primary }]}>View Details</Text>
        </TouchableOpacity>

        {showRemove && (
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={onRemove}
            activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={16} color={theme.danger} />
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 18,
      marginBottom: 14,
      shadowColor: theme.mode === 'dark' ? '#000' : '#0A6EBD',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.mode === 'dark' ? 0.25 : 0.07,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    appliedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-end',
      marginBottom: 8,
      backgroundColor: theme.accentLight,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
    },
    appliedBadgeText: { fontSize: 11, fontWeight: '700' },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 14,
    },
    headerText: { flex: 1 },
    jobTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
      lineHeight: 22,
      letterSpacing: -0.2,
    },
    company: {
      fontSize: 13,
      color: theme.text.secondary,
      marginTop: 3,
      fontWeight: '500',
    },
    bookmarkBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },
    divider: { height: 1, marginBottom: 12 },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
      marginBottom: 12,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.cardAlt,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    tagText: {
      fontSize: 11,
      color: theme.text.secondary,
      fontWeight: '500',
    },
    skillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 14,
    },
    skillChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
    },
    skillChipText: { fontSize: 11, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 10 },
    viewBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      backgroundColor: theme.primaryLight,
      paddingVertical: 13,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.primary + '40',
    },
    viewBtnText: { fontWeight: '700', fontSize: 14 },
    removeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.danger + '60',
      backgroundColor: theme.dangerLight,
    },
    removeBtnText: { color: theme.danger, fontWeight: '600', fontSize: 14 },
  });

export default JobCard;