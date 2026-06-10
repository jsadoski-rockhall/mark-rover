// markdown-it-task-lists ships no type definitions of its own.
declare module "markdown-it-task-lists" {
  import type { PluginWithOptions } from "markdown-it";

  export interface TaskListsOptions {
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
  }

  const taskLists: PluginWithOptions<TaskListsOptions>;
  export default taskLists;
}
