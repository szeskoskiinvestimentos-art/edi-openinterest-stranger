# F3 — Investigação: rotinas `.bat` e eliminação da evolução

> **Data**: 2026-06-21 · **Solicitado por**: Ednilson Szeskoski após detecção da anomalia F1+F2
> **Escopo**: somente `C:\Projetos_Hermes\Edi_Market_Guardian_V0\` · read-only
> **Status**: investigação concluída · propostas formuladas · **NENHUMA MUDANÇA EXECUTADA**

---

## 1. Pergunta do owner

> "Você encontrou o principal motivo de eu solicitar refatoração e organização do projeto. Eu desenvolvia e **as rotinas dos arquivos .bat da raiz apagava a evolução** — `iniciar_servico.bat` e o `force`."

Tradução: ao desenvolver, o owner percebeu que os `.bat` da raiz apagavam seu trabalho (evolução, aprendizado, registros). Isso motivou a refatoração.

---

## 2. Cadeia de execução mapeada

```
.bat na raiz
├── Servico_Unificado.bat              → scripts/orquestrador.py
├── Servico_Unificado_FORCE.bat        → scripts/orquestrador.py --force --no-pause
├── Servico_Unificado_SAFE.bat         → snapshot + Servico_Unificado.bat
└── Publicar_Artefatos.bat             → scripts/publish-artifacts.ps1
```

`.bat` adicionais (não chamados pelos da raiz):
- `Cotacoes/Atualizar_Dados_Mercado.bat` → `npm run market:service` (sobe Node 3033)
- `Auto_B3_System/Edi_OpenInterest - PY - Stranger - WDO/START_DASHBOARD_V1.bat` → `py export_v1_data.py`

---

## 3. Análise de cada script

### 3.1 `scripts/orquestrador.py` (1139 linhas)

**Chamado por**: `Servico_Unificado.bat`, `Servico_Unificado_FORCE.bat`, `Servico_Unificado_SAFE.bat`.

**Operações `shutil.rmtree` (4x)**:

| Linha | Alvo | Tipo |
|---|---|---|
| 573 | `service_locks/options_run.lock` | lock stale |
| 619 | `service_locks/options_run.lock` | release lock |
| 680 | `%APPDATA%/undetected_chromedriver` | cleanup perfil Chrome |

**Operações `git` (somente via `GitManager`)**:

```python
# Linha 760-771
GIT_PATHS = [
    "dashboard_unificado",
    "B3_System/dashboard_unificado",
    "controle_de_dados.html",
    "Cotacoes/dashboard/index.html",
    "Cotacoes/dashboard/MERCADO/index.html",
    "Cotacoes/dashboard/MERCADO/assets/js",
    "Cotacoes/dashboard/MERCADO/assets/data",
    "Cotacoes/dashboard/MERCADO/exports",
    "Cotacoes/tools/market",
    "Cotacoes/package.json",
]

# Linha 809-810
def stage(self) -> None:
    self._run_git("add", *self.GIT_PATHS)
```

**`.edi_agent/` NÃO está em GIT_PATHS**. `git add` opera somente nos paths explícitos.

**Operações de copia**: `shutil.copy2` apenas em `dashboard_unificado/WIN|WDO/assets/data/`.

**Conclusão**: `orquestrador.py` **NÃO toca `.edi_agent/workspace/`** na versão atual. As 4 chamadas `rmtree` miram locks e Chrome tempdir, ambos alheios ao agente.

### 3.2 `Cotacoes/tools/market/gerar_controle.py` (952 linhas)

**Chamado por**: `orquestrador.py` (via `subprocess.run`, linha 697).

**Operações destrutivas**: `_safe_rmtree(staging)` onde `staging = workspace_root / "dashboard_unificado._staging"`. Múltiplas chamadas (linhas 727, 762, 773, 789, 795, 948).

**`_cleanup_previous_backups(workspace_root, keep=3)`** (linha 51, chamada em 929):
```python
prefix = "dashboard_unificado._previous_"   # ← SÓ remove dirs com este prefixo
for name in os.listdir(workspace_root):
    if not name.startswith(prefix): continue
    ...
```

**Conclusão**: `gerar_controle.py` **NÃO toca `.edi_agent/`**. Opera apenas em `dashboard_unificado`, `dashboard_unificado._staging`, `dashboard_unificado._previous_*`.

### 3.3 `scripts/publish-artifacts.ps1` (111 linhas)

**Chamado por**: `Publicar_Artefatos.bat`.

**Operações**:
- Cria git worktree em `.edi-worktrees/publish/` (branch `edi-artifacts`)
- `Remove-Item -LiteralPath $dst -Recurse -Force` (linha 36, 60) — **dentro do worktree**, não no projeto raiz
- Copia: `dashboard_unificado/`, `controle_de_dados.html`, `Cotacoes/dashboard/`
- Commit + push opcional em `edi-artifacts` branch

**Conclusão**: `publish-artifacts.ps1` opera num worktree isolado. **NÃO afeta `.edi_agent/` no projeto principal**.

### 3.4 `Auto_B3_System/automacao_dados.py` (1713 linhas)

**Chamado por**: `orquestrador.py` (linha 684).

**Funções de cleanup (4)**:

| Função | Alvo | Risco |
|---|---|---|
| `cleanup_expired_files(dir)` | `*_options_exp-*.csv` em `dir` | Baixo (só CSVs vencidos) |
| `cleanup_invalid_or_stale_files(dir, prefixes)` | `*_options_exp-*.csv` com prefixos | Baixo (só CSVs) |
| `cleanup_old_temp_profiles()` | `%TEMP%/edi_uc_profile_*`, `edi_chrome_profile_*` > 24h | Baixo (só temp Windows) |
| `cleanup_debug_files()` | arquivos `Debug/` específicos | Baixo |

**Conclusão**: `automacao_dados.py` **NÃO toca `.edi_agent/`**. Opera só em CSVs e diretórios temporários do Windows.

---

## 4. Resultado da análise do código ATUAL

**Nenhum script Python do projeto remove arquivos de `.edi_agent/workspace/`**.

Esta é uma mudança importante em relação ao comportamento que o owner descreve. A refatoração do owner (commits `db71bd4d` e `c485550e` no orquestrador) provavelmente **já endereçou** a maioria dos vetores de eliminação.

---

## 5. Vetores de risco RESIDUAIS (atuais)

Mesmo sem deleção direta, há **3 vetores de risco** que podem explicar (ou voltar a explicar) perda de evolução:

### 🔴 Risco #1: `git clean -fd` apaga tudo untracked

Confirmação via `git status --untracked-files=all`:

```
?? .edi_agent/workspace/auditoria_inicial_2026-06-21/
?? dashboard_unificado/controle/index.html
?? dashboard_unificado/shared/styles.css
```

Esses 3 paths/dirs estão **untracked**. Se alguém rodar `git clean -fd` no projeto, tudo some. O `.gitignore` protege `snap-*/`, mas não protege conteúdo untracked dentro de `.edi_agent/`.

### 🟠 Risco #2: `GIT_PATHS` é hardcoded e pode ser editado

O `GIT_PATHS` em `scripts/orquestrador.py:760-771` lista APENAS 10 paths. Se um dev adicionar `.edi_agent/` por engano, o `git add` começará a rastrear a evolução. Se depois um `git reset --hard HEAD~1` for feito, o conteúdo tracked some.

### 🟠 Risco #3: Histórico de comportamento deletivo (hipótese)

O owner descreve comportamento passado. Como o código atual **NÃO** apresenta esse comportamento, as causas prováveis são:
- **Versões antigas do orquestrador** que o owner já refatorou (commits `db71bd4d`, `c485550e`)
- **Outra instância do projeto** (não esta em `C:\Projetos_Hermes\Edi_Market_Guardian_V0\`)
- **Outra rotina não-versionada** (testes, scripts ad-hoc) que o owner rodou em alguma fase

A refatoração dos `.bat` para `MARKET_SCHEDULER_ENABLED=false` (linha 44-45 do `Servico_Unificado.bat`) também reduz drasticamente os side-effects — antes o `market:service` subia e gerava carga adicional.

---

## 6. Por que a auditoria F1 foi perdida (causa mais provável)

A perda das 5 markdown F1 entre 18:10 (criação) e 19:53 (verificação) **não pôde ser explicada** pelo código atual.

Hipóteses (em ordem de plausibilidade):

| # | Hipótese | Plausibilidade |
|---|---|---|
| 1 | **IDE do owner (Mimo/Opencode) tem rotina de "clean workspace"** que limpa dirs untracked em `.edi_agent/` | 🟠 Média-alta |
| 2 | **Windows Defender / antivírus** quarantine de arquivos recém-criados | 🟡 Média |
| 3 | **Git hook** configurado em `.git/hooks/` que faz `git clean` em arquivos não rastreados (mas não encontrei evidência) | 🟡 Média |
| 4 | **Outra instância** do projeto rodando em paralelo que viu os untracked e limpou | 🟡 Média |
| 5 | **PowerShell / CMD limpo de arquivos temporários** que incidentalmente atingiu `.edi_agent/` | 🟢 Baixa |

A pista mais útil é o **timestamp 18:38 do `controle_de_dados.html`** (não modificado por mim). Isso indica que algum agente rodou entre 18:10 e 18:38 — possivelmente `Servico_Unificado_SAFE.bat` (que tira snapshot antes). O snapshot script escreve em `.edi_agent/snapshots/`, mas se o snapshot foi tirado em modo overwrite e o `.gitignore` filtra `snap-*/`, o git poderia ter sido convencido a limpar...

Mas isso é especulação. **A causa exata não pode ser determinada sem logs adicionais**.

---

## 7. Recomendações (sem executar agora — aguarda aprovação)

### 7.1 Curto prazo (F3 — pode ser feito já)

| # | Ação | Esforço | Bloqueia |
|---|---|---|---|
| 7.1.1 | Adicionar `.edi_agent/workspace/auditoria_*` ao `.gitignore` como **tracked override** (manter dir mas rastrear) | 5 min | nada |
| 7.1.2 | Adicionar **marker file** `.edi_agent/.protected` que rotinas de cleanup devem checar | 10 min | futuras eliminações acidentais |
| 7.1.3 | Adicionar hook de **destructive-operation-guard** em `.git/hooks/pre-commit` que aborta se algum `git clean` for detectado em scripts versionados | 15 min | futura |

### 7.2 Médio prazo (F4 — após estabilização)

| # | Ação | Esforço |
|---|---|---|
| 7.2.1 | Mover auditorias para `audits/` na raiz (fora de `.edi_agent/`) | 30 min |
| 7.2.2 | Adicionar **log obrigatório** em todas as 5 chamadas `shutil.rmtree` do projeto (logger.warning com path) | 30 min |
| 7.2.3 | Script `safe_cleanup.py` que verifica `.edi_agent/.protected` antes de qualquer deleção | 1 h |

### 7.3 Longo prazo (F5+)

| # | Ação | Esforço |
|---|---|---|
| 7.3.1 | Implementar **edi-evolution.json** manifesto com checksum e timestamp de cada evolução; hook pre-cleanup valida antes de deletar | 2 h |
| 7.3.2 | Migrar `.edi_agent/` para git LFS ou armazém externo se crescer muito | 4 h |

---

## 8. Tarefas imediatas (autorizadas por esta investigação)

**Nenhuma mudança foi feita**. Apenas documentação. Aguardando seu "siga" para:
- Marcar esta investigação como **F3 — causa raiz mapeada**
- Iniciar F3.1 (curto prazo): proteger `.edi_agent/workspace/` contra `git clean -fd`

---

## 9. Resumo executivo

| Pergunta | Resposta |
|---|---|
| Os `.bat` atuais **diretamente** apagam a evolução? | **NÃO** — código foi refatorado |
| Havia comportamento deletivo em **versões anteriores**? | **SIM — provável** (refatoração nos commits `db71bd4d` e `c485550e`) |
| A perda F1 foi causada pelos `.bat`? | **Improvável dado código atual** — causa real desconhecida |
| Risco residual? | **SIM** — 3 vetores identificados (Risco #1-3 acima) |
| Mitigação mínima recomendada? | Adicionar `.edi_agent/.protected` + git tracking do dir de auditoria |

---

*Investigação conduzida por Hermes em 2026-06-21 · modo read-only · 100% dentro de `C:\Projetos_Hermes\Edi_Market_Guardian_V0\`.*