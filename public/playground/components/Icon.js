function Icon({ iconName }) {
  try {
    return (
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-[var(--secondary-color)]"
        data-name="icon"
        data-file="components/Icon.js"
      >
        <div className={`icon-${iconName} text-2xl text-[var(--primary-color)]`}></div>
      </div>
    );
  } catch (error) {
    console.error('Icon component error:', error);
    return null;
  }
}