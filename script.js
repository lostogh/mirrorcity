let nameMap = {};

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

  data.forEach(line => {  // ⭐ 제한 없음 (전체 출력)

    if (!line) return;

    // 🔹 텍스트
    let text = line.text || "";
    if (!text) return;

    // 🔹 이름
    let name = "나레이션";

    if (line.nameId && nameMap[line.nameId]) {
      name = nameMap[line.nameId];
    } else if (line.nameId) {
      name = "???";
    }

    // 🔹 태그 변환
    text = text
      .replace(/<name>/g, "[주인공]")
      .replace(/<i>/g, "<em>")
      .replace(/<\/i>/g, "</em>")
      .replace(/<color=#(.*?)>(.*?)<\/color>/g,
        '<span style="color:#$1">$2</span>');

    // 🔹 HTML 생성
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