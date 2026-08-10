import { cn } from '@src/lib/utils';
import type { RuntimeBannerConfig } from '@src/utils/theme';
import type React from 'react';
import { useEffect, useRef } from 'react';

// Block CSS injection vectors: rule terminators, braces, HTML chars,
// url()/expression()/javascript: (mirrors the nebari-landing banner guard).
const UNSAFE_CSS = /[;<>{}"'\\]|url\s*\(|expression\s*\(|javascript:/i;

/** Returns the value unchanged if it is a safe CSS token, otherwise undefined. */
export const safeCssValue = (value: string | undefined): string | undefined => {
  return value && !UNSAFE_CSS.test(value) ? value : undefined;
};

interface BannerProps {
  /**
   * Which edge of the screen the banner is pinned to. Also selects the CSS
   * variable (--top-banner-height / --bottom-banner-height) the rest of the
   * layout uses to make room for it.
   */
  position: 'top' | 'bottom';
  /**
   * Banner configuration from /services/japps/config.json
   * (c.JAppsConfig.banners). Renders nothing when no text is configured.
   */
  config?: RuntimeBannerConfig;
}

/**
 * Full-width text banner (e.g. platform notices or CUI classification
 * markings) pinned above the navbar or below the page content. Text is
 * rendered as plain text (never HTML). Color values pass through the
 * UNSAFE_CSS guard; unsafe values fall back to the theme's inverted colors,
 * which follow light/dark mode.
 */
export const Banner = ({
  position,
  config,
}: BannerProps): React.ReactElement | null => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const hasText = Boolean(config?.text);

  // Publish the rendered height so the fixed navbar, sidebar and content
  // offsets (which consume the variable with a 0px fallback) shift to make
  // room. ResizeObserver keeps it accurate when the text wraps on resize.
  useEffect(() => {
    const element = bannerRef.current;
    const root = document.documentElement;
    const heightVariable = `--${position}-banner-height`;
    if (!element) {
      return;
    }
    const updateHeight = () => {
      root.style.setProperty(heightVariable, `${element.offsetHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty(heightVariable);
    };
  }, [position, hasText]);

  if (!config?.text) {
    return null;
  }

  const background = safeCssValue(config.background);
  const foreground = safeCssValue(config.foreground);

  return (
    <div
      ref={bannerRef}
      role="note"
      data-testid={`${position}-banner`}
      // The theme-inverted fallback utilities are only applied when no custom
      // color is configured: Tailwind is compiled with important:true here, so
      // they would beat the inline style.
      className={cn(
        'fixed inset-x-0 z-1300 w-full py-1 text-center text-sm font-semibold',
        position === 'top' ? 'top-0' : 'bottom-0',
        !background && 'bg-foreground',
        !foreground && 'text-background',
      )}
      style={{ backgroundColor: background, color: foreground }}
    >
      {config.text}
    </div>
  );
};

export default Banner;
