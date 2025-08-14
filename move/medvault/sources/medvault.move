module medvault::medvault {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use std::table::{Self, Table};
    use aptos_framework::timestamp;

    /// Error codes
    const EORG_NOT_FOUND: u64 = 1;
    const EORG_ALREADY_EXISTS: u64 = 2;
    const ENOT_ORG_ADMIN: u64 = 3;
    const EDOCTOR_NOT_FOUND: u64 = 4;
    const EDOCTOR_NOT_ACTIVE: u64 = 5;
    const EDOCTOR_ALREADY_EXISTS: u64 = 6;
    const ERECORD_NOT_FOUND: u64 = 7;
    const ERECORD_ALREADY_EXISTS: u64 = 8;
    const ENOT_PATIENT: u64 = 9;
    const EKEY_NOT_FOUND: u64 = 10;
    const ERECORD_REVOKED: u64 = 11;
    const EINVALID_SIGNER: u64 = 12;

    /// Resource structures
    struct Organization has key, store {
        org_id: String,
        name: String,
        admin_addr: address,
        active: bool,
        created_at: u64,
    }

    struct DoctorInfo has key, store {
        org_id: String,
        handle: String,
        license_hash: String,
        active: bool,
        registered_at: u64,
    }

    struct RecordHeader has key, store {
        record_id: vector<u8>,
        patient: address,
        issuing_doctor: address,
        issuing_org: String,
        created_at: u64,
        revoked: bool,
        encrypted_metadata: vector<u8>,
        ipfs_hash: String,
        file_type: String,
    }

    struct PatientRecords has key {
        records: Table<vector<u8>, RecordHeader>,
    }

    struct DoctorRegistry has key {
        doctors: Table<address, DoctorInfo>,
    }

    struct OrganizationRegistry has key {
        organizations: Table<String, Organization>,
    }

    /// Initialize the registries
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        if (!exists<DoctorRegistry>(account_addr)) {
            move_to(account, DoctorRegistry {
                doctors: table::new(),
            });
        };
        
        if (!exists<OrganizationRegistry>(account_addr)) {
            move_to(account, OrganizationRegistry {
                organizations: table::new(),
            });
        };
        
        if (!exists<PatientRecords>(account_addr)) {
            move_to(account, PatientRecords {
                records: table::new(),
            });
        };
    }

    /// Create a medical record
    public entry fun create_record(
        doctor: &signer,
        patient_addr: address,
        record_id: vector<u8>,
        encrypted_metadata: vector<u8>,
        ipfs_hash: String,
        file_type: String,
        org_id: String,
    ) acquires PatientRecords {
        let doctor_addr = signer::address_of(doctor);
        
        // Ensure patient has PatientRecords resource
        if (!exists<PatientRecords>(doctor_addr)) {
            initialize(doctor);
        };

        let patient_records = borrow_global_mut<PatientRecords>(doctor_addr);
        
        // Check if record already exists
        assert!(!table::contains(&patient_records.records, record_id), error::already_exists(ERECORD_ALREADY_EXISTS));
        
        let record_header = RecordHeader {
            record_id,
            patient: patient_addr,
            issuing_doctor: doctor_addr,
            issuing_org: org_id,
            created_at: timestamp::now_seconds(),
            revoked: false,
            encrypted_metadata,
            ipfs_hash,
            file_type,
        };
        
        table::add(&mut patient_records.records, record_id, record_header);
    }

    /// Register a doctor
    public entry fun register_doctor(
        doctor: &signer,
        org_id: String,
        handle: String,
        license_hash: String,
    ) acquires DoctorRegistry {
        let doctor_addr = signer::address_of(doctor);
        
        if (!exists<DoctorRegistry>(doctor_addr)) {
            initialize(doctor);
        };
        
        let registry = borrow_global_mut<DoctorRegistry>(doctor_addr);
        
        assert!(!table::contains(&registry.doctors, doctor_addr), error::already_exists(EDOCTOR_ALREADY_EXISTS));
        
        let doctor_info = DoctorInfo {
            org_id,
            handle,
            license_hash,
            active: true,
            registered_at: timestamp::now_seconds(),
        };
        
        table::add(&mut registry.doctors, doctor_addr, doctor_info);
    }

    /// Register an organization
    public entry fun register_organization(
        admin: &signer,
        org_id: String,
        name: String,
    ) acquires OrganizationRegistry {
        let admin_addr = signer::address_of(admin);
        
        if (!exists<OrganizationRegistry>(admin_addr)) {
            initialize(admin);
        };
        
        let registry = borrow_global_mut<OrganizationRegistry>(admin_addr);
        
        assert!(!table::contains(&registry.organizations, org_id), error::already_exists(EORG_ALREADY_EXISTS));
        
        let organization = Organization {
            org_id,
            name,
            admin_addr,
            active: true,
            created_at: timestamp::now_seconds(),
        };
        
        table::add(&mut registry.organizations, org_id, organization);
    }

    /// View functions
    
    #[view]
    public fun get_record_exists(account: address, record_id: vector<u8>): bool acquires PatientRecords {
        if (!exists<PatientRecords>(account)) {
            return false
        };
        let patient_records = borrow_global<PatientRecords>(account);
        table::contains(&patient_records.records, record_id)
    }

    #[view]
    public fun get_doctor_exists(account: address): bool acquires DoctorRegistry {
        if (!exists<DoctorRegistry>(account)) {
            return false
        };
        let registry = borrow_global<DoctorRegistry>(account);
        table::contains(&registry.doctors, account)
    }
}
