'use client';

import { useState, useCallback } from 'react';
import { AlertType } from './alert';

interface AlertState {
    type: AlertType;
    title?: string;
    message: string;
    isVisible: boolean;
}

export const useAlert = () => {
    const [alert, setAlert] = useState<AlertState>({
        type: 'info',
        message: '',
        isVisible: false
    });

    const showAlert = useCallback((
        type: AlertType,
        message: string,
        title?: string
    ) => {
        setAlert({
            type,
            title,
            message,
            isVisible: true
        });
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(prev => ({
            ...prev,
            isVisible: false
        }));
    }, []);

    const showSuccess = useCallback((message: string, title?: string) => {
        showAlert('success', message, title);
    }, [showAlert]);

    const showError = useCallback((message: string, title?: string) => {
        showAlert('error', message, title);
    }, [showAlert]);

    const showWarning = useCallback((message: string, title?: string) => {
        showAlert('warning', message, title);
    }, [showAlert]);

    const showInfo = useCallback((message: string, title?: string) => {
        showAlert('info', message, title);
    }, [showAlert]);

    return {
        alert,
        showAlert,
        hideAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
};
