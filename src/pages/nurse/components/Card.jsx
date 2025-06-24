export const Card = ({ children, className = "" }) => {
    return (
        <div className={`rounded-lg bg-white border shadow-sm ${className}`}>
            {children}
        </div>
    );
};