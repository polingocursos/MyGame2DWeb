# 💾 SISTEMA DE BACKUP
> Pasta para guardar snapshots do código entre sessões de desenvolvimento.

---

## Como usar

### Antes de começar uma nova funcionalidade grande
Copie os arquivos relevantes para `snapshots/` com data e descrição:
```
snapshots/
  2026-10-05_v0.1.0_setup-inicial/
  2026-10-12_v0.2.0_lobby-criado/
  2026-10-20_v0.3.0_player-basico/
```

### Sessões automáticas (agent)
A cada sessão de desenvolvimento, o agente salva um log em `sessions/`:
```
sessions/
  session_2026-10-05.md   ← o que foi feito nesta sessão
  session_2026-10-12.md
```

---

## 📌 ÚLTIMO ESTADO CONHECIDO

- **Data:** 2026-10-05
- **Versão:** v0.1.0
- **Estado:** Apenas estrutura de pastas, sem código ainda
- **Próximos passos:** Ver CHANGELOG.md
