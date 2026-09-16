# VaultDrive

VaultDrive is a cloud-based file storage and sharing platform inspired by applications such as Google Drive.

It allows users to upload, organize, preview, download, search, share, restore, and permanently delete files.

The main goal of VaultDrive is to provide secure file management with role-based access control and file deduplication.

---

## Overview

VaultDrive provides a centralized platform where users can manage their files and folders.

Users can:

- Create folders
- Upload files
- Preview supported files
- Download files
- Rename files
- Delete files
- Restore deleted files
- Permanently delete files
- Search files and folders
- Share folders with other users
- Manage folder permissions
- View shared folders
- Monitor storage usage

The application also implements file-level deduplication using SHA-256 hashing.

If the same file is uploaded multiple times, VaultDrive stores the physical file only once and creates references to the existing stored object.

---

## Features

### Authentication

- User registration
- User login
- JWT authentication
- Password hashing
- Protected API endpoints

### File Management

- Upload files
- Download files
- Preview images
- Preview PDFs
- Preview videos
- Rename files
- Delete files
- Restore files
- Permanently delete files

### Folder Management

- Create folders
- Open folders
- Nested folders
- Rename folders
- Delete folders
- Restore folders

### File Deduplication

VaultDrive uses SHA-256 hashing to identify duplicate files.

Example:

```text
User A uploads:
photo.jpg

User B uploads:
photo-copy.jpg

Same file content
        ↓
Same SHA-256 hash
        ↓
One StoredObject
        ↓
Multiple File references
```
