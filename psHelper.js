"use strict";
/**
 * this file contains PowerShell scripts to open file picker and set env variable
 */
const fs = require('fs');
var spawn = require("child_process").spawn, child;
var debug = require("debug")("psHelper")

module.exports.setEnvVar = (key, val) => {
    let cmd = `$env:${key}="${val}"`
    child = spawn("powershell.exe", [ps2]);
    var filePath = null;
    var error = null;
    child.stdout.on("data", function (data) {
        const path = data.toString().trim()
        debug("path = '" + path + "' type: " + typeof path)
        if (path.length > 0) {
            filePath = data
        }
    });
    child.stderr.on("data", function (data) {
        //this script block will get the output of the PS script
        debug("Powershell Errors: " + data);
        error = data;
    });
    child.on("exit", function () {
        debug("Powershell Fil Pick Script finished");
        if (filePath != null && fs.existsSync(filePath)) {
            resolve(filePath.toString())
        } else {
            //user may have cancelled the operation, or closed file picker
            reject(error)
        }
    });
    child.stdin.end();
}
/**
 * a hack to open a windows file picker (explorer) from the console, using a PowerSheel script
 * very clever is you ask me haha
 * @returns absolute file path (example c://joemama/file.txt)
 */
module.exports.pickFile = () => new Promise((resolve, reject) => {

    let ps2 = `
Function Select-FolderDialog
{
    param([string]$Description="Select File",[string]$RootFolder="Desktop")

 [System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") |
     Out-Null     
     $OpenFileDialog = New-Object System.Windows.Forms.OpenFileDialog
     $OpenFileDialog.initialDirectory = $initialDirectory
     $OpenFileDialog.filter = “All files (*.*)| *.txt”
     $OpenFileDialog.ShowDialog() | Out-Null
     $OpenFileDialog.filename
 #  $objForm = New-Object System.Windows.Forms.OpenFileDialog
 #       $objForm.Rootfolder = $RootFolder
 #       $objForm.Description = $Description
 #      $Show = $objForm.ShowDialog()
 #      If ($Show -eq "OK")
 #      {
    #          Return $objForm.SelectedPath
    #   }
    #   Else
    #   {
        #       Write-Error "Operation cancelled by user."
        #}
    }

$folder = Select-FolderDialog # the variable contains user folder selection
write-host $folder
`

    child = spawn("powershell.exe", [ps2]);
    var filePath = null;
    var error = null;
    child.stdout.on("data", function (data) {
        const path = data.toString().trim()
        debug("path = '" + path + "' type: " + typeof path)
        if (path.length > 0) {
            filePath = data
        }
    });
    child.stderr.on("data", function (data) {
        //this script block will get the output of the PS script
        debug("Powershell Errors: " + data);
        error = data;
    });
    child.on("exit", function () {
        debug("Powershell Fil Pick Script finished");
        if (filePath != null && fs.existsSync(filePath)) {
            resolve(filePath.toString())
        } else {
            //user may have cancelled the operation, or closed file picker
            reject(error)
        }
    });
    child.stdin.end();

})