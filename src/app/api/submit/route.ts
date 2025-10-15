import { google } from 'googleapis';
import { Readable } from 'stream';

export const runtime = 'nodejs';

function getEnv(name: string, optional = false): string | undefined {
  const v = process.env[name];
  if (!v && !optional) throw new Error(`Missing env var: ${name}`);
  return v;
}

// Default parent folder for all newly created student folders ("student files")
const DEFAULT_PARENT_FOLDER_ID = '1uBtsAnQrwPMcb-BcYRfE5m_mNA7nTyyW';

function normalizeKey(originalKey: string): string {
  // Collapse spaces, convert snake_case to camelCase, and lower-case first letter
  const withoutSpaces = originalKey.replace(/\s+/g, '');
  const camel = withoutSpaces.replace(/_([a-zA-Z0-9])/g, (_, c) => (c as string).toUpperCase());
  const lowerFirst = camel.charAt(0).toLowerCase() + camel.slice(1);
  // Specific canonicalizations for known fields
  if (lowerFirst === 'additionalDocs1') return 'additionalDoc1';
  if (lowerFirst === 'additionalDocs2') return 'additionalDoc2';
  if (lowerFirst === 'nationalId') return 'nationalID';
  if (lowerFirst === 'folderurl' || lowerFirst === 'folderUrl') return 'folderUrl';
  return lowerFirst;
}

function buildHyperlink(url: string, label: string): string {
  const safeLabel = (label || '').replace(/"/g, '""');
  return `=HYPERLINK("${url}","${safeLabel}")`;
}

function sanitizeSegment(value: string | undefined): string {
  const v = (value || '').toString().trim();
  if (!v) return '';
  // Replace spaces with underscores and strip problematic characters
  return v.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\-]/g, '');
}

function buildStudentFolderName(payload: Record<string, any>): string {
  const last = sanitizeSegment(payload.lastName);
  const first = sanitizeSegment(payload.firstName);
  const degree = sanitizeSegment(payload.degreeLevel);
  const studentType = sanitizeSegment(payload.studentType);
  const lastFirst = [last, first].filter(Boolean).join('_');
  const degreeAndType = [degree, studentType].filter(Boolean).join('-');
  if (lastFirst && degreeAndType) return `${lastFirst}-${degreeAndType}`;
  if (lastFirst) return lastFirst;
  if (degreeAndType) return degreeAndType;
  return 'Student_Folder';
}

function buildStudentNamePrefix(payload: Record<string, any>): string {
  const last = sanitizeSegment(payload.lastName);
  const first = sanitizeSegment(payload.firstName);
  const base = [last, first].filter(Boolean).join('_');
  return base ? `${base}_` : 'Student_';
}

function extractFileExtension(name: string | undefined): string {
  if (!name) return '';
  const match = name.match(/\.[A-Za-z0-9]{1,8}$/);
  return match ? match[0] : '';
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Collect payload from FormData
    // - Normalize keys to internal camelCase
    // - Preserve File objects separately for Drive uploads
    const payload: Record<string, any> = {};
    const filesByKey: Record<string, File> = {};
    for (const [rawKey, value] of formData.entries()) {
      const key = normalizeKey(rawKey);
      if (value instanceof File) {
        if (value && value.size > 0) {
          filesByKey[key] = value;
          payload[key] = value.name || '';
        } else {
          payload[key] = '';
        }
      } else {
        payload[key] = value?.toString?.() ?? '';
      }
    }

    // Ensure Additional Comments mirrors Notes when not explicitly provided
    if (!payload.additionalComments && payload.notes) {
      payload.additionalComments = payload.notes;
    }

    // Auth with Service Account
    const clientEmail = getEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL') as string;
    // Support either multiline key with \n escapes or base64-encoded key
    const rawKey = getEnv('GOOGLE_PRIVATE_KEY', true) || '';
    const b64Key = getEnv('GOOGLE_PRIVATE_KEY_BASE64', true) || '';
    let privateKey = '';
    if (b64Key) {
      try { privateKey = Buffer.from(b64Key, 'base64').toString('utf8'); } catch {}
    }
    if (!privateKey && rawKey) {
      privateKey = rawKey.replace(/\\n/g, '\n');
    }
    if (!privateKey) {
      throw new Error('GOOGLE_PRIVATE_KEY or GOOGLE_PRIVATE_KEY_BASE64 is not set');
    }
    const jwt = new google.auth.JWT(
      clientEmail,
      undefined,
      privateKey,
      [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
      ]
    );
    await jwt.authorize();

    // Always create Drive folder under the designated parent (student files)
    // Force usage of DEFAULT_PARENT_FOLDER_ID regardless of env override
    const driveParentId = DEFAULT_PARENT_FOLDER_ID;
    const drive = google.drive({ version: 'v3', auth: jwt });
    try { console.log('Drive parent in use:', { driveParentId, source: 'default' }); } catch {}

    // Preflight: verify parent exists, is a folder, and is accessible
    try {
      const parentMeta = await drive.files.get({
        fileId: driveParentId,
        fields: 'id,name,mimeType,driveId,parents',
        supportsAllDrives: true,
      });
      const mimeType = parentMeta.data.mimeType;
      if (mimeType !== 'application/vnd.google-apps.folder') {
        throw new Error(`DRIVE_PARENT_FOLDER_ID does not point to a folder (mimeType=${mimeType})`);
      }
      try { console.log('Resolved parent folder:', { id: parentMeta.data.id, name: parentMeta.data.name, driveId: (parentMeta.data as any).driveId }); } catch {}
    } catch (e: any) {
      throw new Error(`Cannot access DRIVE_PARENT_FOLDER_ID=${driveParentId}. Ensure the service account has at least Contributor and the ID is a folder. Original error: ${e?.message || e}`);
    }

    const folderName = buildStudentFolderName(payload);
    let folderUrl = '';
    let folderId: string | undefined;
    {
      try {
        const res = await drive.files.create({
          requestBody: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [driveParentId as string],
          },
          fields: 'id',
          supportsAllDrives: true,
        });
        const id = res.data.id;
        if (!id) throw new Error('Failed to create Drive folder');
        folderId = id;
        folderUrl = `https://drive.google.com/drive/folders/${id}`;
        // Post-create: ensure folder resides under the intended parent
        try {
          const createdMeta = await drive.files.get({
            fileId: folderId,
            fields: 'id,parents',
            supportsAllDrives: true,
          });
          const currentParents = createdMeta.data.parents || [];
          if (!currentParents.includes(driveParentId)) {
            const updateParams: any = {
              fileId: folderId,
              addParents: driveParentId,
              fields: 'id,parents',
              supportsAllDrives: true,
            };
            if (currentParents.length > 0) {
              updateParams.removeParents = currentParents.join(',');
            }
            const updated = await drive.files.update(updateParams);
            try { console.log('Adjusted folder placement into parent:', { folderId, parents: updated.data.parents }); } catch {}
          }
        } catch (placementErr) {
          try { console.error('Post-create folder placement check failed:', placementErr); } catch {}
        }
      } catch (e: any) {
        throw new Error(`Failed to create Drive folder under parent ${driveParentId}. Ensure the service account has at least Contributor on that folder/shared drive. Original error: ${e?.message || e}`);
      }
    }

    // Best-effort: ensure folder is accessible via link
    if (folderId) {
      try {
        await drive.permissions.create({
          fileId: folderId,
          requestBody: { type: 'anyone', role: 'reader' },
          supportsAllDrives: true,
        });
      } catch {}
    }

    // No subfolders: all files will be uploaded directly into the student folder

    // Upload files to the Drive folder and collect their view links
    const fileViewLinks: Record<string, string> = {};
    const fileLinkLabels: Record<string, string> = {};
    // Upload all provided file fields into the newly created folder
    const uploadKeys = Object.keys(filesByKey);
    try { console.log('Files detected for upload:', uploadKeys); } catch {}
    const typeLabelByKey: Record<string, string> = {
      nationalID: 'ID',
      transcript1: 'transcript1',
      transcript2: 'transcript2',
      additionalDoc1: 'additionaldoc1',
      additionalDoc2: 'additionaldoc2',
    };
    if (folderId) {
      try { console.log('Drive folder ready:', { folderId, folderUrl, folderName }); } catch {}
      let successfulUploadCount = 0;
      for (const k of uploadKeys) {
        const f = filesByKey[k];
        if (!f) continue;
        try {
          const ab = await f.arrayBuffer();
          const buffer = Buffer.from(ab);
          const typeLabel = (typeLabelByKey as any)?.[k] || k;
          const ext = extractFileExtension(f.name);
          const driveName = `${folderName}_${typeLabel}${ext}`;
          const res = await drive.files.create({
            requestBody: {
              name: driveName,
              parents: [folderId],
            },
            media: {
              mimeType: (f as any).type || 'application/octet-stream',
              body: Readable.from(buffer),
            } as any,
            fields: 'id',
            supportsAllDrives: true,
          } as any);
          const id = (res.data as any).id as string | undefined;
          if (id) {
            // Best-effort: make file accessible
            try {
              await drive.permissions.create({
                fileId: id,
                requestBody: { type: 'anyone', role: 'reader' },
                supportsAllDrives: true,
              });
            } catch {}
            fileViewLinks[k] = `https://drive.google.com/file/d/${id}/view`;
            fileLinkLabels[k] = driveName;
            try { console.log('Uploaded to Drive:', { key: k, name: driveName, id }); } catch {}
            successfulUploadCount += 1;
          }
        } catch (e) {
          // Log upload error for visibility
          try { console.error('Drive upload failed for key:', k, e); } catch {}
          // skip on upload error; we'll fall back to file name in sheet
        }
      }
      if (uploadKeys.length > 0 && successfulUploadCount === 0) {
        throw new Error('No files were uploaded to Drive. Please verify DRIVE_PARENT_FOLDER_ID and service account access.');
      }
    } else {
      try { console.error('No Drive folderId resolved; cannot upload files.'); } catch {}
    }

    // Append row to Google Sheets
    const spreadsheetId = getEnv('SHEETS_SPREADSHEET_ID') as string;
    const sheets = google.sheets({ version: 'v4', auth: jwt });

    // Resolve target sheet name and starting range dynamically if SHEETS_RANGE is missing/invalid
    let range = getEnv('SHEETS_RANGE', true) as string | undefined;
    if (!range || !/!.+/.test(range)) {
      const meta = await sheets.spreadsheets.get({ spreadsheetId });
      const sheet = meta.data.sheets?.[0];
      const title = sheet?.properties?.title || 'Sheet1';
      range = `${title}!A1`;
    }

    // Define column order to match the Google Sheet headers exactly:
    // FolderUrl, First Name, Middle Name, Last Name, Additional Name, Student Location, Degree Level,
    // Gender, Birthdate, Email, Additional Comments, National ID, National Country, Transcript1,
    // T1_Country, Transcript2, T2_Country, AdditionalDocs1, AdditionalDocs2, Terms_Conditions, Date Submitted
    const orderedKeys = [
      '__FOLDER_URL__',
      'firstName',              // First Name
      'middleName',             // Middle Name
      'lastName',               // Last Name
      'additionalName',         // Additional Name
      'studentType',            // Student Location
      'degreeLevel',            // Degree Level
      'gender',                 // Gender
      'birthDate',              // Birthdate
      'personalEmail',          // Email
      'additionalComments',     // Additional Comments
      'nationalID',             // National ID (file name captured)
      'nationalCountry',        // National Country (name)
      'transcript1',            // Transcript1 (file name captured)
      't1Country',              // T1_Country (name)
      'transcript2',            // Transcript2 (file name captured)
      't2Country',              // T2_Country (name)
      'additionalDoc1',         // AdditionalDocs1 (file name captured)
      'additionalDoc2',         // AdditionalDocs2 (file name captured)
      '__TERMS_CONDITIONS__',   // Terms_Conditions (from payload.termsConditions)
      '__DATE_SUBMITTED__'      // Date Submitted (computed here)
    ];

    // Debug logging to verify payload and ordering during troubleshooting
    try {
      console.log('Submit payload keys:', Object.keys(payload));
      console.log('Notes/AdditionalComments:', payload.notes, payload.additionalComments);
      console.log('Resolved folderUrl:', folderUrl);
    } catch {}

    const row = orderedKeys.map(k => {
      // Column 1: hyperlink labeled as folder name (last_first-degree-student)
      if (k === '__FOLDER_URL__') return folderUrl ? buildHyperlink(folderUrl, folderName || 'Open Folder') : (folderName || '');
      if (k === '__TERMS_CONDITIONS__') {
        const v = payload.termsConditions;
        if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
        if (typeof v === 'string') return v.toLowerCase() === 'true' ? 'TRUE' : v.toLowerCase() === 'false' ? 'FALSE' : v;
        return v ?? '';
      }
      if (k === '__DATE_SUBMITTED__') {
        return new Date().toISOString();
      }
      // Keep National Country as plain text
      if (k === 'nationalCountry') {
        const country = payload[k] ?? '';
        return country ?? '';
      }
      // Files: output raw Drive URL (no HYPERLINK formulas)
      if (k === 'transcript1' || k === 'transcript2' || k === 'additionalDoc1' || k === 'additionalDoc2') {
        const link = fileViewLinks[k];
        const name = fileLinkLabels[k] || payload[k] || '';
        return link || (name ?? '');
      }
      if (k === 'nationalID') {
        const link = fileViewLinks[k];
        const name = fileLinkLabels[k] || payload[k] || '';
        return link || (name ?? '');
      }
      const v = payload[k];
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      return v ?? '';
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: range as string,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    return new Response('Saved', { status: 200 });
  } catch (err: any) {
    console.error('Submit error:', err);
    const message = err?.message || 'Submission failed';
    return new Response(message, { status: 500 });
  }
}


