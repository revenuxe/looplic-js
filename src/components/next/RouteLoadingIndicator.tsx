"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AppLoader } from "@/src/components/next/AppLoader";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isSamePageAnchor(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");

  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return true;
  }

  const target = anchor.getAttribute("target");
  if (target && target !== "_self") {
    return true;
  }

  const url = new URL(anchor.href, window.location.href);
  return url.origin !== window.location.origin || url.href === window.location.href;
}

export function RouteLoadingIndicator() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (showTimerRef.current) window.clearTimeout(showTimerRef.current);

    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 180);
  }, [pathname]);

  useEffect(() => {
    function beginLoading(delay = 120, fallbackDuration = 1800) {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);

      showTimerRef.current = window.setTimeout(() => {
        setVisible(true);
      }, delay);

      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, fallbackDuration);
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (anchor && !isSamePageAnchor(anchor)) {
        beginLoading(80, 4000);
        return;
      }

      const button = target?.closest("button") as HTMLButtonElement | null;

      if (!button || button.disabled || button.closest("[data-no-route-loader]")) {
        return;
      }

      beginLoading(220, 900);
    }

    function handlePopState() {
      beginLoading(60, 4000);
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className={`route-loader ${visible ? "route-loader--visible" : ""}`} aria-hidden={!visible}>
      <div className="route-loader__scrim" />
      <div className="route-loader__center">
        <AppLoader label="Loading" />
      </div>
    </div>
  );
}
