import { showToast, Toast } from "@raycast/api";
import { Octokit } from "@octokit/core";
import fetch from "node-fetch";
import { execa } from "execa";
import { authorize } from "./oauth";

export async function saveSettings(domains: string[]) {
  const toast = await showToast({ style: Toast.Style.Animated, title: "Saving settings..." });
  const octokit = new Octokit({
    auth: await authorize(),
    request: { fetch },
  });

  const response = await octokit.request("GET /gists");

  console.log(response.data);

  let gist: { id?: string } | undefined = response.data.find((x) => x.description === "macOS Settings Backup");

  const files = (
    await Promise.all(
      domains.map(async (domain) => {
        const content = await execa("defaults", ["export", domain, "-"]);

        return { name: `${domain}.plist`, content: content.stdout.trim() };
      }),
    )
  ).reduce(
    (acc, file) => {
      acc[file.name] = { content: file.content };

      return acc;
    },
    {} as Record<string, { content: string }>,
  );

  if (gist && gist.id) {
    await octokit.request("PATCH /gists/{gist_id}", {
      gist_id: gist.id,
      files,
    });
  } else {
    gist = (
      await octokit.request("POST /gists", {
        description: "macOS Settings Backup",
        public: false,
        files,
      })
    ).data;
  }

  toast.title = "Settings saved!";
  toast.style = Toast.Style.Success;
}
