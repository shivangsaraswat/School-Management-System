"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

interface HeaderConfig {
    title: string;
    description?: string;
    backLink?: {
        label: string;
        href: string;
    };
    actions?: React.ReactNode;
}

interface HeaderContextType extends HeaderConfig {
    setHeader: (config: HeaderConfig) => void;
    clearHeader: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<HeaderConfig>({ title: "" });

    const setHeader = useCallback((newConfig: HeaderConfig) => {
        setConfig(newConfig);
    }, []);

    const clearHeader = useCallback(() => {
        setConfig({ title: "" });
    }, []);

    const value = useMemo(() => ({
        ...config,
        setHeader,
        clearHeader
    }), [config, setHeader, clearHeader]);

    return (
        <HeaderContext.Provider value={value}>
            {children}
        </HeaderContext.Provider>
    );
}

export function useHeader() {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error("useHeader must be used within a HeaderProvider");
    }
    return context;
}

interface HeaderUpdaterProps {
    title: string;
    description?: string;
    backLink?: { label: string; href: string };
    children?: React.ReactNode;
}

export function HeaderUpdater({ title, description, backLink, children }: HeaderUpdaterProps) {
    const { setHeader, clearHeader } = useHeader();

    useEffect(() => {
        setHeader({ title, description, backLink, actions: children });
        return () => clearHeader();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, description, backLink?.label, backLink?.href, children]);

    return null;
}
