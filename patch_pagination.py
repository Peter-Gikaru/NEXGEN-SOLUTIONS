import re

file = 'src/pages/AdminDashboardPage.tsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Add pagination state
state_replace = '''  const [parsedBulkData, setParsedBulkData] = useState<any[]>([]);
  const [previewPage, setPreviewPage] = useState(1);'''
content = content.replace('  const [parsedBulkData, setParsedBulkData] = useState<any[]>([]);', state_replace)

# Reset pagination when parsing file
content = content.replace('setParsedBulkData(mapped);', 'setParsedBulkData(mapped);\n        setPreviewPage(1);')
content = content.replace('setParsedBulkData([]);', 'setParsedBulkData([]);\n        setPreviewPage(1);')

# Update the table UI for pagination
old_table = '''                          <tbody>
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
                      </div>'''

new_table = '''                          <tbody>
                            {parsedBulkData.slice((previewPage - 1) * 5, previewPage * 5).map((row, idx) => (
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
                          <div className="py-2 px-3 flex justify-between items-center text-xs text-slate-500 bg-slate-50 border-t border-slate-100">
                            <span>Showing {(previewPage - 1) * 5 + 1}-{Math.min(previewPage * 5, parsedBulkData.length)} of {parsedBulkData.length} products</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={previewPage === 1}
                                onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                                className="px-2 py-1 bg-white border border-slate-200 rounded disabled:opacity-50 hover:bg-slate-50"
                              >
                                Prev
                              </button>
                              <button
                                type="button"
                                disabled={previewPage * 5 >= parsedBulkData.length}
                                onClick={() => setPreviewPage(p => p + 1)}
                                className="px-2 py-1 bg-white border border-slate-200 rounded disabled:opacity-50 hover:bg-slate-50"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>'''

content = content.replace(old_table, new_table)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
