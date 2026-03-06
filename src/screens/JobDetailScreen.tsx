import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Linking,
  Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';

import { useTheme } from '../context/ThemeContext';
import { useJobs } from '../context/JobsContext';
import { RootStackParamList } from '../types';
import ScreenHeader from '../components/ScreenHeader';
import { formatTimestamp } from '../utils/date'; // ← shared utility

type DetailRoute = RouteProp<RootStackParamList, 'JobDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'JobDetail'>;

const COMPANY_COLORS = [
  '#0A6EBD', '#06B6D4', '#8B5CF6', '#F59E0B',
  '#EF4444', '#10B981', '#EC4899', '#6366F1',
];

const getCompanyColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
};

const isHtml = (str: string) => /<[a-z][\s\S]*>/i.test(str);

// ── Reusable sub-components ──────────────────────────────────────────────────

const SectionCard: React.FC<{
  icon: string;
  title: string;
  theme: any;
  children: React.ReactNode;
}> = ({ icon, title, theme, children }) => (
  <View style={[sc.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={sc.header}>
      <Ionicons name={icon as any} size={18} color={theme.primary} />
      <Text style={[sc.title, { color: theme.text.primary }]}>{title}</Text>
    </View>
    {children}
  </View>
);

const sc = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  title:  { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
});

const DetailRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  theme: any;
  onPress?: () => void;
  last?: boolean;
}> = ({ icon, label, value, theme, onPress, last }) => (
  <TouchableOpacity
    style={[dr.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.divider }]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}>
    <View style={[dr.iconWrap, { backgroundColor: theme.primaryLight }]}>
      <Ionicons name={icon as any} size={16} color={theme.primary} />
    </View>
    <View style={dr.texts}>
      <Text style={[dr.label, { color: theme.text.tertiary }]}>{label}</Text>
      <Text style={[dr.value, { color: onPress ? theme.primary : theme.text.primary }]}>
        {value}
      </Text>
    </View>
    {onPress && <Ionicons name="open-outline" size={15} color={theme.primary} />}
  </TouchableOpacity>
);

const dr = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  iconWrap:{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  texts:   { flex: 1 },
  label:   { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  value:   { fontSize: 14, fontWeight: '600', marginTop: 1 },
});

const Tag: React.FC<{ label: string; theme: any }> = ({ label, theme }) => (
  <View style={[tg.chip, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '30' }]}>
    <Text style={[tg.text, { color: theme.primary }]}>{label}</Text>
  </View>
);

const tg = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  text: { fontSize: 13, fontWeight: '600' },
});

// ── Main screen ──────────────────────────────────────────────────────────────

const JobDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<Nav>();
  const { job, fromSaved } = route.params;
  const { saveJob, unsaveJob, isJobSaved, isJobApplied } = useJobs();
  const { width } = useWindowDimensions();

  const saved        = isJobSaved(job.id);
  const applied      = isJobApplied(job.id);
  const companyColor = getCompanyColor(job.companyName);
  const styles       = React.useMemo(() => createStyles(theme), [theme]); // ← memoized

  const htmlTagStyles = {
    body:   { color: theme.text.secondary, fontSize: 14, lineHeight: 22 },
    h1:     { color: theme.text.primary,   fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 6 },
    h2:     { color: theme.text.primary,   fontSize: 16, fontWeight: '800', marginTop: 10, marginBottom: 6 },
    h3:     { color: theme.text.primary,   fontSize: 15, fontWeight: '700', marginTop: 10, marginBottom: 6 },
    p:      { color: theme.text.secondary, fontSize: 14, lineHeight: 22,   marginBottom: 8 },
    li:     { color: theme.text.secondary, fontSize: 14, lineHeight: 22,   marginBottom: 4 },
    ul:     { marginLeft: 4,  marginBottom: 8 },
    ol:     { marginLeft: 4,  marginBottom: 8 },
    strong: { color: theme.text.primary,   fontWeight: '700' },
    em:     { fontStyle: 'italic' },
    a:      { color: theme.primary },
  };

  const renderContent = (content: string) =>
    isHtml(content) ? (
      <RenderHtml
        contentWidth={width - 64}
        source={{ html: content }}
        tagsStyles={htmlTagStyles}
        baseStyle={{ color: theme.text.secondary, fontSize: 14, lineHeight: 22 }}
        enableExperimentalBRCollapsing
      />
    ) : (
      <Text style={[styles.bodyText, { color: theme.text.secondary }]}>{content}</Text>
    );

  // Build overview rows from exact API fields
  const overviewRows: { icon: string; label: string; value: string; link?: string }[] = [];

  if (job.mainCategory)
    overviewRows.push({ icon: 'grid-outline',        label: 'Category',    value: job.mainCategory });
  if (job.jobType)
    overviewRows.push({ icon: 'briefcase-outline',   label: 'Job Type',    value: job.jobType });
  if (job.workModel)
    overviewRows.push({ icon: 'laptop-outline',      label: 'Work Model',  value: job.workModel });
  if (job.seniorityLevel)
    overviewRows.push({ icon: 'trending-up-outline', label: 'Seniority',   value: job.seniorityLevel });
  if (job.locations && job.locations.length > 0)
    overviewRows.push({ icon: 'location-outline',    label: 'Location',    value: job.locations.join(', ') });
  if (job.salary)
    overviewRows.push({ icon: 'cash-outline',        label: 'Salary',      value: job.salary });
  else if (job.currency)
    overviewRows.push({ icon: 'cash-outline',        label: 'Salary',      value: `Currency: ${job.currency} — Amount not disclosed` });
  if (job.pubDate)
    overviewRows.push({ icon: 'calendar-outline',    label: 'Posted',      value: formatTimestamp(job.pubDate) });
  if (job.expiryDate)
    overviewRows.push({ icon: 'alarm-outline',       label: 'Expires',     value: formatTimestamp(job.expiryDate) });
  if (job.applicationLink)
    overviewRows.push({ icon: 'link-outline',        label: 'Listing URL', value: job.applicationLink, link: job.applicationLink });

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Job Details" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero card ─────────────────────────────────────────── */}
        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>

          {/* Company logo or fallback initial */}
          {job.companyLogo ? (
            <Image
              source={{ uri: job.companyLogo }}
              style={[styles.logoImg, { backgroundColor: companyColor + '18' }]}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.logoWrap, { backgroundColor: companyColor + '18' }]}>
              <Text style={[styles.logoText, { color: companyColor }]}>
                {job.companyName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={[styles.jobTitle, { color: theme.text.primary }]}>{job.title}</Text>
          <Text style={[styles.company,  { color: theme.text.secondary }]}>{job.companyName}</Text>

          {/* Quick pills */}
          <View style={styles.tagsRow}>
            {job.locations && job.locations.length > 0 && (
              <View style={[styles.pill, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
                <Ionicons name="location-outline" size={12} color={theme.text.tertiary} />
                <Text style={[styles.pillText, { color: theme.text.secondary }]}>
                  {job.locations.join(', ')}
                </Text>
              </View>
            )}
            {job.workModel && (
              <View style={[styles.pill, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
                <Ionicons name="laptop-outline" size={12} color={theme.text.tertiary} />
                <Text style={[styles.pillText, { color: theme.text.secondary }]}>{job.workModel}</Text>
              </View>
            )}
            {job.jobType && (
              <View style={[styles.pill, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '30' }]}>
                <Ionicons name="briefcase-outline" size={12} color={theme.primary} />
                <Text style={[styles.pillText, { color: theme.primary }]}>{job.jobType}</Text>
              </View>
            )}
            {job.seniorityLevel && (
              <View style={[styles.pill, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
                <Ionicons name="trending-up-outline" size={12} color={theme.text.tertiary} />
                <Text style={[styles.pillText, { color: theme.text.secondary }]}>{job.seniorityLevel}</Text>
              </View>
            )}
            {job.salary && (
              <View style={[styles.pill, { backgroundColor: theme.accentLight, borderColor: theme.accent + '30' }]}>
                <Ionicons name="cash-outline" size={12} color={theme.accent} />
                <Text style={[styles.pillText, { color: theme.accent }]}>{job.salary}</Text>
              </View>
            )}
            {job.mainCategory && (
              <View style={[styles.pill, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
                <Ionicons name="grid-outline" size={12} color={theme.text.tertiary} />
                <Text style={[styles.pillText, { color: theme.text.secondary }]}>{job.mainCategory}</Text>
              </View>
            )}
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: saved ? theme.primaryLight : theme.cardAlt, borderColor: saved ? theme.primary : theme.border },
            ]}
            onPress={() => saved ? unsaveJob(job.id) : saveJob(job)}
            activeOpacity={0.8}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={saved ? theme.primary : theme.text.secondary}
            />
            <Text style={[styles.saveBtnText, { color: saved ? theme.primary : theme.text.secondary }]}>
              {saved ? 'Unsave' : 'Save Job'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Overview ──────────────────────────────────────────── */}
        {overviewRows.length > 0 && (
          <SectionCard icon="list-outline" title="Overview" theme={theme}>
            {overviewRows.map((row, i) => (
              <DetailRow
                key={i}
                icon={row.icon}
                label={row.label}
                value={row.value}
                theme={theme}
                last={i === overviewRows.length - 1}
                onPress={row.link ? () => Linking.openURL(row.link!) : undefined}
              />
            ))}
          </SectionCard>
        )}

        {/* ── Description ───────────────────────────────────────── */}
        {job.description ? (
          <SectionCard icon="document-text-outline" title="Job Description" theme={theme}>
            {renderContent(job.description)}
          </SectionCard>
        ) : null}

        {/* ── Skills / Tags ─────────────────────────────────────── */}
        {job.tags && job.tags.length > 0 && (
          <SectionCard icon="code-slash-outline" title="Skills & Technologies" theme={theme}>
            <View style={styles.skillsWrap}>
              {job.tags.map((tag, i) => (
                <Tag key={i} label={tag} theme={theme} />
              ))}
            </View>
          </SectionCard>
        )}

        {/* ── External apply link ───────────────────────────────── */}
        {job.applicationLink ? (
          <TouchableOpacity
            style={[styles.externalBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => Linking.openURL(job.applicationLink!)}
            activeOpacity={0.8}>
            <View style={[styles.externalBtnIcon, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="open-outline" size={18} color={theme.primary} />
            </View>
            <Text style={[styles.externalBtnText, { color: theme.text.primary }]}>
              View Original Listing
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.text.tertiary} />
          </TouchableOpacity>
        ) : null}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Sticky Apply Button ───────────────────────────────────── */}
      <View style={[styles.stickyBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {applied ? (
          <View style={[styles.appliedBar, { backgroundColor: theme.accentLight, borderColor: theme.accent + '40' }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
            <Text style={[styles.appliedBarText, { color: theme.accent }]}>
              You've already applied for this job
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('ApplicationForm', { job, fromSaved: fromSaved ?? false })}
            activeOpacity={0.85}>
            <Ionicons name="send-outline" size={17} color="#fff" />
            <Text style={styles.applyBtnText}>Apply Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    root: { flex: 1 },
    content: { padding: 16 },

    // Hero
    heroCard: {
      borderRadius: 22,
      padding: 22,
      alignItems: 'center',
      marginBottom: 14,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 4,
    },
    logoImg: {
      width: 76,
      height: 76,
      borderRadius: 18,
      marginBottom: 14,
    },
    logoWrap: {
      width: 76,
      height: 76,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    logoText: { fontSize: 34, fontWeight: '800' },
    jobTitle: {
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: -0.4,
      marginBottom: 6,
    },
    company: { fontSize: 15, fontWeight: '600', marginBottom: 16 },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
      marginBottom: 18,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
    },
    pillText: { fontSize: 12, fontWeight: '600' },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    saveBtnText: { fontSize: 14, fontWeight: '600' },

    // Body text
    bodyText: { fontSize: 14, lineHeight: 23 },

    // Skills
    skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

    // External listing button
    externalBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    externalBtnIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    externalBtnText: { flex: 1, fontSize: 14, fontWeight: '700' },

    // Sticky bar
    stickyBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 28,
      borderTopWidth: 1,
    },
    applyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      paddingVertical: 16,
      borderRadius: 14,
    },
    applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },
    appliedBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
      borderRadius: 14,
      borderWidth: 1.5,
    },
    appliedBarText: { fontWeight: '700', fontSize: 14 },
  });

export default JobDetailScreen;