import { ActionPanel, List, Action, Icon } from "@raycast/api";
import { useExec } from "@raycast/utils";
import { useState } from "react";
import { saveSettings } from "./settings";

export default function Command() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [pickedDomains, setPickedDomains] = useState<string[]>([]);

  const { data: domains, isLoading } = useExec("defaults", ["domains"], {
    parseOutput(args) {
      return args.stdout
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    },
  });

  const { data: domainDetail, isLoading: isLoadingDetails } = useExec("defaults", ["read", selectedDomain || ""], {
    parseOutput(args) {
      return args.stdout.split("\n").slice(0, 100).join("\n");
    },
    execute: !!selectedDomain,
  });

  const nonPickedDomains = domains?.filter((x) => !pickedDomains.includes(x)) || [];

  return (
    <List isLoading={isLoading} onSelectionChange={setSelectedDomain} isShowingDetail>
      <List.Section title="Picked Domains">
        {pickedDomains?.map((domain) => {
          return (
            <List.Item
              key={domain}
              id={domain}
              icon={Icon.Checkmark}
              title={domain}
              detail={
                <List.Item.Detail markdown={`\`\`\`\n${domainDetail}\n\`\`\`` || ""} isLoading={isLoadingDetails} />
              }
              actions={
                <ActionPanel>
                  <Action
                    title="Unpick"
                    onAction={() => {
                      setPickedDomains((x) => x.filter((y) => y !== domain));
                    }}
                  />
                  <Action
                    title="Save Settings"
                    onAction={() => {
                      saveSettings(pickedDomains);
                    }}
                    shortcut={{ key: "s", modifiers: ["cmd"] }}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
      <List.Section title="Other Domains">
        {nonPickedDomains?.map((domain) => {
          return (
            <List.Item
              key={domain}
              id={domain}
              title={domain}
              detail={
                <List.Item.Detail markdown={`\`\`\`\n${domainDetail}\n\`\`\`` || ""} isLoading={isLoadingDetails} />
              }
              actions={
                <ActionPanel>
                  <Action
                    title="Pick"
                    onAction={() => {
                      setPickedDomains((x) => [...x, domain]);
                    }}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
