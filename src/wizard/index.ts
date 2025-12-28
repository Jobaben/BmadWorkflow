/**
 * Wizard Module Exports
 *
 * Central export point for all wizard layer types and classes.
 */

// Types
export {
  ComplexityTier,
  type HighlightType,
  type CodeSnippetRef,
  type Annotation,
  type ParameterBinding,
  type WizardStep,
} from './types';

// Registry
export { ConceptRegistry } from './ConceptRegistry';

// Snippet Extraction
export {
  extractLines,
  snippetToString,
  getSnippetLineCount,
  isLineFocused,
  detectMinIndent,
} from './SnippetExtractor';
export type { ExtractedSnippet, ExtractOptions } from './SnippetExtractor';

// Syntax Highlighting
export {
  highlightCode,
  initializeHighlighter,
  disposeHighlighter,
  isHighlighterReady,
} from './SyntaxHighlighter';
export type { HighlightOptions, HighlightResult } from './SyntaxHighlighter';

// Code Snippet Engine
export { CodeSnippetEngine, SourceNotFoundError } from './CodeSnippetEngine';
export type { HighlightedCode } from './CodeSnippetEngine';

// Source Registry
export { sourceRegistry, getSourceFile, hasSourceFile, getAvailableSourceFiles } from './sourceRegistry';

// Demo Adapter
export { DemoAdapter } from './DemoAdapter';
export type {
  DemoFactory,
  DemoAdapterEvent,
  DemoAdapterEventListener,
  DemoAdapterEventData,
} from './DemoAdapter';

// Wizard Controller
export { WizardController } from './WizardController';
export type {
  StepChangeEvent,
  StepChangeCallback,
  WizardControllerConfig,
} from './WizardController';
