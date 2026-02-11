/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
}

declare var dataLayer: any[];
declare var gtag: (...args: any[]) => void;
