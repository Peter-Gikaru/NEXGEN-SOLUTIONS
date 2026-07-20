import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getImageUrl } from '../utils/getImageUrl';
import AdminAnnouncements from '../components/admin/AdminAnnouncements';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  PlusCircle, 
  ShieldAlert, 
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Layers,
  Edit,
  Trash2,
  Zap,
  Package,
  MapPin,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Plus,
  Volume2,
  Mail,
  RotateCcw,
  ShieldCheck,
  Megaphone,
  MessageSquare,
  Check
} from 'lucide-react';
import AdminNewsletter from '../components/admin/AdminNewsletter';
import AdminReturns from '../components/admin/AdminReturns';
import AdminWarranties from '../components/admin/AdminWarranties';
import AdminCoupons from '../components/admin/AdminCoupons';
import AdminLiveChat from '../components/admin/AdminLiveChat';
import AdminShippingQueue from '../components/admin/AdminShippingQueue';
import AdminSecurity from '../components/admin/AdminSecurity';
import { AdminAnalytics } from '../components/admin/AdminAnalytics';
const RecursiveCategoryItem = ({ 
  category, 
  level = 0,
  onDelete,
  onEdit,
  onAddChild
}: { 
  category: AdminCategory; 
  level?: number;
  onDelete: (id: string) => void;
  onEdit: (id: string, currentName: string) => void;
  onAddChild: (parentId: string, parentName: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  return (
    <div className="w-full">
      <div 
        className={`flex items-center justify-between py-2 px-3 hover:bg-slate-50 border-b border-slate-100 transition-colors ${level === 0 ? 'bg-slate-50/50' : ''}`}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="w-6" /> 
          )}
          <FolderTree className={`h-5 w-5 ${level === 0 ? 'text-blue-500' : 'text-slate-400'}`} />
          <span className={`${level === 0 ? 'text-base font-bold text-slate-900' : 'text-sm font-medium text-slate-700'}`}>
            {category.name}
          </span>
          {hasChildren && (
            <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
              {category.children.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
          <button 
            onClick={() => onEdit(category.id, category.name)}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded flex items-center gap-1"
            title={`Edit ${category.name}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onAddChild(category.id, category.name)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
            title={`Add subcategory to ${category.name}`}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDelete(category.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded flex items-center gap-1"
            title="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="flex flex-col w-full border-l border-slate-100 ml-4">
          {category.children.map(child => (
            <RecursiveCategoryItem 
              key={child.id} 
              category={child} 
              level={level + 1}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};
interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  children: AdminCategory[];
  parentId: string | null;
}
interface AdminLog {
  id: string;
  admin: { name: string; email: string };
  action: string;
  details: string;
  ipAddress: string | null;
  createdAt: string;
}
interface Stats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  salesByDay?: { date: string; sales: number }[];
}
interface LowStock {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  imageUrls: string[];
}
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  status: string;
}
interface Order {
  id: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber: string | null;
  createdAt: string;
  shippingAddress?: {
    guestName?: string;
    guestEmail?: string;
    [key: string]: any;
  };
  user?: {
    name: string;
    email: string;
  };
}
export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'users' | 'addProduct' | 'productsList' | 'categories' | 'flashSales' | 'shippingZones' | 'adminLogs' | 'announcements' | 'newsletter' | 'returns' | 'warranties' | 'coupons' | 'livechat' | 'shippingQueue' | 'securityCenter' | 'analytics'>('stats');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [stats, setStats] = useState<Stats>({ totalSales: 0, totalOrders: 0, totalUsers: 0 });
  const [lowStock, setLowStock] = useState<LowStock[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [shippingZones, setShippingZones] = useState<any[]>([]);
  const [editingShippingZoneId, setEditingShippingZoneId] = useState<string | null>(null);
  const [editShippingZoneForm, setEditShippingZoneForm] = useState({ regionName: '', fee: 0, estimatedDays: '' });
  const [specPairs, setSpecPairs] = useState([{ key: '', value: '' }]);
  const [editSpecPairs, setEditSpecPairs] = useState<{key: string, value: string}[]>([]);
  const [smartPasteText, setSmartPasteText] = useState('');
  const [editSmartPasteText, setEditSmartPasteText] = useState('');
  const [newShippingZoneForm, setNewShippingZoneForm] = useState({ regionName: '', fee: 0, estimatedDays: '' });
  const [flashSaleForm, setFlashSaleForm] = useState({
    productId: '',
    salePrice: 0,
    startTime: '',
    endTime: ''
  });
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    brand: '',
    price: 0,
    compareAtPrice: 0,
    stock: 10,
    categoryId: '',
    specs: '',
    imageUrls: [] as string[],
    threeDModelUrl: '',
  });
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [parsedBulkData, setParsedBulkData] = useState<any[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [newCategoryForm, setNewCategoryForm] = useState({ name: '', description: '', parentId: '' });
  const [uploading, setUploading] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  });
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats({ ...response.data.stats, salesByDay: response.data.salesByDay });
        setLowStock(response.data.lowStockProducts);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
        if (response.data.length > 0 && !productForm.categoryId) {
          setProductForm((prev) => ({ ...prev, categoryId: response.data[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
    fetchCategories();
  }, [user, navigate]);
  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          const response = await api.get(`/admin/orders?page=${ordersPage}&limit=50`);
          setOrders(response.data.data);
          setOrdersTotalPages(response.data.totalPages);
        } catch (err) {
          console.error(err);
        }
      };
      fetchOrders();
    } else if (activeTab === 'users') {
      const fetchUsers = async () => {
        try {
          const response = await api.get(`/admin/users?page=${usersPage}&limit=50`);
          setUsers(response.data.data);
          setUsersTotalPages(response.data.totalPages);
        } catch (err) {
          console.error(err);
        }
      };
      fetchUsers();
    } else if (activeTab === 'productsList') {
      const fetchProducts = async () => {
        try {
          const response = await api.get('/products?includeInactive=true&limit=100');
          setProductsList(response.data.products);
        } catch (err) {
          console.error(err);
        }
      };
      fetchProducts();
    } else if (activeTab === 'flashSales') {
      const fetchFlashSales = async () => {
        try {
          const response = await api.get('/flash');
          setFlashSales(response.data);
          const prodRes = await api.get('/products?includeInactive=true&limit=1000');
          setProductsList(prodRes.data.products);
        } catch (err) {
          console.error(err);
        }
      };
      fetchFlashSales();
    } else if (activeTab === 'shippingZones') {
      const fetchShippingZones = async () => {
        try {
          const response = await api.get('/shipping');
          setShippingZones(response.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchShippingZones();
    } else if (activeTab === 'adminLogs') {
      const fetchLogs = async () => {
        try {
          const res = await api.get('/admin/logs');
          setAdminLogs(res.data);
        } catch (err) {
          console.error('Failed to fetch admin logs', err);
        }
      };
      fetchLogs();
    }
  }, [activeTab, ordersPage, usersPage]);
  const handleCreateFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/flash', flashSaleForm);
      toast.success('Flash sale created successfully!');
      const response = await api.get('/flash');
      setFlashSales(response.data);
      setFlashSaleForm({
        productId: '',
        salePrice: 0,
        startTime: '',
        endTime: ''
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create flash sale');
    }
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    setUploading(true);
    try {
      const response = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProductForm((prev) => ({ 
        ...prev, 
        imageUrls: [...prev.imageUrls, ...(response.data.urls || [])] 
      }));
    } catch (err: any) {
    } finally {
      setUploading(false);
    }
  };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setBulkFile(null);
      setParsedBulkData([]);
      setPreviewPage(1);
      return;
    }
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum allowed size is 5MB.');
      e.target.value = '';
      return;
    }
    setBulkFile(file);
    const parseData = async (data: any[]) => {
      if (data.length === 0) {
         toast.error('The file is empty.');
         return;
      }
      if (data.length > 500) {
         toast.error('File contains too many products. Maximum allowed is 500 products per upload.');
         setParsedBulkData([]);
         return;
      }
      const firstRow = data[0];
      const hasName = 'Product Name' in firstRow || 'name' in firstRow;
      const hasPrice = 'Price (KES)' in firstRow || 'price' in firstRow || 'Price' in firstRow;
      const hasCategory = 'Category' in firstRow || 'categoryName' in firstRow;
      const missing = [];
      if (!hasName) missing.push('Product Name');
      if (!hasPrice) missing.push('Price');
      if (!hasCategory) missing.push('Category');
      if (missing.length > 0) {
          toast.error(`Missing required columns: ${missing.join(', ')}`);
          setParsedBulkData([]);
          return;
      }
      const mapped = data.map((row: any) => {
        const imageUrlsStr = row['Product Images'] || row.imageUrls || '';
        let isValidImage = true;
        if (imageUrlsStr) {
           const urls = imageUrlsStr.split(',');
           for (const url of urls) {
             const cleanUrl = url.trim().toLowerCase();
             if (cleanUrl.match(/\.(pdf|doc|docx|txt|xls|xlsx|csv)$/i)) {
                isValidImage = false;
             }
           }
        }
          let parsedSpecs = {};
          try {
             const specRaw = row['Specs (JSON Format)'] || row.specs;
             const rawSpecs = typeof specRaw === 'string' && specRaw.trim() ? JSON.parse(specRaw) : (specRaw || {});
             if (rawSpecs && typeof rawSpecs === 'object') {
               parsedSpecs = Object.fromEntries(
                 Object.entries(rawSpecs).filter(([key]) => !['__proto__', 'constructor', 'prototype'].includes(key))
               );
             }
          } catch(e) {}
          let parsedVariants = [];
          try {
             const varRaw = row.variants || row.Variants;
             const rawVariants = typeof varRaw === 'string' && varRaw.trim() ? JSON.parse(varRaw) : (varRaw || []);
             if (Array.isArray(rawVariants)) {
               parsedVariants = rawVariants.map((v: any) => {
                 if (v && typeof v === 'object') {
                   return Object.fromEntries(
                     Object.entries(v).filter(([key]) => !['__proto__', 'constructor', 'prototype'].includes(key))
                   );
                 }
                 return v;
               });
             }
          } catch(e) {}
          return {
            name: row['Product Name'] || row.name || '',
            brand: row['Brand'] || row.brand || '',
            description: row['Description'] || row.description || '',
            price: row['Price (KES)'] || row.price || '0',
            compareAtPrice: row['Compare Price (KES)'] || row.compareAtPrice || '',
            stock: row['Initial stock'] || row.stock || '0',
            categoryName: row['Category'] || row.categoryName || '',
            subcategoryName: row['Subcategory'] || row.subcategoryName || row.subcategoryId || '',
            imageUrls: imageUrlsStr,
            threeDModelUrl: row['3D Model (.glb / .gltf)'] || row.threeDModelUrl || '',
            specs: parsedSpecs,
            variants: parsedVariants,
            _isValidImage: isValidImage
          };
      }).filter(row => row.name && row.price);
      const invalidImages = mapped.filter(r => !r._isValidImage);
      if (invalidImages.length > 0) {
         toast.error(`Found ${invalidImages.length} products with invalid image formats. Images cannot be pdf, word, or text files.`);
         setParsedBulkData([]);
         return;
      }
        if (mapped.length === 0) {
          toast.error('No valid products found or missing required columns (Product Name, Price (KES)).');
          setParsedBulkData([]);
          setPreviewPage(1);
        } else {
          try {
             setIsUploadingBulk(true);
             const res = await api.post('/products/bulk/validate', { products: mapped });
             const { newProducts, duplicateCount } = res.data;
             if (duplicateCount > 0) {
                 toast(`${duplicateCount} products were already in the system and were skipped.`);
             }
             if (newProducts.length === 0) {
                 toast.error('All products in this file are already in the system.');
             } else {
                 toast.success(`Successfully extracted ${newProducts.length} new products`);
             }
             setParsedBulkData(newProducts);
             setPreviewPage(1);
          } catch (err: any) {
             console.error(err);
             toast.error(`Validation failed: ${err.response?.data?.message || err.message || 'Unknown error occurred'}`);
             setParsedBulkData([]);
          } finally {
             setIsUploadingBulk(false);
          }
        }
    };
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        worker: true,
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
  const handleDeleteAllProducts = async () => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to permanently delete ALL products in the database? This action cannot be undone!')) return;
    try {
      const response = await api.delete('/products/bulk-delete-all');
      toast.success(response.data.message || 'All products deleted successfully');
      setProductsList([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete products');
    }
  };
  const handleRemoveCSV = () => {
    setBulkFile(null);
    setParsedBulkData([]);
    setPreviewPage(1);
    const fileInput = document.getElementById('csv-upload-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
      if (response.data.successCount === 0) {
        toast.error(response.data.message || 'Failed to import any products. Check your columns and data.');
      } else if (response.data.errors && response.data.errors.length > 0) {
        toast.success(response.data.message + ' (some failed)');
        console.error('Bulk import errors:', response.data.errors);
      } else {
        toast.success(response.data.message || 'Successfully posted products');
      }
      setBulkFile(null);
      setParsedBulkData([]);
        setPreviewPage(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload bulk products');
    } finally {
      setIsUploadingBulk(false);
    }
  };

  const parseSmartPaste = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const newPairs: {key: string, value: string}[] = [];
    lines.forEach(line => {
      let key = '';
      let value = line;
      if (line.includes(':')) {
        const parts = line.split(':');
        key = parts[0].trim();
        value = parts.slice(1).join(':').trim();
      } else if (/RAM|Memory/i.test(line)) {
        key = 'RAM';
      } else if (/SSD|HDD|Storage|TB|GB/i.test(line) && !/RAM/i.test(line) && !/Graphics/i.test(line)) {
        key = 'Storage';
      } else if (/Display|Screen|Resolution|"/i.test(line)) {
        key = 'Display';
      } else if (/WiFi|Bluetooth|Webcam/i.test(line)) {
        key = 'Connectivity';
      } else if (/Battery|Charger|Power/i.test(line)) {
        key = 'Battery';
      } else if (/Processor|CPU|Core i|Ryzen/i.test(line)) {
        key = 'Processor';
      } else if (/Graphics|GPU|NVIDIA|Radeon|Intel Iris/i.test(line)) {
        key = 'Graphics';
      } else if (/Keyboard|Backlight/i.test(line)) {
        key = 'Keyboard';
      } else if (/Face ID|Fingerprint|Security|Face 🆔/i.test(line)) {
        key = 'Security';
      } else if (/Ports|USB|HDMI/i.test(line)) {
        key = 'Ports';
      } else {
        key = 'Feature';
      }
      newPairs.push({ key, value });
    });
    return newPairs;
  };

  const handleSmartPasteCreate = () => {
    const newPairs = parseSmartPaste(smartPasteText);
    setSpecPairs([...specPairs.filter(p => p.key || p.value), ...newPairs]);
    setSmartPasteText('');
  };

  const handleSmartPasteEdit = () => {
    const newPairs = parseSmartPaste(editSmartPasteText);
    setEditSpecPairs([...editSpecPairs.filter(p => p.key || p.value), ...newPairs]);
    setEditSmartPasteText('');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSpecs: any = {};
    specPairs.forEach(s => {
      if (s.key.trim() && s.value.trim()) {
        parsedSpecs[s.key.trim()] = s.value.trim();
      }
    });
    try {
      const productPayload = {
        name: productForm.name,
        description: productForm.description,
        brand: productForm.brand,
        price: Number(productForm.price),
        compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : null,
        stock: Number(productForm.stock),
        categoryId: productForm.categoryId,
        specs: parsedSpecs,
        imageUrls: productForm.imageUrls,
        threeDModelUrl: productForm.threeDModelUrl || undefined,
      };
      await api.post('/products', productPayload);
      toast.success('Product published successfully!');
      const prodRes = await api.get('/products?includeInactive=true&limit=1000');
      setProductsList(prodRes.data.products);
      setProductForm({
        name: '',
        description: '',
        brand: '',
        price: 0,
        compareAtPrice: 0,
        stock: 10,
        categoryId: categories.length > 0 ? categories[0].id : '',
        specs: '',
        imageUrls: [],
        threeDModelUrl: '',
      });
      setSpecPairs([{ key: '', value: '' }]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish product');
    }
  };
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const parsedEditSpecs: any = {};
    editSpecPairs.forEach(s => {
      if (s.key.trim() && s.value.trim()) {
        parsedEditSpecs[s.key.trim()] = s.value.trim();
      }
    });
    try {
      await api.put(`/products/${editingProduct.id}`, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: Number(editingProduct.price),
        compareAtPrice: editingProduct.compareAtPrice ? Number(editingProduct.compareAtPrice) : null,
        imageUrls: editingProduct.imageUrls,
        threeDModelUrl: editingProduct.threeDModelUrl,
        variants: editingProduct.variants,
        categoryId: editingProduct.categoryId,
        specs: parsedEditSpecs,
      });
      toast.success('Product updated successfully!');
      setEditingProduct(null);
      const prodRes = await api.get('/products?includeInactive=true&limit=1000');
      setProductsList(prodRes.data.products);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update product');
    }
  };
  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    setUploading(true);
    try {
      const response = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditingProduct((prev: any) => ({ 
        ...prev, 
        imageUrls: [...(prev.imageUrls || []), ...(response.data.urls || [])] 
      }));
    } catch (err: any) {
      toast.error('Failed to upload images for edit');
    } finally {
      setUploading(false);
    }
  };
  const handleUpdateOrderStatus = async (id: string, status: string) => {
    if (!window.confirm(`Are you sure you want to change this order's status to ${status}?`)) return;
    try {
      await api.put(`/admin/orders/${id}`, { orderStatus: status });
      setOrders((prev) =>
        prev.map((ord) => (ord.id === id ? { ...ord, orderStatus: status } : ord))
      );
      toast.success('Order status updated and notification sent');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    }
  };
  const handleUpdatePaymentStatus = async (id: string, status: string) => {
    if (!window.confirm(`Are you sure you want to change this order's payment status to ${status}?`)) return;
    try {
      await api.put(`/admin/orders/${id}`, { paymentStatus: status });
      setOrders((prev) =>
        prev.map((ord) => (ord.id === id ? { ...ord, paymentStatus: status } : ord))
      );
      toast.success('Payment status updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update payment status');
    }
  };
  const handleToggleUserRole = async (id: string, currentRole: string) => {
    if (user?.id === id) return;
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((usr) => (usr.id === id ? { ...usr, role: newRole } : usr))
      );
      toast.success('User role updated');
    } catch (err) {
      console.error(err);
    }
  };
  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    if (user?.id === id) return;
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (!window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) return;
    try {
      await api.put(`/admin/users/${id}/status`, { status: newStatus });
      setUsers((prev) =>
        prev.map((usr) => (usr.id === id ? { ...usr, status: newStatus } : usr))
      );
      toast.success('User status updated');
    } catch (err) {
      console.error(err);
    }
  };
  const handleToggleProductActive = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'recall' : 'publish';
    if (!window.confirm(`Are you sure you want to ${action} this product?`)) return;
    try {
      await api.put(`/products/${id}/toggle-active`, { isActive: !currentStatus });
      setProductsList(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
      toast.success(`Product successfully ${currentStatus ? 'recalled' : 'published'}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle product status');
    }
  };
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/users', newUserForm);
      setUsers((prev) => [response.data, ...prev]);
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN',
      });
    } catch (err: any) {
    }
  };
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories', newCategoryForm);
      const res = await api.get('/categories');
      setCategories(res.data);
      setNewCategoryForm({ name: '', description: '', parentId: '' });
      toast.success('Category created successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };
  const handleUpdateCategory = async (id: string, currentName: string) => {
    const newName = window.prompt('Enter new category name:', currentName);
    if (!newName || newName === currentName) return;
    try {
      await api.put(`/categories/${id}`, { name: newName });
      const res = await api.get('/categories');
      setCategories(res.data);
      toast.success('Category updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  };
  const handleAddSubcategory = async (parentId: string, parentName: string) => {
    const newName = window.prompt(`Enter new subcategory name for ${parentName}:`);
    if (!newName || !newName.trim()) return;
    try {
      await api.post('/categories', { name: newName.trim(), parentId });
      const res = await api.get('/categories');
      setCategories(res.data);
      toast.success('Subcategory added successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add subcategory');
    }
  };
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? It will fail if it has products or subcategories.')) return;
    try {
      await api.delete(`/categories/${id}`);
      const res = await api.get('/categories');
      setCategories(res.data);
      toast.success('Category deleted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };
  const activeTabTitle: Record<string, string> = {
    stats: 'Metrics & Stock',
    orders: 'Manage Orders',
    users: 'Manage Users',
    addProduct: 'Add Product',
    categories: 'Manage Categories',
    productsList: 'Manage Products',
    flashSales: 'Flash Sales',
    shippingZones: 'Shipping Zones',
    adminLogs: 'Admin Logs',
    announcements: 'Manage Announcements',
    analytics: 'Analytics',
    coupons: 'Manage Coupons',
    livechat: 'Live Chat Support',
    newsletter: 'Newsletter',
    returns: 'Product Returns',
    securityCenter: 'Security Center',
    shippingQueue: 'Shipping Queue',
    warranties: 'Warranties & Claims'
  };
  const currentTitle = activeTabTitle[activeTab] || 'Dashboard';
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {}
      <aside className={`fixed inset-y-0 left-0 bg-slate-900 text-slate-300 flex flex-col z-50 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'} md:relative`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0 justify-between w-64">
          <div className="font-sans text-xl font-bold tracking-tight text-white">
            NexGen <span className="text-blue-500">Admin</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Logged in as</div>
          <div className="text-sm font-medium text-white truncate">{user?.email}</div>
          <div className="text-xs text-blue-400 mt-0.5">Role: {user?.role}</div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Section 1: Overview */}
          <div>
            <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 select-none">Overview</div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('stats'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                  activeTab === 'stats'
                    ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                }`}
              >
                <LayoutDashboard className="h-5 w-5 shrink-0" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                  activeTab === 'analytics'
                    ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                }`}
              >
                <TrendingUp className="h-5 w-5 shrink-0" />
                <span>Full Analytics</span>
              </button>
              <button
                onClick={() => { setActiveTab('adminLogs'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                  activeTab === 'adminLogs'
                    ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                }`}
              >
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>Admin Logs</span>
              </button>
            </div>
          </div>

          {/* Section 2: Catalog & Sales */}
          <div>
            <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 select-none">Catalog & Sales</div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('productsList'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                  activeTab === 'productsList'
                    ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                }`}
              >
                <Package className="h-5 w-5 shrink-0" />
                <span>Manage Products</span>
              </button>
              <button
                onClick={() => { setActiveTab('addProduct'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                  activeTab === 'addProduct'
                    ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                }`}
              >
                <PlusCircle className="h-5 w-5 shrink-0" />
                <span>Add Product</span>
              </button>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                    activeTab === 'categories'
                      ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                  }`}
                >
                  <Layers className="h-5 w-5 shrink-0" />
                  <span>Categories</span>
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setActiveTab('flashSales'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                    activeTab === 'flashSales'
                      ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                  }`}
                >
                  <Zap className="h-5 w-5 shrink-0" />
                  <span>Flash Sales</span>
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setActiveTab('coupons'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                    activeTab === 'coupons'
                      ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                  }`}
                >
                  <Megaphone className="h-5 w-5 shrink-0" />
                  <span>Coupons</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 3: Orders & Logistics */}
          <div>
            <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 select-none">Orders & Logistics</div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                  activeTab === 'orders'
                    ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                }`}
              >
                <ShoppingBag className="h-5 w-5 shrink-0" />
                <span>Orders</span>
              </button>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setActiveTab('shippingZones'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                    activeTab === 'shippingZones'
                      ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                  }`}
                >
                  <MapPin className="h-5 w-5 shrink-0" />
                  <span>Shipping Zones</span>
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setActiveTab('shippingQueue'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                    activeTab === 'shippingQueue'
                      ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                  }`}
                >
                  <MapPin className="h-5 w-5 shrink-0" />
                  <span>Shipping Queue</span>
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setActiveTab('returns'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                    activeTab === 'returns'
                      ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                  }`}
                >
                  <RotateCcw className="h-5 w-5 shrink-0" />
                  <span>Returns & Refunds</span>
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setActiveTab('warranties'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                    activeTab === 'warranties'
                      ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <span>Warranty Claims</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 4: Marketing & Engagement */}
          <div>
            <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 select-none">Marketing & Engagement</div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('livechat'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                  activeTab === 'livechat'
                    ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                }`}
              >
                <MessageSquare className="h-5 w-5 shrink-0" />
                <span>Live Chat</span>
              </button>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setActiveTab('newsletter'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                    activeTab === 'newsletter'
                      ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                  }`}
                >
                  <Mail className="h-5 w-5 shrink-0" />
                  <span>Newsletter</span>
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setActiveTab('announcements'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                    activeTab === 'announcements'
                      ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                  }`}
                >
                  <Volume2 className="h-5 w-5 shrink-0" />
                  <span>Announcements</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 5: Access Control */}
          <div>
            <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 select-none">Access Control</div>
            <div className="space-y-1">
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                    activeTab === 'users'
                      ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                  }`}
                >
                  <Users className="h-5 w-5 shrink-0" />
                  <span>Users & Roles</span>
                </button>
              )}
              <button
                onClick={() => { setActiveTab('securityCenter'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm ${
                  activeTab === 'securityCenter'
                    ? 'bg-[#F59E0B] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                }`}
              >
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>Security Center</span>
              </button>
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={async () => {
              await logout();
              navigate('/login');
            }} 
            className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors font-medium text-sm px-3 py-2 rounded-lg cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      {}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-md transition-colors"
              onClick={() => setIsSidebarOpen(prev => !prev)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">{currentTitle}</h1>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        {}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8">
            {activeTab === 'announcements' && (
              <AdminAnnouncements />
            )}
            {activeTab === 'newsletter' && (
              <AdminNewsletter />
            )}
            {activeTab === 'returns' && (
              <AdminReturns />
            )}
            {activeTab === 'warranties' && (
              <AdminWarranties />
            )}
            {activeTab === 'coupons' && (
              <AdminCoupons />
            )}
            {activeTab === 'livechat' && (
              <AdminLiveChat />
            )}
            {activeTab === 'shippingQueue' && (
              <AdminShippingQueue />
            )}
            {activeTab === 'securityCenter' && (
              <AdminSecurity />
            )}
            {activeTab === 'analytics' && (
              <AdminAnalytics />
            )}
            {activeTab === 'stats' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                  <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Sales</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">KES {stats.totalSales.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Orders</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Registered Users</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                {stats.salesByDay && stats.salesByDay.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col p-6 mt-8">
                    <h3 className="font-bold text-slate-800 mb-6">Sales Last 30 Days (KES)</h3>
                    <div className="h-[200px] flex items-end gap-2 text-xs font-semibold text-slate-500 overflow-x-auto pb-4">
                      {stats.salesByDay.map((day, idx) => {
                        const maxSales = Math.max(...stats.salesByDay!.map(d => d.sales));
                        const heightPct = Math.max((day.sales / maxSales) * 100, 2);
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 flex-1 min-w-[30px]" title={`${day.date}: KES ${day.sales.toLocaleString()}`}>
                            <div className="w-full bg-blue-100 rounded-t relative group">
                              <div 
                                className="absolute bottom-0 w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600" 
                                style={{ height: `${heightPct}%` }}
                              >
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity">
                                  KES {day.sales.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <span className="truncate w-full text-center text-[9px] -rotate-45 origin-top-left mt-2">
                              {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col mt-8">
                  <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                    <h3 className="font-bold text-slate-800">Low Stock Inventory (≤ 5 items)</h3>
                  </div>
                  <div className="p-6 overflow-x-auto">
                    {lowStock.length === 0 ? (
                      <p className="text-slate-500 text-sm">All products are well stocked.</p>
                    ) : (
                      <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="pb-3 px-2 font-semibold">Product</th>
                            <th className="pb-3 px-2 font-semibold">Category</th>
                            <th className="pb-3 px-2 font-semibold">Price</th>
                            <th className="pb-3 px-2 font-semibold text-right">Stock Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lowStock.map((prod) => (
                            <tr key={prod.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="py-4 px-2 font-semibold text-slate-900">{prod.name}</td>
                              <td className="py-4 px-2 text-slate-600">{prod.category}</td>
                              <td className="py-4 px-2 text-blue-600 font-bold">KES {prod.price.toLocaleString()}</td>
                              <td className="py-4 px-2 text-right">
                                <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-bold">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                                  {prod.stock} Left
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            )}
            {activeTab === 'orders' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Order Management</h3>
                  <button 
                    onClick={async () => {
                      try {
                        const response = await api.get('/admin/orders/export', { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'orders_export.csv');
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode?.removeChild(link);
                      } catch (err) {
                        console.error('Failed to export orders', err);
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    Export Orders CSV
                  </button>
                </div>
                <div className="p-6 overflow-x-auto">
                  {orders.length === 0 ? (
                    <p className="text-slate-500 text-sm">No orders recorded yet.</p>
                  ) : (
                    <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="pb-3 px-2 font-semibold">Order ID</th>
                          <th className="pb-3 px-2 font-semibold">Customer</th>
                          <th className="pb-3 px-2 font-semibold">Amount</th>
                          <th className="pb-3 px-2 font-semibold">Order Status</th>
                          <th className="pb-3 px-2 font-semibold">Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((ord) => (
                          <tr key={ord.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-2 text-slate-500 font-mono text-xs uppercase">{ord.id.slice(0, 8)}</td>
                            <td className="py-4 px-2">
                              <div className="font-bold text-slate-900">
                                {ord.user?.name || ord.shippingAddress?.guestName || 'Unknown User'}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {ord.user?.email || ord.shippingAddress?.guestEmail || 'No Email'}
                              </div>
                            </td>
                            <td className="py-4 px-2 text-slate-900 font-bold">KES {ord.totalAmount.toLocaleString()}</td>
                            <td className="py-4 px-2">
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className="bg-white border border-slate-300 text-sm text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                                <option value="RETURN_REQUESTED">RETURN REQ.</option>
                                <option value="RETURNED">RETURNED</option>
                              </select>
                            </td>
                            <td className="py-4 px-2">
                              <select
                                value={ord.paymentStatus}
                                onChange={(e) => handleUpdatePaymentStatus(ord.id, e.target.value)}
                                className="bg-white border border-slate-300 text-sm text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="PAID">PAID</option>
                                <option value="FAILED">FAILED</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {ordersTotalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="text-sm text-slate-500">
                        Page <span className="font-bold">{ordersPage}</span> of <span className="font-bold">{ordersTotalPages}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={ordersPage === 1}
                          onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-semibold disabled:opacity-50 hover:bg-slate-50"
                        >
                          Previous
                        </button>
                        <button
                          disabled={ordersPage === ordersTotalPages}
                          onClick={() => setOrdersPage(p => Math.min(ordersTotalPages, p + 1))}
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-semibold disabled:opacity-50 hover:bg-slate-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'users' && (
              <div className="space-y-6 lg:space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-fit">
                    <h3 className="font-bold text-slate-800 mb-5">Provision New User</h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newUserForm.name}
                          onChange={(e) => setNewUserForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Jane Doe"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Email Address</label>
                        <input
                          type="email"
                          required
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="jane@nexgen.com"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Password</label>
                        <input
                          type="password"
                          required
                          value={newUserForm.password}
                          onChange={(e) => setNewUserForm(p => ({ ...p, password: e.target.value }))}
                          placeholder="••••••••"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                        />
                        <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">Must be at least 8 chars, including uppercase, lowercase, number & special char.</p>
                      </div>
                      <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Role Assignment</label>
                        <select
                          value={newUserForm.role}
                          onChange={(e) => setNewUserForm(p => ({ ...p, role: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 cursor-pointer"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="USER">USER</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm shadow-sm"
                      >
                        Provision Account
                      </button>
                    </form>
                  </div>
                  <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                      <h3 className="font-bold text-slate-800">User Access Control (RBAC)</h3>
                    </div>
                    <div className="p-6 overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="pb-3 px-2 font-semibold">Name</th>
                            <th className="pb-3 px-2 font-semibold">Email</th>
                            <th className="pb-3 px-2 font-semibold">Role</th>
                            <th className="pb-3 px-2 font-semibold">Status</th>
                            <th className="pb-3 px-2 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((usr) => (
                            <tr key={usr.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="py-4 px-2 font-bold text-slate-900">{usr.name}</td>
                              <td className="py-4 px-2 text-slate-600">{usr.email}</td>
                              <td className="py-4 px-2">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  usr.role === 'ADMIN' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {usr.role}
                                </span>
                              </td>
                              <td className="py-4 px-2">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  usr.status === 'SUSPENDED'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {usr.status}
                                </span>
                              </td>
                              <td className="py-4 px-2 text-right space-x-2">
                                {usr.id !== user?.id ? (
                                  <>
                                    <button
                                      onClick={() => handleToggleUserRole(usr.id, usr.role)}
                                      className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer shadow-sm"
                                    >
                                      Toggle Role
                                    </button>
                                    <button
                                      onClick={() => handleToggleUserStatus(usr.id, usr.status)}
                                      className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer border shadow-sm ${
                                        usr.status === 'SUSPENDED'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                      }`}
                                    >
                                      {usr.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-xs text-slate-400 italic font-medium px-2">Self (Protected)</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {usersTotalPages > 1 && (
                      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                          Page <span className="font-bold">{usersPage}</span> of <span className="font-bold">{usersTotalPages}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            disabled={usersPage === 1}
                            onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-semibold disabled:opacity-50 hover:bg-slate-50"
                          >
                            Previous
                          </button>
                          <button
                            disabled={usersPage === usersTotalPages}
                            onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))}
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-semibold disabled:opacity-50 hover:bg-slate-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'productsList' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Product Management</h3>
                  <button 
                    onClick={handleDeleteAllProducts}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete All Products
                  </button>
                </div>
                <div className="p-6 overflow-x-auto">
                  {productsList.length === 0 ? (
                    <p className="text-slate-500 text-sm">No products found.</p>
                  ) : (
                    <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="pb-3 px-2 font-semibold">Product</th>
                          <th className="pb-3 px-2 font-semibold">Category</th>
                          <th className="pb-3 px-2 font-semibold">Price</th>
                          <th className="pb-3 px-2 font-semibold">Stock</th>
                          <th className="pb-3 px-2 font-semibold text-right">Status / Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsList.map((prod) => (
                          <tr key={prod.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${prod.isActive === false ? 'opacity-60 bg-slate-50' : ''}`}>
                            <td className="py-4 px-2">
                              <div className="flex items-center gap-3">
                                {prod.imageUrls && prod.imageUrls.length > 0 ? (
                                  <img src={getImageUrl(prod.imageUrls[0])} alt={prod.name} className="w-10 h-10 object-cover bg-white border border-slate-200 rounded" />
                                ) : (
                                  <div className="w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 rounded">
                                    <Package className="h-5 w-5" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-slate-900">{prod.name}</div>
                                  <div className="text-xs text-slate-500 mt-0.5 font-mono">{prod.slug}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-slate-600">{prod.category?.name || 'Uncategorized'}</td>
                            <td className="py-4 px-2 text-blue-600 font-bold">KES {prod.price.toLocaleString()}</td>
                            <td className="py-4 px-2 text-slate-600 font-bold">{prod.stock}</td>
                            <td className="py-4 px-2 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    let parsedVariants = [];
                                    try {
                                      parsedVariants = typeof prod.variants === 'string' && prod.variants ? JSON.parse(prod.variants) : (prod.variants || []);
                                    } catch(e) {}
                                    const initSpecPairs = prod.specs && typeof prod.specs === 'object' && Object.keys(prod.specs).length > 0 
                                      ? Object.entries(prod.specs).map(([k, v]) => ({ key: k, value: String(v) }))
                                      : [{ key: '', value: '' }];
                                    setEditSpecPairs(initSpecPairs);
                                    setEditingProduct({...prod, variants: parsedVariants});
                                  }}
                                  className="text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  Edit
                                </button>
                                {prod.isActive !== false ? (
                                  <button
                                    onClick={() => handleToggleProductActive(prod.id, true)}
                                    className="text-xs font-bold bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    Recall
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleProductActive(prod.id, false)}
                                    className="text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                                  >
                                    Publish
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {editingProduct && (
                  <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-bold text-slate-800">Edit Product</h3>
                        <button onClick={() => setEditingProduct(null)} className="text-slate-500 hover:text-slate-800"><X className="h-5 w-5" /></button>
                      </div>
                      <form onSubmit={handleUpdateProduct} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-slate-600">Name</label>
                            <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-slate-600">Category</label>
                            <select
                              value={editingProduct.categoryId || ''}
                              onChange={(e) => setEditingProduct({...editingProduct, categoryId: e.target.value})}
                              className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              required
                            >
                              <option value="">Select Category</option>
                              {categories.map((cat) => (
                                <optgroup key={cat.id} label={cat.name}>
                                  <option value={cat.id}>{cat.name}</option>
                                  {cat.children && cat.children.map(sub => (
                                    <option key={sub.id} value={sub.id}>— {sub.name}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1 uppercase text-slate-600">Description</label>
                          <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" rows={3} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-slate-600">Price (KES)</label>
                            <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                          </div>
                                           <div>
                              <label className="block text-xs font-bold mb-1 uppercase text-slate-600">Compare Price (KES)</label>
                              <input type="number" value={editingProduct.compareAtPrice || ''} onChange={(e) => setEditingProduct({...editingProduct, compareAtPrice: Number(e.target.value)})} className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-slate-600">Add Photos</label>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleEditImageUpload}
                              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-300 rounded p-1"
                            />
                            {uploading && <p className="text-xs text-slate-500 mt-2 font-medium">Uploading images...</p>}
                            
                            {/* Photo Gallery Preview */}
                            {editingProduct.imageUrls && editingProduct.imageUrls.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-slate-600 mb-2 font-medium">Current Photos ({editingProduct.imageUrls.length})</p>
                                <div className="flex flex-wrap gap-2">
                                  {editingProduct.imageUrls.map((url: string, index: number) => (
                                    <div key={index} className="relative group w-16 h-16 border border-slate-200 rounded overflow-hidden">
                                      <img src={getImageUrl(url)} alt={`preview ${index}`} className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newUrls = [...editingProduct.imageUrls];
                                          newUrls.splice(index, 1);
                                          setEditingProduct({...editingProduct, imageUrls: newUrls});
                                        }}
                                        className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove photo"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 mb-4">
                            <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <label className="block text-blue-800 text-xs font-bold mb-1.5 uppercase tracking-wide">✨ Smart Auto-Fill Specs</label>
                              <p className="text-xs text-blue-600 mb-2">Paste a list of features here and our smart tool will automatically organize them into a table!</p>
                              <textarea
                                value={editSmartPasteText}
                                onChange={(e) => setEditSmartPasteText(e.target.value)}
                                placeholder='e.g.&#10;8GB RAM&#10;256GB SSD&#10;PORTS: 2x USB-C'
                                rows={3}
                                className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
                              />
                              <button
                                type="button"
                                onClick={handleSmartPasteEdit}
                                disabled={!editSmartPasteText.trim()}
                                className="bg-blue-600 text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                Auto-Fill Table
                              </button>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-xs font-bold uppercase text-slate-600">Specifications</label>
                            </div>
                            <div className="space-y-2">
                              {editSpecPairs.map((pair, index) => (
                                <div key={index} className="flex gap-2">
                                  <input type="text" placeholder="Key (e.g. RAM)" value={pair.key} onChange={(e) => { const newPairs = [...editSpecPairs]; newPairs[index].key = e.target.value; setEditSpecPairs(newPairs); }} className="w-1/3 border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500" />
                                  <input type="text" placeholder="Value (e.g. 16GB)" value={pair.value} onChange={(e) => { const newPairs = [...editSpecPairs]; newPairs[index].value = e.target.value; setEditSpecPairs(newPairs); }} className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500" />
                                  <button type="button" onClick={() => setEditSpecPairs(editSpecPairs.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700 px-1"><X className="w-5 h-5" /></button>
                                </div>
                              ))}
                            </div>
                            <button type="button" onClick={() => setEditSpecPairs([...editSpecPairs, { key: '', value: '' }])} className="mt-2 text-xs text-blue-600 font-bold hover:underline">Add Specification</button>
                          </div>
                          <div className="col-span-2">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-xs font-bold uppercase text-slate-600">Variants</label>
                              <button type="button" onClick={() => setEditingProduct({...editingProduct, variants: [...(editingProduct.variants || []), { id: Date.now().toString(), name: '', priceOffset: 0, stock: 0 }]})} className="text-xs text-blue-600 font-bold hover:underline">Add Variant</button>
                            </div>
                            <div className="space-y-2">
                              {editingProduct.variants && editingProduct.variants.map((variant: any, index: number) => (
                                <div key={variant.id || index} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                                  <input type="text" placeholder="Name (e.g. 16GB RAM)" value={variant.name} onChange={(e) => {
                                    const newVars = [...editingProduct.variants];
                                    newVars[index].name = e.target.value;
                                    setEditingProduct({...editingProduct, variants: newVars});
                                  }} className="flex-1 border border-slate-300 rounded p-1 text-sm focus:outline-none focus:border-blue-500" />
                                  <input type="number" placeholder="Price offset" value={variant.priceOffset} onChange={(e) => {
                                    const newVars = [...editingProduct.variants];
                                    newVars[index].priceOffset = Number(e.target.value);
                                    setEditingProduct({...editingProduct, variants: newVars});
                                  }} className="w-24 border border-slate-300 rounded p-1 text-sm focus:outline-none focus:border-blue-500" />
                                  <input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => {
                                    const newVars = [...editingProduct.variants];
                                    newVars[index].stock = Number(e.target.value);
                                    setEditingProduct({...editingProduct, variants: newVars});
                                  }} className="w-20 border border-slate-300 rounded p-1 text-sm focus:outline-none focus:border-blue-500" />
                                  <button type="button" onClick={() => {
                                    const newVars = [...editingProduct.variants];
                                    newVars.splice(index, 1);
                                    setEditingProduct({...editingProduct, variants: newVars});
                                  }} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                            <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 border rounded-lg font-semibold hover:bg-slate-50 cursor-pointer">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm cursor-pointer">Save Changes</button>
                          </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'addProduct' && (
              <div className="space-y-6 max-w-3xl">
                {}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Bulk Upload Products</h3>
                    {bulkFile && (
                      <button 
                        type="button"
                        onClick={handleRemoveCSV}
                        className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 flex items-center gap-2 cursor-pointer transition-colors border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear File
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleBulkUpload} className="flex flex-col gap-4 items-start">
                    <input 
                      id="csv-upload-input"
                      type="file" 
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                                        {parsedBulkData.length > 0 && (
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
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isUploadingBulk || parsedBulkData.length === 0}
                      className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-300 disabled:cursor-not-allowed text-sm"
                    >
                      {isUploadingBulk ? 'Publishing...' : 'Confirm & Publish'}
                    </button>
                  </form>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8">
                <h3 className="font-bold text-slate-800 mb-6 text-lg border-b border-slate-100 pb-4">Create New Product Listing</h3>
                <form onSubmit={handleCreateProduct} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Product Name</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="HP ProBook 450"
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Brand</label>
                      <input
                        type="text"
                        required
                        value={productForm.brand}
                        onChange={(e) => setProductForm((p) => ({ ...p, brand: e.target.value }))}
                        placeholder="HP"
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Description</label>
                    <textarea
                      required
                      value={productForm.description}
                      onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Provide a detailed description of the laptop features, portability, and usage cases..."
                      rows={4}
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Price (KES)</label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm((p) => ({ ...p, price: Number(e.target.value) }))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Compare Price (KES)</label>
                      <input
                        type="number"
                        value={productForm.compareAtPrice}
                        onChange={(e) => setProductForm((p) => ({ ...p, compareAtPrice: Number(e.target.value) }))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Initial Stock</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                               <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                        <select
                          value={productForm.categoryId}
                          onChange={(e) => setProductForm((p) => ({ ...p, categoryId: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                          required
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Product Images</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      {uploading && <p className="text-xs text-slate-500 mt-2 font-medium">Uploading images...</p>}
                      
                      {/* Photo Gallery Preview */}
                      {productForm.imageUrls.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-slate-600 mb-2 font-medium">Current Photos ({productForm.imageUrls.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {productForm.imageUrls.map((url: string, index: number) => (
                              <div key={index} className="relative group w-16 h-16 border border-slate-200 rounded overflow-hidden">
                                <img src={getImageUrl(url)} alt={`preview ${index}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newUrls = [...productForm.imageUrls];
                                    newUrls.splice(index, 1);
                                    setProductForm({...productForm, imageUrls: newUrls});
                                  }}
                                  className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove photo"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <label className="block text-blue-800 text-xs font-bold mb-1.5 uppercase tracking-wide">✨ Smart Auto-Fill Specs</label>
                      <p className="text-xs text-blue-600 mb-2">Paste a list of features here and our smart tool will automatically organize them into a table!</p>
                      <textarea
                        value={smartPasteText}
                        onChange={(e) => setSmartPasteText(e.target.value)}
                        placeholder='e.g.&#10;8GB RAM&#10;256GB SSD&#10;PORTS: 2x USB-C'
                        rows={3}
                        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
                      />
                      <button
                        type="button"
                        onClick={handleSmartPasteCreate}
                        disabled={!smartPasteText.trim()}
                        className="bg-blue-600 text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        Auto-Fill Table
                      </button>
                    </div>
                    <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Specifications</label>
                    <div className="space-y-2">
                      {specPairs.map((pair, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. RAM"
                            value={pair.key}
                            onChange={(e) => {
                              const newPairs = [...specPairs];
                              newPairs[index].key = e.target.value;
                              setSpecPairs(newPairs);
                            }}
                            className="w-1/3 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                          />
                          <input
                            type="text"
                            placeholder="e.g. 16GB"
                            value={pair.value}
                            onChange={(e) => {
                              const newPairs = [...specPairs];
                              newPairs[index].value = e.target.value;
                              setSpecPairs(newPairs);
                            }}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setSpecPairs(specPairs.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 px-1 cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSpecPairs([...specPairs, { key: '', value: '' }])}
                      className="mt-3 text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Specification
                    </button>
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer shadow-md shadow-blue-500/20"
                    >
                      <PlusCircle className="h-5 w-5" />
                      Publish Product Listing
                    </button>
                  </div>
                </form>
              </div>
              </div>
            )}
            {activeTab === 'categories' && (
              <div className="space-y-6 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-slate-100 pb-2">Create Category</h3>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Name</label>
                        <input
                          type="text"
                          required
                          value={newCategoryForm.name}
                          onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                          placeholder="Gaming Laptops"
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-slate-900 shadow-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Parent Category (Optional)</label>
                        <select
                          value={newCategoryForm.parentId}
                          onChange={(e) => setNewCategoryForm({ ...newCategoryForm, parentId: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-slate-900 shadow-sm cursor-pointer"
                        >
                          <option value="">None (Top-level)</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wide">Description (Optional)</label>
                        <input
                          type="text"
                          value={newCategoryForm.description}
                          onChange={(e) => setNewCategoryForm((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Optional description"
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 shadow-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <PlusCircle className="h-4.5 w-4.5" />
                        Add Category
                      </button>
                    </form>
                  </div>
                </div>
                  {}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-slate-100 pb-2">Category Hierarchy</h3>
                    {categories.length === 0 ? (
                      <p className="text-slate-500 text-sm py-4">No categories found. Create one above.</p>
                    ) : (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        {categories.map(cat => (
                          <RecursiveCategoryItem 
                            key={cat.id} 
                            category={cat} 
                            onDelete={handleDeleteCategory}
                            onEdit={handleUpdateCategory}
                            onAddChild={handleAddSubcategory}
                          />
                        ))}
                      </div>
                    )}
                  </div>              </div>
            )}
            {activeTab === 'flashSales' && (
              <div className="space-y-6 lg:space-y-8">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-slate-100 pb-2">Create Flash Sale</h3>
                  <form onSubmit={handleCreateFlashSale} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase">Product</label>
                        <select
                          required
                          value={flashSaleForm.productId}
                          onChange={(e) => setFlashSaleForm(p => ({ ...p, productId: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select a Product</option>
                          {productsList.map(prod => (
                            <option key={prod.id} value={prod.id}>{prod.name} - KES {prod.price}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase">Flash Sale Price (KES)</label>
                        <input
                          type="number"
                          required
                          value={flashSaleForm.salePrice || ''}
                          onChange={(e) => setFlashSaleForm(p => ({ ...p, salePrice: Number(e.target.value) }))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase">Start Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={flashSaleForm.startTime}
                          onChange={(e) => setFlashSaleForm(p => ({ ...p, startTime: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase">End Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={flashSaleForm.endTime}
                          onChange={(e) => setFlashSaleForm(p => ({ ...p, endTime: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#F59E0B] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-500 transition-colors mt-4"
                    >
                      <Zap className="h-5 w-5" />
                      Set Flash Sale
                    </button>
                  </form>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
                  <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-slate-100 pb-2">Active Flash Sales</h3>
                  <div className="overflow-x-auto">
                    {flashSales.length === 0 ? (
                      <p className="text-slate-500 text-sm">No active flash sales found.</p>
                    ) : (
                      <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="pb-3 px-2 font-semibold">Product</th>
                            <th className="pb-3 px-2 font-semibold">Original Price</th>
                            <th className="pb-3 px-2 font-semibold text-amber-600">Sale Price</th>
                            <th className="pb-3 px-2 font-semibold">Ends At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {flashSales.map((sale) => (
                            <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-4 px-2 font-bold text-slate-900">{sale.product?.name}</td>
                              <td className="py-4 px-2 text-slate-600 line-through">KES {sale.product?.price?.toLocaleString()}</td>
                              <td className="py-4 px-2 text-amber-600 font-bold">KES {sale.salePrice?.toLocaleString()}</td>
                              <td className="py-4 px-2 text-slate-600">{new Date(sale.endTime).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'adminLogs' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4 text-lg">Admin Activity Logs</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="pb-3 px-2 font-semibold">Time</th>
                          <th className="pb-3 px-2 font-semibold">Admin</th>
                          <th className="pb-3 px-2 font-semibold">Action</th>
                          <th className="pb-3 px-2 font-semibold">Details</th>
                          <th className="pb-3 px-2 font-semibold">IP Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminLogs.map((log) => (
                          <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-2 text-slate-600 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="py-3 px-2 font-medium text-slate-900">{log.admin?.name} ({log.admin?.email})</td>
                            <td className="py-3 px-2 font-bold text-[#F59E0B]">{log.action}</td>
                            <td className="py-3 px-2 text-slate-600">{log.details}</td>
                            <td className="py-3 px-2 text-slate-500 font-mono text-xs">{log.ipAddress}</td>
                          </tr>
                        ))}
                        {adminLogs.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500">No logs found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'shippingZones' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Add Shipping Zone</h3>
                    <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const res = await api.post('/shipping', newShippingZoneForm);
                        setShippingZones(prev => [...prev, res.data].sort((a,b) => a.regionName.localeCompare(b.regionName)));
                        setNewShippingZoneForm({ regionName: '', fee: 0, estimatedDays: '' });
                        toast.success('Shipping zone added!');
                      } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Error adding zone');
                      }
                    }}>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Region/City</label>
                        <input
                          type="text"
                          required
                          value={newShippingZoneForm.regionName}
                          onChange={e => setNewShippingZoneForm(prev => ({...prev, regionName: e.target.value}))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Fee (KES)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={newShippingZoneForm.fee}
                          onChange={e => setNewShippingZoneForm(prev => ({...prev, fee: Number(e.target.value)}))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Estimated Days</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 2-3 Days"
                          value={newShippingZoneForm.estimatedDays}
                          onChange={e => setNewShippingZoneForm(prev => ({...prev, estimatedDays: e.target.value}))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <button type="submit" className="bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                        Add Zone
                      </button>
                    </form>
                  </div>
                  <div className="p-6 overflow-x-auto">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Current Zones</h3>
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 text-sm">
                          <th className="pb-3 px-2 font-semibold">Region</th>
                          <th className="pb-3 px-2 font-semibold">Fee (KES)</th>
                          <th className="pb-3 px-2 font-semibold">Estimated Days</th>
                          <th className="pb-3 px-2 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shippingZones.map((zone) => (
                          <tr key={zone.id} className="border-b border-slate-100 hover:bg-slate-50">
                            {editingShippingZoneId === zone.id ? (
                              <>
                                <td className="py-4 px-2">
                                  <input type="text" className="w-full border border-slate-300 rounded px-2 py-1 text-sm" value={editShippingZoneForm.regionName} onChange={e => setEditShippingZoneForm(prev => ({...prev, regionName: e.target.value}))} />
                                </td>
                                <td className="py-4 px-2">
                                  <input type="number" min="0" className="w-full border border-slate-300 rounded px-2 py-1 text-sm" value={editShippingZoneForm.fee} onChange={e => setEditShippingZoneForm(prev => ({...prev, fee: Number(e.target.value)}))} />
                                </td>
                                <td className="py-4 px-2">
                                  <input type="text" className="w-full border border-slate-300 rounded px-2 py-1 text-sm" value={editShippingZoneForm.estimatedDays} onChange={e => setEditShippingZoneForm(prev => ({...prev, estimatedDays: e.target.value}))} />
                                </td>
                                <td className="py-4 px-2 text-right whitespace-nowrap">
                                  <button onClick={async () => {
                                    try {
                                      const res = await api.put(`/shipping/${zone.id}`, editShippingZoneForm);
                                      setShippingZones(prev => prev.map(z => z.id === zone.id ? res.data : z).sort((a,b) => a.regionName.localeCompare(b.regionName)));
                                      setEditingShippingZoneId(null);
                                      toast.success('Updated successfully');
                                    } catch (err: any) {
                                      toast.error(err.response?.data?.message || 'Error updating');
                                    }
                                  }} className="text-green-600 hover:bg-green-50 p-2 rounded-full cursor-pointer mr-2 inline-flex" title="Save changes">
                                    <Check className="h-5 w-5" />
                                  </button>
                                  <button onClick={() => setEditingShippingZoneId(null)} className="text-slate-500 hover:bg-slate-50 p-2 rounded-full cursor-pointer inline-flex" title="Cancel">
                                    <X className="h-5 w-5" />
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-4 px-2 font-bold text-slate-900">{zone.regionName}</td>
                                <td className="py-4 px-2 text-slate-600">{zone.fee.toLocaleString()}</td>
                                <td className="py-4 px-2 text-slate-600">{zone.estimatedDays}</td>
                                <td className="py-4 px-2 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      setEditingShippingZoneId(zone.id);
                                      setEditShippingZoneForm({ regionName: zone.regionName, fee: zone.fee, estimatedDays: zone.estimatedDays });
                                    }}
                                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full cursor-pointer mr-2 inline-flex" title="Edit"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!window.confirm(`Delete ${zone.regionName}?`)) return;
                                      try {
                                        await api.delete(`/shipping/${zone.id}`);
                                        setShippingZones(prev => prev.filter(z => z.id !== zone.id));
                                        toast.success('Deleted');
                                      } catch (err) {
                                        toast.error('Error deleting');
                                      }
                                    }}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-full cursor-pointer inline-flex" title="Delete"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
export default AdminDashboardPage;
