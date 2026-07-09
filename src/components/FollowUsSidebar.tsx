import React from 'react';
export const FollowUsSidebar: React.FC = () => {
  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com/nexgengadgets',
      bgColor: 'bg-[#1877F2]',
      icon: (
        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/nexgengadgets',
      bgColor: 'bg-[#833AB4]', 
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      )
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/254717043408',
      bgColor: 'bg-[#25D366]',
      icon: (
        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.528 2.019 14.062.99 11.455.99c-5.447 0-9.873 4.373-9.877 9.803-.002 1.76.477 3.478 1.39 4.987l-.933 3.409 3.622-.937zm12.35-5.26c-.307-.154-1.82-.9-2.102-1.002-.281-.102-.486-.154-.69.154-.204.307-.791.997-.969 1.199-.178.203-.357.228-.664.075-1.54-.772-2.532-1.258-3.535-2.983-.263-.452.263-.42.753-1.4.08-.165.04-.308-.02-.462-.06-.154-.486-1.173-.666-1.605-.176-.424-.352-.366-.486-.373-.125-.006-.27-.007-.413-.007-.143 0-.377.054-.573.271-.197.216-.75.733-.75 1.788 0 1.055.766 2.072.872 2.215.106.143 1.51 2.3 3.656 3.226.51.22 1.086.35 1.637.355.556.006 1.066-.254 1.468-.314.449-.068 1.82-.744 2.078-1.462.257-.718.257-1.333.18-1.461-.077-.128-.282-.205-.59-.359z"/>
        </svg>
      )
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@nexgengadgets',
      bgColor: 'bg-[#000000]',
      icon: (
        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.01c1.306-.022 2.607-.01 3.914-.01.121 2.378 1.5 4.364 3.738 5.163.031.782.008 1.569.008 2.353-.18-.046-.353-.105-.529-.163-1.74-.582-3.07-1.84-3.792-3.486-.016 3.865.016 7.731-.016 11.597-.101 4.544-4.831 7.643-9.141 5.922-3.805-1.52-5.856-5.828-4.604-9.743 1.137-3.56 4.95-5.71 8.528-4.739.016 1.512.016 3.023.016 4.536-2.146-.62-4.521.196-5.185 2.338-.726 2.342.844 4.887 3.284 4.82 2.274-.062 3.863-1.889 3.818-4.218.008-5.328-.008-10.655.016-15.982z"/>
        </svg>
      )
    }
  ];
  return (
    <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-50 flex-col gap-0.5 select-none">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center w-14 h-14 ${link.bgColor} transition-all duration-200 rounded-l shadow-lg overflow-hidden group text-white`}
          aria-label={link.name}
        >
          <div className="shrink-0 group-hover:scale-125 transition-transform duration-200 w-6 h-6 flex items-center justify-center">
            {link.icon}
          </div>
        </a>
      ))}
    </div>
  );
};
export default FollowUsSidebar;
