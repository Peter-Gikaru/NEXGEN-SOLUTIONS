import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, X, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';


export const WarrantyClaimPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const productId = searchParams.get('productId');
  const navigate = useNavigate();


  const [issueType, setIssueType] = useState('HARDWARE_FAILURE');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId || !productId) {
      toast.error('Missing order or product information.');
      navigate('/');
    }
  }, [orderId, productId, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        toast.error('You can upload a maximum of 5 images');
        return;
      }
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !productId) return;

    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        
        const uploadRes = await api.post('/uploads/returns', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrls = uploadRes.data.urls;
      }

      await api.post('/warranty', {
        orderId,
        productId,
        issueType,
        description,
        imageUrls: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null
      });

      toast.success('Warranty claim submitted successfully. Support will contact you.');
      navigate('/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit warranty claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderId || !productId) return null;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#F59E0B] mb-8 font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">File a Warranty Claim</h1>
              <p className="text-slate-500 text-sm">Order ID: {orderId}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Issue Type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F59E0B] text-slate-900"
              >
                <option value="HARDWARE_FAILURE">Hardware Failure (Screen, Keyboard, etc.)</option>
                <option value="BATTERY_ISSUE">Battery / Power Issue</option>
                <option value="SOFTWARE_OS">Software / OS Issue</option>
                <option value="OVERHEATING">Overheating</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Please describe the issue in detail..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F59E0B] text-slate-900 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Upload Images/Videos (Optional, Max 5)</label>
              <p className="text-xs text-slate-500 mb-3">Upload clear photos or short videos demonstrating the issue.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {files.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Upload preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {files.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#F59E0B] hover:bg-amber-50 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-xs font-semibold text-slate-500">Add File</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F59E0B] hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Claim'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WarrantyClaimPage;
