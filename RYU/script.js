// =======================
// 텍스트 정리
// =======================
function cleanText(line) {
  return line
    .replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, "$1($2)")
    .replace(/<[^>]*>/g, "")
    .replace(/[▼■]/g, "")
    .replace(/^人物・/, "")
    .replace(/用語・/g, "")
    .trim();
}

// =======================
// 주석 제거
// =======================
function removeComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, "");
}

// =======================
// 루비 파싱
// =======================
function parseRuby(text) {
  const m = text.match(/☆ルビ（(.*?)\s*=\s*(.*?)）/);
  if (!m) return null;
  return { base: m[1], ruby: m[2] };
}

// =======================
// 파서 (🔥 안정판)
// =======================
// =======================
// 텍스트 정리
// =======================
function cleanText(line) {
  return line
    .replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, "$1($2)")
    .replace(/<[^>]*>/g, "")
    .replace(/[▼■]/g, "")
    .replace(/^人物・/, "")
    .trim();
}

// =======================
// 주석 제거
// =======================
function removeComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, "");
}

// =======================
// "진짜 지시문만" 판별
// =======================
function isDirective(line) {
  return (
    line.startsWith("効果音") ||
    line.startsWith("カットイン") ||
    line.startsWith("時間待ち") ||
    line.startsWith("曲") ||
    line.startsWith("背景") ||
    line.startsWith("ループ効果音") ||
    line.startsWith("ループエフェクト") ||
    line.startsWith("背景フィルタ") ||
    line.startsWith("表情")
  );
}

// =======================
// 완전히 숨길 것
// =======================
function shouldHideDirective(text) {
  return (
    text.startsWith("時間待ち") ||
    text.startsWith("効果音") ||
    text.startsWith("ループ効果音") ||
    text.startsWith("曲") ||
    text.startsWith("表情")
  );
}

// =======================
// 루비 파싱
// =======================
function parseRuby(text) {
  const match = text.match(/☆ルビ（(.*?)\s*=\s*(.*?)）/);
  if (!match) return null;

  return {
    base: match[1],
    ruby: match[2]
  };
}

// =======================
// 대사 push
// =======================
function pushDialogue(arr, speaker, buffer) {
  if (!buffer.length) return;

  arr.push({
    type: "dialogue",
    speaker,
    text: buffer.join("\n")
  });

  buffer.length = 0;
}

// =======================
// 파서
// =======================
function parse(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);

  let result = [];
  let toc = [];

  let currentSpeaker = "";
  let buffer = [];
  let eventIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let txt = cleanText(line);
    if (
  line.includes("<ト書き>") ||
  line.includes("<単発音再生>") ||
  line.includes("<立ち絵表示")  ||
  line.includes("<顔表示>")
) continue;

    // 이벤트 시작
    if (line.includes("<サブイベント")) {
      pushDialogue(result, currentSpeaker, buffer);

      const match = line.match(/名前="([^"]+)"/);
      if (match) {
        const id = "event_" + eventIndex++;

        result.push({
          type: "eventTitle",
          title: match[1],
          id
        });

        toc.push({ title: match[1], id });
      }
      continue;
    }

    // 이벤트 종료
    if (line.includes("</サブイベント>")) {
      pushDialogue(result, currentSpeaker, buffer);
      result.push({ type: "eventEnd" });
      continue;
    }

    // 화자
    if (line.startsWith("<話者>")) {
      pushDialogue(result, currentSpeaker, buffer);
      currentSpeaker = cleanText(line);
      continue;
    }

    // =======================
    // 선택지 (절대 유지)
    // =======================
    if (line.startsWith("<選択肢実行>")) {
      pushDialogue(result, currentSpeaker, buffer);

      let choices = [];
      i++;

      while (i < lines.length && !lines[i].includes("</選択肢実行>")) {

        if (lines[i].includes("<場合>")) {

          let content = [];
          let subSpeaker = currentSpeaker;
          let subBuffer = [];
          let first = true;

          i++;

          while (i < lines.length && !lines[i].includes("</場合>")) {
            let l = lines[i];
            let t = cleanText(l);

            if (l.startsWith("<話者>")) {

              const newSpeaker = cleanText(l);

              // 🔥 같은 화자면 무시 (핵심)
              if (newSpeaker === subSpeaker) {
                i++;
                continue;
              }

              // 🔥 대사 있을 때만 push
              if (subBuffer.length) {
                content.push({
                  type: "dialogue",
                  speaker: subSpeaker,
                  text: subBuffer.join("\n")
                });
                subBuffer = [];
              }

              subSpeaker = newSpeaker;
            }

            else if (isDirective(t)) {
              if (!shouldHideDirective(t)) {
                content.push({ type: "directive", text: t });
              }
            }

            else if (t) {

              if (first) {
                content.push({ type: "choiceMain", text: t });
                first = false;
              } else {
                subBuffer.push(t);
              }
            }

            i++;
          }

          if (subBuffer.length) {
            content.push({
              type: "dialogue",
              speaker: subSpeaker,
              text: subBuffer.join("\n")
            });
          }

          choices.push({ content });
        }

        i++;
      }

      result.push({ type: "choice", options: choices });
      continue;
    }

    // =======================
    // 지시문
    // =======================
    if (isDirective(txt)) {

      if (shouldHideDirective(txt)) continue;

      pushDialogue(result, currentSpeaker, buffer);

      result.push({
        type: "directive",
        text: txt
      });

      continue;
    }

    // =======================
    // 🔥 핵심: 절대 버리지 않는다
    // =======================
    if (txt && txt !== currentSpeaker) {
      buffer.push(txt);
    }
  }

  pushDialogue(result, currentSpeaker, buffer);

  return { data: result, toc };
}

// =======================
// 렌더링 (네 코드 유지)
// =======================

// =======================
// 렌더링
// =======================
function render(parsed) {

  const viewer = document.getElementById("viewer");
  const tocDiv = document.getElementById("toc");

  viewer.innerHTML = "";
  tocDiv.innerHTML = "";

  // 목차
  parsed.toc.forEach(item => {
    const el = document.createElement("div");
    el.style.cursor = "pointer";
    el.style.color = "#6cf";
    el.innerText = item.title.replace(/^イベント・佐伯昌長・?/, "");

    el.onclick = () => {
      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
    };

    tocDiv.appendChild(el);
  });

  // 본문
  parsed.data.forEach(block => {

    if (block.type === "eventTitle") {
      viewer.innerHTML += `<div id="${block.id}" style="margin:20px 0;color:#ffd700;">📌 ${block.title}</div>`;
      return;
    }

    if (block.type === "eventEnd") {
      viewer.innerHTML += `<hr>`;
      return;
    }

    if (block.type === "dialogue") {
      viewer.innerHTML += `
        <div class="block">
          <div class="speaker">${block.speaker || ""}</div>
          <div class="dialogue-text">${block.text.replace(/\n/g,"<br>")}</div>
        </div>
      `;
      return;
    }

    if (block.type === "ruby") {
      viewer.innerHTML += `<div style="font-size:12px;color:#9cf;">📖 ${block.base} (${block.ruby})</div>`;
      return;
    }

    if (block.type === "choice") {

      const container = document.createElement("div");
      container.className = "choice-container";
      container.style.gridTemplateColumns = `repeat(${block.options.length},1fr)`;

      block.options.forEach(opt => {

        const c = document.createElement("div");
        c.className = "choice";

        let lastSpeaker = "";
        let html = "";

        opt.content.forEach(item => {

          if (item.type === "choiceMain") {
            html += `<div style="color:#ffd700;font-weight:bold;">▶ ${item.text}</div>`;
          }

          if (item.type === "dialogue") {

            let speakerHTML = "";

            if (item.speaker && item.speaker !== lastSpeaker) {
              speakerHTML = `<div class="speaker">${item.speaker}</div>`;
              lastSpeaker = item.speaker;
            }

            html += `
              <div>
                ${speakerHTML}
                <div>${item.text.replace(/\n/g,"<br>")}</div>
              </div>
            `;
          }

        });

        c.innerHTML = html;
        container.appendChild(c);
      });

      viewer.appendChild(container);
    }

  });
}

// =======================
// 실행
// =======================
document.getElementById("fileInput").addEventListener("change", e => {

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(evt) {
    const raw = removeComments(evt.target.result);
    const parsed = parse(raw);
    render(parsed);
  };

  reader.readAsText(file, "utf-8");
});