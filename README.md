# MedVault - Decentralized Medical Records System

![MedVault Logo](https://img.shields.io/badge/MedVault-Blockchain%20Medical%20Records-blue)
![Aptos](https://img.shields.io/badge/Aptos-Move%20Smart%20Contracts-green)
![React](https://img.shields.io/badge/React-TypeScript%20Frontend-blue)
![IPFS](https://img.shields.io/badge/IPFS-Encrypted%20Storage-orange)

A privacy-first, organization-aware patient health record system built on Aptos blockchain. MedVault enables hospitals and organizations to manage doctors and patients while ensuring that patients maintain full control over their encrypted medical data.

## 🏥 Overview

MedVault is a decentralized medical records system that provides:

- **Organization Management**: Hospitals can register and manage their doctors
- **Privacy-First Design**: All medical data is encrypted client-side
- **Patient Control**: Patients control who can access their records
- **Soulbound NFTs**: Each medical record is represented by a non-transferable NFT
- **Cross-Organization Access**: Doctors can view headers across organizations with patient permission
- **Audit Trails**: Comprehensive logging of all access and changes

## 📋 Features

### For Organization Admins
- Create and manage organizations
- Register and verify doctors
- Activate/deactivate doctor accounts
- View audit logs for the organization
- Cannot access patient data or modify medical records

### For Doctors
- Create encrypted medical reports for patients
- Search patients by wallet address
- View medical record timelines (headers only)
- Request access to specific records
- Decrypt records when granted access by patients

### For Patients
- View all medical records across organizations
- Grant/revoke access to specific doctors
- Decrypt and view full medical records
- Manage their encryption keys
- Revoke medical records if needed

### Public Verification
- Verify authenticity of medical records
- Check NFT certificates
- View non-sensitive record headers

## 🏗 Architecture

### Smart Contracts (Aptos Move)
- **Organizations**: Hospital/clinic registration and management
- **Doctors**: Doctor registration, verification, and status management
- **Records**: Medical record headers with IPFS CIDs
- **Access Control**: Wrapped encryption keys for authorized access
- **NFTs**: Soulbound tokens representing medical records

### Frontend (React + TypeScript)
- **Admin Portal**: Organization management interface
- **Doctor Portal**: Medical record creation and patient search
- **Patient Portal**: Record viewing and access management
- **Verify Page**: Public record verification

### Storage & Encryption
- **IPFS**: Encrypted medical data storage via web3.storage
- **libsodium**: Client-side encryption and key management
- **Petra Wallet**: Blockchain transaction signing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Aptos CLI
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/medvault.git
cd medvault
```

### 2. Deploy Smart Contracts

```bash
cd move/medvault

# Install Aptos CLI if not already installed
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Create and fund an account for deployment
aptos init --network devnet
aptos account fund-with-faucet --account default

# Compile and deploy the module
aptos move compile
aptos move publish
```

Save the deployed module address for frontend configuration.

### 3. Setup Frontend

```bash
cd frontend/medvault

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
# - Set VITE_MODULE_ADDR to your deployed module address
# - Set VITE_WEB3_STORAGE_TOKEN to your web3.storage API token
# - Configure other environment variables as needed
```

### 4. Get Web3.Storage API Token

1. Visit [web3.storage](https://web3.storage)
2. Create an account and generate an API token
3. Add the token to your `.env` file

### 5. Run the Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Environment Variables

Create a `.env` file in `frontend/medvault/` based on `.env.example`:

```env
# Aptos Network Configuration
VITE_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
VITE_MODULE_ADDR=0x1234...  # Your deployed module address

# IPFS/Web3.Storage Configuration
VITE_WEB3_STORAGE_TOKEN=your_web3_storage_token_here

# Optional Configuration
VITE_APTOS_EXPLORER_URL=https://explorer.aptoslabs.com
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd move/medvault
aptos move test
```

### Frontend Tests

```bash
cd frontend/medvault
npm run test
```

## 📚 Usage Guide

### For Organization Admins

1. **Connect Petra Wallet** and navigate to `/admin`
2. **Create Organization**: Register your hospital/clinic
3. **Register Doctors**: Add doctor wallets with their professional details
4. **Activate Doctors**: Verify and activate doctor accounts
5. **Monitor Activity**: View audit logs and organization statistics

### For Doctors

1. **Connect Petra Wallet** and navigate to `/doctor`
2. **Register Encryption Key**: Set up your encryption key for receiving access
3. **Create Medical Records**: 
   - Fill out patient information form
   - Upload attachments (PDFs, images)
   - System encrypts data and uploads to IPFS
   - Creates blockchain record and mints NFT to patient
4. **Search Patients**: View medical record timelines by patient wallet
5. **Request Access**: Generate QR codes for patients to grant access

### For Patients

1. **Connect Petra Wallet** and navigate to `/patient`
2. **Register Encryption Key**: Set up your encryption key (required for record access)
3. **View Records**: See all your medical records across organizations
4. **Grant Access**: Give doctors permission to view specific records
5. **Revoke Access**: Remove doctor access to records
6. **Decrypt Records**: View full medical record content

### Public Verification

1. Navigate to `/verify`
2. Enter record ID or scan QR code
3. View record header and NFT information
4. Verify authenticity without accessing private data

## 🔒 Security Features

- **Client-Side Encryption**: All medical data encrypted before leaving the browser
- **Key Wrapping**: Encryption keys wrapped using recipient public keys
- **Soulbound NFTs**: Medical record certificates cannot be transferred
- **Access Control**: Granular permissions per record per doctor
- **Audit Trails**: Comprehensive logging of all actions
- **Private Key Management**: Keys stored securely in browser session storage

## 🏭 Deployment

### Testnet Deployment

1. **Deploy Smart Contracts**:
```bash
aptos init --network testnet
aptos account fund-with-faucet --account default
aptos move publish --named-addresses medvault=default
```

2. **Deploy Frontend** (Vercel example):
```bash
npm run build
vercel --prod
```

Set environment variables in Vercel dashboard.

### Mainnet Deployment

Follow the same process but use `--network mainnet` and ensure proper funding of the deployment account.

## 📖 API Reference

### Smart Contract Functions

#### Entry Functions

- `create_org(org_id, org_name)` - Create a new organization
- `register_doctor(doctor_addr, doctor_handle, license_hash, org_id)` - Register a doctor
- `activate_doctor(doctor_addr)` / `deactivate_doctor(doctor_addr)` - Manage doctor status
- `register_user_key(public_key_bytes)` - Register encryption public key
- `create_record(record_id, patient_addr, ...)` - Create medical record
- `grant_access(record_id, grantee_addr, wrapped_key)` - Grant record access
- `revoke_access(record_id, grantee_addr)` - Revoke record access
- `revoke_record(record_id)` - Revoke entire record

#### View Functions

- `get_record_header(record_id)` - Get record metadata
- `list_records_of(patient_addr)` - Get patient's record IDs
- `get_wrapped_key(record_id, viewer_addr)` - Get encrypted access key
- `get_user_public_key(user_addr)` - Get user's encryption public key
- `get_organization(org_id)` - Get organization details
- `get_doctor_info(doctor_addr)` - Get doctor information
- `is_doctor_active(doctor_addr)` - Check doctor status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs or request features via GitHub Issues
- **Community**: Join our Discord server for discussions
- **Email**: support@medvault.health

## 🎯 Demo Script (2-3 minutes)

For a quick demonstration of MedVault:

1. **Admin Setup** (10s): Admin connects wallet → registers & activates Doctor A
2. **Record Creation** (50s): Doctor A creates encrypted report for Patient X → shows transaction hash & minted NFT
3. **Patient Access** (30s): Patient X views timeline → decrypts and views report
4. **Access Management** (20s): Patient X grants Doctor B access to the record
5. **Cross-Doctor Access** (30s): Doctor B searches patient → decrypts and views report
6. **Access Revocation** (20s): Patient X revokes Doctor B's access
7. **Verification** (10s): Show public verify page and explain privacy features

## 📊 Acceptance Criteria

✅ Move module published to Testnet  
✅ Frontend deployed and live  
✅ Admin, Doctor, Patient interfaces implemented with Petra integration  
✅ IPFS upload, client-side encryption & wrapping implemented  
✅ NFT (soulbound) minted at record creation  
✅ View & decrypt flows functioning for patient & granted doctors  
✅ All events and logs visible; admin can manage doctor activation  
✅ Unit tests & manual test plan documented & passing  
✅ README with setup, env vars, deployment, and demo steps

---

**Built with ❤️ for healthcare privacy and security**
