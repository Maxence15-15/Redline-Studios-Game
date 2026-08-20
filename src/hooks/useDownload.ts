import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { Game } from "../types";

export type DownloadStatus =
  | "idle"
  | "downloading"
  | "extracting"
  | "ready"
  | "launching"
  | "error";

export function useDownload(game: Game, installed: boolean, onInstalled: (id: string) => void) {
  const [status, setStatus] = useState<DownloadStatus>(installed ? "ready" : "idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const extractDirRef = useRef<string | null>(null);

  useEffect(() => {
    setStatus(installed ? "ready" : "idle");
    setProgress(0);
    setError(null);
  }, [game.id, installed]);

  useEffect(() => {
    const unlisten = listen<{ game_id: string; downloaded: number; total: number }>(
      "download-progress",
      (event) => {
        if (event.payload.game_id !== game.id) return;
        const { downloaded, total } = event.payload;
        setProgress(total > 0 ? Math.round((downloaded / total) * 100) : 0);
      }
    );
    return () => {
      unlisten.then((f) => f());
    };
  }, [game.id]);

  const start = useCallback(async () => {
    setStatus("downloading");
    setError(null);
    try {
      const installDir = await invoke<string>("get_install_dir");
      const destPath = `${installDir}/${game.id}.zip`;
      await invoke<string>("download_game", {
        gameId: game.id,
        url: game.downloadUrl,
        destPath,
        expectedSha256: game.sha256 ?? null,
      });

      setStatus("extracting");
      const extractDir = await invoke<string>("extract_game", {
        zipPath: destPath,
        gameId: game.id,
      });
      extractDirRef.current = extractDir;

      setStatus("ready");
      onInstalled(game.id);
    } catch (e) {
      setStatus("error");
      setError(String(e));
    }
  }, [game, onInstalled]);

  const play = useCallback(async () => {
    setStatus("launching");
    setError(null);
    try {
      let extractDir = extractDirRef.current;
      if (!extractDir) {
        const installDir = await invoke<string>("get_install_dir");
        extractDir = `${installDir}/${game.id}_extracted`;
        extractDirRef.current = extractDir;
      }
      await invoke("launch_game", {
        extractDir,
        exeRelativePath: game.exePath ?? null,
      });
      setStatus("ready");
    } catch (e) {
      setStatus("error");
      setError(String(e));
    }
  }, [game]);

  return { status, progress, error, start, play };
}
