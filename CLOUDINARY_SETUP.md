# Cloudinary File Upload Setup Guide

## ✅ What Was Implemented

Your print shop now has a **professional file upload system** with:

1. ✅ **Drag & Drop UI** - Customers can drag files or click to upload
2. ✅ **File Size Validation** - Maximum 50MB file size enforced
3. ✅ **File Type Validation** - Only accepts PDF, JPG, PNG, SVG
4. ✅ **Cloud Storage** - Files uploaded to Cloudinary (persists forever!)
5. ✅ **Upload Progress** - Visual feedback during upload
6. ✅ **File URLs Saved** - Full file data (URL, publicId, filename) saved with orders

## 🔧 Setup Required (5 minutes)

### Step 1: Create Free Cloudinary Account

1. Go to [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a **free account** (no credit card required)
3. You get:
   - ✅ 25 GB storage
   - ✅ 25 GB bandwidth/month
   - ✅ Perfect for a print shop!

### Step 2: Get Your Cloud Name

1. After signing up, go to [console.cloudinary.com](https://console.cloudinary.com)
2. On the Dashboard, you'll see:
   ```
   Cloud name: your-cloud-name-here
   ```
3. **Copy this cloud name**

### Step 3: Create Upload Preset

1. Go to **Settings → Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Fill in:
   - **Preset name:** `printing_uploads`
   - **Signing Mode:** Select **Unsigned** (important!)
   - **Folder:** `printing-etc-designs`
   - **Access mode:** Select **"Public"** (required for PDF preview!)
5. Click **Save**

**Critical for PDFs:** The "Access mode" must be set to "Public" so that uploaded PDFs can be previewed without authentication errors.

### Step 4: Add Cloud Name to Your Code

Open [`src/components/FileUpload/FileUpload.jsx`](src/components/FileUpload/FileUpload.jsx) and replace:

```javascript
// Line 13:
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME_HERE";

// Replace with:
const CLOUDINARY_CLOUD_NAME = "your-actual-cloud-name";
```

### Step 5: Test It!

1. Start your dev server: `npm run dev`
2. Go to any product page
3. Scroll to "Upload Design"
4. Try dragging a PDF or image file
5. Watch it upload with progress bar!
6. File should appear in your Cloudinary dashboard

## 📁 How It Works

### Customer Experience:

1. Customer drags or clicks to upload design file
2. File validates (size & type)
3. Progress bar shows upload status
4. File uploads to Cloudinary cloud storage
5. Success! File preview shown with checkmark

### What Gets Saved:

```javascript
{
  url: "https://res.cloudinary.com/yourcloud/...", // Permanent URL
  publicId: "printing-etc-designs/abc123",          // Cloudinary ID
  fileName: "BusinessCard_Design.pdf",              // Original name
  fileSize: 2457600,                                // Size in bytes
  fileType: "application/pdf"                       // MIME type
}
```

### In Cart & Orders:

Orders now save the full file object, so you can:

- ✅ Download customer designs anytime
- ✅ Access files from Cloudinary dashboard
- ✅ Files never expire (permanent storage)
- ✅ View/download directly from order pages

## 🎨 File Upload Features

### Drag & Drop Zone

- Click or drag to upload
- Visual feedback when dragging
- File type and size shown
- Maximum 50MB enforced

### Supported File Types:

- ✅ PDF (`.pdf`)
- ✅ JPEG (`.jpg`, `.jpeg`)
- ✅ PNG (`.png`)
- ✅ SVG (`.svg`)

### Validation

Automatically rejects:

- ❌ Files over 50MB
- ❌ Unsupported file types
- ❌ Shows error message

### Upload Progress

- Spinner animation
- Percentage display (0-100%)
- Progress bar
- Smooth transitions

### File Preview

After upload:

- ✓ File name displayed
- ✓ File size shown
- ✓ "Uploaded to cloud" confirmation
- ✓ Remove button to delete

## 🔒 Security Features

- **Client-side validation** - Checks file before upload
- **Unsigned uploads** - No API keys in frontend
- **Upload preset** - Controls what can be uploaded
- **Cloudinary vetting** - Server-side validation
- **Unique filenames** - Prevents overwrites

## 📊 Cloudinary Dashboard

Access your uploaded files:

1. Go to [console.cloudinary.com/media_library](https://console.cloudinary.com/media_library)
2. Click **printing-etc-designs** folder
3. See all customer uploads with:
   - File previews
   - Upload dates
   - File sizes
   - Download buttons

## 🔄 Order Workflow

### Current Flow:

1. Customer uploads design → Stored in Cloudinary
2. Adds to cart → File URL saved with cart item
3. Checks out → File URL included in order
4. You receive order → Download design from Cloudinary URL

### Accessing Customer Files:

**Option 1 - From Order Data:**

```javascript
order.items[0].uploadedFile.url;
// https://res.cloudinary.com/yourcloud/image/upload/...
```

**Option 2 - From Cloudinary Dashboard:**

- Go to Media Library
- Browse `printing-etc-designs` folder
- Download or view any file

## 💰 Pricing

**Free Tier (Perfect for Start):**

- 25 GB storage
- 25 GB bandwidth/month
- ~5,000-10,000 file uploads/month
- Unlimited transformations

**If You Exceed Free Tier:**

- Plus Plan: $89/month
- Unlimited storage & bandwidth
- Advanced features

## 🎯 Benefits

### For You (Print Shop):

- ✅ **No file management** - Cloudinary handles everything
- ✅ **Reliable storage** - 99.99% uptime SLA
- ✅ **Fast uploads** - Global CDN
- ✅ **Forever storage** - Files never expire
- ✅ **Easy access** - Download from dashboard or API

### For Customers:

- ✅ **Modern UX** - Drag & drop is intuitive
- ✅ **Fast uploads** - Optimized delivery
- ✅ **Visual feedback** - Progress bars and previews
- ✅ **Reliable** - Files don't get lost
- ✅ **Secure** - Professional cloud storage

## 🚨 Important Notes

### Files are Now PERMANENT:

- Old system: Files lost on page refresh ❌
- New system: Files stored in cloud forever ✓

### File URLs in Database:

Your `db.json` orders will now contain:

```json
{
  "uploadedFile": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "printing-etc-designs/...",
    "fileName": "design.pdf",
    "fileSize": 1234567,
    "fileType": "application/pdf"
  }
}
```

Instead of just:

```json
{
  "uploadedFile": "design.pdf" // Old - file is lost!
}
```

## 🔑 Environment Variables (Optional)

For better security, use environment variables:

**Create `.env` file:**

```
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=printing_uploads
```

**Update FileUpload.jsx:**

```javascript
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
```

## 📚 Additional Resources

- [Cloudinary Dashboard](https://console.cloudinary.com)
- [Upload Documentation](https://cloudinary.com/documentation/upload_images)
- [Media Library](https://cloudinary.com/documentation/media_library_widget)
- [Pricing Plans](https://cloudinary.com/pricing)

---

**Your file upload system is ready! 🎉**

Just add your Cloudinary cloud name and you're good to go. Customer designs will now be securely stored and accessible forever!
