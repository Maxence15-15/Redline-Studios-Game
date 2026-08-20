#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures_util::StreamExt;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use tauri::{Emitter, Manager};

#[derive(Clone, Serialize)]
struct DownloadProgress {
    game_id: String,
    downloaded: u64,
    total: u64,
}

#[tauri::command]
async fn download_game(
    app: tauri::AppHandle,
    game_id: String,
    url: String,
    dest_path: String,
    expected_sha256: Option<String>,
) -> Result<String, String> {
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    if !response.status().is_success() {
        return Err(format!("HTTP {}", response.status()));
    }
    let total = response.content_length().unwrap_or(0);

    let mut file = std::fs::File::create(&dest_path).map_err(|e| e.to_string())?;
    let mut hasher = Sha256::new();
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        hasher.update(&chunk);
        downloaded += chunk.len() as u64;

        let _ = app.emit(
            "download-progress",
            DownloadProgress {
                game_id: game_id.clone(),
                downloaded,
                total,
            },
        );
    }

    if let Some(expected) = expected_sha256 {
        let computed = format!("{:x}", hasher.finalize());
        if computed != expected {
            let _ = std::fs::remove_file(&dest_path);
            return Err(format!(
                "Checksum invalide (attendu {expected}, obtenu {computed})"
            ));
        }
    }

    Ok(dest_path)
}

#[tauri::command]
fn get_install_dir(app: tauri::AppHandle) -> Result<String, String> {
    let dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| e.to_string())?
        .join("games");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.to_string_lossy().to_string())
}

/// Extrait une archive .zip téléchargée dans un sous-dossier dédié au jeu.
/// Retourne le chemin du dossier extrait.
#[tauri::command]
fn extract_game(zip_path: String, game_id: String) -> Result<String, String> {
    let zip_file_path = Path::new(&zip_path);
    let parent = zip_file_path
        .parent()
        .ok_or_else(|| "Chemin de zip invalide".to_string())?;
    let extract_dir = parent.join(format!("{game_id}_extracted"));

    if extract_dir.exists() {
        fs::remove_dir_all(&extract_dir).map_err(|e| e.to_string())?;
    }
    fs::create_dir_all(&extract_dir).map_err(|e| e.to_string())?;

    let file = fs::File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = match entry.enclosed_name() {
            Some(p) => extract_dir.join(p),
            None => continue,
        };

        if entry.name().ends_with('/') {
            fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = outpath.parent() {
                fs::create_dir_all(p).map_err(|e| e.to_string())?;
            }
            let mut outfile = fs::File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut entry, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    Ok(extract_dir.to_string_lossy().to_string())
}

fn find_exe_in_dir(dir: &Path) -> Option<PathBuf> {
    // Noms à ignorer : utilitaires internes UE5/Unity qui ne sont pas le jeu lui-même.
    const IGNORE: &[&str] = &[
        "unrealcefsubprocess",
        "crashreportclient",
        "crashreportclienteditor",
        "unitycrashhandler",
        "battleye",
        "easyanticheat",
        "vc_redist",
        "ueprereqsetup",
    ];

    let entries = fs::read_dir(dir).ok()?;
    let mut candidates: Vec<PathBuf> = Vec::new();

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            if let Some(found) = find_exe_in_dir(&path) {
                candidates.push(found);
            }
        } else if let Some(ext) = path.extension() {
            if ext.eq_ignore_ascii_case("exe") {
                let name = path
                    .file_stem()
                    .map(|s| s.to_string_lossy().to_lowercase())
                    .unwrap_or_default();
                if !IGNORE.iter().any(|ig| name.contains(ig)) {
                    candidates.push(path);
                }
            }
        }
    }

    candidates.into_iter().next()
}

/// Lance l'exécutable du jeu. Si `exe_relative_path` est fourni (depuis le
/// manifeste), on l'utilise directement ; sinon on cherche automatiquement
/// le premier .exe pertinent dans le dossier extrait.
#[tauri::command]
fn launch_game(extract_dir: String, exe_relative_path: Option<String>) -> Result<(), String> {
    let base = PathBuf::from(&extract_dir);

    let exe_path = if let Some(rel) = exe_relative_path {
        base.join(rel)
    } else {
        find_exe_in_dir(&base)
            .ok_or_else(|| "Aucun exécutable trouvé dans le dossier extrait".to_string())?
    };

    if !exe_path.exists() {
        return Err(format!("Exécutable introuvable : {}", exe_path.display()));
    }

    let working_dir = exe_path.parent().unwrap_or(&base);

    std::process::Command::new(&exe_path)
        .current_dir(working_dir)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

fn wishlist_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("wishlist.json"))
}

#[tauri::command]
fn get_wishlist(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let path = wishlist_path(&app)?;
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let ids: Vec<String> = serde_json::from_str(&content).unwrap_or_default();
    Ok(ids)
}

#[tauri::command]
fn toggle_wishlist(app: tauri::AppHandle, game_id: String) -> Result<Vec<String>, String> {
    let path = wishlist_path(&app)?;
    let mut ids: Vec<String> = if path.exists() {
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Vec::new()
    };

    if let Some(pos) = ids.iter().position(|id| id == &game_id) {
        ids.remove(pos);
    } else {
        ids.push(game_id);
    }

    let serialized = serde_json::to_string(&ids).map_err(|e| e.to_string())?;
    fs::write(&path, serialized).map_err(|e| e.to_string())?;

    Ok(ids)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            download_game,
            get_install_dir,
            extract_game,
            launch_game,
            get_wishlist,
            toggle_wishlist
        ])
        .run(tauri::generate_context!())
        .expect("erreur au lancement du launcher");
}
