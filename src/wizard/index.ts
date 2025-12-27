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

// Source Registry
export {
  sourceRegistry,
  getSourceContent,
  hasSourceFile,
  getRegisteredFiles,
} from './sourceRegistry';

// Snippet Extraction
export {
  extractLines,
  getLineCount,
  getLine,
  validateRange,
  getSpecificLines,
  type ExtractionResult,
  type ExtractionError,
} from './SnippetExtractor';

// Syntax Highlighting
export {
  SyntaxHighlighter,
  getHighlighter,
  type HighlightedOutput,
  type HighlightOptions,
} from './SyntaxHighlighter';

// Code Snippet Engine
export {
  CodeSnippetEngine,
  createCodeSnippetEngine,
  SourceNotFoundError,
  type HighlightedCode,
  type HighlightedLine,
} from './CodeSnippetEngine';

// Annotation Rendering
export {
  ANNOTATION_CLASSES,
  calculateAnnotationPositions,
  renderAnnotationGutter,
  renderAnnotationContent,
  applyAnnotationsToLines,
  getAnnotationIcon,
  groupAnnotationsByLine,
  type RenderedAnnotation,
  type AnnotationRenderOptions,
} from './AnnotationRenderer';
