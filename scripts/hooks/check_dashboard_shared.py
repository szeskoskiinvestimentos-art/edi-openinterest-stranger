#!/usr/bin/env python
"""
check_dashboard_shared.py
==========================
Pre-commit hook (E95b-prevention 2026-06-21).

Bloqueia commit se `dashboard_unificado/shared/js/` ou `dashboard_unificado/shared/css/`
tiver arquivos DELETED (D no `git status --short`).

Por quê?
----------
Em 2026-06-21, o `gerar_controle.py` substituiu `dashboard_unificado/` por
versão antiga de `Auto_B3_System/dashboard_unificado/`, deletando 6 arquivos
(E26, E83, E80). Os arquivos só foram recuperados porque existia
`dashboard_unificado._previous/` como backup.

Este hook detecta esse padrão ANTES de propagar via commit.

Uso:
    python scripts/hooks/check_dashboard_shared.py

Exit codes:
    0 = OK
    1 = ERRO (deletions detectadas, abortar commit)
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# Pastas críticas que NÃO devem ter deletions
GUARD_PATHS = [
    "dashboard_unificado/shared/js",
    "dashboard_unificado/shared/css",
]


def main() -> int:
    try:
        r = subprocess.run(
            ["git", "status", "--short"] + GUARD_PATHS,
            cwd=str(ROOT), capture_output=True, text=True, timeout=10,
        )
    except (subprocess.TimeoutExpired, FileNotFoundError) as e:
        print(f"[shared-guard] WARN: git nao disponivel ({e}). Pulando check.")
        return 0

    if r.returncode != 0:
        print(f"[shared-guard] git status falhou (rc={r.returncode}):")
        print(r.stderr)
        return 0  # não bloquear por erro de git

    deletions: list[str] = []
    for line in r.stdout.splitlines():
        # formato git status: "XY path"
        # X = index, Y = working tree
        # D = deletado no working tree ou staged
        if not line:
            continue
        status = line[:2]
        path = line[3:].strip()
        if "D" in status and any(gp in path for gp in GUARD_PATHS):
            deletions.append(path)

    if deletions:
        print("[shared-guard] ERRO: arquivos criticos de shared/ estao DELETED:")
        for d in deletions:
            print(f"  D  {d}")
        print()
        print("Estes arquivos sao criticos (E26 split-view, E83 heatmap, E80 daytrade).")
        print("Restaure com:")
        print("  git checkout HEAD -- dashboard_unificado/shared/")
        print("Ou do backup dashboard_unificado._previous/ se existir.")
        print()
        print("Para commitar mesmo assim (emergencia): git commit --no-verify")
        return 1

    print(f"[shared-guard] OK ({len(GUARD_PATHS)} paths monitorados)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
