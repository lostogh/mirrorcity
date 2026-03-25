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

  // 카드 생성
  const card = document.createElement("div");
  card.className = "script-card";

  const speaker = document.createElement("div");
  speaker.className = (name === "나레이션") ? "speaker narration" : "speaker character";
  speaker.innerText = name;

  const lineDiv = document.createElement("div");
  lineDiv.className = "line";
  lineDiv.innerHTML = text;

  card.appendChild(speaker);
  card.appendChild(lineDiv);

  container.appendChild(card);

  // 🔥 선택지 처리 (여기가 핵심)
  if (line.choices && line.choices.length > 0) {
    const choiceBox = document.createElement("div");

    line.choices.forEach(choice => {
      const btn = document.createElement("div");
      btn.className = "choice";
      btn.innerText = choice;

      btn.onclick = () => {
        alert(choice);
      };

      choiceBox.appendChild(btn);
    });

    container.appendChild(choiceBox);
  }

});