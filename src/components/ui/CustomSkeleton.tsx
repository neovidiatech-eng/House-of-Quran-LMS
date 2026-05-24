export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="w-full animate-pulse">
            <div className="flex border-b border-gray-200 bg-gray-50 py-4 px-6">
                {[...Array(columns)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-24 mx-2"></div>
                ))}
            </div>

            {[...Array(rows)].map((_, rowIndex) => (
                <div key={rowIndex} className="flex border-b border-gray-100 py-5 px-6 items-center">
                    {[...Array(columns)].map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className={`h-3 bg-gray-100 rounded mx-2 ${colIndex === 0 ? 'w-32' : 'w-20'
                                }`}
                        ></div>
                    ))}
                </div>
            ))}
        </div>
    );
};
