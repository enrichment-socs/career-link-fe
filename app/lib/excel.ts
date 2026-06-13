import * as XLSX from 'xlsx'
import pkg from 'file-saver';


const exportToExcel = (name:string, data:any) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {type: 'application/octet-stream'});
    pkg.saveAs(blob, `${name}.xlsx`);
};

const exportToExcelBySheet = (name: string, sheets: Record<string, any[]>) => {
    const workbook = XLSX.utils.book_new();

    Object.entries(sheets).forEach(([rawSheetName, data]) => {
        if (!data || data.length === 0) return;

        const sanitized = rawSheetName
            .replace(/[\\/?*\[\]:]/g, "-")
            .slice(0, 31);
        const sheetName = sanitized || "Sheet";

        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    pkg.saveAs(blob, `${name}.xlsx`);
};

function importExcel<T>(event: ProgressEvent<FileReader>, onSuccess:(res:T[]) => void) {
    if (event.target == null) return []
    
    const workbook = XLSX.read(event.target.result, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    let sheetData = XLSX.utils.sheet_to_json<T>(sheet);

    onSuccess(sheetData)
}

export {exportToExcel, exportToExcelBySheet, importExcel}
