import React from 'react';
import { Link } from 'react-router-dom';
import { IoChevronForward } from "react-icons/io5";

const Breadcrumb = ({ items }) => {
    return (
        <div className="flex items-center gap-2 mb-6 text-sm">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <IoChevronForward className="text-gray-400" />
                    )}
                    {index === items.length - 1 ? (
                        <span className="text-gray-600 font-medium">
                            {item.label}
                        </span>
                    ) : (
                        <Link
                            to={item.path}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            {item.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumb;