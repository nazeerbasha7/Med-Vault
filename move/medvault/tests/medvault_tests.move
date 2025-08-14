#[test_only]
module medvault::medvault_tests {
    use std::string;
    use std::vector;
    use std::option;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use medvault::medvault;

    #[test(aptos_framework = @0x1, medvault_admin = @medvault, org_admin = @0x100, doctor1 = @0x200, doctor2 = @0x300, patient = @0x400)]
    public fun test_full_flow(
        aptos_framework: &signer, 
        medvault_admin: &signer, 
        org_admin: &signer, 
        doctor1: &signer, 
        doctor2: &signer, 
        patient: &signer
    ) {
        // Setup timestamp for testing
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test_secs(1000);

        // Create accounts
        account::create_account_for_test(@medvault);
        account::create_account_for_test(@0x100);
        account::create_account_for_test(@0x200);
        account::create_account_for_test(@0x300);
        account::create_account_for_test(@0x400);

        // Initialize module
        medvault::init_module(medvault_admin);

        // Test 1: Create organization
        let org_id = string::utf8(b"hospital_1");
        let org_name = string::utf8(b"General Hospital");
        medvault::create_org(org_admin, org_id, org_name);

        // Verify organization exists
        let org_info = medvault::get_organization(org_id);
        assert!(option::is_some(&org_info), 1);

        // Test 2: Register doctors
        let doctor1_addr = @0x200;
        let doctor2_addr = @0x300;
        let doctor1_handle = string::utf8(b"Dr. Smith");
        let doctor2_handle = string::utf8(b"Dr. Johnson");
        let license_hash = string::utf8(b"license_hash_123");

        medvault::register_doctor(org_admin, doctor1_addr, doctor1_handle, license_hash, org_id);
        medvault::register_doctor(org_admin, doctor2_addr, doctor2_handle, license_hash, org_id);

        // Verify doctors are registered but not active
        assert!(!medvault::is_doctor_active(doctor1_addr), 2);
        assert!(!medvault::is_doctor_active(doctor2_addr), 3);

        // Test 3: Activate doctor1
        medvault::activate_doctor(org_admin, doctor1_addr);
        assert!(medvault::is_doctor_active(doctor1_addr), 4);

        // Test 4: Register patient's public key
        let patient_pubkey = vector::empty<u8>();
        vector::push_back(&mut patient_pubkey, 1);
        vector::push_back(&mut patient_pubkey, 2);
        vector::push_back(&mut patient_pubkey, 3);
        medvault::register_user_key(patient, patient_pubkey);

        // Verify patient public key is stored
        let stored_key = medvault::get_user_public_key(@0x400);
        assert!(option::is_some(&stored_key), 5);

        // Test 5: Create medical record
        let record_id = vector::empty<u8>();
        vector::push_back(&mut record_id, 100);
        vector::push_back(&mut record_id, 101);
        vector::push_back(&mut record_id, 102);
        
        let patient_addr = @0x400;
        let file_type = string::utf8(b"PDF");
        let cid = vector::empty<u8>();
        vector::push_back(&mut cid, 200);
        vector::push_back(&mut cid, 201);
        
        let wrapped_key_patient = vector::empty<u8>();
        vector::push_back(&mut wrapped_key_patient, 50);
        vector::push_back(&mut wrapped_key_patient, 51);

        medvault::create_record(
            doctor1,
            record_id,
            patient_addr,
            doctor1_handle,
            file_type,
            cid,
            1500,
            wrapped_key_patient
        );

        // Verify record exists
        let record_header = medvault::get_record_header(record_id);
        assert!(option::is_some(&record_header), 6);

        // Verify patient owns the record
        let patient_records = medvault::list_records_of(patient_addr);
        assert!(vector::length(&patient_records) == 1, 7);

        // Verify patient can access wrapped key
        let patient_wrapped_key = medvault::get_wrapped_key(record_id, patient_addr);
        assert!(option::is_some(&patient_wrapped_key), 8);

        // Test 6: Patient grants access to doctor2
        let wrapped_key_doctor2 = vector::empty<u8>();
        vector::push_back(&mut wrapped_key_doctor2, 60);
        vector::push_back(&mut wrapped_key_doctor2, 61);

        medvault::grant_access(patient, record_id, doctor2_addr, wrapped_key_doctor2);

        // Verify doctor2 can access wrapped key
        let doctor2_wrapped_key = medvault::get_wrapped_key(record_id, doctor2_addr);
        assert!(option::is_some(&doctor2_wrapped_key), 9);

        // Test 7: Patient revokes access from doctor2
        medvault::revoke_access(patient, record_id, doctor2_addr);

        // Verify doctor2 can no longer access wrapped key
        let doctor2_wrapped_key_after_revoke = medvault::get_wrapped_key(record_id, doctor2_addr);
        assert!(option::is_none(&doctor2_wrapped_key_after_revoke), 10);

        // Test 8: Patient revokes the record
        medvault::revoke_record(patient, record_id);

        // Verify record is marked as revoked
        let revoked_record_header = medvault::get_record_header(record_id);
        assert!(option::is_some(&revoked_record_header), 11);

        // Test 9: Deactivate doctor1
        medvault::deactivate_doctor(org_admin, doctor1_addr);
        assert!(!medvault::is_doctor_active(doctor1_addr), 12);
    }

    #[test(aptos_framework = @0x1, medvault_admin = @medvault, org_admin = @0x100, doctor = @0x200)]
    #[expected_failure(abort_code = 0x50005)] // EDOCTOR_NOT_ACTIVE
    public fun test_inactive_doctor_cannot_create_record(
        aptos_framework: &signer,
        medvault_admin: &signer,
        org_admin: &signer,
        doctor: &signer
    ) {
        // Setup
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(@medvault);
        account::create_account_for_test(@0x100);
        account::create_account_for_test(@0x200);

        medvault::init_module(medvault_admin);

        // Create org and register doctor (but don't activate)
        let org_id = string::utf8(b"hospital_1");
        let org_name = string::utf8(b"General Hospital");
        medvault::create_org(org_admin, org_id, org_name);

        let doctor_addr = @0x200;
        let doctor_handle = string::utf8(b"Dr. Smith");
        let license_hash = string::utf8(b"license_hash_123");
        medvault::register_doctor(org_admin, doctor_addr, doctor_handle, license_hash, org_id);

        // Try to create record with inactive doctor - should fail
        let record_id = vector::empty<u8>();
        vector::push_back(&mut record_id, 100);
        
        let patient_addr = @0x400;
        let file_type = string::utf8(b"PDF");
        let cid = vector::empty<u8>();
        vector::push_back(&mut cid, 200);
        
        let wrapped_key_patient = vector::empty<u8>();
        vector::push_back(&mut wrapped_key_patient, 50);

        medvault::create_record(
            doctor,
            record_id,
            patient_addr,
            doctor_handle,
            file_type,
            cid,
            1500,
            wrapped_key_patient
        );
    }

    #[test(aptos_framework = @0x1, medvault_admin = @medvault, org_admin = @0x100, patient = @0x400, unauthorized = @0x500)]
    #[expected_failure(abort_code = 0x50009)] // ENOT_PATIENT
    public fun test_unauthorized_access_grant(
        aptos_framework: &signer,
        medvault_admin: &signer,
        org_admin: &signer,
        patient: &signer,
        unauthorized: &signer
    ) {
        // Setup
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(@medvault);
        account::create_account_for_test(@0x100);
        account::create_account_for_test(@0x200);
        account::create_account_for_test(@0x400);
        account::create_account_for_test(@0x500);

        medvault::init_module(medvault_admin);

        // Create org, register and activate doctor
        let org_id = string::utf8(b"hospital_1");
        let org_name = string::utf8(b"General Hospital");
        medvault::create_org(org_admin, org_id, org_name);

        let doctor_addr = @0x200;
        let doctor_handle = string::utf8(b"Dr. Smith");
        let license_hash = string::utf8(b"license_hash_123");
        medvault::register_doctor(org_admin, doctor_addr, doctor_handle, license_hash, org_id);
        medvault::activate_doctor(org_admin, doctor_addr);

        // Create record
        let record_id = vector::empty<u8>();
        vector::push_back(&mut record_id, 100);
        
        let patient_addr = @0x400;
        let file_type = string::utf8(b"PDF");
        let cid = vector::empty<u8>();
        vector::push_back(&mut cid, 200);
        
        let wrapped_key_patient = vector::empty<u8>();
        vector::push_back(&mut wrapped_key_patient, 50);

        let doctor = account::create_signer_for_test(@0x200);
        medvault::create_record(
            &doctor,
            record_id,
            patient_addr,
            doctor_handle,
            file_type,
            cid,
            1500,
            wrapped_key_patient
        );

        // Unauthorized user tries to grant access - should fail
        let wrapped_key_grantee = vector::empty<u8>();
        vector::push_back(&mut wrapped_key_grantee, 60);

        medvault::grant_access(unauthorized, record_id, @0x600, wrapped_key_grantee);
    }
}
