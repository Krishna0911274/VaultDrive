import { useEffect, useRef, useState } from "react";
import "./Dashboard.css";

import {
  getCurrentUser,
  getFolders,
  createFolder,
  uploadFile,
  getFolderContents,

  // Sharing
  shareFolder,
  getFolderPermissions,
  updateFolderPermission,
  removeFolderPermission,

  // File actions
  downloadFile,
  renameFile,
  deleteFile,
  previewFile,
  getFilePreview,

  // Trash
  getTrash,
  restoreFile,
  permanentlyDeleteFile,

  // Activity
  getActivity,

  // Folder actions
  renameFolder,
  deleteFolder,
  getDeletedFolders,
  restoreFolder,
  permanentlyDeleteFolder,

  // Search
  searchItems,

  // Shared with me
  getSharedWithMe,
  getStorageUsage,
} from "../services/api";

/* =========================================================
   ICONS
========================================================= */

function IconFolder({ width = 20, height = 20, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
    </svg>
  );
}

function IconFolderPlus({ width = 20, height = 20, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
      <path d="M12 11v5" />
      <path d="M9.5 13.5h5" />
    </svg>
  );
}

function IconUpload({ width = 20, height = 20, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function IconShare({ width = 20, height = 20, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.3 10.8 7.4-4.6" />
      <path d="m8.3 13.2 7.4 4.6" />
    </svg>
  );
}

function IconActivity({ width = 20, height = 20, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12h3l2-5 4 10 2-5h5" />
    </svg>
  );
}

function IconSearch({ width = 20, height = 20, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function IconGrid({ width = 20, height = 20, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function IconList({ width = 20, height = 20, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 6h12" />
      <path d="M8 12h12" />
      <path d="M8 18h12" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTrash({ width = 20, height = 20, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function IconMoreVertical({ width = 18, height = 18, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconRestore({ width = 16, height = 16, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 5v6h6" />
    </svg>
  );
}

function IconDownload({ width = 16, height = 16, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 19h14" />
    </svg>
  );
}

function IconFile({ width = 22, height = 22, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V3.5Z" />
      <path d="M14 3.5V8h4" />
      <path d="M9 12h6" />
      <path d="M9 16h4.5" />
    </svg>
  );
}

function IconEdit({ width = 16, height = 16, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconTrashSmall({ width = 16, height = 16, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function VaultMark() {
  return (
    <svg
      className="brand-logo"
      width="30"
      height="30"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="34"
        height="34"
        rx="9"
        fill="#171E32"
        stroke="#2DD4BF"
        strokeWidth="1.4"
      />
      <circle
        cx="18"
        cy="18"
        r="10.5"
        stroke="#2DD4BF"
        strokeWidth="1.2"
        strokeOpacity="0.45"
      />
      <circle cx="18" cy="18" r="6.5" stroke="#5EEAD4" strokeWidth="1.2" />
      <line
        x1="18"
        y1="18"
        x2="18"
        y2="10.5"
        stroke="#5EEAD4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="18" cy="18" r="1.6" fill="#5EEAD4" />
    </svg>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size < 0) {
    return "File";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function Dashboard() {
  /* =======================================================
     USER
  ======================================================= */

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  /* =======================================================
     PROFILE
  ======================================================= */

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  /* =======================================================
     ACTION MENUS (folder/file kebab dropdowns)
  ======================================================= */

  const [openActionMenu, setOpenActionMenu] = useState(null);
  const actionMenuRootRef = useRef(null);

  const toggleFolderMenu = (event, folderId) => {
    event.stopPropagation();
    setOpenActionMenu((current) =>
      current === `folder-${folderId}` ? null : `folder-${folderId}`,
    );
  };

  const toggleFileMenu = (event, fileId) => {
    event.stopPropagation();
    setOpenActionMenu((current) =>
      current === `file-${fileId}` ? null : `file-${fileId}`,
    );
  };

  const toggleTrashFolderMenu = (event, folderId) => {
    event.stopPropagation();

    setOpenActionMenu((current) =>
      current === `trash-folder-${folderId}`
        ? null
        : `trash-folder-${folderId}`,
    );
  };

  const toggleTrashFileMenu = (event, fileId) => {
    event.stopPropagation();

    setOpenActionMenu((current) =>
      current === `trash-file-${fileId}` ? null : `trash-file-${fileId}`,
    );
  };

  const closeActionMenu = () => setOpenActionMenu(null);

  /* =======================================================
     ROOT FOLDERS
  ======================================================= */

  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [folderError, setFolderError] = useState("");

  /* =======================================================
     CURRENT FOLDER
  ======================================================= */

  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderContents, setFolderContents] = useState(null);
  const [loadingContents, setLoadingContents] = useState(false);
  const [contentsError, setContentsError] = useState("");
  const [folderPath, setFolderPath] = useState([]);

  /* =======================================================
     CREATE FOLDER
  ======================================================= */

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [createFolderError, setCreateFolderError] = useState("");

  /* =======================================================
     UPLOAD
  ======================================================= */

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");

  /* =======================================================
     SHARE
  ======================================================= */

  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedShareFolder, setSelectedShareFolder] = useState(null);

  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");

  const [sharingFolder, setSharingFolder] = useState(false);

  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");

  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const [folderPermissions, setFolderPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const [updatingPermissionUserId, setUpdatingPermissionUserId] =
    useState(null);

  const [removingPermissionUserId, setRemovingPermissionUserId] =
    useState(null);

  /* =======================================================
     RENAME
  ======================================================= */

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedRenameFile, setSelectedRenameFile] = useState(null);
  const [renameName, setRenameName] = useState("");
  const [renamingFile, setRenamingFile] = useState(false);
  const [renameError, setRenameError] = useState("");

  /* =======================================================
     RENAME FOLDER
  ======================================================= */
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [selectedRenameFolder, setSelectedRenameFolder] = useState(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [renamingFolder, setRenamingFolder] = useState(false);
  const [renameFolderError, setRenameFolderError] = useState("");
  /* =======================================================
     VIEW MODE
  ======================================================= */

  const [viewMode, setViewMode] = useState(
    localStorage.getItem("vaultdrive_view_mode") || "grid",
  );

  /* =======================================================
     TRASH
  ======================================================= */

  const [deletedFolders, setDeletedFolders] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [trashFiles, setTrashFiles] = useState([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [trashError, setTrashError] = useState("");
  const [trashActionId, setTrashActionId] = useState(null);

  /* =======================================================
     ACTIVITY
  ======================================================= */

  const [showActivity, setShowActivity] = useState(false);
  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityError, setActivityError] = useState("");

  /* =======================================================
     SEARCH
  ======================================================= */

  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState({
    files: [],
    folders: [],
  });

  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  /* =======================================================
     SHARED WITH ME
  ======================================================= */

  const [sharedFolders, setSharedFolders] = useState([]);
  const [loadingShared, setLoadingShared] = useState(false);
  const [sharedError, setSharedError] = useState("");
  const [showSharedWithMe, setShowSharedWithMe] = useState(false);

  const [storage, setStorage] = useState({
    used_gb: 0,
    used_mb: 0,
    limit_gb: 10,
    percentage: 0,
  });

  /* =======================================================
   FILE PREVIEW
======================================================= */

  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  const clearSearch = () => {
    setSearchQuery("");

    setSearchResults({
      files: [],
      folders: [],
    });

    setSearchError("");
    setSearching(false);
    setSearchActive(false);

    goBackToRoot();
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = async (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    try {
      setSearching(true);
      setSearchError("");
      setSearchActive(true);

      setShowTrash(false);
      setShowActivity(false);
      setShowSharedWithMe(false);

      setCurrentFolder(null);
      setFolderContents(null);
      setFolderPath([]);

      const results = await searchItems(query);

      console.log("========== SEARCH ==========");
      console.log("Search query:", query);
      console.log("Search API result:", results);

      let files = [];
      let folders = [];

      if (Array.isArray(results)) {
        files = results;
      } else {
        files = Array.isArray(results?.files) ? results.files : [];

        folders = Array.isArray(results?.folders) ? results.folders : [];
      }

      console.log("Search files:", files);
      console.log("Search folders:", folders);
      console.log("File count:", files.length);
      console.log("Folder count:", folders.length);

      setSearchResults({
        files,
        folders,
      });
    } catch (error) {
      console.error("Search error:", error);

      setSearchError(error.message || "Search failed");

      setSearchResults({
        files: [],
        folders: [],
      });
    } finally {
      setSearching(false);
    }
  };

  /* =======================================================
     OPEN SEARCHED FOLDER
  ======================================================= */

  const handleOpenSearchFolder = async (folder) => {
    setSearchActive(false);
    setSearchQuery("");
    setSearchResults({
      files: [],
      folders: [],
    });

    await openFolder(folder);
  };

  /* =======================================================
     REFRESH CURRENT FOLDER
  ======================================================= */

  const refreshCurrentFolder = async () => {
    if (!currentFolder) {
      return;
    }

    try {
      setLoadingContents(true);
      setContentsError("");

      const data = await getFolderContents(currentFolder.id);

      setFolderContents(data);
    } catch (error) {
      console.error(error);

      setContentsError(error.message || "Failed to refresh folder");
    } finally {
      setLoadingContents(false);
    }
  };

  /* =======================================================
     CREATE FOLDER MODAL
  ======================================================= */

  const openCreateFolderModal = () => {
    setFolderName("");
    setCreateFolderError("");
    setShowCreateFolder(true);
  };

  const closeCreateFolderModal = () => {
    if (creatingFolder) {
      return;
    }

    setShowCreateFolder(false);
    setFolderName("");
    setCreateFolderError("");
  };

  /* =======================================================
     CREATE FOLDER
  ======================================================= */

  const handleCreateFolder = async (event) => {
    event.preventDefault();

    if (!folderName.trim()) {
      setCreateFolderError("Please enter a folder name");
      return;
    }

    try {
      setCreatingFolder(true);
      setCreateFolderError("");

      const parentId = currentFolder ? currentFolder.id : null;

      const newFolder = await createFolder(folderName.trim(), parentId);

      console.log("Folder created:", newFolder);

      if (!currentFolder) {
        setFolders((currentFolders) => [...currentFolders, newFolder]);
      } else {
        await refreshCurrentFolder();
      }

      setFolderName("");
      setShowCreateFolder(false);
    } catch (error) {
      console.error(error);

      setCreateFolderError(error.message || "Failed to create folder");
    } finally {
      setCreatingFolder(false);
    }
  };

  /* =======================================================
     FILE UPLOAD
  ======================================================= */

  const handleFileUpload = async (file) => {
    if (!file) {
      return;
    }

    try {
      setUploadingFile(true);
      setUploadError("");

      const folderId = currentFolder ? currentFolder.id : null;

      const uploadedFile = await uploadFile(file, folderId);

      console.log("File uploaded:", uploadedFile);

      setSelectedFile(null);

      if (currentFolder) {
        await refreshCurrentFolder();
      }
    } catch (error) {
      console.error(error);

      setUploadError(error.message || "Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  /* =======================================================
     OPEN FOLDER
  ======================================================= */

  const openFolder = async (folder) => {
    if (!folder || !folder.id) {
      return;
    }

    try {
      setLoadingContents(true);
      setContentsError("");

      const data = await getFolderContents(folder.id);

      console.log("Folder contents:", data);

      setFolderPath((currentPath) => [...currentPath, folder]);

      setCurrentFolder(folder);
      setFolderContents(data);

      setShowTrash(false);
      setShowActivity(false);
      setShowSharedWithMe(false);
    } catch (error) {
      console.error(error);

      setContentsError(error.message || "Failed to open folder");
    } finally {
      setLoadingContents(false);
    }
  };

  /* =======================================================
     GO BACK ROOT
  ======================================================= */

  const goBackToRoot = () => {
    setCurrentFolder(null);
    setFolderContents(null);
    setFolderPath([]);
    setContentsError("");
    setUploadError("");

    setShowTrash(false);
    setShowActivity(false);
    setShowSharedWithMe(false);
  };

  /* =======================================================
     GO BACK ONE FOLDER
  ======================================================= */

  const goBackOneFolder = async () => {
    if (folderPath.length === 0) {
      return;
    }

    const newPath = folderPath.slice(0, -1);

    if (newPath.length === 0) {
      goBackToRoot();
      return;
    }

    const parentFolder = newPath[newPath.length - 1];

    try {
      setLoadingContents(true);
      setContentsError("");

      const data = await getFolderContents(parentFolder.id);

      setFolderPath(newPath);
      setCurrentFolder(parentFolder);
      setFolderContents(data);
    } catch (error) {
      console.error(error);

      setContentsError(error.message || "Failed to go back");
    } finally {
      setLoadingContents(false);
    }
  };

  /* =======================================================
     LOAD PERMISSIONS
  ======================================================= */

  const loadFolderPermissions = async (folderId) => {
    try {
      setLoadingPermissions(true);
      setShareError("");

      const data = await getFolderPermissions(folderId);

      setFolderPermissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setShareError(error.message || "Failed to load people with access");
    } finally {
      setLoadingPermissions(false);
    }
  };

  /* =======================================================
     SHARE CLICK
  ======================================================= */

  const handleShareClick = async (event, folder) => {
    event.stopPropagation();

    closeActionMenu();

    setSelectedShareFolder(folder);
    setShowShareModal(true);

    setShareEmail("");
    setShareRole("viewer");

    setShareError("");
    setShareSuccess("");

    setFolderPermissions([]);

    await loadFolderPermissions(folder.id);
  };

  /* =======================================================
     SHARE FOLDER
  ======================================================= */

  const handleShareFolder = async () => {
    if (!selectedShareFolder) {
      return;
    }

    if (!shareEmail.trim()) {
      setShareError("Please enter the user's email.");
      return;
    }

    try {
      setSharingFolder(true);
      setShareError("");
      setShareSuccess("");

      await shareFolder(selectedShareFolder.id, shareEmail.trim(), shareRole);

      setShareSuccess("Folder shared successfully.");

      await loadFolderPermissions(selectedShareFolder.id);

      setShareEmail("");
      setShareRole("viewer");
    } catch (error) {
      console.error(error);

      setShareError(error.message || "Failed to share folder");
    } finally {
      setSharingFolder(false);
    }
  };

  /* =======================================================
     UPDATE PERMISSION
  ======================================================= */

  const handleUpdatePermission = async (userId, role) => {
    if (!selectedShareFolder) {
      return;
    }

    try {
      setUpdatingPermissionUserId(userId);
      setShareError("");
      setShareSuccess("");

      await updateFolderPermission(selectedShareFolder.id, userId, role);

      setShareSuccess("Permission updated successfully.");

      await loadFolderPermissions(selectedShareFolder.id);
    } catch (error) {
      console.error(error);

      setShareError(error.message || "Failed to update permission");
    } finally {
      setUpdatingPermissionUserId(null);
    }
  };

  /* =======================================================
     REMOVE PERMISSION
  ======================================================= */

  const handleRemovePermission = async (userId) => {
    if (!selectedShareFolder) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this user's access?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingPermissionUserId(userId);
      setShareError("");
      setShareSuccess("");

      await removeFolderPermission(selectedShareFolder.id, userId);

      setShareSuccess("User access removed successfully.");

      await loadFolderPermissions(selectedShareFolder.id);
    } catch (error) {
      console.error(error);

      setShareError(error.message || "Failed to remove user access");
    } finally {
      setRemovingPermissionUserId(null);
    }
  };

  /* =======================================================
     DELETE FILE
  ======================================================= */

  const handleDelete = async (event, file) => {
    event.stopPropagation();

    closeActionMenu();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteFile(file.id);

      setFolderContents((prev) => ({
        ...prev,
        files: (prev?.files || []).filter((item) => item.id !== file.id),
      }));
    } catch (error) {
      console.error("Delete error:", error);

      alert(error.message || "Failed to delete file");
    }
  };

  /* =======================================================
     DELETE FOLDER
  ======================================================= */

  const handleDeleteFolder = async (event, folder) => {
    event.stopPropagation();

    closeActionMenu();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${folder.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteFolder(folder.id);

      if (currentFolder) {
        await refreshCurrentFolder();
      } else {
        setFolders((currentFolders) =>
          currentFolders.filter((item) => item.id !== folder.id),
        );
      }
    } catch (error) {
      console.error("Delete folder error:", error);

      alert(error.message || "Failed to delete folder");
    }
  };

  /* =======================================================
     DOWNLOAD FILE
  ======================================================= */

  const handleDownload = async (file) => {
    try {
      await downloadFile(file.id);
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to download file");
    }
  };
  const formatUsedStorage = () => {
    const usedGb = Number(storage?.used_gb || 0);
    const usedMb = Number(storage?.used_mb || 0);

    if (usedGb < 1) {
      return `${usedMb.toFixed(2)} MB`;
    }

    return `${usedGb.toFixed(2)} GB`;
  };

  const getStorageLevel = () => {
    const pct = Math.min(Number(storage?.percentage || 0), 100);

    if (pct >= 90) {
      return "danger";
    }

    if (pct >= 70) {
      return "warning";
    }

    return "safe";
  };

  const handleRenameFolderSubmit = async () => {
    const trimmedName = renameFolderName.trim();

    if (!trimmedName) {
      setRenameFolderError("Folder name is required");
      return;
    }

    if (!selectedRenameFolder) {
      return;
    }

    try {
      setRenamingFolder(true);
      setRenameFolderError("");

      await renameFolder(selectedRenameFolder.id, trimmedName);

      // Update root folders UI
      setFolders((currentFolders) =>
        currentFolders.map((folder) =>
          folder.id === selectedRenameFolder.id
            ? {
                ...folder,
                name: trimmedName,
              }
            : folder,
        ),
      );

      // Update current folder contents UI
      setFolderContents((currentContents) => {
        if (!currentContents) {
          return currentContents;
        }

        return {
          ...currentContents,

          folders: Array.isArray(currentContents.folders)
            ? currentContents.folders.map((folder) =>
                folder.id === selectedRenameFolder.id
                  ? {
                      ...folder,
                      name: trimmedName,
                    }
                  : folder,
              )
            : currentContents.folders,
        };
      });

      // Update breadcrumb if renamed folder is present there
      setFolderPath((currentPath) =>
        currentPath.map((folder) =>
          folder.id === selectedRenameFolder.id
            ? {
                ...folder,
                name: trimmedName,
              }
            : folder,
        ),
      );

      // If the renamed folder is currently open
      if (currentFolder && currentFolder.id === selectedRenameFolder.id) {
        setCurrentFolder((current) => ({
          ...current,
          name: trimmedName,
        }));
      }

      // Close modal
      setShowRenameFolderModal(false);
      setSelectedRenameFolder(null);
      setRenameFolderName("");
      setRenameFolderError("");
    } catch (error) {
      console.error("Rename folder error:", error);

      setRenameFolderError(error.message || "Failed to rename folder");
    } finally {
      setRenamingFolder(false);
    }
  };

  /* =======================================================
   PREVIEW FILE
======================================================= */

  const handlePreview = async (file) => {
    try {
      setPreviewLoading(true);
      setPreviewError("");
      setPreviewFile(file);
      setShowPreview(true);

      const url = await getFilePreview(file.id);

      setPreviewUrl(url);
    } catch (error) {
      console.error("Preview error:", error);
      setPreviewError(error.message || "Unable to preview file");
    } finally {
      setPreviewLoading(false);
    }
  };

  /* =======================================================
   CLOSE PREVIEW
======================================================= */

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setShowPreviewModal(false);
    setPreviewFile(null);
    setPreviewUrl("");
    setPreviewError("");
    setPreviewLoading(false);
  };
  /* =======================================================
     RENAME FILE
  ======================================================= */

  const handleRenameClick = (event, file) => {
    event.stopPropagation();

    closeActionMenu();

    setSelectedRenameFile(file);
    setRenameName(file.name);
    setRenameError("");
    setShowRenameModal(true);
  };

  const handleRenameFile = async () => {
    if (!selectedRenameFile) {
      return;
    }

    const newName = renameName.trim();

    if (!newName) {
      setRenameError("Please enter a file name.");
      return;
    }

    try {
      setRenamingFile(true);
      setRenameError("");

      const updatedFile = await renameFile(selectedRenameFile.id, newName);

      setFolderContents((prev) => ({
        ...prev,
        files: (prev?.files || []).map((file) =>
          file.id === updatedFile.id ? updatedFile : file,
        ),
      }));

      setShowRenameModal(false);
      setSelectedRenameFile(null);
      setRenameName("");
    } catch (error) {
      console.error("Rename error:", error);

      setRenameError(error.message || "Failed to rename file");
    } finally {
      setRenamingFile(false);
    }
  };

  /* =======================================================
     RENAME FOLDER
  ======================================================= */

  const handleRenameFolder = (event, folder) => {
    event.stopPropagation();

    closeActionMenu();

    setSelectedRenameFolder(folder);
    setRenameFolderName(folder.name);
    setRenameFolderError("");
    setShowRenameFolderModal(true);
  };

  /* =======================================================
     VIEW MODE
  ======================================================= */

  const toggleViewMode = () => {
    const newMode = viewMode === "grid" ? "list" : "grid";

    setViewMode(newMode);

    localStorage.setItem("vaultdrive_view_mode", newMode);
  };

  /* =======================================================
     LOAD TRASH
  ======================================================= */

  const loadTrash = async () => {
    try {
      setLoadingTrash(true);
      setTrashError("");

      const [files, folders] = await Promise.all([
        getTrash(),
        getDeletedFolders(),
      ]);

      setTrashFiles(Array.isArray(files) ? files : files?.files || []);

      setDeletedFolders(
        Array.isArray(folders) ? folders : folders?.folders || [],
      );
    } catch (error) {
      console.error("Load Trash error:", error);

      setTrashError(error.message || "Failed to load Trash");
    } finally {
      setLoadingTrash(false);
    }
  };

  const loadStorage = async () => {
    try {
      const data = await getStorageUsage();
      setStorage(data);
    } catch (error) {
      console.error("Storage error:", error);
    }
  };

  /* =======================================================
     OPEN TRASH
  ======================================================= */

  const openTrash = async (event) => {
    if (event) {
      event.preventDefault();
    }

    setSearchActive(false);
    setSearchQuery("");
    setSearchResults({
      files: [],
      folders: [],
    });

    setShowTrash(true);
    setShowActivity(false);
    setShowSharedWithMe(false);

    setCurrentFolder(null);
    setFolderContents(null);
    setFolderPath([]);

    setContentsError("");

    await loadTrash();
  };

  /* =======================================================
     RESTORE FILE
  ======================================================= */

  const handleRestoreFile = async (file) => {
    const fileId = Number(file.id);

    if (!Number.isInteger(fileId) || fileId <= 0) {
      alert("Invalid file ID.");
      return;
    }

    try {
      setTrashActionId(fileId);
      setTrashError("");

      await restoreFile(fileId);

      setTrashFiles((currentFiles) =>
        currentFiles.filter((item) => Number(item.id) !== fileId),
      );

      await loadTrash();
    } catch (error) {
      console.error("Restore error:", error);

      setTrashError(error.message || "Failed to restore file");
    } finally {
      setTrashActionId(null);
    }
  };

  /* =======================================================
     PERMANENT DELETE FILE
  ======================================================= */

  const handlePermanentDeleteFile = async (file) => {
    const fileId = Number(file.id);

    if (!Number.isInteger(fileId) || fileId <= 0) {
      alert("Invalid file ID.");
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete "${file.name}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setTrashActionId(fileId);
      setTrashError("");

      await permanentlyDeleteFile(fileId);

      setTrashFiles((currentFiles) =>
        currentFiles.filter((item) => Number(item.id) !== fileId),
      );

      await loadTrash();
    } catch (error) {
      console.error("Permanent delete error:", error);

      setTrashError(error.message || "Failed to permanently delete file");
    } finally {
      setTrashActionId(null);
    }
  };

  /* =======================================================
     RESTORE FOLDER
  ======================================================= */

  const handleRestoreFolder = async (folderId) => {
    try {
      setTrashError("");

      await restoreFolder(Number(folderId));

      await loadTrash();

      const updatedFolders = await getFolders();

      setFolders(
        Array.isArray(updatedFolders)
          ? updatedFolders
          : updatedFolders?.folders || [],
      );
    } catch (error) {
      console.error("Restore folder error:", error);

      setTrashError(error.message || "Failed to restore folder");
    }
  };

  /* =======================================================
     PERMANENT DELETE FOLDER
  ======================================================= */

  const handlePermanentDeleteFolder = async (folderId) => {
    const confirmed = window.confirm(
      "This will permanently delete the folder. Continue?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setTrashError("");

      await permanentlyDeleteFolder(Number(folderId));

      await loadTrash();
    } catch (error) {
      console.error("Permanent delete folder error:", error);

      setTrashError(error.message || "Failed to permanently delete folder");
    }
  };

  /* =======================================================
     CLOSE TRASH
  ======================================================= */

  const closeTrash = () => {
    setShowTrash(false);

    setTrashFiles([]);
    setDeletedFolders([]);

    setTrashError("");

    goBackToRoot();
  };

  /* =======================================================
     LOAD ACTIVITY
  ======================================================= */

  const loadActivity = async () => {
    try {
      setLoadingActivity(true);
      setActivityError("");

      const data = await getActivity();

      setActivity(Array.isArray(data) ? data : data?.activities || []);
    } catch (error) {
      console.error("Activity error:", error);

      setActivityError(error.message || "Failed to load activity");
    } finally {
      setLoadingActivity(false);
    }
  };

  /* =======================================================
     OPEN ACTIVITY
  ======================================================= */

  const openActivity = async (event) => {
    if (event) {
      event.preventDefault();
    }

    setSearchActive(false);
    setSearchQuery("");
    setSearchResults({
      files: [],
      folders: [],
    });

    setShowActivity(true);
    setShowTrash(false);
    setShowSharedWithMe(false);

    setCurrentFolder(null);
    setFolderContents(null);
    setFolderPath([]);

    await loadActivity();
  };

  /* =======================================================
     LOAD SHARED WITH ME
  ======================================================= */

  const loadSharedWithMe = async () => {
    try {
      setLoadingShared(true);
      setSharedError("");

      const data = await getSharedWithMe();

      console.log("Shared with me:", data);

      setSharedFolders(Array.isArray(data) ? data : data?.folders || []);
    } catch (error) {
      console.error("Shared with me error:", error);

      setSharedError(error.message || "Failed to load shared folders");
    } finally {
      setLoadingShared(false);
    }
  };

  /* =======================================================
     OPEN SHARED WITH ME
  ======================================================= */

  const handleSharedWithMe = async (event) => {
    if (event) {
      event.preventDefault();
    }

    setSearchActive(false);
    setSearchQuery("");
    setSearchResults({
      files: [],
      folders: [],
    });

    setShowSharedWithMe(true);
    setShowTrash(false);
    setShowActivity(false);

    setCurrentFolder(null);
    setFolderContents(null);
    setFolderPath([]);

    await loadSharedWithMe();
  };

  /* =======================================================
     LOAD USER + FOLDERS
  ======================================================= */

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();

        setUser(data);
      } catch (error) {
        console.error(error);

        setError(error.message || "Failed to load user");
      }
    }

    async function loadFolders() {
      try {
        setLoadingFolders(true);
        setFolderError("");

        const data = await getFolders();

        if (Array.isArray(data)) {
          setFolders(data);
        } else if (Array.isArray(data?.folders)) {
          setFolders(data.folders);
        } else {
          console.error("Unexpected folders response:", data);

          setFolders([]);
        }
      } catch (error) {
        console.error(error);

        setFolderError(error.message || "Failed to load folders");
      } finally {
        setLoadingFolders(false);
      }
    }

    loadUser();
    loadFolders();
    loadStorage();
  }, []);

  /* =======================================================
     PROFILE CLICK OUTSIDE
  ======================================================= */

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }

      if (
        openActionMenu &&
        !event.target.closest(".folder-card-actions") &&
        !event.target.closest(".file-card-actions") &&
        !event.target.closest(".trash-card-actions")
      ) {
        setOpenActionMenu(null);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowProfileMenu(false);
        setOpenActionMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      document.removeEventListener("keydown", handleEscape);
    };
  }, [openActionMenu]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* =======================================================
     ROOT FOLDERS
  ======================================================= */

  const rootFolders = folders.filter((folder) => folder.parent_id === null);

  /* =======================================================
     CLOSE SHARE MODAL
  ======================================================= */

  const closeShareModal = () => {
    if (sharingFolder) {
      return;
    }

    setShowShareModal(false);
    setSelectedShareFolder(null);

    setShareEmail("");
    setShareRole("viewer");

    setShareError("");
    setShareSuccess("");

    setFolderPermissions([]);
  };

  /* =======================================================
     RENDER HELPERS: FOLDER CARD / FILE CARD
  ======================================================= */

  const renderFolderCard = (folder, { listView = false, onOpen } = {}) => (
    <div
      key={folder.id}
      className={`folder-card ${listView ? "folder-card-list" : ""}`}
      onClick={onOpen ? () => onOpen(folder) : undefined}
    >
      <div className="folder-card-icon">
        <IconFolder width={28} height={28} />
      </div>

      <div className="folder-info">
        <div className="folder-name">{folder.name}</div>

        <div className="folder-meta">Folder</div>
      </div>

      <div className="folder-card-actions">
        <button
          type="button"
          className={`action-menu-button ${
            openActionMenu === `folder-${folder.id}` ? "is-open" : ""
          }`}
          aria-label="Folder actions"
          onClick={(event) => toggleFolderMenu(event, folder.id)}
        >
          <IconMoreVertical />
        </button>

        {openActionMenu === `folder-${folder.id}` && (
          <div
            className="action-dropdown"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                closeActionMenu();
                handlePreview(file);
              }}
            >
              <IconFile width={15} height={15} />
              Preview
            </button>
            <button
              type="button"
              onClick={(event) => handleShareClick(event, folder)}
            >
              <IconShare width={15} height={15} />
              Share
            </button>

            <button
              type="button"
              onClick={(event) => handleRenameFolder(event, folder)}
            >
              <IconEdit width={15} height={15} />
              Rename
            </button>

            <div className="action-dropdown-divider"></div>

            <button
              type="button"
              className="danger"
              onClick={(event) => handleDeleteFolder(event, folder)}
            >
              <IconTrashSmall width={15} height={15} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderFileCard = (file, { gridView = false } = {}) => (
    <div
      key={file.id}
      className={`file-card ${gridView ? "file-card-grid" : ""}`}
      onDoubleClick={() => handlePreview(file)}
    >
      <div className="file-card-icon">
        <IconFile width={23} height={23} />
      </div>

      <div className="file-card-info">
        <strong title={file.name}>{file.name}</strong>

        <div className="file-card-meta">
          <span>{formatFileSize(file.file_size)}</span>
          <span className="file-type-badge">
            {file.name?.split(".").pop()?.toUpperCase() || "FILE"}
          </span>
        </div>
      </div>

      <div className="file-card-actions">
        <button
          type="button"
          className={`action-menu-button ${
            openActionMenu === `file-${file.id}` ? "is-open" : ""
          }`}
          aria-label="File actions"
          onClick={(event) => toggleFileMenu(event, file.id)}
        >
          <IconMoreVertical />
        </button>

        {openActionMenu === `file-${file.id}` && (
          <div
            className="action-dropdown"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                closeActionMenu();
                handlePreview(file);
              }}
            >
              <IconFile width={15} height={15} />
              Open
            </button>

            <button
              type="button"
              onClick={() => {
                closeActionMenu();
                handleDownload(file);
              }}
            >
              <IconDownload width={15} height={15} />
              Download
            </button>

            <button
              type="button"
              onClick={(event) => handleRenameClick(event, file)}
            >
              <IconEdit width={15} height={15} />
              Rename
            </button>

            <div className="action-dropdown-divider"></div>

            <button
              type="button"
              className="danger"
              onClick={(event) => handleDelete(event, file)}
            >
              <IconTrashSmall width={15} height={15} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dashboard">
      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <div className="logo-icon">
            <VaultMark />
          </div>

          <span className="nav-label">VaultDrive</span>
        </div>

        <nav className="dashboard-nav">
          {/* MY FILES */}

          <a
            href="#"
            className={`nav-item ${
              !showTrash && !showActivity && !showSharedWithMe && !searchActive
                ? "active"
                : ""
            }`}
            onClick={(event) => {
              event.preventDefault();

              clearSearch();

              setShowTrash(false);
              setShowActivity(false);
              setShowSharedWithMe(false);

              goBackToRoot();
            }}
          >
            <span className="nav-icon">
              <IconFolder />
            </span>

            <span className="nav-label">My Files</span>
          </a>

          {/* SHARED WITH ME */}

          <a
            href="#"
            className={`nav-item ${showSharedWithMe ? "active" : ""}`}
            onClick={handleSharedWithMe}
          >
            <span className="nav-icon">
              <IconShare />
            </span>

            <span className="nav-label">Shared with me</span>
          </a>

          {/* TRASH */}

          <a
            href="#"
            className={`nav-item ${showTrash ? "active" : ""}`}
            onClick={openTrash}
          >
            <span className="nav-icon">
              <IconTrash />
            </span>

            <span className="nav-label">Trash</span>
          </a>

          {/* ACTIVITY */}

          <a
            href="#"
            className={`nav-item ${showActivity ? "active" : ""}`}
            onClick={openActivity}
          >
            <span className="nav-icon">
              <IconActivity />
            </span>

            <span className="nav-label">Activity</span>
          </a>
        </nav>

        {/* STORAGE */}

        <div className="sidebar-bottom">
          <div className="storage-box">
            <div className="storage-header">
              <p>Storage</p>
            </div>

            <div className="storage-bar" aria-label="Storage usage">
              <div
                className="storage-used"
                data-level={getStorageLevel()}
                style={{
                  width: `${Math.min(storage.percentage || 0, 100)}%`,
                }}
              ></div>
            </div>

            <div className="storage-details">
              <span data-level={getStorageLevel()}>
                {formatUsedStorage()} of {storage.limit_gb || 10} GB used
              </span>
              <span className="storage-limit-label">10 GB limit</span>
            </div>
          </div>
        </div>
      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-main">
        {/* HIDDEN FILE INPUT */}

        <input
          id="file-upload"
          type="file"
          style={{
            display: "none",
          }}
          onChange={async (event) => {
            const file = event.target.files?.[0];

            if (!file) {
              return;
            }

            setSelectedFile(file);
            setUploadError("");

            await handleFileUpload(file);

            event.target.value = "";
          }}
        />

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="dashboard-header">
          {/* SEARCH */}

          <div className="search-box">
            <IconSearch width={18} height={18} className="search-icon" />

            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search files and folders..."
                className="w-[320px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pl-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className={`rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                  searching ? "is-loading" : ""
                }`}
                aria-label={searching ? "Searching" : "Search"}
              >
                {searching ? "Searching..." : "Search"}
              </button>

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:scale-95"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* PROFILE */}

          <div className="profile-wrapper" ref={profileRef}>
            <button
              type="button"
              className="user-profile"
              onClick={() => setShowProfileMenu((current) => !current)}
            >
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>

              <div className="user-info">
                <strong>{user?.name || "Loading..."}</strong>

                <small>Personal account</small>
              </div>

              <span className="ml-2 text-gray-400">▾</span>
            </button>

            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="flex items-center gap-3">
                    <div className="user-avatar">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div>
                      <strong>{user?.name || "User"}</strong>

                      <span>{user?.email || "Personal account"}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-divider"></div>

                <button
                  type="button"
                  className="logout-button"
                  onClick={handleLogout}
                >
                  <span>↪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="dashboard-content">
          {/* =================================================
              SEARCH RESULTS
          ================================================= */}

          {searchActive ? (
            <div className="search-results-page">
              <div className="welcome-section">
                <div>
                  <h1>Search Results</h1>

                  <p>
                    Search results for <strong>"{searchQuery.trim()}"</strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="upload-button"
                  onClick={clearSearch}
                >
                  ← My Files
                </button>
              </div>

              {searching && <div className="folder-loading">Searching...</div>}

              {searchError && <div className="upload-error">{searchError}</div>}

              {!searching && !searchError && (
                <>
                  {/* RESULT COUNT */}

                  <div className="section-header">
                    <h2>Results</h2>

                    <span className="text-sm text-gray-500">
                      {searchResults.files.length +
                        searchResults.folders.length}{" "}
                      result(s)
                    </span>
                  </div>

                  {/* FOLDERS */}

                  {searchResults.folders.length > 0 && (
                    <div className="files-section">
                      <div className="section-header">
                        <h2>Folders</h2>
                      </div>

                      <div
                        className={
                          viewMode === "grid"
                            ? "folder-grid"
                            : "folder-list-view"
                        }
                      >
                        {searchResults.folders.map((folder) => (
                          <div
                            key={`search-folder-${folder.id}`}
                            className={`folder-card ${
                              viewMode === "list" ? "folder-card-list" : ""
                            }`}
                          >
                            <div className="folder-card-icon">
                              <IconFolder width={28} height={28} />
                            </div>

                            <div className="folder-info">
                              <div className="folder-name">{folder.name}</div>

                              <div className="folder-meta">Folder</div>
                            </div>

                            <button
                              type="button"
                              className="folder-share-button"
                              onClick={() => handleOpenSearchFolder(folder)}
                            >
                              Open
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FILES */}

                  {searchResults.files.length > 0 && (
                    <div className="files-section">
                      <div className="section-header">
                        <h2>Files</h2>
                      </div>

                      <div
                        className={
                          viewMode === "grid" ? "file-grid-view" : "file-list"
                        }
                      >
                        {searchResults.files.map((file) => (
                          <div
                            key={`search-file-${file.id}`}
                            className={`file-card ${
                              viewMode === "grid" ? "file-card-grid" : ""
                            }`}
                          >
                            <div className="file-card-icon">
                              <IconFile width={23} height={23} />
                            </div>

                            <div className="file-card-info">
                              <strong title={file.name}>{file.name}</strong>

                              <div className="file-card-meta">
                                <span>{formatFileSize(file.file_size)}</span>
                                <span className="file-type-badge">
                                  {file.name?.split(".").pop()?.toUpperCase() ||
                                    "FILE"}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  closeActionMenu();
                                  handlePreview(file);
                                }}
                              >
                                <IconFile width={15} height={15} />
                                Open
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  closeActionMenu();
                                  handleDownload(file);
                                }}
                              >
                                <IconDownload width={15} height={15} />
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EMPTY SEARCH */}

                  {searchResults.files.length === 0 &&
                    searchResults.folders.length === 0 && (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <IconSearch width={34} height={34} />
                        </div>

                        <h3>No results found</h3>

                        <p>
                          We couldn't find any files or folders matching "
                          {searchQuery.trim()}
                          ".
                        </p>

                        <button
                          type="button"
                          className="empty-upload-button"
                          onClick={clearSearch}
                        >
                          ← Back to My Files
                        </button>
                      </div>
                    )}
                </>
              )}
            </div>
          ) : showTrash ? (
            /* =================================================
               TRASH
            ================================================= */

            <>
              <div className="welcome-section">
                <div>
                  <h1>Trash</h1>

                  <p>
                    Deleted files and folders stay here until you restore or
                    permanently delete them.
                  </p>
                </div>

                <button className="upload-button" onClick={closeTrash}>
                  ← My Files
                </button>
              </div>

              {loadingTrash && (
                <div className="folder-loading">Loading Trash...</div>
              )}

              {trashError && <div className="upload-error">{trashError}</div>}

              {/* DELETED FOLDERS */}

              {!loadingTrash && deletedFolders.length > 0 && (
                <div className="files-section">
                  <div className="section-header">
                    <h2>Deleted Folders</h2>
                  </div>

                  <div
                    className={
                      viewMode === "grid" ? "trash-grid" : "trash-list-view"
                    }
                  >
                    {deletedFolders.map((folder) => (
                      <div key={folder.id} className="trash-card">
                        <div className="trash-card-icon">
                          <IconFolder width={22} height={22} />
                        </div>

                        <div className="trash-card-info">
                          <strong>{folder.name}</strong>

                          <span>Deleted folder</span>
                        </div>

                        <div className="trash-card-actions">
                          <button
                            type="button"
                            className={`action-menu-button ${
                              openActionMenu === `trash-folder-${folder.id}`
                                ? "is-open"
                                : ""
                            }`}
                            aria-label="Trash folder actions"
                            onClick={(event) =>
                              toggleTrashFolderMenu(event, folder.id)
                            }
                          >
                            <IconMoreVertical />
                          </button>

                          {openActionMenu === `trash-folder-${folder.id}` && (
                            <div
                              className="action-dropdown trash-action-dropdown"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  closeActionMenu();
                                  handleRestoreFolder(folder.id);
                                }}
                              >
                                <IconRestore width={16} height={16} />
                                <span>Restore</span>
                              </button>

                              <div className="action-dropdown-divider" />

                              <button
                                type="button"
                                className="danger"
                                onClick={() => {
                                  closeActionMenu();
                                  handlePermanentDeleteFolder(folder.id);
                                }}
                              >
                                <IconTrashSmall width={16} height={16} />
                                <span>Delete Permanently</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DELETED FILES */}

              {!loadingTrash && trashFiles.length > 0 && (
                <div className="files-section">
                  <div className="section-header">
                    <h2>Deleted Files</h2>
                  </div>

                  <div
                    className={
                      viewMode === "grid" ? "trash-grid" : "trash-list-view"
                    }
                  >
                    {trashFiles.map((file) => {
                      const fileId = Number(file.id);

                      const isBusy = trashActionId === fileId;

                      return (
                        <div key={fileId} className="trash-card">
                          <div className="trash-card-icon">
                            <IconFolder width={22} height={22} />
                          </div>

                          <div className="trash-card-info">
                            <strong>{file.name}</strong>

                            <span>{file.file_size} bytes</span>
                          </div>

                          <div className="trash-card-actions">
                            <button
                              type="button"
                              className={`action-menu-button ${
                                openActionMenu === `trash-file-${fileId}`
                                  ? "is-open"
                                  : ""
                              }`}
                              aria-label="Trash file actions"
                              disabled={isBusy}
                              onClick={(event) =>
                                toggleTrashFileMenu(event, fileId)
                              }
                            >
                              <IconMoreVertical />
                            </button>

                            {openActionMenu === `trash-file-${fileId}` && (
                              <div
                                className="action-dropdown trash-action-dropdown"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => {
                                    closeActionMenu();
                                    handleRestoreFile(file);
                                  }}
                                >
                                  <IconRestore width={16} height={16} />
                                  <span>
                                    {isBusy ? "Working..." : "Restore"}
                                  </span>
                                </button>

                                <div className="action-dropdown-divider" />

                                <button
                                  type="button"
                                  className="danger"
                                  disabled={isBusy}
                                  onClick={() => {
                                    closeActionMenu();
                                    handlePermanentDeleteFile(file);
                                  }}
                                >
                                  <IconTrashSmall width={16} height={16} />
                                  <span>Delete Permanently</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EMPTY TRASH */}

              {!loadingTrash &&
                !trashError &&
                trashFiles.length === 0 &&
                deletedFolders.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <IconTrash width={34} height={34} />
                    </div>

                    <h3>Trash is empty</h3>

                    <p>Deleted files and folders will appear here.</p>
                  </div>
                )}
            </>
          ) : showActivity ? (
            /* =================================================
               ACTIVITY
            ================================================= */

            <>
              <div className="welcome-section">
                <div>
                  <h1>Activity</h1>

                  <p>See your recent VaultDrive activity.</p>
                </div>

                <button
                  className="upload-button"
                  onClick={() => {
                    setShowActivity(false);
                    goBackToRoot();
                  }}
                >
                  ← My Files
                </button>
              </div>

              {loadingActivity && (
                <div className="folder-loading">Loading activity...</div>
              )}

              {activityError && (
                <div className="upload-error">{activityError}</div>
              )}

              {!loadingActivity && !activityError && activity.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <IconActivity width={34} height={34} />
                  </div>

                  <h3>No activity yet</h3>

                  <p>Your recent actions will appear here.</p>
                </div>
              )}

              {!loadingActivity && !activityError && activity.length > 0 && (
                <div className="activity-card">
                  <div className="activity-card-header">
                    <div>
                      <h2>Recent Activity</h2>
                      <p>Your latest VaultDrive actions</p>
                    </div>

                    <div className="activity-count">{activity.length}</div>
                  </div>

                  <div className="activity-scroll-area">
                    <div className="activity-list">
                      {activity.map((item) => (
                        <div key={item.id} className="activity-item">
                          <div className="activity-icon">
                            <IconActivity />
                          </div>

                          <div className="activity-info">
                            <strong>
                              {item.action
                                ?.split("_")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                                )
                                .join(" ")}
                            </strong>

                            <span>
                              {item.file_name ||
                                item.folder_name ||
                                "VaultDrive"}
                            </span>

                            {item.created_at && (
                              <small>
                                {new Date(item.created_at).toLocaleString()}
                              </small>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : showSharedWithMe ? (
            /* =================================================
               SHARED WITH ME
            ================================================= */

            <>
              <div className="welcome-section">
                <div>
                  <h1>Shared with Me</h1>

                  <p>Folders that other users have shared with you.</p>
                </div>

                <button
                  type="button"
                  className="upload-button"
                  onClick={() => {
                    setShowSharedWithMe(false);
                    goBackToRoot();
                  }}
                >
                  ← My Files
                </button>
              </div>

              {loadingShared && (
                <div className="folder-loading">Loading shared folders...</div>
              )}

              {sharedError && <div className="upload-error">{sharedError}</div>}

              {!loadingShared && !sharedError && (
                <>
                  {sharedFolders.length > 0 ? (
                    <div className="files-section">
                      <div className="section-header">
                        <h2>Shared Folders</h2>

                        <span className="text-sm text-gray-500">
                          {sharedFolders.length} folder(s)
                        </span>
                      </div>

                      <div
                        className={
                          viewMode === "grid"
                            ? "folder-grid"
                            : "folder-list-view"
                        }
                      >
                        {sharedFolders.map((folder) => (
                          <div
                            key={`shared-folder-${folder.id}`}
                            className={`folder-card ${
                              viewMode === "list" ? "folder-card-list" : ""
                            }`}
                          >
                            <div className="folder-card-icon">
                              <IconFolder width={28} height={28} />
                            </div>

                            <div className="folder-info">
                              <div className="folder-name">
                                {folder.folder_name}
                              </div>

                              <div className="folder-meta">Shared folder</div>
                            </div>

                            <button
                              type="button"
                              className="upload-button"
                              onClick={() => {
                                setShowSharedWithMe(false);
                                setSearchActive(false);
                                openFolder({
                                  id: folder.folder_id,
                                  name: folder.folder_name,
                                });
                              }}
                            >
                              Open
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <IconFolder width={34} height={34} />
                      </div>

                      <h3>No shared folders</h3>

                      <p>No folders have been shared with you yet.</p>

                      <button
                        type="button"
                        className="empty-upload-button"
                        onClick={() => {
                          setShowSharedWithMe(false);
                          goBackToRoot();
                        }}
                      >
                        ← Back to My Files
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* =================================================
               NORMAL MY FILES
            ================================================= */

            <>
              {/* WELCOME */}

              <div className="welcome-section">
                <div>
                  <h1>{currentFolder ? currentFolder.name : "My Files"}</h1>

                  <p>Store, manage and share your files securely.</p>
                </div>

                <button
                  className="upload-button"
                  onClick={() => document.getElementById("file-upload").click()}
                  disabled={uploadingFile}
                >
                  <IconUpload />

                  {uploadingFile ? "Uploading..." : "Upload"}
                </button>
              </div>

              {/* QUICK ACTIONS */}

              <div className="quick-actions">
                <button
                  className="action-card"
                  onClick={() => document.getElementById("file-upload").click()}
                  disabled={uploadingFile}
                >
                  <IconUpload />

                  <div>
                    <strong>Upload files</strong>

                    <p>
                      {currentFolder
                        ? `Add files to ${currentFolder.name}`
                        : "Add files to My Files"}
                    </p>
                  </div>
                </button>

                <button className="action-card" onClick={openCreateFolderModal}>
                  <IconFolderPlus />

                  <div>
                    <strong>New folder</strong>

                    <p>
                      {currentFolder
                        ? `Create inside ${currentFolder.name}`
                        : "Create a new folder"}
                    </p>
                  </div>
                </button>
              </div>

              {/* UPLOAD STATUS */}

              {uploadingFile && (
                <div className="upload-status">
                  Uploading <strong>{selectedFile?.name}</strong>
                  ...
                </div>
              )}

              {uploadError && <div className="upload-error">{uploadError}</div>}

              {/* BREADCRUMB */}

              {currentFolder && (
                <div className="folder-breadcrumb">
                  <button
                    className="breadcrumb-back"
                    onClick={goBackOneFolder}
                    aria-label="Go back"
                  >
                    <span className="breadcrumb-back-icon">←</span>

                    <span>Back</span>
                  </button>

                  <div className="breadcrumb-divider"></div>

                  <button className="breadcrumb-link" onClick={goBackToRoot}>
                    My Files
                  </button>

                  {folderPath.map((folder, index) => (
                    <div className="breadcrumb-item" key={folder.id}>
                      <span className="breadcrumb-separator">›</span>

                      {index === folderPath.length - 1 ? (
                        <div className="breadcrumb-current">
                          <IconFolder width={16} height={16} />

                          <strong>{folder.name}</strong>
                        </div>
                      ) : (
                        <button
                          className="breadcrumb-link"
                          onClick={async () => {
                            const newPath = folderPath.slice(0, index + 1);

                            try {
                              setLoadingContents(true);

                              setContentsError("");

                              const data = await getFolderContents(folder.id);

                              setFolderPath(newPath);

                              setCurrentFolder(folder);

                              setFolderContents(data);
                            } catch (error) {
                              console.error(error);

                              setContentsError(
                                error.message || "Failed to open folder",
                              );
                            } finally {
                              setLoadingContents(false);
                            }
                          }}
                        >
                          {folder.name}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* FILES / FOLDERS */}

              <div className="files-section">
                <div className="section-header">
                  <h2>{currentFolder ? "Folder contents" : "Files"}</h2>

                  <button
                    className={`view-button ${
                      viewMode === "list" ? "active" : ""
                    }`}
                    aria-label={
                      viewMode === "grid"
                        ? "Switch to list view"
                        : "Switch to grid view"
                    }
                    onClick={toggleViewMode}
                    title={
                      viewMode === "grid"
                        ? "Switch to list view"
                        : "Switch to grid view"
                    }
                  >
                    {viewMode === "grid" ? <IconList /> : <IconGrid />}
                  </button>
                </div>

                {/* CURRENT FOLDER */}

                {currentFolder && (
                  <div className="folder-contents">
                    {loadingContents && (
                      <div className="folder-loading">Loading folder...</div>
                    )}

                    {!loadingContents && contentsError && (
                      <div className="folder-error">{contentsError}</div>
                    )}

                    {!loadingContents && !contentsError && folderContents && (
                      <>
                        {/* SUBFOLDERS */}

                        {folderContents.folders?.length > 0 && (
                          <div
                            className={
                              viewMode === "grid"
                                ? "folder-grid"
                                : "folder-list-view"
                            }
                          >
                            {folderContents.folders.map((folder) =>
                              renderFolderCard(folder, {
                                listView: viewMode === "list",
                                onOpen: openFolder,
                              }),
                            )}
                          </div>
                        )}

                        {/* FILES */}

                        {folderContents.files?.length > 0 && (
                          <div
                            className={
                              viewMode === "grid"
                                ? "file-grid-view"
                                : "file-list"
                            }
                          >
                            {folderContents.files.map((file) =>
                              renderFileCard(file, {
                                gridView: viewMode === "grid",
                              }),
                            )}
                          </div>
                        )}

                        {/* EMPTY */}

                        {(!folderContents.folders ||
                          folderContents.folders.length === 0) &&
                          (!folderContents.files ||
                            folderContents.files.length === 0) && (
                            <div className="empty-state">
                              <div className="empty-icon">
                                <IconFolder width={34} height={34} />
                              </div>

                              <h3>This folder is empty</h3>

                              <p>Upload files or create a new folder here.</p>

                              <button
                                className="empty-upload-button"
                                onClick={() =>
                                  document.getElementById("file-upload").click()
                                }
                              >
                                <IconUpload width={17} height={17} />
                                Upload file
                              </button>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                )}

                {/* ROOT FOLDERS */}

                {!currentFolder && (
                  <>
                    {loadingFolders && (
                      <div className="folder-loading">Loading folders...</div>
                    )}

                    {!loadingFolders && folderError && (
                      <div className="folder-error">{folderError}</div>
                    )}

                    {!loadingFolders &&
                      !folderError &&
                      rootFolders.length > 0 && (
                        <div
                          className={
                            viewMode === "grid"
                              ? "folder-grid"
                              : "folder-list-view"
                          }
                        >
                          {rootFolders.map((folder) =>
                            renderFolderCard(folder, {
                              listView: viewMode === "list",
                              onOpen: openFolder,
                            }),
                          )}
                        </div>
                      )}

                    {!loadingFolders &&
                      !folderError &&
                      rootFolders.length === 0 && (
                        <div className="empty-state">
                          <div className="empty-icon">
                            <IconFolder width={34} height={34} />
                          </div>

                          <h3>No folders yet</h3>

                          <p>Create your first folder to get started.</p>

                          <button
                            className="empty-upload-button"
                            onClick={openCreateFolderModal}
                          >
                            <IconFolderPlus width={17} height={17} />
                            New folder
                          </button>
                        </div>
                      )}
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* =====================================================
          CREATE FOLDER MODAL
      ===================================================== */}

      {showCreateFolder && (
        <div className="modal-overlay" onClick={closeCreateFolderModal}>
          <div
            className="create-folder-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Create new folder</h2>

                <p>
                  {currentFolder
                    ? `Create a folder inside ${currentFolder.name}.`
                    : "Give your folder a name."}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeCreateFolderModal}
                aria-label="Close"
                disabled={creatingFolder}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateFolder}>
              <div className="folder-name-field">
                <label htmlFor="folder-name">
                  <IconFolderPlus width={16} height={16} />

                  <span>Folder name</span>
                </label>

                <input
                  id="folder-name"
                  type="text"
                  value={folderName}
                  onChange={(event) => setFolderName(event.target.value)}
                  placeholder="e.g. My Projects"
                  autoFocus
                  disabled={creatingFolder}
                />

                <small>
                  Choose a name that helps you identify this folder.
                </small>
              </div>

              {createFolderError && (
                <p className="create-folder-error">{createFolderError}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={closeCreateFolderModal}
                  disabled={creatingFolder}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-create"
                  disabled={creatingFolder}
                >
                  {creatingFolder ? "Creating..." : "Create folder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          SHARE MODAL
      ===================================================== */}

      {showShareModal && selectedShareFolder && (
        <div className="share-modal-overlay" onClick={closeShareModal}>
          <div
            className="share-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="share-modal-header">
              <div>
                <h2>Share Folder</h2>

                <p>Share "{selectedShareFolder.name}" with another user.</p>
              </div>

              <button
                className="share-modal-close"
                disabled={sharingFolder}
                onClick={closeShareModal}
              >
                ×
              </button>
            </div>

            <div className="share-modal-body">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter user's email"
                value={shareEmail}
                onChange={(event) => {
                  setShareEmail(event.target.value);

                  setShareError("");
                  setShareSuccess("");
                }}
                disabled={sharingFolder}
              />

              <label>Permission</label>

              <select
                value={shareRole}
                onChange={(event) => {
                  setShareRole(event.target.value);

                  setShareError("");
                }}
                disabled={sharingFolder}
              >
                <option value="viewer">Viewer</option>

                <option value="editor">Editor</option>
              </select>

              <p className="share-permission-info">
                Viewer can view and download files. Editor can also upload and
                rename files.
              </p>

              {shareError && <div className="share-error">{shareError}</div>}

              {shareSuccess && (
                <div className="share-success">{shareSuccess}</div>
              )}

              <div className="people-with-access">
                <h4>People with access</h4>

                {loadingPermissions ? (
                  <p className="permission-loading">Loading...</p>
                ) : folderPermissions.length === 0 ? (
                  <p className="permission-empty">No one has access yet.</p>
                ) : (
                  <div className="permission-list">
                    {folderPermissions.map((permission) => (
                      <div key={permission.user_id} className="permission-user">
                        <div className="permission-user-info">
                          <div className="permission-user-name">
                            {permission.name}
                          </div>

                          <div className="permission-user-email">
                            {permission.email}
                          </div>
                        </div>

                        <div className="permission-user-actions">
                          <select
                            value={permission.role}
                            disabled={
                              updatingPermissionUserId === permission.user_id
                            }
                            onChange={(event) =>
                              handleUpdatePermission(
                                permission.user_id,
                                event.target.value,
                              )
                            }
                          >
                            <option value="viewer">Viewer</option>

                            <option value="editor">Editor</option>
                          </select>

                          <button
                            type="button"
                            className="permission-remove-button"
                            disabled={
                              removingPermissionUserId === permission.user_id
                            }
                            onClick={() =>
                              handleRemovePermission(permission.user_id)
                            }
                          >
                            {removingPermissionUserId === permission.user_id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="share-modal-footer">
              <button
                className="share-cancel-button"
                disabled={sharingFolder}
                onClick={closeShareModal}
              >
                Close
              </button>

              <button
                className="share-submit-button"
                disabled={sharingFolder}
                onClick={handleShareFolder}
              >
                {sharingFolder ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
    FILE PREVIEW MODAL
===================================================== */}

      {showPreview && (
        <div
          className="preview-overlay"
          onClick={() => {
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }

            setShowPreview(false);
            setPreviewFile(null);
            setPreviewUrl("");
            setPreviewError("");
          }}
        >
          <div
            className="preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="preview-header">
              <div>
                <h3>{previewFile?.name}</h3>
                <span>{formatFileSize(previewFile?.file_size || 0)}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                  }

                  setShowPreview(false);
                  setPreviewFile(null);
                  setPreviewUrl("");
                  setPreviewError("");
                }}
              >
                ✕
              </button>
            </div>

            <div className="preview-content">
              {previewLoading && (
                <div className="preview-loading">Loading preview...</div>
              )}

              {previewError && (
                <div className="preview-error">{previewError}</div>
              )}

              {!previewLoading &&
                !previewError &&
                previewUrl &&
                previewFile?.name
                  ?.toLowerCase()
                  .match(/\.(jpg|jpeg|png|gif)$/) && (
                  <img
                    src={previewUrl}
                    alt={previewFile.name}
                    className="preview-image"
                  />
                )}

              {!previewLoading &&
                !previewError &&
                previewUrl &&
                previewFile?.name
                  ?.toLowerCase()
                  .match(/\.(mp4|webm|mov|mkv|avi)$/) && (
                  <video src={previewUrl} controls className="preview-video" />
                )}

              {!previewLoading &&
                !previewError &&
                previewUrl &&
                previewFile?.name?.toLowerCase().endsWith(".pdf") && (
                  <iframe
                    src={previewUrl}
                    title={previewFile.name}
                    className="preview-pdf"
                  />
                )}
            </div>

            <div className="preview-footer">
              <button type="button" onClick={() => handleDownload(previewFile)}>
                <IconDownload width={16} height={16} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          RENAME FILE MODAL
      ===================================================== */}

      {showRenameModal && selectedRenameFile && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="modal-close"
              onClick={() => {
                setShowRenameModal(false);

                setSelectedRenameFile(null);

                setRenameError("");
              }}
              disabled={renamingFile}
            >
              ×
            </button>

            <h2>Rename File</h2>

            <p className="modal-description">
              Rename "{selectedRenameFile.name}"
            </p>

            <input
              type="text"
              value={renameName}
              onChange={(event) => setRenameName(event.target.value)}
              placeholder="Enter new file name"
              disabled={renamingFile}
            />

            {renameError && <div className="rename-error">{renameError}</div>}

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => {
                  setShowRenameModal(false);

                  setSelectedRenameFile(null);

                  setRenameError("");
                }}
                disabled={renamingFile}
              >
                Cancel
              </button>

              <button
                className="confirm-button"
                onClick={handleRenameFile}
                disabled={renamingFile}
              >
                {renamingFile ? "Renaming..." : "Rename"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          RENAME FOLDER MODAL
      ===================================================== */}

      {showRenameFolderModal && selectedRenameFolder && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              onClick={() => {
                setShowRenameFolderModal(false);
                setSelectedRenameFolder(null);
                setRenameFolderName("");
                setRenameFolderError("");
              }}
              disabled={renamingFolder}
            >
              ×
            </button>

            <h2>Rename Folder</h2>

            <p className="modal-description">
              Rename "{selectedRenameFolder.name}"
            </p>

            <input
              type="text"
              value={renameFolderName}
              onChange={(event) => {
                setRenameFolderName(event.target.value);
                setRenameFolderError("");
              }}
              placeholder="Enter new folder name"
              disabled={renamingFolder}
              autoFocus
            />

            {renameFolderError && (
              <div className="rename-error">{renameFolderError}</div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowRenameFolderModal(false);
                  setSelectedRenameFolder(null);
                  setRenameFolderName("");
                  setRenameFolderError("");
                }}
                disabled={renamingFolder}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-button"
                onClick={handleRenameFolderSubmit}
                disabled={renamingFolder}
              >
                {renamingFolder ? "Renaming..." : "Rename"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
