import { useState } from "react";
import { getFaviconMeta, getFaviconSources } from "../utils/favicon";

export default function Favicon({ url, favIconUrl }) {
  const meta = getFaviconMeta(url);
  const sources = getFaviconSources(url, favIconUrl);
  const [errorState, setErrorState] = useState({ key: "", index: 0 });

  const key = `${url}|${favIconUrl || ""}`;
  const sourceIndex = errorState.key === key ? errorState.index : 0;
  const source = sources[sourceIndex];

  return (
    <span
      className={`favicon favicon-${meta.tone}${source ? " has-image" : ""}`}
      aria-hidden="true"
    >
      {source ? (
        <img
          src={source}
          alt=""
          onError={() => setErrorState({ key, index: sourceIndex + 1 })}
        />
      ) : (
        meta.letter
      )}
    </span>
  );
}
