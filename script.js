let nameMap = {};

let codeMap = {
  npc01: "나도환",
  npc02: "백민우",
  npc03: "차주연",
  npc04: "안내인",
  npc05: "강희수",
  npc06: "지시아",
  npc07: "지시온",
  npc08: "켄",
  npc09: "양첸",
  npc11: "고수아",
  npc12: "하루",
  npc13: "이린",
  npc14: "남영훈",
  npc15: "김이경",
  npc16: "고스트",
  npc17: "코치"
};

async function loadNames() {
  const res = await fetch("./script/Names.json");
  const data = await res.json();

  data.m_names.Array.forEach(n => {
    nameMap[n.m_id] = (n.m_kor || "").trim();
  });
}

async function loadScript() {
  const res = await fetch("./script/str.json");
  const data = await res.json();

  const container = document.getElementById("content");
  container.innerHTML = "";

  data.forEach(line => {

    if (!line) return;

    let text = line.text || "";
    if (!text) return;

    let name = "나레이션";

    // 1순위: code
    if (line.code && codeMap[line.code]) {
      name = codeMap[line.code];
    }

    // 2순위: nameId
    else if (line.nameId && nameMap[line.nameId]) {
      name = nameMap[line.nameId];
    }

    // 3순위: <i>태그
    else {
      const match = text.match(/<i>(.*?)<\/i>/);
      if (match) {
        name = match[1];
      }
    }

    // 태그 변환
    text = text
      .replace(/<name>/g, "[주인공]")
      .replace(/<i>/g, "<em>")
      .replace(/<\/i>/g, "</em>")
      .replace(/<color=#(.*?)>(.*?)<\/color>/g,
        '<span style="color:#$1">$2</span>');

    // =========================
    // 🔥 여기부터가 핵심 (CSS 맞춤 구조)
    // =========================

    const card = document.createElement("div");
    card.className = "script-card";

    const speaker = document.createElement("div");

    // 나레이션 / 캐릭터 구분
    if (name === "나레이션") {
      speaker.className = "speaker narration";
    } else {
      speaker.className = "speaker character";
    }

    speaker.innerText = name;

    const lineDiv = document.createElement("div");
    lineDiv.className = "line";

    lineDiv.innerHTML = text;

    card.appendChild(speaker);
    card.appendChild(lineDiv);

    container.appendChild(card);
  });
}

async function init() {
  await loadNames();
  await loadScript();
}

init();