import { useState, useRef } from "react";
import "./FileUpload.css";

const CLOUDINARY_CLOUD_NAME = "dlonvpwii"; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = "printing_uploads";

const FileUpload = ({ onFileUploaded, onError, currentFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
  ];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const validateFile = (file) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return "Please upload a PDF, JPG, PNG, or SVG file";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 50MB";
    }
    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "printing-etc-designs");

    // Determine resource type based on file type
    const isPDF = file.type === "application/pdf";
    const resourceType = isPDF ? "raw" : "image";

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Cloudinary upload failed:", errorData);
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("Cloudinary upload response:", data);

      // Construct the correct URL based on resource type
      const baseUrl = data.secure_url;

      return {
        url: baseUrl,
        publicId: data.public_id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        previewUrl: baseUrl,
        resourceType: resourceType,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload file to cloud storage");
    }
  };

  const handleFile = async (file) => {
    const error = validateFile(file);
    if (error) {
      if (onError) onError(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Create local blob URL for preview (especially for PDFs which may have auth issues)
    const localPreviewUrl = URL.createObjectURL(file);

    // Simulate progress (Cloudinary doesn't provide real-time progress)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const fileData = await uploadToCloudinary(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        // Use local blob URL for preview, Cloudinary URL for storage/download
        if (onFileUploaded)
          onFileUploaded({
            ...fileData,
            previewUrl: localPreviewUrl, // Use local blob for preview
            cloudinaryUrl: fileData.url, // Keep Cloudinary URL for orders
          });
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      // Clean up blob URL on error
      URL.revokeObjectURL(localPreviewUrl);
      if (onError) onError(error.message);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    if (onFileUploaded) onFileUploaded(null);
  };

  if (currentFile) {
    return (
      <div className="file-upload">
        <div className="file-upload__preview">
          <div className="file-upload__file-info">
            <svg
              className="file-upload__file-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="file-upload__file-details">
              <p className="file-upload__file-name">{currentFile.fileName}</p>
              <p className="file-upload__file-size">
                {formatFileSize(currentFile.fileSize)} • Uploaded to cloud ✓
              </p>
            </div>
          </div>
          <button
            type="button"
            className="file-upload__remove"
            onClick={handleRemove}
            aria-label="Remove file"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        className="file-upload__input"
        accept=".pdf,.jpg,.jpeg,.png,.svg"
        onChange={handleFileInputChange}
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="file-upload__dropzone file-upload__dropzone_uploading">
          <div className="file-upload__uploading">
            <div className="file-upload__spinner"></div>
            <p className="file-upload__uploading-text">
              Uploading... {uploadProgress}%
            </p>
            <div className="file-upload__progress-bar">
              <div
                className="file-upload__progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`file-upload__dropzone ${
            isDragging ? "file-upload__dropzone_dragging" : ""
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <svg
            className="file-upload__icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="file-upload__text">
            <span className="file-upload__text-highlight">Click to upload</span>{" "}
            or drag and drop
          </p>
          <p className="file-upload__subtext">
            PDF, JPG, PNG, or SVG (max 50MB)
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
