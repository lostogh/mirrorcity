// script.js에서 더 이상 currentEpisode를 정의하지 말 것
// 대신 window.currentEpisode가 반드시 있어야 한다고 가정

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
    // 현재 HTML 파일 이름 가져오기
  const path = window.location.pathname;
  const fileName = path.split("/").pop(); // 예: EP0.html

  // .html 제거 → EP0
  const baseName = fileName.replace(".html", "");

  // JSON 불러오기
  const res = await fetch(
    `https://raw.githubusercontent.com/lostogh/mirrorcity/main/script/${baseName}.json?time=${Date.now()}`
  );
  const data = await res.json();

  const container = document.getElementById("content");
  container.innerHTML = ""; // 반복문 밖에서 초기화

  data.forEach(line => {
    let text = line.text || "";
    if (!text) return;

    let name = "나레이션";

    if (line.code && codeMap[line.code]) {
      name = codeMap[line.code];
    } 
    else if (line.nameId !== undefined && nameMap[line.nameId]) {
      const mapped = nameMap[line.nameId];
      if (mapped && mapped.trim() !== "") {
        name = mapped;
      }
    }

    // 텍스트 변환
    text = text
      .replace(/<name>/g, `<span class="player-name">주인공</span>`)
      .replace(/<i>/g, "<em>")
      .replace(/<\/i>/g, "</em>")
      .replace(/<color=#(.*?)>(.*?)<\/color>/g,
        '<span style="color:#$1">$2</span>');

    const cleanText = text.replace(/<[^>]*>/g, "").toUpperCase();
    const isClear = cleanText.includes("EPISODE CLEAR");
    const isGameOver = cleanText.includes("GAME OVER");

    // 카드 생성
    const card = document.createElement("div");
    card.className = "script-card";

    const speaker = document.createElement("div");
    speaker.className = "speaker";

    if (name.includes("나레이션")) {
      speaker.classList.add("narration");
    } else {
      speaker.classList.add("character");
    }

    speaker.innerText = name;

    const lineDiv = document.createElement("div");
    lineDiv.className = "line";
    lineDiv.innerHTML = text;

    card.appendChild(speaker);
    card.appendChild(lineDiv);
    container.appendChild(card);

    // CLEAR / GAME OVER 이미지
    if (isClear) {
      const clearBox = document.createElement("div");
      clearBox.style.textAlign = "center";
      clearBox.style.margin = "120px 0";
      clearBox.innerHTML = `<img src="img/Img_EpisodeClearText.png" class="responsive-img">`;
      container.appendChild(clearBox);
    }

    if (isGameOver) {
      const overBox = document.createElement("div");
      overBox.style.textAlign = "center";
      overBox.style.margin = "120px 0";
      overBox.innerHTML = `<img src="img/GameOver.png" class="responsive-img">`;
      container.appendChild(overBox);
    }

    // ✅ 선택지: 카드 바로 아래에 붙이도록 반복문 안에서 처리
    if (line.choices && line.choices.length > 0) {
      const choiceBox = document.createElement("div");
      choiceBox.className = "choice-box";

      line.choices.forEach(choice => {
        let choiceText = choice
          .replace(/<name>/g, "[주인공]")
          .replace(/<i>/g, "<em>")
          .replace(/<\/i>/g, "</em>")
          .replace(/<color=#(.*?)>(.*?)<\/color>/g,
            '<span style="color:#$1">$2</span>');

        const btn = document.createElement("div");
        btn.className = "choice";
        btn.innerHTML = choiceText;

        btn.onclick = () => {
          console.log(choice);
        };

        choiceBox.appendChild(btn);
      });

      container.appendChild(choiceBox); // 카드 바로 아래에 붙임
    }
  });
}

async function init() {
  await loadNames();
  await loadScript();
}

init();