import { codeToHtml } from "shiki";

export async function highlightTsx(code: string): Promise<string> {
  return codeToHtml(code, {
    lang: "tsx",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}
