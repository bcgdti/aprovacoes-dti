// ════════════════════════════════════════════════════════════════
// dti · Aprovações de conteúdo — backend (Google Apps Script)
// Cole este arquivo inteiro no editor de script da sua planilha.
// ════════════════════════════════════════════════════════════════

// URL do webhook do Power Automate (Teams). Veja INSTRUCOES.md, passo "Teams".
// Deixe "" para desativar as notificações.
const TEAMS_WEBHOOK_URL = "https://default9c853ba5ce7c4b719b14429ce4db79.dd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/7239e20f507145ef85724e38166a52ee/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=FZerY3fG65RWkxoePi-OnW2V_s2VDrKDnTuGcCjxuWA";

// E-mails do Teams de cada pessoa — usados para as @menções pingarem.
const TEAM_EMAILS = {
  "Alice": "alice.goncalves@dtidigital.com.br",
  "Aline": "aline.mendes@dtidigital.com.br",
  "Bruna": "bruna.alvim@dtidigital.com.br",
  "Pedro": "pedro.martino@dtidigital.com.br",
  "Luís": "luis.soares@dtidigital.com.br",
  "Marcela": "marcela.assis@dtidigital.com.br",
  "Henrique": "henrique.abinajm@dtidigital.com.br",
};

const SHEET_NAME = "Conteúdos";

const HEADERS = [
  "ID", "Data de envio", "Autor", "Canal", "Tipo de aprovação",
  "Título/descrição", "Conteúdo", "Link de mídia", "Status",
  "Check de IA confirmado", "Aprovador principal", "Data de postagem",
  "Comentários do aprovador", "Data da decisão", "Comentários no texto (JSON)",
  "Versão corrigida", "Aprovador secundário", "Parecer do secundário",
  "Comentário do secundário", "Precisa aprovação externa", "Contato externo",
  "Status externo", "Comentário externo", "Data externa"
];

const KEYS = [
  "id", "dataEnvio", "autor", "canal", "tipoAprovacao",
  "titulo", "conteudo", "linkMidia", "status",
  "checkIA", "aprovador", "dataPostagem",
  "comentarios", "dataDecisao", "notas", "versaoCorrigida",
  "aprovadorSecundario", "parecerSecundario", "comentarioSecundario",
  "precisaExterna", "contatoExterno", "statusExterno", "comentarioExterno", "dataExterna"
];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < HEADERS.length) {
    // Migração: garante todas as colunas e reescreve o cabeçalho.
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sh.setFrozenRows(1);
  }
  return sh;
}

// ── GET: lista todos os conteúdos ───────────────────────────────
function doGet() {
  try {
    return json({ ok: true, items: listItems() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function rowToObj(r) {
  const tz = Session.getScriptTimeZone();
  const o = {};
  KEYS.forEach(function (k, i) {
    let v = r[i];
    if (v instanceof Date) {
      v = Utilities.formatDate(v, tz, k === "dataPostagem" ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm");
    }
    o[k] = v === undefined || v === null ? "" : String(v);
  });
  o.checkIA = o.checkIA === "true" || o.checkIA === "TRUE" || o.checkIA === "Sim" || o.checkIA === true;
  o.precisaExterna = o.precisaExterna === "true" || o.precisaExterna === "TRUE" || o.precisaExterna === "Sim" || o.precisaExterna === true;
  try { o.notas = o.notas ? JSON.parse(o.notas) : []; } catch (e) { o.notas = []; }
  return o;
}

function listItems() {
  const sh = getSheet();
  if (sh.getLastRow() < 2) return [];
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, KEYS.length).getValues();
  return rows.filter(function (r) { return r[0]; }).map(rowToObj).reverse();
}

function cellValue(k, item) {
  if (k === "notas") return JSON.stringify(item.notas || []);
  if (k === "checkIA") return item.checkIA ? "true" : "";
  if (k === "precisaExterna") return item.precisaExterna ? "true" : "";
  return item[k] === undefined || item[k] === null ? "" : item[k];
}

// ── POST: cria ou atualiza um conteúdo ──────────────────────────
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    const sh = getSheet();

    if (body.action === "create") {
      const item = body.item || {};
      item.id = nextId(sh);
      item.dataEnvio = nowStr();
      sh.appendRow(KEYS.map(function (k) { return cellValue(k, item); }));
      notifyTeams("Novo conteúdo enviado", item);
      return json({ ok: true, item: item });
    }

    if (body.action === "update") {
      const ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues();
      for (let r = 0; r < ids.length; r++) {
        if (String(ids[r][0]) === String(body.id)) {
          const row = r + 2;
          const patch = body.patch || {};
          KEYS.forEach(function (k, c) {
            if (patch.hasOwnProperty(k)) {
              const one = {}; one[k] = patch[k];
              sh.getRange(row, c + 1).setValue(cellValue(k, one));
            }
          });
          // Lê o item atualizado e notifica conforme a mudança.
          const merged = rowToObj(sh.getRange(row, 1, 1, KEYS.length).getValues()[0]);
          const label = updateLabel(patch);
          if (label) notifyTeams(label, merged);
          return json({ ok: true });
        }
      }
      return json({ ok: false, error: "ID não encontrado: " + body.id });
    }

    if (body.action === "delete") {
      const ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues();
      for (let r = 0; r < ids.length; r++) {
        if (String(ids[r][0]) === String(body.id)) {
          sh.deleteRow(r + 2);
          return json({ ok: true });
        }
      }
      return json({ ok: false, error: "ID não encontrado: " + body.id });
    }

    if (body.action === "notify") {
      if (body.acao && body.item) notifyTeams(body.acao, body.item);
      return json({ ok: true });
    }

    return json({ ok: false, error: "Ação desconhecida." });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Decide o rótulo da notificação a partir do que mudou.
function updateLabel(patch) {
  if (patch.statusExterno === "Aprovado") return "Aprovação externa concluída";
  if (patch.statusExterno === "Com ressalvas") return "Ajustes solicitados (aprovação externa)";
  if (patch.status === "Aguardando aprovação externa") return "Aprovado internamente — aguardando externa";
  if (patch.status === "Aprovado") return "Conteúdo aprovado";
  if (patch.parecerSecundario === "Com ressalvas") return "Ajustes solicitados pelo 2º aprovador";
  if (patch.status === "Ajustes solicitados") return "Ajustes solicitados";
  if (patch.hasOwnProperty("versaoCorrigida") && patch.status === "Aguardando aprovação") return "Versão corrigida reenviada";
  if (patch.parecerSecundario) return "Parecer do secundário: " + patch.parecerSecundario;
  if (patch.hasOwnProperty("notas")) return ""; // comentários no texto não notificam o Teams
  return "Conteúdo atualizado";
}

// ── Notificação no Teams (Power Automate Workflows) ─────────────
function notifyTeams(acao, item) {
  if (!TEAMS_WEBHOOK_URL) return;
  try {
    const msg = buildTeamsMessage(acao, item);

    const body = [{ type: "TextBlock", text: '"' + item.titulo + '" - ' + item.id, wrap: true, weight: "Bolder", size: "Medium" }];
    msg.lines.forEach(function (ln) {
      body.push({ type: "TextBlock", text: ln.text, wrap: true, spacing: "Small", weight: ln.bold ? "Bolder" : "Default" });
    });

    const content = {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.4",
      body: body,
    };
    if (msg.entities.length) content.msteams = { entities: msg.entities };

    const card = {
      type: "message",
      attachments: [{ contentType: "application/vnd.microsoft.card.adaptive", content: content }],
    };

    UrlFetchApp.fetch(TEAMS_WEBHOOK_URL, {
      method: "post",
      contentType: "application/json",
      muteHttpExceptions: true,
      payload: JSON.stringify(card),
    });
  } catch (err) {
    // Notificação nunca deve quebrar o fluxo principal.
  }
}

// Monta as linhas e as @menções de cada tipo de notificação.
function buildTeamsMessage(acao, item) {
  const entities = [];
  const seen = {};
  // Cria token de menção <at>Nome</at> e registra a entidade (id = e-mail).
  function at(name) {
    const email = TEAM_EMAILS[name];
    if (!email) return name || "";
    if (!seen[name]) {
      seen[name] = true;
      entities.push({ type: "mention", text: "<at>" + name + "</at>", mentioned: { id: email, name: name } });
    }
    return "<at>" + name + "</at>";
  }
  function aprovadores() {
    let s = "Aprovador principal: " + at(item.aprovador);
    if (item.aprovadorSecundario) s += ". 2º aprovador: " + at(item.aprovadorSecundario);
    return s;
  }

  const lines = [];
  const add = (text, bold) => lines.push({ text: text, bold: !!bold });

  if (acao === "Novo conteúdo enviado") {
    add("Status: Aguardando aprovação 🕐", true);
    add(aprovadores());
    add("Conteúdo por: " + item.autor);
    if (item.precisaExterna) add("Aprovação externa depois com: " + item.contatoExterno);
  } else if (acao === "Aprovado internamente — aguardando externa") {
    add("Status: Aguardando aprovação externa 🌐", true);
    add("Aprovado internamente por: " + at(item.aprovador));
    add("Aprovação externa com: " + item.contatoExterno);
    add("Responsável: " + at(item.autor));
  } else if (acao === "Aprovação externa concluída") {
    add("Status: Aprovado ✅", true);
    add("Aprovado externamente por: " + item.contatoExterno);
    add("Conteúdo por: " + item.autor);
  } else if (acao === "Ajustes solicitados (aprovação externa)") {
    add("Status: Ajustes solicitados ✏️", true);
    add("Ressalvas externas (" + item.contatoExterno + ")");
    add("Conteúdo por: " + at(item.autor));
  } else if (acao === "Conteúdo aprovado") {
    add("Status: Aprovado ✅", true);
    add("Aprovado por: " + at(item.aprovador));
    add("Conteúdo por: " + item.autor);
  } else if (acao === "Ajustes solicitados") {
    add("Status: Ajustes solicitados ✏️", true);
    add("Solicitado por: " + at(item.aprovador));
    add("Conteúdo por: " + at(item.autor));
  } else if (acao === "Ajustes solicitados pelo 2º aprovador") {
    add("Status: Ajustes solicitados ✏️", true);
    add("Ressalvas do 2º aprovador: " + at(item.aprovadorSecundario));
    add("Conteúdo por: " + at(item.autor));
  } else if (acao === "Versão corrigida reenviada") {
    add("Status: Aguardando aprovação 🔄", true);
    add("Reenviado por: " + at(item.autor));
    add(aprovadores());
  } else if (acao.indexOf("Parecer do secundário") === 0) {
    const ressalva = item.parecerSecundario === "Com ressalvas";
    add("Parecer do 2º aprovador: " + (item.parecerSecundario || "registrado") + (ressalva ? " ⚠️" : " 👍"), true);
    add("Por: " + at(item.aprovadorSecundario));
    add("Decisão final com: " + at(item.aprovador));
  } else if (acao === "Novo comentário no texto") {
    add("Novo comentário no texto 💬", true);
    add("Conteúdo por: " + at(item.autor));
    add("Aprovador: " + at(item.aprovador));
  } else {
    add("Status: " + item.status, true);
    add(aprovadores());
    add("Conteúdo por: " + item.autor);
  }

  return { lines: lines, entities: entities };
}

// ── Helpers ─────────────────────────────────────────────────────
function nextId(sh) {
  let max = 0;
  if (sh.getLastRow() >= 2) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().forEach(function (v) {
      const m = String(v[0]).match(/^C-(\d+)/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
  }
  return "C-" + String(max + 1).padStart(3, "0");
}

function nowStr() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
