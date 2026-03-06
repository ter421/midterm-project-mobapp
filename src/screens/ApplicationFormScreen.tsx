import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { useJobs } from '../context/JobsContext';
import { useApplicationForm } from '../hooks/useApplicationForm';
import { RootStackParamList } from '../types';
import FormInput from '../components/FormInput';
import ScreenHeader from '../components/ScreenHeader';
import { showFeedbackModal } from '../../App';

type FormRoute = RouteProp<RootStackParamList, 'ApplicationForm'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'ApplicationForm'>;

const ApplicationFormScreen: React.FC = () => {
  const { theme }                       = useTheme();
  const { addAppliedJob, isJobApplied } = useJobs();
  const route                           = useRoute<FormRoute>();
  const navigation                      = useNavigation<Nav>();
  const { job, fromSaved }              = route.params;
  const alreadyApplied                  = isJobApplied(job.id);

  const { formData, errors, isValid, updateField, touchField, touchAll, resetForm } =
    useApplicationForm();

  const styles = createStyles(theme);

  const handleSubmit = () => {
    touchAll();
    if (!isValid || alreadyApplied) return;
    const name = formData.fullName;
    addAppliedJob(job, name);
    resetForm();
    showFeedbackModal({
      jobTitle: job.title,
      companyName: job.companyName,
      applicantName: name,
      fromSaved: fromSaved ?? false,
      onDone: () => navigation.navigate('MainTabs'),
    });
  };

  // ── Already applied ────────────────────────────────────────────────────────
  if (alreadyApplied) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <ScreenHeader title="Apply for Job" />
        <View style={styles.blockedContent}>
          <View style={[styles.blockedIconWrap, { backgroundColor: theme.accentLight }]}>
            <Ionicons name="checkmark-circle" size={56} color={theme.accent} />
          </View>
          <Text style={[styles.blockedTitle, { color: theme.text.primary }]}>Already Applied</Text>
          <Text style={[styles.blockedMessage, { color: theme.text.secondary }]}>
            You've already submitted an application for{' '}
            <Text style={{ fontWeight: '700', color: theme.text.primary }}>{job.title}</Text>
            {' '}at{' '}
            <Text style={{ fontWeight: '700', color: theme.text.primary }}>{job.companyName}</Text>.
            {'\n\n'}
            You cannot apply for the same job more than once.
          </Text>
          <TouchableOpacity
            style={[styles.blockedBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={16} color="#fff" />
            <Text style={styles.blockedBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Normal form ────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Apply for Job" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={[styles.jobCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.jobCardAccent, { backgroundColor: theme.primary }]} />
            <View style={styles.jobCardContent}>
              <Text style={[styles.applyingFor, { color: theme.primary }]}>Applying for</Text>
              <Text style={[styles.jobTitle, { color: theme.text.primary }]} numberOfLines={2}>
                {job.title}
              </Text>
              <Text style={[styles.company, { color: theme.text.secondary }]}>{job.companyName}</Text>
              <View style={styles.jobMeta}>
                {job.location ? (
                  <View style={styles.jobMetaItem}>
                    <Ionicons name="location-outline" size={13} color={theme.text.tertiary} />
                    <Text style={[styles.jobMetaText, { color: theme.text.secondary }]}>{job.location}</Text>
                  </View>
                ) : null}
                {job.jobType ? (
                  <View style={styles.jobMetaItem}>
                    <Ionicons name="briefcase-outline" size={13} color={theme.text.tertiary} />
                    <Text style={[styles.jobMetaText, { color: theme.text.secondary }]}>{job.jobType}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Your Information</Text>
            <FormInput
              label="Full Name" iconName="person-outline" value={formData.fullName}
              onChangeText={t => updateField('fullName', t)} onBlur={() => touchField('fullName')}
              placeholder="e.g. Maria Santos" error={errors.fullName}
              touched={!!formData.fullName || !!errors.fullName}
              autoCapitalize="words" style={{ color: theme.text.primary }}
            />
            <FormInput
              label="Email Address" iconName="mail-outline" value={formData.email}
              onChangeText={t => updateField('email', t)} onBlur={() => touchField('email')}
              placeholder="e.g. maria@email.com" error={errors.email}
              touched={!!formData.email || !!errors.email}
              keyboardType="email-address" autoCapitalize="none" style={{ color: theme.text.primary }}
            />
            <FormInput
              label="Contact Number" iconName="call-outline" value={formData.contactNumber}
              onChangeText={t => updateField('contactNumber', t)} onBlur={() => touchField('contactNumber')}
              placeholder="e.g. 09171234567" error={errors.contactNumber}
              touched={!!formData.contactNumber || !!errors.contactNumber}
              keyboardType="phone-pad" maxLength={13} style={{ color: theme.text.primary }}
            />
            <FormInput
              label="Why Should We Hire You?" iconName="chatbubble-outline" value={formData.whyHire}
              onChangeText={t => updateField('whyHire', t)} onBlur={() => touchField('whyHire')}
              placeholder="Tell us about your strengths, skills, and why you're the best fit for this role..."
              error={errors.whyHire} touched={!!formData.whyHire || !!errors.whyHire}
              multiline numberOfLines={6} style={{ color: theme.text.primary }}
            />
            <View style={styles.charCountRow}>
              <Text style={[styles.charCount, { color: theme.text.tertiary }]}>
                {formData.whyHire.length} / 20 minimum characters
              </Text>
              {formData.whyHire.length >= 20 && (
                <Ionicons name="checkmark-circle" size={15} color={theme.accent} />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: isValid ? theme.primary : theme.border }]}
            onPress={handleSubmit} activeOpacity={0.85}>
            <Ionicons name="send" size={17} color={isValid ? '#fff' : theme.text.tertiary} />
            <Text style={[styles.submitText, { color: isValid ? '#fff' : theme.text.tertiary }]}>
              Submit Application
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    root: { flex: 1 },
    blockedContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    blockedIconWrap: { width: 100, height: 100, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
    blockedTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4, marginBottom: 12, textAlign: 'center' },
    blockedMessage: { fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
    blockedBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
    blockedBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    content: { padding: 16, gap: 14 },
    jobCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
    jobCardAccent: { width: 5 },
    jobCardContent: { flex: 1, padding: 16 },
    applyingFor: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
    jobTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3, marginBottom: 3 },
    company: { fontSize: 14, fontWeight: '500', marginBottom: 10 },
    jobMeta: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
    jobMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    jobMetaText: { fontSize: 12, fontWeight: '500' },
    formCard: { borderRadius: 18, borderWidth: 1, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
    sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3, marginBottom: 20 },
    charCountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: -8 },
    charCount: { fontSize: 12 },
    submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 16 },
    submitText: { fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
  });

export default ApplicationFormScreen;