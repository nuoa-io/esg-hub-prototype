"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Upload, ArrowLeft } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faFilePdf,
  faFileCsv,
  faFileExcel,
  faFileWord,
  faFileImage,
  faFile,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { useFileUpload } from '@/src/api/data-integration';
import { GlobalLoading } from '@/src/components/global-loading';
import { FileType } from '@/src/types/file-upload';
import { ErrorComponent } from '@/src/components/ui/error';
import { useToast } from '@/src/hooks/use-toast';

interface FileUploadProps {
  onNavigateBack: () => void
  onNavigateToValidation: () => void
}

export function FileUpload({ onNavigateBack, onNavigateToValidation }: FileUploadProps) {
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fileUpload, isLoading, isError } = useFileUpload();
  const { showErrorToast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files);
        setUploadedFiles((prev) => [...prev, ...files]);
      }
    },
    []
  );

  if (isLoading) {
    return <GlobalLoading />;
  }

  if (isError) {
    return <ErrorComponent title="Error Loading Data" description="There was an error loading the file upload data. Please try again later." />;
  }

  if (!fileUpload) {
    return null;
  }

  const handleFileTypeSelect = (typeId: string) => {
    setSelectedFileTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleStartUpload = () => {
    if (uploadedFiles.length === 0) {
      showErrorToast("Please select files to upload first.")
      return
    }
    onNavigateToValidation()
  }

  // Helper to choose icon for each uploaded file in the list
  const getIconForFile = (file: File) => {
    if (file.type.startsWith('image')) return faFileImage;
    if (file.name.endsWith('.pdf')) return faFilePdf;
    if (file.name.endsWith('.csv')) return faFileCsv;
    if (/[.]xls[x]?$/i.test(file.name)) return faFileExcel;
    if (/[.]docx?$/i.test(file.name)) return faFileWord;
    return faFile;
  };

  const getIconFromFileType = (icon: string) => {
    switch (icon) {
      case 'faFileExcel':
        return faFileExcel;
      case 'faFileCsv':
        return faFileCsv;
      case 'faFilePdf':
        return faFilePdf;
      case 'faFileWord':
        return faFileWord;
      case 'faFileImage':
        return faFileImage;
      case 'faFile':
        return faFile;
      default:
        return faFile;
    }
  };

  return (
    <div className="space-y-8">
      {/* How it works */}
      <Alert className="bg-blue-50 border-blue-200 rounded-brand">
        <AlertDescription>
          <div className="space-y-2">
            <h3 className="font-medium text-blue-900">How it works</h3>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• Upload your files and our AI will automatically extract ESG-related information</li>
              <li>• Review the extracted data and make corrections if needed</li>
              <li>• Provide feedback to help improve our AI accuracy</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* File Type Selection */}
      <div>
        <h2 className="text-xl font-medium mb-6">Choose File Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fileUpload.fileTypes.map((type: FileType) => (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all rounded-brand ${
                selectedFileTypes.includes(type.id)
                  ? "ring-2 ring-brand-primary border-brand-primary"
                  : "border-border-light hover:shadow-md"
              } bg-white`}
              onClick={() => {
                handleFileTypeSelect(type.id)
                fileInputRef.current?.click()
              }}
            >
              <CardContent className="p-6 text-center">
                <FontAwesomeIcon icon={getIconFromFileType(type.icon)} className={`text-3xl mb-3 ${type.iconColor}`} />
                <h3 className="font-medium mb-2">{type.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${type.badgeColor}`}>
                  {type.badge}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div>
        <div
          className={`border-2 border-dashed rounded-brand p-12 text-center transition-colors ${
            dragActive ? "border-brand-primary bg-brand-primary/5" : "border-border-light hover:border-brand-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-brand-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Drag and drop your files here</h3>
          <p className="text-gray-600 mb-6">or click to browse and select files from your computer</p>

          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.jpg,.jpeg,.png"
            ref={fileInputRef}
          />
          <Button
            className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Files
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            Maximum file size: 100MB per file
            <br />
            Supported formats: Excel, CSV, PDF, Word, JPG, PNG
          </p>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-4">Uploaded Files ({uploadedFiles.length})</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-brand">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={getIconForFile(file)} className="text-gray-500 text-lg" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onNavigateBack} className="border-border-light rounded-brand bg-transparent">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="space-x-4">
          <Button variant="outline" className="border-border-light rounded-brand bg-transparent">
            Save as Draft
          </Button>
          <Button onClick={handleStartUpload} className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand">
            Start Upload
          </Button>
        </div>
      </div>
    </div>
  )
}
