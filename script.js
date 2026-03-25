let nameMap = {};

async function loadNames() {
  const res = await fetch("Names.json");
  const data = await res.json();

  data.m_names.Array.forEach(n => {
    nameMap[n.m_id] = (n.m_kor || "").trim();
  });
}

async function loadScript() {
  const res = await fetch("str.json");
  const data = await res.json();

  const container = document.getElementById("content");

  data.slice(0, 300).forEach(line => { // ⭐ 렉 방지 (300 정도 추천)

    let name = "나레이션";

if (line.nameId && nameMap[line.nameId]) {
  name = nameMap[line.nameId];
} else if (line.nameId) {
  name = "???"; // 또는 ID 표시도 가능
}

    // 태그 변환
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
