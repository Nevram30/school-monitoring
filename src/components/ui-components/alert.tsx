'use client';

import React, { useState, useEffect } from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type: AlertType;
    title?: string;
    message: string;
    isVisible: boolean;
    onClose?: () => void;
    autoClose?: boolean;
    autoCloseDelay?: number;
    className?: string;
}

const Alert: React.FC<AlertProps> = ({
    type,
    title,
    message,
    isVisible,
    onClose,
    autoClose = true,
    autoCloseDelay = 5000,
    className = ''
}) => {
    const [show, setShow] = useState(isVisible);

    useEffect(() => {
        setShow(isVisible);
    }, [isVisible]);

    useEffect(() => {
        if (show && autoClose) {
            const timer = setTimeout(() => {
                setShow(false);
                if (onClose) {
                    setTimeout(() => onClose(), 300); // Wait for animation to complete
                }
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [show, autoClose, autoCloseDelay, onClose]);

    const handleClose = () => {
        setShow(false);
        if (onClose) {
            setTimeout(() => onClose(), 300); // Wait for animation to complete
        }
    };

    const getAlertStyles = () => {
        switch (type) {
            case 'success':
                return {
                    container: 'bg-green-50 border-green-200',
                    icon: 'text-green-400',
                    title: 'text-green-800',
                    message: 'text-green-700',
                    button: 'text-green-500 hover:text-green-600 hover:bg-green-100'
                };
            case 'error':
                return {
                    container: 'bg-red-50 border-red-200',
                    icon: 'text-red-400',
                    title: 'text-red-800',
                    message: 'text-red-700',
                    button: 'text-red-500 hover:text-red-600 hover:bg-red-100'
                };
            case 'warning':
                return {
                    container: 'bg-yellow-50 border-yellow-200',
                    icon: 'text-yellow-400',
                    title: 'text-yellow-800',
                    message: 'text-yellow-700',
                    button: 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-100'
                };
            case 'info':
                return {
                    container: 'bg-blue-50 border-blue-200',
                    icon: 'text-blue-400',
                    title: 'text-blue-800',
                    message: 'text-blue-700',
                    button: 'text-blue-500 hover:text-blue-600 hover:bg-blue-100'
                };
            default:
                return {
                    container: 'bg-gray-50 border-gray-200',
                    icon: 'text-gray-400',
                    title: 'text-gray-800',
                    message: 'text-gray-700',
                    button: 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
                };
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return CheckCircleIcon;
            case 'error':
                return XCircleIcon;
            case 'warning':
                return ExclamationTriangleIcon;
            case 'info':
                return InformationCircleIcon;
            default:
                return InformationCircleIcon;
        }
    };

    const styles = getAlertStyles();
    const IconComponent = getIcon();

    if (!isVisible) return null;

    return (
        <div
            className={`
        fixed top-4 right-4 z-50 max-w-md w-full
        transform transition-all duration-300 ease-in-out
        ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${className}
      `}
        >
            <div className={`
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        ${styles.container}
      `}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <IconComponent className={`h-5 w-5 ${styles.icon}`} />
                    </div>
                    <div className="ml-3 flex-1">
                        {title && (
                            <h3 className={`text-sm font-medium ${styles.title}`}>
                                {title}
                            </h3>
                        )}
                        <p className={`text-sm ${title ? 'mt-1' : ''} ${styles.message}`}>
                            {message}
                        </p>
                    </div>
                    {onClose && (
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`
                    inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${styles.button}
                  `}
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Alert;
