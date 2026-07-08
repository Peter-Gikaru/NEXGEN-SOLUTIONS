import os

file = 'src/pages/AdminDashboardPage.tsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

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

content = content.replace(preview_table, '<button')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
