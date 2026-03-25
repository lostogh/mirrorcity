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
  const res = await fetch("https://raw.githubusercontent.com/lostogh/mirrorcity/main/script/Names.json");
  const data = await res.json();

  data.m_names.Array.forEach(n => {
    nameMap[n.m_id] = (n.m_kor || "").trim();
  });
}

async function loadScript() {
  const res = await fetch("https://raw.githubusercontent.com/lostogh/mirrorcity/main/script/EP00.json");
  const data = await res.json();

  const container = document.getElementById("content");
  container.innerHTML = "";

  data.forEach(line => {

    if (!line) return;

    let text = line.text || "";
    if (!text) return;

    let name = "나레이션";

    // 이름 처리
    if (line.code && codeMap[line.code]) {
      name = codeMap[line.code];
    } else if (line.nameId !== undefined && nameMap[line.nameId]) {
      name = nameMap[line.nameId];
    } else {
      const match = text.match(/<i>(.*?)<\/i>/);
      if (match) {
        name = match[1];
      }
    }

    // 태그 처리
    text = text
      .replace(/<name>/g, "[주인공]")
      .replace(/<i>/g, "<em>")
      .replace(/<\/i>/g, "</em>")
      .replace(/<color=#(.*?)>(.*?)<\/color>/g,
        '<span style="color:#$1">$2</span>');

    // 🔥 카드 생성 
    const card = document.createElement("div");
    card.className = "script-card";

    // 🔥 대사
    const lineDiv = document.createElement("div");
    lineDiv.className = "line";
    lineDiv.innerHTML = text;

    // 🔥 카드에 추가
    card.appendChild(speaker);
    card.appendChild(lineDiv);

    // 🔥 화면에 추가
    container.appendChild(card);

    speaker.innerText = name;

    // 선택지
if (line.choices && line.choices.length > 0) {
  const choiceBox = document.createElement("div");

  line.choices.forEach(choice => {

    // 🔥 여기서 반드시 변환
    let choiceText = choice
      .replace(/<name>/g, "[주인공]")
      .replace(/<i>/g, "<em>")
      .replace(/<\/i>/g, "</em>")
      .replace(/<color=#(.*?)>(.*?)<\/color>/g,
        '<span style="color:#$1">$2</span>');

    const btn = document.createElement("div");
    btn.className = "choice";

    // 🔥 innerHTML 사용
    btn.innerHTML = choiceText;

    btn.onclick = () => {
      console.log(choice);
    };

    choiceBox.appendChild(btn);
  });

  container.appendChild(choiceBox);
}

  });
}

async function init() {
  await loadNames();
  await loadScript();
}

init();

function filterText() {
  let input = document.getElementById("search").value.toLowerCase();
  let lines = document.querySelectorAll(".line");

  lines.forEach(line => {
    let text = line.innerText.toLowerCase();
    line.style.display = text.includes(input) ? "" : "none";
  });
}