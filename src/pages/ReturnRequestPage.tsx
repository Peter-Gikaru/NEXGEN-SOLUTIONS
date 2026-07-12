import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, X, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';


export const ReturnRequestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();


  const [reason, setReason] = useState('DEFECTIVE');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      toast.error('No order selected for return.');
      navigate('/');
    }
  }, [orderId, navigate]);

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
    if (!orderId) return;

    if (files.length === 0) {
      toast.error('Please upload at least one image of the product');
      return;
    }

    setIsSubmitting(true);
    try {
      
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      
      const uploadRes = await api.post('/uploads/returns', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrls = uploadRes.data.urls; 

      
      await api.post('/returns', {
        orderId,
        reason,
        description,
        imageUrls: JSON.stringify(imageUrls)
      });

      toast.success('Return request submitted successfully. We will contact you shortly.');
      navigate('/track');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderId) return null;

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
            <div className="bg-amber-100 text-amber-600 p-3 rounded-xl">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Request a Return</h1>
              <p className="text-slate-500 text-sm">Order ID: {orderId}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Return</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F59E0B] text-slate-900"
              >
                <option value="DEFECTIVE">Product is defective / Not working</option>
                <option value="WRONG_ITEM">Received wrong item</option>
                <option value="DAMAGED">Damaged during shipping</option>
                <option value="NOT_AS_DESCRIBED">Item not as described</option>
                <option value="CHANGED_MIND">Changed my mind</option>
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Upload Evidence (Max 5 images)</label>
              <p className="text-xs text-slate-500 mb-3">Please upload clear photos of the item and its packaging.</p>
              
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
                    <span className="text-xs font-semibold text-slate-500">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
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
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Return Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestPage;
