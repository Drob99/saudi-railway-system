const Tooltip = ({ children, content, open = undefined }) => {
  if (!content) return children;
  
  return (
    <div className="relative group">
      {children}
      <div 
        className={`
          absolute bottom-full mb-2 left-1/2 -translate-x-1/2
          transition-all duration-200
          ${open === undefined ? 'opacity-0 group-hover:opacity-100' : open ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {content}
        </div>
        <div className="border-t-4 border-x-4 border-transparent border-t-gray-900 w-0 h-0 mx-auto" />
      </div>
    </div>
  );
};

export default Tooltip;