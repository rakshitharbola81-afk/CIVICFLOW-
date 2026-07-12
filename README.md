# 🏙️ CivicFlow - Smart Complaint Management System

CivicFlow is a full-stack complaint management platform that streamlines communication between citizens, municipal workers, and administrators. The system enables complaint registration, worker assignment, progress tracking, proof-based verification, and analytics through secure role-based workflows.

---

## 🚀 Features

### 👤 Citizen
- Register & Login using JWT Authentication
- Create complaints with image upload
- Track complaint status in real time
- View complaint history

### 👷 Worker
- View assigned complaints
- Start working on complaints
- Upload after-work proof image
- Add work notes
- Submit work for admin verification

### 👨‍💼 Admin
- Dashboard with complaint statistics
- Assign complaints to workers
- Manage workers
  - Create Worker
  - Edit Worker
  - Enable/Disable Worker
- Review before & after images
- Approve or Reject completed work
- Analytics Dashboard

---

## 🔄 Complaint Workflow

```text
Citizen
      │
Create Complaint
      │
Pending
      │
Admin Assign
      │
Assigned
      │
Worker Starts
      │
In Progress
      │
Uploads After Image
      │
Verification Pending
      │
Admin Reviews
      │
 ┌──────────────┐
 │              │
 ▼              ▼
Approve      Reject
 │              │
Resolved   In Progress