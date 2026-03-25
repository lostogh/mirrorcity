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
  const res = await fetch("./Names.json");
  const data = await res.json();

  data.m_names.Array.forEach(n => {
    nameMap[n.m_id] = (n.m_kor || "").trim();
  });
}

async function loadScript() {
  const res = await fetch("./str.json");
  const data = await res.json();

  const container = document.getElementById("content");
  container.innerHTML = "";

  data.forEach(line => {

    if (!line) return;

    let text = line.text || "";
    if (!text) return;

    let name = "나레이션";

    // 🔥 1순위: code
    if (line.code && codeMap[line.code]) {
      name = codeMap[line.code];
    }

    // 🔹 2순위: nameId
    else if (line.nameId && nameMap[line.nameId]) {
      name = nameMap[line.nameId];
    }

    // 🔹 3순위: 텍스트 <i>이름</i>
    else {
      const match = text.match(/<i>(.*?)<\/i>/);
      if (match) {
        name = match[1];
      }
    }

    // 🔹 태그 변환
    text = text
      .replace(/<name>/g, "[주인공]")
      .replace(/<i>/g, "<em>")
      .replace(/<\/i>/g, "</em>")
      .replace(/<color=#(.*?)>(.*?)<\/color>/g,
        '<span style="color:#$1">$2</span>');

    const div = document.createElement("div");
    div.className = "line";

    div.innerHTML = `
      <div class="name">${name}</div>
      <div class="text">${text}</div>
    `;

    container.appendChild(div);
  });
}

async function init() {
  await loadNames();
  await loadScript();
}

init();