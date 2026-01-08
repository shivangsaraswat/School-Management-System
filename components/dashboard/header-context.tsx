"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

interface HeaderContextType {
    title: string;
    description?: string;
    backLink?: {
        label: string;
        href: string;
    };
    setHeader: (config: { title: string; description?: string; backLink?: { label: string; href: string } }) => void;
    clearHeader: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<{
        title: string;
        description?: string;
        backLink?: { label: string; href: string };
    }>({ title: "" });

    const setHeader = useCallback((newConfig: { title: string; description?: string; backLink?: { label: string; href: string } }) => {
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

export function HeaderUpdater({ title, description, backLink }: { title: string; description?: string; backLink?: { label: string; href: string } }) {
    const { setHeader, clearHeader } = useHeader();

    useEffect(() => {
        setHeader({ title, description, backLink });
        return () => clearHeader();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, description, backLink?.label, backLink?.href]);

    return null;
}
