interface DecompileResult {
    isSuccessful: boolean;
    decompileFolderPath?: string;
    manifestPath?: string;
    error?: string;
    apkToolYmlPath?: string;
}