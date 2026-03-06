import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { FeedbackPayload } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
type ModalStep = 'success' | 'rating' | 'done';

interface FeedbackModalContextType {
  showFeedbackModal: (payload: FeedbackPayload) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STAR_LABELS   = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];
const STAR_MESSAGES = [
  "We're sorry to hear that.",
  "We'll work harder to improve.",
  'Thanks for the honest feedback!',
  'Great to hear! Almost perfect.',
  'Amazing! So glad you loved it.',
];
const STAR_ICONS = [
  'sad-outline', 'thumbs-down-outline', 'remove-circle-outline',
  'thumbs-up-outline', 'happy-outline',
] as const;

// ─── Context ──────────────────────────────────────────────────────────────────
const FeedbackModalContext = createContext<FeedbackModalContextType>({
  showFeedbackModal: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export const FeedbackModalProvider = ({ children }: { children: ReactNode }) => {
  const { theme }             = useTheme();
  const [payload, setPayload] = useState<FeedbackPayload | null>(null);
  const [step,    setStep]    = useState<ModalStep>('success');
  const [rating,  setRating]  = useState(0);
  const [visible, setVisible] = useState(false);

  const showFeedbackModal = useCallback((p: FeedbackPayload) => {
    setPayload(p);
    setStep('success');
    setRating(0);
    setVisible(true);
  }, []);

  const handleDone = useCallback(() => {
    setVisible(false);
    payload?.onDone();
  }, [payload]);

  const s = useMemo(() => createStyles(theme), [theme]);

  return (
    <FeedbackModalContext.Provider value={{ showFeedbackModal }}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleDone}>
        <View style={s.overlay}>
          <View style={[s.card, { backgroundColor: theme.card }]}>

            {/* ── Step: success ──────────────────────────────────── */}
            {step === 'success' && (
              <>
                <View style={[s.ringOuter, { backgroundColor: theme.accent + '22' }]}>
                  <View style={[s.ringInner, { backgroundColor: theme.accentLight }]}>
                    <Ionicons name="checkmark-circle" size={52} color={theme.accent} />
                  </View>
                </View>

                <Text style={[s.title, { color: theme.text.primary }]}>
                  Application Submitted!
                </Text>

                <View style={[s.badge, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '30' }]}>
                  <Ionicons name="person-circle-outline" size={15} color={theme.primary} />
                  <Text style={[s.badgeText, { color: theme.primary }]}>{payload?.applicantName}</Text>
                </View>

                <Text style={[s.message, { color: theme.text.secondary }]}>
                  Your application for{' '}
                  <Text style={{ fontWeight: '700', color: theme.text.primary }}>{payload?.jobTitle}</Text>
                  {' '}at{' '}
                  <Text style={{ fontWeight: '700', color: theme.text.primary }}>{payload?.companyName}</Text>
                  {' '}has been successfully submitted.
                </Text>

                {payload?.fromSaved && (
                  <View style={[s.note, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
                    <Ionicons name="information-circle-outline" size={14} color={theme.text.tertiary} />
                    <Text style={[s.noteText, { color: theme.text.secondary }]}>
                      This job was removed from Saved Jobs and moved to Applied Jobs.
                    </Text>
                  </View>
                )}

                <View style={[s.divider, { backgroundColor: theme.divider }]} />

                <View style={s.trackRow}>
                  <Ionicons name="send-outline" size={13} color={theme.text.tertiary} />
                  <Text style={[s.trackText, { color: theme.text.tertiary }]}>
                    Track your application in the{' '}
                    <Text style={{ fontWeight: '700', color: theme.primary }}>Applied</Text> tab
                  </Text>
                </View>

                <TouchableOpacity
                  style={[s.primaryBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setStep('rating')}
                  activeOpacity={0.85}>
                  <Ionicons name="star-outline" size={16} color="#fff" />
                  <Text style={s.primaryBtnText}>Rate Your Experience</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.skipBtn} onPress={handleDone}>
                  <Text style={[s.skipText, { color: theme.text.tertiary }]}>Skip for now</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Step: rating ───────────────────────────────────── */}
            {step === 'rating' && (
              <>
                <View style={[s.ringOuter, { backgroundColor: '#F59E0B22' }]}>
                  <View style={[s.ringInner, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="star" size={48} color="#F59E0B" />
                  </View>
                </View>

                <Text style={[s.title, { color: theme.text.primary }]}>
                  How was your experience?
                </Text>

                <Text style={[s.message, { color: theme.text.secondary }]}>
                  Your feedback helps us improve the app for everyone.
                </Text>

                <View style={s.starsRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      activeOpacity={0.7}
                      style={s.starBtn}>
                      <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={44}
                        color={star <= rating ? '#F59E0B' : theme.text.tertiary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[s.ratingLabel, { color: rating > 0 ? '#F59E0B' : theme.text.tertiary }]}>
                  {rating > 0 ? STAR_LABELS[rating - 1] : 'Tap a star to rate'}
                </Text>

                {rating > 0 && (
                  <View style={[s.chip, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B40' }]}>
                    <Ionicons name={STAR_ICONS[rating - 1]} size={15} color="#F59E0B" />
                    <Text style={s.chipText}>{STAR_MESSAGES[rating - 1]}</Text>
                  </View>
                )}

                <View style={[s.divider, { backgroundColor: theme.divider, marginTop: 16 }]} />

                <TouchableOpacity
                  style={[s.primaryBtn, { backgroundColor: rating > 0 ? theme.primary : theme.border }]}
                  onPress={() => { if (rating > 0) setStep('done'); }}
                  activeOpacity={0.85}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color={rating > 0 ? '#fff' : theme.text.tertiary}
                  />
                  <Text style={[s.primaryBtnText, { color: rating > 0 ? '#fff' : theme.text.tertiary }]}>
                    {rating > 0 ? 'Submit Rating' : 'Select a star first'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.skipBtn} onPress={handleDone}>
                  <Text style={[s.skipText, { color: theme.text.tertiary }]}>Skip rating</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Step: done ─────────────────────────────────────── */}
            {step === 'done' && (
              <>
                <View style={[s.ringOuter, { backgroundColor: '#F59E0B22' }]}>
                  <View style={[s.ringInner, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="star" size={48} color="#F59E0B" />
                  </View>
                </View>

                <Text style={[s.title, { color: theme.text.primary }]}>
                  Thank you, {payload?.applicantName}!
                </Text>

                <View style={s.starsRow}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Ionicons
                      key={n}
                      name={n <= rating ? 'star' : 'star-outline'}
                      size={34}
                      color={n <= rating ? '#F59E0B' : theme.text.tertiary}
                    />
                  ))}
                </View>

                <Text style={[s.ratingLabel, { color: '#F59E0B', marginBottom: 8 }]}>
                  {STAR_LABELS[rating - 1]}
                </Text>

                <Text style={[s.message, { color: theme.text.secondary }]}>
                  {STAR_MESSAGES[rating - 1]}{'\n'}Your feedback has been recorded.
                </Text>

                <View style={[s.divider, { backgroundColor: theme.divider }]} />

                <TouchableOpacity
                  style={[s.primaryBtn, { backgroundColor: theme.primary }]}
                  onPress={handleDone}
                  activeOpacity={0.85}>
                  <Ionicons name="checkmark-outline" size={16} color="#fff" />
                  <Text style={s.primaryBtnText}>Okay</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>
      </Modal>
    </FeedbackModalContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useFeedbackModal = () => useContext(FeedbackModalContext);

// ─── Styles ───────────────────────────────────────────────────────────────────
const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      borderRadius: 24,
      padding: 28,
      alignItems: 'center',
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 20,
    },
    ringOuter: {
      width: 108,
      height: 108,
      borderRadius: 54,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    ringInner: {
      width: 86,
      height: 86,
      borderRadius: 43,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title:       { fontSize: 21, fontWeight: '800', letterSpacing: -0.3, textAlign: 'center', marginBottom: 12 },
    badge:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
    badgeText:   { fontSize: 14, fontWeight: '700' },
    message:     { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 14 },
    note:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 14, width: '100%' },
    noteText:    { flex: 1, fontSize: 12, lineHeight: 18 },
    divider:     { height: 1, width: '100%', marginBottom: 14 },
    trackRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    trackText:   { fontSize: 13 },
    starsRow:    { flexDirection: 'row', gap: 6, marginBottom: 10 },
    starBtn:     { padding: 4 },
    ratingLabel: { fontSize: 16, fontWeight: '800', marginBottom: 10, letterSpacing: 0.2 },
    chip:        { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    chipText:    { fontSize: 13, fontWeight: '600', color: '#F59E0B' },
    primaryBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 14, width: '100%', marginBottom: 8 },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    skipBtn:     { paddingVertical: 8 },
    skipText:    { fontSize: 13, fontWeight: '600' },
  });