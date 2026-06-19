"""
clean_chrome_profile.py
=======================
Limpa o Chrome profile preservando arquivos de autenticação.
Uso:
    python scripts/hooks/clean_chrome_profile.py
    python scripts/hooks/clean_chrome_profile.py --dry-run
"""
from __future__ import annotations
import argparse
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PROFILE = ROOT / "Auto_B3_System" / "chrome_profile"

# Arquivos em chrome_profile/Default/ a MANTER (estado de login, preferências, extensões)
KEEP_FILES = {
    "Login Data", "Login Data-journal",
    "Login Data For Account", "Login Data For Account-journal",
    "Preferences", "Secure Preferences",
    "Web Data", "Web Data-journal",
    "History", "History-journal",
    "Top Sites", "Top Sites-journal",
    "Bookmarks", "Bookmarks-journal",
    "Favicons", "Favicons-journal",
    "Account Web Data", "Account Web Data-journal",
    "Affiliation Database", "Affiliation Database-journal",
    "DIPS", "DIPS-wal",
    "passkey_enclave_state", "trusted_vault.pb",
    "Network Action Predictor", "Network Action Predictor-journal",
    "ServerCertificate", "ServerCertificate-journal",
    "heavy_ad_intervention_opt_out.db", "heavy_ad_intervention_opt_out.db-journal",
    "Shortcuts", "Shortcuts-journal",
    "SharedStorage", "SharedStorage-wal",
    "BrowsingTopicsSiteData", "BrowsingTopicsSiteData-journal",
    "BrowsingTopicsState",
    "PreferredApps",
    "BookmarkMergedSurfaceOrdering",
    "README", "LOCK",  # Chrome internals
    # Cookies (se existir — segurança de manter)
    "Cookies", "Cookies-journal",
}

# Diretórios em chrome_profile/Default/ a MANTER (estado de extensões e storage)
KEEP_DIRS = {
    "Extensions",                  # Extensões instaladas
    "Local Extension Settings",    # Settings por extensão
    "Local Storage",               # State de páginas autenticadas
}

# Diretórios em chrome_profile/ a MANTER (None = manter todos os de Default)
# Para outros diretórios no nível chrome_profile/, podemos deletar tudo exceto:
KEEP_PROFILE_ROOT = set()  # não manter nada além de Default/


def _mb(p: Path) -> float:
    if p.is_file():
        return p.stat().st_size / (1024 * 1024)
    return sum(f.stat().st_size for f in p.rglob("*") if f.is_file()) / (1024 * 1024)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Apenas lista, nao deleta")
    args = parser.parse_args()

    if not PROFILE.exists():
        print(f"[ERRO] Profile nao encontrado: {PROFILE}")
        return 1

    removed_files: list[str] = []
    removed_dirs: list[str] = []
    kept_files: list[str] = []
    kept_dirs: list[str] = []
    total_freed_mb = 0.0

    # 1. chrome_profile/Default/ — protecao rigorosa
    default_dir = PROFILE / "Default"
    if default_dir.exists():
        for item in default_dir.iterdir():
            if item.is_file():
                size_mb = _mb(item)
                if item.name in KEEP_FILES:
                    kept_files.append(f"Default/{item.name}")
                else:
                    if not args.dry_run:
                        item.unlink()
                    removed_files.append(f"Default/{item.name}")
                    total_freed_mb += size_mb
            elif item.is_dir():
                if item.name in KEEP_DIRS:
                    kept_dirs.append(f"Default/{item.name}/")
                else:
                    size_mb = _mb(item)
                    if not args.dry_run:
                        shutil.rmtree(item)
                    removed_dirs.append(f"Default/{item.name}/")
                    total_freed_mb += size_mb

    # 2. chrome_profile/* (outros diretorios no nivel do profile) — caches gerais
    for item in PROFILE.iterdir():
        if item == default_dir:
            continue
        if item.name in KEEP_PROFILE_ROOT:
            continue
        if item.is_file():
            size_mb = _mb(item)
            if not args.dry_run:
                item.unlink()
            removed_files.append(item.name)
            total_freed_mb += size_mb
        elif item.is_dir():
            size_mb = _mb(item)
            if not args.dry_run:
                shutil.rmtree(item)
            removed_dirs.append(f"{item.name}/")
            total_freed_mb += size_mb

    print("=" * 60)
    print(f"Chrome profile: {PROFILE}")
    print("=" * 60)
    print(f"\n[+] Mantidos (autenticacao/estado):")
    for f in sorted(kept_files):
        print(f"    FILE  {f}")
    for d in sorted(kept_dirs):
        print(f"    DIR   {d}")
    print(f"\n[-] Removidos (cache/regeneraveis):")
    for f in sorted(removed_files):
        print(f"    FILE  {f}")
    for d in sorted(removed_dirs):
        print(f"    DIR   {d}")
    print(f"\n[INFO] {'(DRY-RUN) ' if args.dry_run else ''}Liberado: {total_freed_mb:.1f} MB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
