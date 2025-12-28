/**
 * Learning Panel Component
 *
 * Displays educational content for wizard steps including:
 * - Step title and tier badge
 * - Learning objectives
 * - Description text
 * - Code snippets with syntax highlighting
 * - Annotations explaining key concepts
 *
 * @zone SYNC
 * @reason DOM rendering must be synchronous for smooth UI updates
 *
 * @see FR-002 (Code Snippet Display)
 * @see FR-003 (Explanatory Annotations)
 * @see NFR-005 (Accessibility - readable typography)
 */

import type { WizardStep, Annotation } from '../wizard/types';
import { ComplexityTier } from '../wizard/types';
import type { HighlightedCode } from '../wizard/CodeSnippetEngine';
import { CodeDisplay, injectCodeDisplayStyles } from './CodeDisplay';

/**
 * Generate the CSS styles for the learning panel component.
 */
export function getLearningPanelStyles(): string {
  return `
    .learning-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #1a1a2e;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .learning-panel-header {
      flex-shrink: 0;
      padding: 20px 24px;
      background-color: #16213e;
      border-bottom: 1px solid #30363d;
    }

    .learning-panel-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .learning-panel-title {
      font-size: 24px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }

    .learning-panel-tier-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .learning-panel-tier-badge--micro {
      background-color: rgba(46, 160, 67, 0.2);
      color: #7ee787;
      border: 1px solid rgba(46, 160, 67, 0.4);
    }

    .learning-panel-tier-badge--medium {
      background-color: rgba(210, 153, 34, 0.2);
      color: #e3b341;
      border: 1px solid rgba(210, 153, 34, 0.4);
    }

    .learning-panel-tier-badge--advanced {
      background-color: rgba(163, 113, 247, 0.2);
      color: #d2a8ff;
      border: 1px solid rgba(163, 113, 247, 0.4);
    }

    .learning-panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .learning-panel-section {
      margin-bottom: 24px;
    }

    .learning-panel-section:last-child {
      margin-bottom: 0;
    }

    .learning-panel-section-title {
      font-size: 14px;
      font-weight: 600;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .learning-panel-objectives {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .learning-panel-objective {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 0;
      font-size: 16px;
      line-height: 1.5;
    }

    .learning-panel-objective-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(56, 139, 253, 0.2);
      color: #58a6ff;
      border-radius: 50%;
      font-size: 12px;
    }

    .learning-panel-description {
      font-size: 16px;
      line-height: 1.7;
      color: #c9d1d9;
    }

    .learning-panel-description p {
      margin: 0 0 16px 0;
    }

    .learning-panel-description p:last-child {
      margin-bottom: 0;
    }

    .learning-panel-description code {
      background-color: rgba(110, 118, 129, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
      font-size: 14px;
    }

    .learning-panel-code-block {
      margin-bottom: 20px;
    }

    .learning-panel-code-block:last-child {
      margin-bottom: 0;
    }

    .learning-panel-annotations {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .learning-panel-annotation {
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 15px;
      line-height: 1.5;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .learning-panel-annotation-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .learning-panel-annotation-type {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .learning-panel-annotation-lines {
      font-size: 12px;
      color: #8b949e;
    }

    .learning-panel-annotation-content {
      color: #c9d1d9;
    }

    .learning-panel-annotation--concept {
      background-color: rgba(56, 139, 253, 0.1);
      border-left: 3px solid #388bfd;
    }

    .learning-panel-annotation--concept .learning-panel-annotation-type {
      color: #58a6ff;
    }

    .learning-panel-annotation--pattern {
      background-color: rgba(163, 113, 247, 0.1);
      border-left: 3px solid #a371f7;
    }

    .learning-panel-annotation--pattern .learning-panel-annotation-type {
      color: #d2a8ff;
    }

    .learning-panel-annotation--warning {
      background-color: rgba(210, 153, 34, 0.1);
      border-left: 3px solid #d29922;
    }

    .learning-panel-annotation--warning .learning-panel-annotation-type {
      color: #e3b341;
    }

    .learning-panel-annotation--tip {
      background-color: rgba(46, 160, 67, 0.1);
      border-left: 3px solid #2ea043;
    }

    .learning-panel-annotation--tip .learning-panel-annotation-type {
      color: #7ee787;
    }

    .learning-panel-annotation--collapsed .learning-panel-annotation-content {
      display: none;
    }

    .learning-panel-annotation-toggle {
      margin-left: auto;
      color: #8b949e;
      font-size: 12px;
    }

    .learning-panel-parameter-section {
      padding: 16px;
      background-color: rgba(56, 139, 253, 0.05);
      border: 1px dashed rgba(56, 139, 253, 0.3);
      border-radius: 8px;
      min-height: 60px;
    }

    .learning-panel-parameter-placeholder {
      color: #8b949e;
      font-style: italic;
      text-align: center;
    }

    .learning-panel-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #8b949e;
      font-size: 16px;
    }
  `;
}

/**
 * Check if styles have been injected.
 */
let stylesInjected = false;

/**
 * Inject learning panel styles into the document head.
 */
export function injectLearningPanelStyles(): void {
  if (stylesInjected || typeof document === 'undefined') {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'learning-panel-styles';
  styleElement.textContent = getLearningPanelStyles();
  document.head.appendChild(styleElement);
  stylesInjected = true;
}

/**
 * Get tier badge class based on complexity tier.
 */
function getTierBadgeClass(tier: ComplexityTier): string {
  return `learning-panel-tier-badge learning-panel-tier-badge--${tier}`;
}

/**
 * Get tier display label.
 */
function getTierLabel(tier: ComplexityTier): string {
  switch (tier) {
    case ComplexityTier.Micro:
      return 'Micro';
    case ComplexityTier.Medium:
      return 'Medium';
    case ComplexityTier.Advanced:
      return 'Advanced';
    default:
      return String(tier);
  }
}

/**
 * Simple markdown-like parsing for description text.
 * Supports: **bold**, `code`, and paragraph breaks.
 */
function parseDescription(text: string): string {
  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/);

  return paragraphs
    .map((p) => {
      // Handle inline code
      let html = p.replace(/`([^`]+)`/g, '<code>$1</code>');
      // Handle bold
      html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Handle single line breaks as <br>
      html = html.replace(/\n/g, '<br>');
      return `<p>${html}</p>`;
    })
    .join('');
}

/**
 * LearningPanel displays educational content for wizard steps.
 *
 * @example
 * ```typescript
 * const panel = new LearningPanel(container);
 * panel.renderStep(wizardStep, highlightedCodeArray);
 * ```
 */
export class LearningPanel {
  private container: HTMLElement;
  private panelElement: HTMLElement | null = null;
  private contentElement: HTMLElement | null = null;
  private parameterContainer: HTMLElement | null = null;
  private codeDisplays: CodeDisplay[] = [];
  private collapsedAnnotations: Set<string> = new Set();

  /**
   * Create a new LearningPanel.
   *
   * @param container - The HTML element to render into
   */
  constructor(container: HTMLElement) {
    this.container = container;

    // Inject styles on first use
    injectLearningPanelStyles();
    injectCodeDisplayStyles();

    // Create initial structure
    this.createStructure();
  }

  /**
   * Create the panel DOM structure.
   */
  private createStructure(): void {
    this.panelElement = document.createElement('div');
    this.panelElement.className = 'learning-panel';

    // Create empty state
    const emptyState = document.createElement('div');
    emptyState.className = 'learning-panel-empty';
    emptyState.textContent = 'Select a step to view content';
    this.panelElement.appendChild(emptyState);

    this.container.appendChild(this.panelElement);
  }

  /**
   * Render a wizard step's content.
   *
   * @param step - The wizard step to display
   * @param code - Array of highlighted code snippets
   */
  renderStep(step: WizardStep, code: HighlightedCode[]): void {
    if (!this.panelElement) return;

    // Clear existing content and code displays
    this.clear();

    // Create header
    const header = this.createHeader(step);
    this.panelElement.appendChild(header);

    // Create scrollable content area
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'learning-panel-content';

    // Learning objectives section
    if (step.learningObjectives.length > 0) {
      const objectivesSection = this.createObjectivesSection(step.learningObjectives);
      this.contentElement.appendChild(objectivesSection);
    }

    // Description section
    if (step.description) {
      const descriptionSection = this.createDescriptionSection(step.description);
      this.contentElement.appendChild(descriptionSection);
    }

    // Code snippets section
    if (code.length > 0) {
      const codeSection = this.createCodeSection(step, code);
      this.contentElement.appendChild(codeSection);
    }

    // Annotations section (displayed separately for better visibility)
    if (step.annotations.length > 0) {
      const annotationsSection = this.createAnnotationsSection(step.annotations);
      this.contentElement.appendChild(annotationsSection);
    }

    // Parameter controls section (placeholder for story-020)
    const parameterSection = this.createParameterSection();
    this.contentElement.appendChild(parameterSection);

    this.panelElement.appendChild(this.contentElement);
  }

  /**
   * Create the header section with title and tier badge.
   */
  private createHeader(step: WizardStep): HTMLElement {
    const header = document.createElement('div');
    header.className = 'learning-panel-header';

    const titleRow = document.createElement('div');
    titleRow.className = 'learning-panel-title-row';

    const title = document.createElement('h2');
    title.className = 'learning-panel-title';
    title.textContent = step.title;
    titleRow.appendChild(title);

    const badge = document.createElement('span');
    badge.className = getTierBadgeClass(step.tier);
    badge.textContent = getTierLabel(step.tier);
    titleRow.appendChild(badge);

    header.appendChild(titleRow);

    return header;
  }

  /**
   * Create the learning objectives section.
   */
  private createObjectivesSection(objectives: string[]): HTMLElement {
    const section = document.createElement('div');
    section.className = 'learning-panel-section';

    const title = document.createElement('div');
    title.className = 'learning-panel-section-title';
    title.textContent = 'What You\'ll Learn';
    section.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'learning-panel-objectives';

    for (const objective of objectives) {
      const item = document.createElement('li');
      item.className = 'learning-panel-objective';

      const icon = document.createElement('span');
      icon.className = 'learning-panel-objective-icon';
      icon.textContent = '✓';
      item.appendChild(icon);

      const text = document.createElement('span');
      text.textContent = objective;
      item.appendChild(text);

      list.appendChild(item);
    }

    section.appendChild(list);
    return section;
  }

  /**
   * Create the description section.
   */
  private createDescriptionSection(description: string): HTMLElement {
    const section = document.createElement('div');
    section.className = 'learning-panel-section';

    const title = document.createElement('div');
    title.className = 'learning-panel-section-title';
    title.textContent = 'Overview';
    section.appendChild(title);

    const content = document.createElement('div');
    content.className = 'learning-panel-description';
    content.innerHTML = parseDescription(description);
    section.appendChild(content);

    return section;
  }

  /**
   * Create the code snippets section.
   */
  private createCodeSection(step: WizardStep, code: HighlightedCode[]): HTMLElement {
    const section = document.createElement('div');
    section.className = 'learning-panel-section';

    const title = document.createElement('div');
    title.className = 'learning-panel-section-title';
    title.textContent = 'Code';
    section.appendChild(title);

    // Display each code snippet with its title
    for (let i = 0; i < code.length; i++) {
      const snippet = code[i];
      const snippetRef = step.codeSnippets[i];

      const codeBlock = document.createElement('div');
      codeBlock.className = 'learning-panel-code-block';

      const codeContainer = document.createElement('div');
      const codeDisplay = new CodeDisplay(codeContainer, {
        showLineNumbers: true,
        startLineNumber: snippetRef?.startLine ?? 1,
        maxHeight: '300px',
        title: snippetRef?.title ?? `Snippet ${i + 1}`,
        showAnnotations: true,
      });

      codeDisplay.render(snippet);
      this.codeDisplays.push(codeDisplay);

      codeBlock.appendChild(codeContainer);
      section.appendChild(codeBlock);
    }

    return section;
  }

  /**
   * Create the annotations section with expandable items.
   */
  private createAnnotationsSection(annotations: Annotation[]): HTMLElement {
    const section = document.createElement('div');
    section.className = 'learning-panel-section';

    const title = document.createElement('div');
    title.className = 'learning-panel-section-title';
    title.textContent = 'Key Concepts';
    section.appendChild(title);

    const annotationsContainer = document.createElement('div');
    annotationsContainer.className = 'learning-panel-annotations';

    for (const annotation of annotations) {
      const element = this.createAnnotationElement(annotation);
      annotationsContainer.appendChild(element);
    }

    section.appendChild(annotationsContainer);
    return section;
  }

  /**
   * Create a single annotation element.
   */
  private createAnnotationElement(annotation: Annotation): HTMLElement {
    const element = document.createElement('div');
    const isCollapsed = this.collapsedAnnotations.has(annotation.id);
    element.className = `learning-panel-annotation learning-panel-annotation--${annotation.highlightType}${isCollapsed ? ' learning-panel-annotation--collapsed' : ''}`;
    element.dataset.annotationId = annotation.id;

    // Header with type, lines, and toggle
    const header = document.createElement('div');
    header.className = 'learning-panel-annotation-header';

    const typeLabel = document.createElement('span');
    typeLabel.className = 'learning-panel-annotation-type';
    typeLabel.textContent = this.getAnnotationTypeLabel(annotation.highlightType);
    header.appendChild(typeLabel);

    const linesLabel = document.createElement('span');
    linesLabel.className = 'learning-panel-annotation-lines';
    linesLabel.textContent =
      annotation.lineStart === annotation.lineEnd
        ? `Line ${annotation.lineStart}`
        : `Lines ${annotation.lineStart}-${annotation.lineEnd}`;
    header.appendChild(linesLabel);

    const toggle = document.createElement('span');
    toggle.className = 'learning-panel-annotation-toggle';
    toggle.textContent = isCollapsed ? '▸ Show' : '▾ Hide';
    header.appendChild(toggle);

    element.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.className = 'learning-panel-annotation-content';
    content.textContent = annotation.content;
    element.appendChild(content);

    // Add click handler for expand/collapse
    element.addEventListener('click', () => {
      this.toggleAnnotation(annotation.id, element, toggle);
    });

    return element;
  }

  /**
   * Toggle annotation expanded/collapsed state.
   */
  private toggleAnnotation(id: string, element: HTMLElement, toggle: HTMLElement): void {
    const isCollapsed = this.collapsedAnnotations.has(id);

    if (isCollapsed) {
      this.collapsedAnnotations.delete(id);
      element.classList.remove('learning-panel-annotation--collapsed');
      toggle.textContent = '▾ Hide';
    } else {
      this.collapsedAnnotations.add(id);
      element.classList.add('learning-panel-annotation--collapsed');
      toggle.textContent = '▸ Show';
    }
  }

  /**
   * Get display label for annotation type.
   */
  private getAnnotationTypeLabel(type: Annotation['highlightType']): string {
    switch (type) {
      case 'concept':
        return '💡 Concept';
      case 'pattern':
        return '🔧 Pattern';
      case 'warning':
        return '⚠️ Warning';
      case 'tip':
        return '💬 Tip';
      default:
        return 'Note';
    }
  }

  /**
   * Create the parameter controls section (placeholder).
   */
  private createParameterSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'learning-panel-section';

    const title = document.createElement('div');
    title.className = 'learning-panel-section-title';
    title.textContent = 'Parameters';
    section.appendChild(title);

    this.parameterContainer = document.createElement('div');
    this.parameterContainer.className = 'learning-panel-parameter-section';

    const placeholder = document.createElement('div');
    placeholder.className = 'learning-panel-parameter-placeholder';
    placeholder.textContent = 'Parameter controls will appear here';
    this.parameterContainer.appendChild(placeholder);

    section.appendChild(this.parameterContainer);
    return section;
  }

  /**
   * Highlight a parameter in the code display.
   * Called when a parameter control is focused.
   *
   * @param key - The parameter key to highlight
   */
  highlightParameter(key: string): void {
    // This will be implemented when integrating with ParameterCodeLinker (story-020)
    console.log(`Highlighting parameter: ${key}`);
  }

  /**
   * Get the container element for parameter controls.
   * Used by ParameterCodeLinker to inject controls.
   */
  getParameterContainer(): HTMLElement | null {
    return this.parameterContainer;
  }

  /**
   * Clear all content from the panel.
   */
  clear(): void {
    // Dispose code displays
    for (const display of this.codeDisplays) {
      display.clear();
    }
    this.codeDisplays = [];

    // Clear panel content
    if (this.panelElement) {
      this.panelElement.innerHTML = '';
    }

    this.contentElement = null;
    this.parameterContainer = null;
  }

  /**
   * Dispose of the panel and clean up resources.
   */
  dispose(): void {
    this.clear();

    if (this.panelElement && this.panelElement.parentElement) {
      this.panelElement.parentElement.removeChild(this.panelElement);
    }

    this.panelElement = null;
    this.collapsedAnnotations.clear();
  }
}
