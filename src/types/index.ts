export interface Job {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  mainCategory?: string;
  jobType?: string;
  workModel?: string;
  seniorityLevel?: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string;
  locations?: string[];
  location?: string;
  tags?: string[];
  description?: string;
  pubDate?: number;
  expiryDate?: number;
  applicationLink?: string;
  guid?: string;
  [key: string]: unknown;
}

export interface AppliedJob {
  job: Job;
  appliedAt: string;
  applicantName: string;
}

export interface ApplicationFormData {
  fullName: string;
  email: string;
  contactNumber: string;
  whyHire: string;
}

export interface FormErrors {
  fullName?: string;
  email?: string;
  contactNumber?: string;
  whyHire?: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  JobDetail: {
    job: Job;
    fromSaved?: boolean;
  };
  ApplicationForm: {
    job: Job;
    fromSaved?: boolean;
  };
};

export type MainTabParamList = {
  JobFinder: undefined;
  SavedJobs: undefined;
  AppliedJobs: undefined;
};