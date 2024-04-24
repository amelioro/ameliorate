import { useCallback, useMemo, useState } from "react";

import { Button } from "../../ui/Button";
import { Icon } from "../../ui/Icon";
import { Surface } from "../../ui/Surface";

export interface LinkEditorPanelProps {
  initialUrl?: string;
  onSetLink: (url: string) => void;
}

export const useLinkEditorState = ({ initialUrl, onSetLink }: LinkEditorPanelProps) => {
  const [url, setUrl] = useState(initialUrl ?? "");

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  }, []);

  const isValidUrl = useMemo(() => /^(\S+):(\/\/)?\S+$/.test(url), [url]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isValidUrl) {
        onSetLink(url);
      }
    },
    [url, isValidUrl, onSetLink]
  );

  return {
    url,
    setUrl,
    onChange,
    handleSubmit,
    isValidUrl,
  };
};

export const LinkEditorPanel = ({ onSetLink, initialUrl }: LinkEditorPanelProps) => {
  const state = useLinkEditorState({ onSetLink, initialUrl });

  return (
    <Surface className="p-2">
      <form onSubmit={state.handleSubmit} className="flex items-center gap-2">
        <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 cursor-text">
          <Icon name="Link" className="flex-none text-black dark:text-white" />
          <input
            type="url"
            className="flex-1 bg-transparent outline-none min-w-[12rem] text-black text-sm dark:text-white"
            placeholder="Enter URL"
            value={state.url}
            onChange={state.onChange}
          />
        </label>
        <Button variant="primary" buttonSize="small" type="submit" disabled={!state.isValidUrl}>
          Set Link
        </Button>
      </form>
    </Surface>
  );
};
