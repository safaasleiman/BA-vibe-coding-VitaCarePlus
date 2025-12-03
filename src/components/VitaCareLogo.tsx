interface VitaCareLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const VitaCareLogo = ({ className = "", size = "md" }: VitaCareLogoProps) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-baseline ${className}`}>
      <span className={`${sizeClasses[size]} font-bold text-primary`}>VITA</span>
      <span className={`${sizeClasses[size]} font-medium text-accent`}>care</span>
      <span className={`${sizeClasses[size]} font-bold text-accent`}>+</span>
    </div>
  );
};
