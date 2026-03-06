import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job, AppliedJob } from '../types';

// ─── Storage Keys ────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  SAVED_JOBS:    '@jobs/saved',
  APPLIED_JOBS:  '@jobs/applied',
} as const;

// ─── Context Type ────────────────────────────────────────────────────────────
interface JobsContextType {
  jobs:         Job[];
  savedJobs:    Job[];
  appliedJobs:  AppliedJob[];
  loading:      boolean;
  error:        string | null;
  fetchJobs:    () => Promise<void>;
  saveJob:      (job: Job) => void;
  unsaveJob:    (jobId: string) => void;       // ← new toggle
  removeJob:    (jobId: string) => void;
  isJobSaved:   (jobId: string) => boolean;
  addAppliedJob: (job: Job, applicantName: string) => void;
  isJobApplied: (jobId: string) => boolean;
}

const JobsContext = createContext<JobsContextType>({
  jobs:          [],
  savedJobs:     [],
  appliedJobs:   [],
  loading:       false,
  error:         null,
  fetchJobs:     async () => {},
  saveJob:       () => {},
  unsaveJob:     () => {},
  removeJob:     () => {},
  isJobSaved:    () => false,
  addAppliedJob: () => {},
  isJobApplied:  () => false,
});

// ─── API ─────────────────────────────────────────────────────────────────────
const API_URL = 'https://empllo.com/api/v1';

// ─── Stable ID helper ────────────────────────────────────────────────────────
// Prefer the job's own guid/id so IDs survive re-fetches.
// Only fall back to a generated key if the API provides nothing stable.
const deriveStableId = (raw: Record<string, unknown>): string => {
  if (typeof raw.guid === 'string' && raw.guid.trim())  return raw.guid.trim();
  if (typeof raw.id   === 'string' && raw.id.trim())    return raw.id.trim();
  if (typeof raw.id   === 'number')                     return String(raw.id);
  // Last resort: deterministic key from company + title so at least the same
  // logical job gets the same ID within a single session.
  const company = typeof raw.companyName === 'string' ? raw.companyName : '';
  const title   = typeof raw.title       === 'string' ? raw.title       : '';
  return `${company}__${title}`.toLowerCase().replace(/\s+/g, '_');
};

// ─── Normalizer ──────────────────────────────────────────────────────────────
const normalizeJob = (raw: Record<string, unknown>): Job => {
  const locations = Array.isArray(raw.locations) ? (raw.locations as string[]) : [];
  const tags      = Array.isArray(raw.tags)      ? (raw.tags      as string[]) : [];

  const minSalary = raw.minSalary != null ? Number(raw.minSalary) : null;
  const maxSalary = raw.maxSalary != null ? Number(raw.maxSalary) : null;
  const currency  = typeof raw.currency === 'string' ? raw.currency : '';

  let salary: string | undefined;
  if (minSalary != null && maxSalary != null && !isNaN(minSalary) && !isNaN(maxSalary)) {
    salary = `${currency} ${minSalary.toLocaleString()} – ${maxSalary.toLocaleString()}`;
  } else if (minSalary != null && !isNaN(minSalary)) {
    salary = `${currency} ${minSalary.toLocaleString()}+`;
  } else if (maxSalary != null && !isNaN(maxSalary)) {
    salary = `Up to ${currency} ${maxSalary.toLocaleString()}`;
  }

  // Explicitly map only known fields — no raw spread bleeding unknown props.
  return {
    id:              deriveStableId(raw),                                          // ← stable
    guid:            typeof raw.guid            === 'string' ? raw.guid            : undefined,
    title:           typeof raw.title           === 'string' ? raw.title           : 'Untitled Position',
    companyName:     typeof raw.companyName     === 'string' ? raw.companyName     : 'Unknown Company',
    companyLogo:     typeof raw.companyLogo     === 'string' ? raw.companyLogo     : undefined,
    mainCategory:    typeof raw.mainCategory    === 'string' ? raw.mainCategory    : undefined,
    jobType:         typeof raw.jobType         === 'string' ? raw.jobType         : undefined,
    workModel:       typeof raw.workModel       === 'string' ? raw.workModel       : undefined,
    seniorityLevel:  typeof raw.seniorityLevel  === 'string' ? raw.seniorityLevel  : undefined,
    minSalary,
    maxSalary,
    currency:        currency || undefined,
    locations,
    location:        locations.length > 0 ? locations.join(', ') : undefined,
    tags,
    description:     typeof raw.description     === 'string' ? raw.description     : undefined,
    pubDate:         typeof raw.pubDate         === 'number' ? raw.pubDate         : undefined,
    expiryDate:      typeof raw.expiryDate      === 'number' ? raw.expiryDate      : undefined,
    applicationLink: typeof raw.applicationLink === 'string' ? raw.applicationLink : undefined,
    salary,
  };
};

// ─── AsyncStorage helpers ────────────────────────────────────────────────────
async function persist<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[JobsContext] Failed to persist', key, e);
  }
}

async function rehydrate<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (e) {
    console.warn('[JobsContext] Failed to rehydrate', key, e);
    return fallback;
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────
export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs,         setJobs]         = useState<Job[]>([]);
  const [savedJobs,    setSavedJobs]    = useState<Job[]>([]);
  const [appliedJobs,  setAppliedJobs]  = useState<AppliedJob[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [hydrated,     setHydrated]     = useState(false);

  // ── Rehydrate from storage on mount ───────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [saved, applied] = await Promise.all([
        rehydrate<Job[]>(STORAGE_KEYS.SAVED_JOBS,   []),
        rehydrate<AppliedJob[]>(STORAGE_KEYS.APPLIED_JOBS, []),
      ]);
      setSavedJobs(saved);
      setAppliedJobs(applied);
      setHydrated(true);
    })();
  }, []);

  // ── Persist saved jobs whenever they change (after hydration) ─────────────
  useEffect(() => {
    if (!hydrated) return;
    persist(STORAGE_KEYS.SAVED_JOBS, savedJobs);
  }, [savedJobs, hydrated]);

  // ── Persist applied jobs whenever they change (after hydration) ───────────
  useEffect(() => {
    if (!hydrated) return;
    persist(STORAGE_KEYS.APPLIED_JOBS, appliedJobs);
  }, [appliedJobs, hydrated]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();

      let rawJobs: Record<string, unknown>[] = [];
      if (Array.isArray(data)) {
        rawJobs = data;
      } else if (data.jobs && Array.isArray(data.jobs)) {
        rawJobs = data.jobs;
      } else if (data.data && Array.isArray(data.data)) {
        rawJobs = data.data;
      } else {
        const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
        if (arrayKey) rawJobs = data[arrayKey] as Record<string, unknown>[];
      }

      setJobs(rawJobs.map(normalizeJob));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch jobs. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Save / Unsave ──────────────────────────────────────────────────────────
  const saveJob = useCallback((job: Job) => {
    setSavedJobs(prev => {
      if (prev.some(j => j.id === job.id)) return prev;
      return [...prev, job];
    });
  }, []);

  const unsaveJob = useCallback((jobId: string) => {
    setSavedJobs(prev => prev.filter(j => j.id !== jobId));
  }, []);

  // Kept for backwards-compat — identical to unsaveJob
  const removeJob = useCallback((jobId: string) => {
    setSavedJobs(prev => prev.filter(j => j.id !== jobId));
  }, []);

  const isJobSaved = useCallback(
    (jobId: string) => savedJobs.some(j => j.id === jobId),
    [savedJobs],
  );

  // ── Apply ──────────────────────────────────────────────────────────────────
  const addAppliedJob = useCallback((job: Job, applicantName: string) => {
    setAppliedJobs(prev => {
      if (prev.some(a => a.job.id === job.id)) return prev;
      return [...prev, { job, applicantName, appliedAt: new Date().toISOString() }];
    });
    // Auto-remove from saved when applied
    setSavedJobs(prev => prev.filter(j => j.id !== job.id));
  }, []);

  const isJobApplied = useCallback(
    (jobId: string) => appliedJobs.some(a => a.job.id === jobId),
    [appliedJobs],
  );

  return (
    <JobsContext.Provider value={{
      jobs, savedJobs, appliedJobs, loading, error,
      fetchJobs,
      saveJob, unsaveJob, removeJob,
      isJobSaved,
      addAppliedJob, isJobApplied,
    }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => useContext(JobsContext);