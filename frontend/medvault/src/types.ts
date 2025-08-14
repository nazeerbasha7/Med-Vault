// Type definitions for the MedVault application

export interface Organization {
  org_id: string;
  name: string;
  admin_addr: string;
  active: boolean;
  created_at: number;
}

export interface DoctorInfo {
  org_id: string;
  handle: string;
  license_hash: string;
  active: boolean;
  registered_at: number;
}

export interface RecordHeader {
  record_id: Uint8Array;
  patient: string;
  issuing_doctor: string;
  issuing_org: string;
  doctor_handle: string;
  file_type: string;
  cid: Uint8Array;
  created_at: number;
  revoked: boolean;
  nft_token_address?: string;
}

export interface UserPublicKey {
  public_key_bytes: Uint8Array;
  updated_at: number;
}

export interface MedicalRecord {
  patient_name?: string;
  age?: number;
  dob?: string;
  suffering_disease: string;
  prescription: string;
  observations: string;
  vital_signs: {
    blood_pressure?: string;
    sugar_level?: string;
    heart_rate?: string;
  };
  doctor_notes: string;
  hospital_ward?: string;
  attachments?: File[];
}

export interface EncryptedRecord {
  encrypted_data: Uint8Array;
  nonce: Uint8Array;
  auth_tag: Uint8Array;
}

export interface WrappedKey {
  wrapped_key: Uint8Array;
  recipient_public_key: Uint8Array;
}

// Events
export interface OrganizationCreated {
  org_id: string;
  name: string;
  admin_addr: string;
  timestamp: number;
}

export interface DoctorRegistered {
  doctor_addr: string;
  org_id: string;
  handle: string;
  license_hash: string;
  timestamp: number;
}

export interface DoctorStatusChanged {
  doctor_addr: string;
  org_id: string;
  active: boolean;
  timestamp: number;
}

export interface RecordCreated {
  record_id: Uint8Array;
  patient: string;
  issuing_doctor: string;
  issuing_org: string;
  doctor_handle: string;
  file_type: string;
  cid: Uint8Array;
  nft_token_address?: string;
  timestamp: number;
}

export interface AccessGranted {
  record_id: Uint8Array;
  patient: string;
  grantee: string;
  timestamp: number;
}

export interface AccessRevoked {
  record_id: Uint8Array;
  patient: string;
  grantee: string;
  timestamp: number;
}

export interface RecordRevoked {
  record_id: Uint8Array;
  patient: string;
  timestamp: number;
}

// UI State types
export interface UserRole {
  type: 'admin' | 'doctor' | 'patient' | 'public';
  org_id?: string;
}

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
}

export interface LoadingState {
  loading: boolean;
  message?: string;
}

// File types supported
export const SUPPORTED_FILE_TYPES = [
  'PDF',
  'IMAGE',
  'TEXT',
  'JSON',
] as const;

export type FileType = typeof SUPPORTED_FILE_TYPES[number];

// Environment variables
export interface EnvConfig {
  VITE_NODE_URL: string;
  VITE_MODULE_ADDR: string;
  VITE_WEB3_STORAGE_TOKEN: string;
  VITE_APTOS_EXPLORER_URL?: string;
}
