/**
 * a hack to open a windows file picker (explorer) from the console, using a PowerSheel script
 * very clever is you ask me haha
 * @return {Promise} absolute file path (example c://joemama/file.txt)
 */
export declare const pickFile: () => Promise<string>;
