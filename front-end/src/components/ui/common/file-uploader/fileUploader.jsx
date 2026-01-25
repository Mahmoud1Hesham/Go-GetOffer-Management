"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFetch } from "@/hooks/useFetch";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";

const FileUploader = ({
    title = "Upload Documents",
    subtitle ,
    footer ,
    maxFiles = 8,
    // `accept` is the prop used by react-dropzone. Some callers pass
    // `acceptedFileTypes` (older name) — support both for compatibility.
    accept = {
        "image/jpeg": [],
        "image/png": [],
        "image/jpg": [],
        "image/svg+xml": ['.svg'],
        "application/pdf": [],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
    },
    acceptedFileTypes = null,
    apiUrl = "",
    autoUpload = true,
    onFilesChange,
    showCancel = false,
    showNext = false,
    showBack = false,
    onCancel,
    onNext,
    onBack,
    formKey,
    responseKey = "",
}) => {
    const [files, setFiles] = useState([]);
    const { t, i18n } = useTranslation(["fileUploader"]);
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") || i18n.language || "en";


    const notifyParent = (updatedFiles) => {
        if (updatedFiles.length > 0 && onFilesChange) {
            console.log("FileUploader notifyParent - sending to parent:", updatedFiles);
            onFilesChange(updatedFiles);
        }
    };

    const uploadFiles = async (filesArray) => {
        const formData = new FormData();
        filesArray.forEach(file => formData.append(formKey, file));

        try {
            console.log("FileUploader uploading files:", filesArray);
            const response = await useFetch(apiUrl, { method: "POST", data: formData });
            const uploadedUrls = response?.data?.data?.[responseKey] || [];
            const urlsCopy = Array.isArray(uploadedUrls) ? [...uploadedUrls] : [];

            setFiles(curr =>
                curr.map(item =>
                    filesArray.some(f => f.name === item.file.name && f.size === item.file.size)
                        ? {
                            ...item,
                            uploaded: true,
                            uploadedUrl: urlsCopy.length ? urlsCopy.shift() : null,
                            progress: 100
                        }
                        : item
                )
            );

            setTimeout(() => {
                const validFiles = files.filter(f => f.file); // only keep files with data
                console.log("FileUploader upload finished, valid files:", validFiles);
                notifyParent(validFiles);
            });
        } catch (error) {
            console.error("FileUploader upload error:", error);
            setFiles(curr =>
                curr.map(item =>
                    filesArray.some(f => f.name === item.file.name && f.size === item.file.size)
                        ? { ...item, error: "Upload failed." }
                        : item
                )
            );
            setTimeout(() => {
                const validFiles = files.filter(f => f.file);
                console.log("FileUploader upload failed, valid files:", validFiles);
                notifyParent(validFiles);
            });
        }
    };

    const onDrop = (acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach((rej) => {
                setFiles((curr) => {
                    const updated = [
                        ...curr,
                        {
                            file: rej.file,
                            preview: null,
                            progress: 0,
                            error: "Unsupported file type",
                        },
                    ];
                    console.log("FileUploader rejected files:", rej.file);
                    notifyParent(updated);
                    return updated;
                });
            });
            return;
        }

        let mappedFiles = acceptedFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            error: null,
            uploaded: false,
        }));

        if (files.length + mappedFiles.length > maxFiles) {
            mappedFiles = mappedFiles.slice(0, maxFiles - files.length);
        }

        const updatedFiles = [...files, ...mappedFiles];
        setFiles(updatedFiles);
        console.log("FileUploader onDrop updated files:", updatedFiles);
        notifyParent(updatedFiles);

        // only trigger server upload when autoUpload is true
        if (autoUpload) uploadFiles(mappedFiles.map((m) => m.file));
    };

    // Prefer `acceptedFileTypes` when provided for backward compatibility.
    const effectiveAccept = acceptedFileTypes || accept;

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: effectiveAccept });

    const removeFile = (file) => {
        const updated = files.filter((f) => f.file !== file);
        setFiles(updated);
        console.log("FileUploader removeFile updated files:", updated);
        notifyParent(updated);
    };

    const clearAllFiles = () => {
        setFiles([]);
        console.log("FileUploader cleared all files");
        // do NOT notify parent with empty array to prevent clearing state unintentionally
    };

    const retryUpload = (file) => {
        setFiles((curr) =>
            curr.map((item) =>
                item.file === file ? { ...item, error: null, progress: 0 } : item
            )
        );
        uploadFiles([file]);
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
            <div className={`${lang === 'en' ? "text-left" : "text-right"} w-full`}>
                <h2 className="font-semibold mb-1">{title}</h2>
                <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
            </div>

            {/* Dropzone Box */}
            <div
                {...getRootProps()}
                className="border-2 border-dashed transition-all duration-300 border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-go-primary-e"
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                    <div className="mb-2 w-8">
                        <img src="/assets/other/fileUpload.svg" alt="file upload icon" />
                    </div>
                    <p className="font-semibold">{t('texts.1.title')}</p>
                    <div className="flex items-center gap-2 my-2 w-full max-w-3xs">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="text-gray-400 text-sm px-2">{t('help-text')}</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <Button
                        type="button"
                        variant={"outline"}
                        className="px-4 py-2 border border-go-primary-e text-go-primary-e rounded-md hover:bg-go-primary-e hover:text-white transition"
                    >
                        {t('buttons.title')}
                    </Button>
                </div>
            </div>
            <p className={`text-sm text-gray-500 ${lang === 'en' ? "text-left" : "text-right"} mt-2`}>{footer}</p>

            {/* Uploaded Files */}
            <div className="mt-4 space-y-3">
                {files.map((f, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center justify-between border rounded-md p-3 transition ${f.uploaded ? "bg-green-50 border-green-400" : "bg-gray-50 border-gray-200"
                            }`}
                    >
                        <div className="w-full pr-3">
                            <div className="flex gap-2 items-center">
                                <p className="text-sm text-left font-medium">{f.file.name}</p>
                                {f.uploaded && (
                                    <span className="text-green-600 font-bold text-xs">{lang === 'en' ? `✓ Uploaded` : `تم الرفع ✓`}</span>
                                )}
                                <p className="text-xs text-left mt-1 text-gray-500">
                                    {(f.file.size / 1024).toFixed(1)} kb
                                </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                    className={`h-2 rounded-full transition-all ${f.error ? "bg-red-500" : f.uploaded ? "bg-green-500" : "bg-blue-500"
                                        }`}
                                    style={{ width: `${f.progress}%` }}
                                ></div>
                            </div>
                            {f.error && (
                                <p className="text-xs text-red-500 mt-1">{f.error}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {f.error && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => retryUpload(f.file)}
                                >
                                    {lang === 'en' ? `Retry` : `المحاوله مجدداً`}
                                </Button>
                            )}
                            <button
                                onClick={() => removeFile(f.file)}
                                className="ml-1 text-gray-500 hover:text-red-500"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
                {/* <p className={`text-sm text-gray-500 ${lang === 'en' ? "text-left" : "text-right"} mt-2`}>{t('texts.1.subtitle2')}</p> */}
            </div>

            {/* Buttons */}
            {(showCancel || showNext || showBack) && (
                <div className="flex justify-end gap-4 mt-6">
                    {showCancel && files.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                clearAllFiles();
                                if (onCancel) onCancel();
                            }}
                            className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition"
                        >
                            {lang === 'en' ? `Cancel` : `إلغاء`}
                        </button>
                    )}
                    {showBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-2 border border-gray-400 text-gray-600 rounded-md hover:bg-gray-200 transition"
                        >
                            {lang === 'en' ? `Back` : `رجوع`}
                        </button>
                    )}
                    {showNext && (
                        <button
                            type="button"
                            onClick={() => onNext?.(files)}
                            className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                        >
                            {lang === 'en' ? `Next` : `التالى`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUploader;
