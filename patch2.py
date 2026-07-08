import re
import os

file = 'src/pages/AdminDashboardPage.tsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import Papa' not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport Papa from 'papaparse';\nimport * as XLSX from 'xlsx';")

if 'const [parsedBulkData' not in content:
    content = content.replace('const [bulkFile, setBulkFile] = useState<File | null>(null);', 
'''const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [parsedBulkData, setParsedBulkData] = useState<any[]>([]);''')

new_handler = '''  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setBulkFile(null);
      setParsedBulkData([]);
      return;
    }
    setBulkFile(file);

    const parseData = (data: any[]) => {
      // Mapping logic
      const mapped = data.map((row: any) => ({
        name: row['Product Name'] || row.name || '',
        brand: row['Brand'] || row.brand || '',
        description: row['Description'] || row.description || '',
        price: row['Price (KES)'] || row.price || '0',
        compareAtPrice: row['Compare Price (KES)'] || row.compareAtPrice || '',
        stock: row['Initial stock'] || row.stock || '0',
        categoryName: row['Category'] || row.categoryName || '',
        subcategoryId: row['Subcategory'] || row.subcategoryId || '',
        imageUrls: row['Product Images'] || row.imageUrls || '',
        threeDModelUrl: row['3D Model (.glb / .gltf)'] || row.threeDModelUrl || '',
        specs: row['Specs (JSON Format)'] || row.specs || ''
      })).filter(row => row.name && row.price);

      if (mapped.length === 0) {
        toast.error('No valid products found or missing required columns (Product Name, Price (KES)).');
        setParsedBulkData([]);
      } else {
        toast.success(`Successfully extracted ${mapped.length} products`);
        setParsedBulkData(mapped);
      }
    };

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          parseData(results.data);
        },
        error: () => {
          toast.error('Failed to parse CSV file');
        }
      });
    } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          parseData(data);
        } catch (err) {
          toast.error('Failed to parse Excel file');
        }
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error('Unsupported file format. Please upload .csv, .xls, or .xlsx');
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBulkData.length === 0) {
      toast.error('No valid data to upload. Please select a valid file first.');
      return;
    }
    
    setIsUploadingBulk(true);

    try {
      const response = await api.post('/products/bulk', { products: parsedBulkData });
      toast.success(response.data.message || 'Successfully posted products');
      setBulkFile(null);
      setParsedBulkData([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload bulk products');
    } finally {
      setIsUploadingBulk(false);
    }
  };'''

content = re.sub(r'const handleBulkUpload = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsUploadingBulk\(false\);\n    \}\n  \};', new_handler, content)

# 4. Add the preview table in JSX and replace onChange safely
content = content.replace('onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}', 'onChange={handleFileSelect}')
content = content.replace('accept=".csv"', 'accept=".csv,.xls,.xlsx"')

preview_table = '''                    {parsedBulkData.length > 0 && (
                      <div className="w-full mt-4 overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Product Name</th>
                              <th className="py-2 px-3">Price</th>
                              <th className="py-2 px-3">Category</th>
                              <th className="py-2 px-3">Images</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedBulkData.slice(0, 5).map((row, idx) => (
                              <tr key={idx} className="border-b last:border-0 border-slate-100">
                                <td className="py-2 px-3 truncate max-w-[150px]">{row.name}</td>
                                <td className="py-2 px-3">{row.price}</td>
                                <td className="py-2 px-3">{row.categoryName}</td>
                                <td className="py-2 px-3 truncate max-w-[100px]">{row.imageUrls}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {parsedBulkData.length > 5 && (
                          <div className="py-2 px-3 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-100">
                            Showing 5 of {parsedBulkData.length} products...
                          </div>
                        )}
                      </div>
                    )}
                    <button'''
                    
# Specifically target the bulk upload button only
content = re.sub(r'(<form onSubmit=\{handleBulkUpload\}[\s\S]*?)<button', r'\1' + preview_table, content)

content = content.replace('<form onSubmit={handleBulkUpload} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">', '<form onSubmit={handleBulkUpload} className="flex flex-col gap-4 items-start">')
content = content.replace('disabled={isUploadingBulk || !bulkFile}', 'disabled={isUploadingBulk || parsedBulkData.length === 0}')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
