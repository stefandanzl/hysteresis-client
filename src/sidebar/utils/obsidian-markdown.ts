import { renderMathAndMarkdown as originalRenderMathAndMarkdown } from '@hypothesis/annotation-ui';
import { escapeHtml } from '../markdown-commands';

/**
 * Enhanced markdown rendering with Obsidian integration and fallback
 * 
 * This function provides:
 * 1. Integration with Obsidian's native markdown rendering when available
 * 2. Fallback to original Showdown+KaTeX rendering when Obsidian is not available
 * 3. Safe content sanitization and error handling
 * 
 * @param markdown - The markdown content to render
 * @returns HTML string of the rendered markdown
 */
export function renderObsidianMathAndMarkdown(markdown: string): string {
  // Try Obsidian integration first
  if (typeof window !== 'undefined' && window['renderObsidianMarkdown']) {
    try {
      return window['renderObsidianMarkdown'](markdown);
    } catch (error) {
      console.warn('Obsidian markdown rendering failed, falling back to original:', error);
      // Fall back to original rendering
    }
  }
  
  // Fallback to original rendering
  try {
    return originalRenderMathAndMarkdown(markdown);
  } catch (error) {
    console.error('Original markdown rendering failed:', error);
    // Ultimate fallback: escape HTML and return as-is
    return `<div class="markdown-error">${escapeHtml(markdown)}</div>`;
  }
}

/**
 * Sets up Obsidian CSS synchronization
 * This ensures the hypothesis sidebar uses the same styling as the Obsidian interface
 */
export function setupObsidianCSSSync(): void {
  if (!top?.window.app?.plugins?.getPlugin("obsidian-annotator")) {
    console.log('Obsidian annotator plugin not found, CSS sync disabled');
    return;
  }

  try {
    const styleObserver = top.window.app.plugins.getPlugin("obsidian-annotator").styleObserver;
    
    if (!styleObserver || typeof styleObserver.listen !== 'function') {
      console.log('Style observer not available, CSS sync disabled');
      return;
    }

    styleObserver.listen((style: string) => {
      const styleEl = document.getElementById("obsidianStyles") || 
        document.head.appendChild(document.createElement('style'));
      styleEl.id = "obsidianStyles";
      styleEl.innerHTML = style;
    });

    console.log('Obsidian CSS synchronization enabled');
  } catch (error) {
    console.error('Failed to set up Obsidian CSS sync:', error);
  }
}

/**
 * Global function for Obsidian to call for markdown rendering
 * This is the entry point that Obsidian will use
 */
declare global {
  interface Window {
    renderObsidianMarkdown?: (markdown: string) => string;
  }
}

/**
 * Initialize Obsidian integration
 * This should be called when the sidebar app starts
 */
export function initializeObsidianIntegration(): void {
  // Set up the global function that Obsidian can call
  window.renderObsidianMarkdown = renderObsidianMathAndMarkdown;
  
  // Set up CSS synchronization
  setupObsidianCSSSync();
  
  console.log('Obsidian integration initialized');
}