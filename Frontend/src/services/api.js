const API_URL = "http://localhost:8000";

/* =========================================================
   COMMON HELPERS
========================================================= */

function getToken() {
  return localStorage.getItem("access_token");
}

function authHeaders() {
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse(response) {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Server returned invalid response. Status: ${response.status}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        `Request failed with status ${response.status}`,
    );
  }

  return data;
}

function requireToken() {
  const token = getToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  return token;
}

/* =========================================================
   AUTH
========================================================= */

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return parseResponse(response);
}

export async function registerUser(name, email, password) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  return parseResponse(response);
}

export async function getCurrentUser() {
  requireToken();

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}

/* =========================================================
   FOLDERS
========================================================= */

export async function getFolders() {
  requireToken();

  const response = await fetch(`${API_URL}/folders/`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}

export async function createFolder(name, parentId = null) {
  requireToken();

  const body = {
    name,
  };

  if (parentId !== null && parentId !== undefined) {
    body.parent_id = Number(parentId);
  }

  const response = await fetch(`${API_URL}/folders/`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return parseResponse(response);
}

/*
  Get folders + files inside a folder.

  IMPORTANT:
  This endpoint should exist in your folder router.
*/
export async function getFolderContents(folderId) {
  requireToken();

  const id = Number(folderId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid folder ID.");
  }

  const response = await fetch(`${API_URL}/folders/${id}/contents`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}

export async function renameFolder(folderId, name) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/folders/${folderId}/rename`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to rename folder");
  }

  return data;
}

export async function deleteFolder(folderId) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/folders/${folderId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to delete folder");
  }

  return data;
}

export async function getFolderRole(folderId) {
  requireToken();

  const id = Number(folderId);

  const response = await fetch(`${API_URL}/folders/${id}/role`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}

/* =========================================================
   FILE UPLOAD
========================================================= */

export async function uploadFile(file, folderId = null) {
  requireToken();

  if (!file) {
    throw new Error("Please select a file.");
  }

  const formData = new FormData();

  /*
    IMPORTANT:
    The backend expects:

    file
    folder_id

    as multipart/form-data.
  */

  formData.append("file", file);

  if (folderId !== null && folderId !== undefined) {
    const numericFolderId = Number(folderId);

    if (!Number.isInteger(numericFolderId) || numericFolderId <= 0) {
      throw new Error("Invalid folder ID.");
    }

    formData.append("folder_id", String(numericFolderId));
  }

  console.log("========== FILE UPLOAD ==========");
  console.log("File:", file.name);
  console.log("Size:", file.size);
  console.log("Folder ID:", folderId);
  console.log("=================================");

  const response = await fetch(`${API_URL}/files/upload`, {
    method: "POST",

    /*
      DO NOT set Content-Type manually here.

      Browser automatically creates:

      multipart/form-data; boundary=...

    */
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },

    body: formData,
  });

  return parseResponse(response);
}

/* =========================================================
   FILE LIST
========================================================= */

export async function getFiles() {
  requireToken();

  const response = await fetch(`${API_URL}/files/`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}

/* =========================================================
   FILE DOWNLOAD
========================================================= */

export async function downloadFile(fileId) {
  requireToken();

  const id = Number(fileId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid file ID.");
  }

  const response = await fetch(`${API_URL}/files/${id}/download`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    const data = await parseResponse(response);
    return data;
  }

  const blob = await response.blob();

  const contentDisposition = response.headers.get("Content-Disposition");

  let filename = "download";

  if (contentDisposition) {
    const match = contentDisposition.match(
      /filename\*?=(?:UTF-8'')?["']?([^;"']+)/i,
    );

    if (match && match[1]) {
      filename = decodeURIComponent(match[1]);
    }
  }

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);

  return true;
}

/* =========================================================
   PREVIEW FILE
========================================================= */
export async function previewFile(fileId) {
  requireToken();

  const response = await fetch(`${API_URL}/files/${fileId}/preview`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    let message = "Failed to preview file";

    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  return URL.createObjectURL(blob);
}

export async function getFilePreview(fileId) {
  requireToken();

  const response = await fetch(`${API_URL}/files/${fileId}/preview`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const blob = await response.blob();

  return URL.createObjectURL(blob);
}

/* =========================================================
   RENAME FILE
========================================================= */

export async function renameFile(fileId, name) {
  requireToken();

  const id = Number(fileId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid file ID.");
  }

  const response = await fetch(`${API_URL}/files/${id}/rename`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
    }),
  });

  return parseResponse(response);
}

/* =========================================================
   SOFT DELETE FILE
========================================================= */

export async function deleteFile(fileId) {
  requireToken();

  const id = Number(fileId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid file ID.");
  }

  const response = await fetch(`${API_URL}/files/${id}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}

/* =========================================================
   TRASH
========================================================= */

export async function getTrash() {
  requireToken();

  const response = await fetch(`${API_URL}/files/trash`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}

export async function restoreFile(fileId) {
  requireToken();

  const id = Number(fileId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid file ID.");
  }

  console.log("Restoring file ID:", id);

  const response = await fetch(`${API_URL}/files/${id}/restore`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}

export async function permanentlyDeleteFile(fileId) {
  requireToken();

  const id = Number(fileId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid file ID.");
  }

  console.log("Permanently deleting file ID:", id);

  const response = await fetch(`${API_URL}/files/${id}/permanent`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}

/* =========================================================
   FOLDER SHARING
========================================================= */

export async function shareFolder(folderId, email, role) {
  requireToken();

  const id = Number(folderId);

  const response = await fetch(`${API_URL}/permissions/share`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      folder_id: id,
      email,
      role,
    }),
  });

  return parseResponse(response);
}

export async function getFolderPermissions(folderId) {
  requireToken();

  const id = Number(folderId);

  const response = await fetch(`${API_URL}/permissions/folder/${id}`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}

export async function updateFolderPermission(folderId, userId, role) {
  requireToken();

  const folder = Number(folderId);
  const user = Number(userId);

  const response = await fetch(
    `${API_URL}/permissions/folder/${folder}/user/${user}`,
    {
      method: "PUT",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role,
      }),
    },
  );

  return parseResponse(response);
}

export async function removeFolderPermission(folderId, userId) {
  requireToken();

  const folder = Number(folderId);
  const user = Number(userId);

  const response = await fetch(
    `${API_URL}/permissions/folder/${folder}/user/${user}`,
    {
      method: "DELETE",
      headers: {
        ...authHeaders(),
      },
    },
  );

  return parseResponse(response);
}

/* =========================================================
   USER ACTIVITY
========================================================= */

export async function getActivity() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/activity/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load activity");
  }

  return data;
}

/* =========================================================
   DELETED FOLDER API
========================================================= */
export async function getDeletedFolders() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/folders/trash`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load deleted folders");
  }

  return data;
}

/* =========================================================
   RESTORE FOLDER API
========================================================= */
export async function restoreFolder(folderId) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/folders/${folderId}/restore`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to restore folder");
  }

  return data;
}

/* =========================================================
   PERMENENTLY DELETE FOLDER API
========================================================= */
export async function permanentlyDeleteFolder(folderId) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/folders/${folderId}/permanent`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to permanently delete folder");
  }

  return data;
}

// ============================================================
// SEARCH
// ============================================================

export async function searchItems(query) {
  const token = localStorage.getItem("access_token");

  const url = `${API_URL}/search/?q=${encodeURIComponent(query)}`;

  console.log("SEARCH URL:", url);
  console.log("SEARCH TOKEN EXISTS:", !!token);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("SEARCH STATUS:", response.status);

  const data = await response.json();

  console.log("SEARCH BACKEND DATA:", data);

  if (!response.ok) {
    throw new Error(data.detail || "Failed to search");
  }

  return data;
}

// ============================================================
// SHARED WITH ME API
// ============================================================

export async function getSharedWithMe() {
  requireToken();

  const response = await fetch(`${API_URL}/folders/shared-with-me`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}

// ============================================================
// GET STORAGE
// ============================================================
export async function getStorageUsage() {
  requireToken();

  const response = await fetch(`${API_URL}/storage/`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  return parseResponse(response);
}
