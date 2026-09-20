export type ProjectStatus = "featured" | "archive";

export interface Project {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly technologies: readonly string[];
  readonly year: number;
  readonly status: ProjectStatus;
  readonly href?: string;
}
