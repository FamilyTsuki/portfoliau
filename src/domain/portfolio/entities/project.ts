export type ProjectStatus = "featured" | "in-progress" | "archive";

export interface Project {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly longDescription?: string;
  readonly role?: string;
  readonly technologies: readonly string[];
  readonly year: number;
  readonly status: ProjectStatus;
  readonly metrics?: string;
  readonly demoUrl?: string;
  readonly githubUrl?: string;
}

export interface Profile {
  readonly name: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly bio: string;
  readonly location: string;
  readonly email: string;
  readonly availableForFreelance: boolean;
  readonly github: string;
  readonly linkedin: string;
  readonly twitter?: string;
}
