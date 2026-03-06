import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Job, AppliedJob } from '../types';

interface JobsContextType {
  jobs: Job[];
  savedJobs: Job[];
  appliedJobs: AppliedJob[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  saveJob: (job: Job) => void;
  removeJob: (jobId: string) => void;
  isJobSaved: (jobId: string) => boolean;
  addAppliedJob: (job: Job, applicantName: string) => void;
  isJobApplied: (jobId: string) => boolean;
}

const JobsContext = createContext<JobsContextType>({
  jobs: [],
  savedJobs: [],
  appliedJobs: [],
  loading: false,
  error: null,
  fetchJobs: async () => {},
  saveJob: () => {},
  removeJob: () => {},
  isJobSaved: () => false,
  addAppliedJob: () => {},
  isJobApplied: () => false,
});

const API_URL = 'https://empllo.com/api/v1';

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

  return {
    ...raw,
    id:             uuidv4(),   // ← uuid v4 per requirement
    title:          typeof raw.title           === 'string' ? raw.title           : 'Untitled Position',
    companyName:    typeof raw.companyName     === 'string' ? raw.companyName     : 'Unknown Company',
    companyLogo:    typeof raw.companyLogo     === 'string' ? raw.companyLogo     : undefined,
    mainCategory:   typeof raw.mainCategory    === 'string' ? raw.mainCategory    : undefined,
    jobType:        typeof raw.jobType         === 'string' ? raw.jobType         : undefined,
    workModel:      typeof raw.workModel       === 'string' ? raw.workModel       : undefined,
    seniorityLevel: typeof raw.seniorityLevel  === 'string' ? raw.seniorityLevel  : undefined,
    minSalary,
    maxSalary,
    currency:       currency || undefined,
    locations,
    location:       locations.length > 0 ? locations.join(', ') : undefined,
    tags,
    description:    typeof raw.description      === 'string' ? raw.description      : undefined,
    pubDate:        typeof raw.pubDate           === 'number' ? raw.pubDate           : undefined,
    expiryDate:     typeof raw.expiryDate        === 'number' ? raw.expiryDate        : undefined,
    applicationLink: typeof raw.applicationLink  === 'string' ? raw.applicationLink   : undefined,
    guid:           typeof raw.guid              === 'string' ? raw.guid              : undefined,
    salary,
  };
};

export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs]               = useState<Job[]>([]);
  const [savedJobs, setSavedJobs]     = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

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

  const saveJob = useCallback((job: Job) => {
    setSavedJobs(prev => {
      if (prev.some(j => j.id === job.id)) return prev;
      return [...prev, job];
    });
  }, []);

  const removeJob = useCallback((jobId: string) => {
    setSavedJobs(prev => prev.filter(j => j.id !== jobId));
  }, []);

  const isJobSaved = useCallback(
    (jobId: string) => savedJobs.some(j => j.id === jobId),
    [savedJobs],
  );

  const addAppliedJob = useCallback((job: Job, applicantName: string) => {
    setAppliedJobs(prev => {
      if (prev.some(a => a.job.id === job.id)) return prev;
      return [...prev, { job, applicantName, appliedAt: new Date().toISOString() }];
    });
    setSavedJobs(prev => prev.filter(j => j.id !== job.id));
  }, []);

  const isJobApplied = useCallback(
    (jobId: string) => appliedJobs.some(a => a.job.id === jobId),
    [appliedJobs],
  );

  return (
    <JobsContext.Provider value={{
      jobs, savedJobs, appliedJobs, loading, error,
      fetchJobs, saveJob, removeJob, isJobSaved,
      addAppliedJob, isJobApplied,
    }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => useContext(JobsContext);