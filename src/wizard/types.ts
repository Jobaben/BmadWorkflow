/**
 * Wizard Core Types
 *
 * Type definitions for the wizard learning experience layer.
 * These types define the structure for wizard steps, annotations,
 * code snippets, and complexity categorization.
 *
 * @see ARCHITECTURE.md - Concept Registry component
 */

import { DemoType } from '../types';

/**
 * Complexity tier for categorizing learning concepts.
 * Used to progressively introduce concepts from simple to advanced.
 *
 * @see FR-006 (Concept Categorization)
 */
export enum ComplexityTier {
  /** Single concept, typically < 10 lines of code */
  Micro = 'micro',
  /** Combined concepts, patterns */
  Medium = 'medium',
  /** Full feature integration */
  Advanced = 'advanced',
}

/**
 * Highlight type for code annotations.
 * Determines the visual styling of the annotation.
 */
export type HighlightType = 'concept' | 'pattern' | 'warning' | 'tip';

/**
 * Reference to a code snippet within a source file.
 * Used to extract and display specific portions of demo source code.
 *
 * @see FR-002 (Code Snippet Display)
 */
export interface CodeSnippetRef {
  /** Unique identifier for this snippet */
  id: string;
  /** Relative path from src/ to the source file */
  sourceFile: string;
  /** Starting line number (1-indexed) */
  startLine: number;
  /** Ending line number (1-indexed, inclusive) */
  endLine: number;
  /** Optional display title for the snippet */
  title?: string;
  /** Optional lines to emphasize within the snippet */
  focusLines?: number[];
}

/**
 * Annotation linked to specific code regions.
 * Provides explanatory content for code sections.
 *
 * @see FR-003 (Explanatory Annotations)
 */
export interface Annotation {
  /** Unique identifier for this annotation */
  id: string;
  /** Starting line number (1-indexed) */
  lineStart: number;
  /** Ending line number (1-indexed, inclusive) */
  lineEnd: number;
  /** Markdown-supported explanation content */
  content: string;
  /** Visual style category for the annotation */
  highlightType: HighlightType;
}

/**
 * Binding between UI parameter controls and code locations.
 * Enables live highlighting of code when parameters are adjusted.
 *
 * @see FR-005 (Live Parameter Connection)
 */
export interface ParameterBinding {
  /** Parameter key matching ParameterSchema.key */
  parameterKey: string;
  /** Location of the parameter in source code */
  codeLocation: CodeSnippetRef;
  /** Variable name as it appears in code */
  variableName: string;
  /** Explanation of what this parameter controls */
  explanation: string;
}

/**
 * Complete definition of a wizard step (learning unit).
 * Each step teaches one or more related concepts with code examples.
 *
 * @see FR-001 (Wizard Navigation)
 * @see Architecture - WizardStep interface
 */
export interface WizardStep {
  /** Unique identifier (e.g., 'particle-emission-basics') */
  id: string;
  /** Display title for the step */
  title: string;
  /** Complexity classification */
  tier: ComplexityTier;
  /** Which demo to display with this step */
  demoType: DemoType;
  /** Markdown-supported explanation of the concept */
  description: string;
  /** List of learning objectives for this step */
  learningObjectives: string[];
  /** Code snippets to display */
  codeSnippets: CodeSnippetRef[];
  /** Annotations for the code */
  annotations: Annotation[];
  /** Optional parameter-to-code bindings */
  parameters?: ParameterBinding[];
  /** Position in recommended learning path (lower = earlier) */
  order: number;
  /** Optional step IDs that should be completed first */
  prerequisites?: string[];
}
