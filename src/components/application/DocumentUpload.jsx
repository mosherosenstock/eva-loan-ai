import React, { useState } from 'react';
import { UploadFile } from "@/api/integrations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, X, AlertCircle } from "lucide-react";

export default function DocumentUpload({ onDocumentUpload, uploadedDocuments }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files) => {
    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const { file_url } = await UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      
      onDocumentUpload(uploadedUrls);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
    
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const documentTypes = [
    { type: "Bank Statements", description: "Last 3 months", required: true },
    { type: "Pay Stubs", description: "Recent pay stubs", required: true },
    { type: "Tax Returns", description: "Last 2 years", required: false },
    { type: "ID Document", description: "Driver's license or passport", required: true },
    { type: "Proof of Address", description: "Utility bill or lease", required: false }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-[#1a365d] mb-2">Upload Supporting Documents</h3>
        <p className="text-slate-600">Upload documents to support your loan application. Our AI will automatically extract relevant information.</p>
      </div>

      {/* Document Requirements */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-3">Document Requirements</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {documentTypes.map((doc, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${doc.required ? 'bg-red-400' : 'bg-green-400'}`} />
                <span className="text-sm font-medium text-blue-800">{doc.type}</span>
                <span className="text-xs text-blue-600">({doc.description})</span>
                {doc.required && <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">Required</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card 
        className={`border-2 border-dashed transition-all ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {uploading ? "Uploading documents..." : "Drop your documents here"}
            </h3>
            <p className="text-slate-500 mb-4">or click to browse your files</p>
            
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            
            <Button
              onClick={() => document.getElementById('file-upload').click()}
              disabled={uploading}
              variant="outline"
              className="mb-4"
            >
              {uploading ? "Uploading..." : "Choose Files"}
            </Button>
            
            <p className="text-xs text-slate-400">
              Supported formats: PDF, PNG, JPG, JPEG (Max 10MB per file)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {uploadedDocuments.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Uploaded Documents ({uploadedDocuments.length})
            </h4>
            <div className="space-y-2">
              {uploadedDocuments.map((url, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Document {index + 1}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Uploaded
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedDocuments.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                No documents uploaded yet. Consider uploading supporting documents to strengthen your application.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}