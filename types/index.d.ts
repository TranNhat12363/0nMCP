/**
 * 0nMCP - Universal AI API Orchestrator
 * Type definitions
 */

// ============================================================
// Core Types
// ============================================================

export interface ServiceConnection {
  $0n: {
    type: 'connection';
    version: string;
    created: string;
    name: string;
  };
  service: string;
  auth: {
    type: 'api_key' | 'bearer' | 'oauth2' | 'basic';
    credentials: Record<string, string>;
  };
  metadata?: Record<string, any>;
}

export interface Workflow {
  $0n: {
    type: 'workflow';
    version: string;
    created: string;
    name: string;
  };
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  error_handling?: ErrorHandling;
}

export interface WorkflowTrigger {
  type: 'webhook' | 'schedule' | 'manual' | 'event';
  config: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  service: string;
  action: string;
  params: Record<string, any>;
  output_as?: string;
  condition?: string;
  on_error?: 'stop' | 'continue' | 'retry';
}

export interface ErrorHandling {
  default: 'stop' | 'continue';
  notify?: NotifyConfig;
}

export interface NotifyConfig {
  service: string;
  action: string;
  params: Record<string, any>;
}

export interface Snapshot {
  $0n: {
    type: 'snapshot';
    version: string;
    created: string;
    name: string;
  };
  source: {
    service: string;
    location_id?: string;
  };
  data: {
    pipelines?: Pipeline[];
    tags?: Tag[];
    custom_values?: CustomValue[];
    workflows?: WorkflowConfig[];
  };
}

// ============================================================
// Service Catalog Types
// ============================================================

export interface ServiceDefinition {
  name: string;
  category: ServiceCategory;
  description: string;
  baseUrl: string;
  authHeader: (creds: Record<string, string>) => Record<string, string>;
  actions: Record<string, ActionDefinition>;
}

export type ServiceCategory = 
  | 'payments'
  | 'communication'
  | 'ai'
  | 'database'
  | 'crm'
  | 'devtools'
  | 'ecommerce'
  | 'marketing'
  | 'scheduling';

export interface ActionDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description?: string;
  params?: ParamDefinition[];
}

export interface ParamDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  description?: string;
}

// ============================================================
// CRM Types (GoHighLevel)
// ============================================================

export interface Pipeline {
  id?: string;
  name: string;
  stages: PipelineStage[];
}

export interface PipelineStage {
  id?: string;
  name: string;
  position: number;
}

export interface Tag {
  id?: string;
  name: string;
}

export interface CustomValue {
  id?: string;
  name: string;
  fieldKey: string;
  value: string;
}

export interface WorkflowConfig {
  id?: string;
  name: string;
  trigger: string;
  actions: WorkflowAction[];
}

export interface WorkflowAction {
  type: string;
  wait?: string;
  config: Record<string, any>;
}

export interface Contact {
  id?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface Opportunity {
  id?: string;
  name: string;
  pipelineId: string;
  stageId: string;
  contactId: string;
  monetaryValue?: number;
  status?: 'open' | 'won' | 'lost' | 'abandoned';
}

// ============================================================
// Orchestration Types
// ============================================================

export interface OrchestrationPlan {
  task: string;
  steps: PlannedStep[];
  estimated_time?: string;
}

export interface PlannedStep {
  step: number;
  service: string;
  action: string;
  params: Record<string, any>;
  reason: string;
}

export interface OrchestrationResult {
  success: boolean;
  task: string;
  steps_executed: number;
  results: StepResult[];
  error?: string;
}

export interface StepResult {
  step: number;
  service: string;
  action: string;
  success: boolean;
  data?: any;
  error?: string;
}

// ============================================================
// Tool Response Types
// ============================================================

export interface ToolResponse {
  content: ToolContent[];
  isError?: boolean;
}

export interface ToolContent {
  type: 'text';
  text: string;
}

// ============================================================
// MCP Types
// ============================================================

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// ============================================================
// Connection Module Exports
// ============================================================

export function initDotOn(): Promise<void>;
export function getConnections(): Promise<Record<string, any>>;
export function saveConnection(service: string, credentials: Record<string, string>): Promise<void>;
export function listConnections(): Promise<ConnectionInfo[]>;
export function deleteConnection(service: string): Promise<boolean>;
export function getServiceCredentials(service: string): Promise<Record<string, string> | null>;
export function migrateLegacy(): Promise<{ migrated: number; services: string[] }>;

export interface ConnectionInfo {
  service: string;
  connected: boolean;
  savedAt?: string;
}

// ============================================================
// Catalog Module Exports
// ============================================================

export const SERVICES: Record<string, ServiceDefinition>;
export function getServiceActions(service: string): Record<string, ActionDefinition> | null;
export function executeAction(
  service: string,
  action: string,
  params: Record<string, any>,
  credentials: Record<string, string>
): Promise<any>;

// ============================================================
// CRM Module Exports
// ============================================================

export const CRM_TOOLS: MCPTool[];
export function listSnapshots(): Promise<SnapshotInfo[]>;
export function loadSnapshot(name: string): Promise<Snapshot | null>;
export function deploySnapshot(snapshot: Snapshot, dryRun?: boolean): Promise<DeployResult>;
export function createSnapshot(name: string): Promise<Snapshot>;
export function searchContacts(query: string): Promise<Contact[]>;
export function upsertContact(data: Partial<Contact>): Promise<Contact>;
export function listPipelines(): Promise<Pipeline[]>;
export function createOpportunity(data: Partial<Opportunity>): Promise<Opportunity>;
export function tagContact(contactId: string, tagName: string): Promise<void>;
export function createTask(data: TaskData): Promise<Task>;
export function sendMessage(contactId: string, message: string, type?: 'sms' | 'email'): Promise<void>;

export interface SnapshotInfo {
  name: string;
  created: string;
  source: string;
}

export interface DeployResult {
  success: boolean;
  dry_run: boolean;
  created: {
    pipelines: number;
    tags: number;
    custom_values: number;
  };
  errors: string[];
}

export interface TaskData {
  title: string;
  contactId?: string;
  dueDate?: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  status: string;
}

// ============================================================
// Orchestrator Module Exports
// ============================================================

export function orchestrate(task: string): Promise<OrchestrationResult>;
