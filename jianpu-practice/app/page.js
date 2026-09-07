"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const scores = [
  { id: "chengquan", title: "成全", artist: "劉若英", rhythm: "Slow Soul", time: "4/4", key: "B", low: -3, high: 8, range: "下加一點的 6 ～ 上加一點的 3", measures: 36, voices: ["主旋律全部"], sections: ["前奏", "主歌", "副歌", "尾奏"] },
  { id: "shanhu", title: "珊瑚海", artist: "周杰倫＋Lara", rhythm: "Slow Soul", time: "4/4", key: "Ab", low: -2, high: 9, range: "下加一點的 5 ～ 上加一點的 4", measures: 44, voices: ["主旋律全部", "男聲", "女聲", "合唱"], sections: ["前奏", "主歌", "副歌", "間奏"] },
  { id: "xie", title: "你被寫在我的歌裡", artist: "蘇打綠＋ELLA", rhythm: "Mod. Soul", time: "4/4", key: "C#", low: -1, high: 10, range: "下加一點的 7 ～ 上加兩點的 5", measures: 40, voices: ["主旋律全部", "男聲", "女聲", "合唱"], sections: ["前奏", "主歌", "副歌"] }
];

const pitchLabels = [
  "下加兩點的 1", "下加兩點的 2", "下加兩點的 3", "下加兩點的 4", "下加兩點的 5", "下加兩點的 6", "下加兩點的 7",
  "下加一點的 1", "下加一點的 2", "下加一點的 3", "下加一點的 4", "下加一點的 5", "下加一點的 6", "下加一點的 7",
  "中央音域的 1", "中央音域的 2", "中央音域的 3", "中央音域的 4", "中央音域的 5", "中央音域的 6", "中央音域的 7",
  "上加一點的 1", "上加一點的 2", "上加一點的 3", "上加一點的 4", "上加一點的 5", "上加一點的 6", "上加一點的 7",
  "上加兩點的 1", "上加兩點的 2", "上加兩點的 3", "上加兩點的 4", "上加兩點的 5", "上加兩點的 6", "上加兩點的 7"
];

function JianpuPitch({ value }) {
  const number = ((value % 7) + 7) % 7 + 1;
  const octave = Math.floor(value / 7);
  return <span className="pitch" aria-label={pitchLabels[value + 14] || "音域"}>{octave > 0 && <i className="above">{Array(octave).fill("·").join(" ")}</i>}{number}{octave < 0 && <i className="below">{Array(-octave).fill("·").join(" ")}</i>}</span>;
}

function Button({ children, onClick, kind = "primary", disabled = false }) {
  return <button className={`button ${kind}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Select({ value, onChange, children, label }) {
  return <label className="select-wrap"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select></label>;
}

function Metronome({ bpm, setBpm, subdivision, setSubdivision, loop, setLoop }) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  const count = useRef(0);
  useEffect(() => () => clearInterval(timer.current), []);
  const toggle = () => {
    if (playing) { clearInterval(timer.current); setPlaying(false); return; }
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    const subdivisionCount = { "四分音符": 1, "八分音符": 2, "十六分音符": 4, "三連音": 3, shuffle: 2 }[subdivision] || 1;
    const tick = () => {
      const strong = count.current % subdivisionCount === 0;
      const osc = audio.createOscillator(); const gain = audio.createGain();
      osc.frequency.value = strong ? 980 : 680; gain.gain.setValueAtTime(strong ? 0.13 : 0.07, audio.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.05);
      osc.connect(gain).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + 0.06); count.current += 1;
    };
    tick(); timer.current = setInterval(tick, 60000 / bpm / subdivisionCount); setPlaying(true);
  };
  return <div className="metronome">
    <div><span className="eyebrow">練習設定</span><strong>節拍器</strong></div>
    <div className="controls"><label>BPM <input type="number" min="40" max="220" value={bpm} onChange={(e) => setBpm(Math.max(40, Math.min(220, Number(e.target.value))))} /></label>
      <Select label="節拍" value={subdivision} onChange={setSubdivision}><option>四分音符</option><option>八分音符</option><option>十六分音符</option><option>三連音</option><option>shuffle</option></Select>
      <Select label="循環" value={loop} onChange={setLoop}><option value="1">1 次</option><option value="2">2 次</option><option value="4">4 次</option><option value="8">8 次</option></Select>
      <Button onClick={toggle} kind={playing ? "dark" : "primary"}>{playing ? "■ 停止節拍器" : "▶ 開始節拍器"}</Button></div>
  </div>;
}

function Header({ page, setPage }) {
  return <header><button className="brand" onClick={() => setPage("library")}>小光老師的譜庫</button><nav><button className={page === "library" ? "active" : ""} onClick={() => setPage("library")}>我的譜庫</button><button className={page === "import" ? "active" : ""} onClick={() => setPage("import")}>匯入樂譜</button></nav><Button onClick={() => setPage("import")}>＋ 匯入樂譜</Button></header>;
}

function ScorePreview({ start = 1, count = 4, compact = false }) {
  return <div className={`score-preview ${compact ? "compact" : ""}`}>{Array.from({ length: count }, (_, i) => <div className="measure" key={i}><span>{start + i}</span><b>{["1 2 3 5", "5 3 2 1", "3 5 6 5", "2 3 2 1"][i % 4]}</b><em>|</em></div>)}</div>;
}

export default function App() {
  const [page, setPage] = useState("library");
  const [selected, setSelected] = useState(scores[0]);
  const [query, setQuery] = useState(""); const [rhythm, setRhythm] = useState("全部"); const [time, setTime] = useState("全部"); const [key, setKey] = useState("全部");
  const [minPitch, setMinPitch] = useState(-14); const [maxPitch, setMaxPitch] = useState(14);
  const [start, setStart] = useState(1); const [length, setLength] = useState(4); const [voice, setVoice] = useState("主旋律全部"); const [bpm, setBpm] = useState(85); const [subdivision, setSubdivision] = useState("八分音符"); const [loop, setLoop] = useState("4");
  const filtered = useMemo(() => scores.filter((s) => (s.title + s.artist).includes(query) && (rhythm === "全部" || s.rhythm === rhythm) && (time === "全部" || s.time === time) && (key === "全部" || s.key === key) && s.low >= minPitch && s.high <= maxPitch), [query, rhythm, time, key, minPitch, maxPitch]);
  const openScore = (score) => { setSelected(score); setVoice(score.voices[0]); setStart(1); setPage("detail"); };
  const randomPractice = () => { const maxStart = Math.max(1, selected.measures - length + 1); setStart(Math.floor(Math.random() * maxStart) + 1); setPage("practice"); };
  return <main><Header page={page} setPage={setPage} />
    {page === "library" && <section className="library page"><div className="hero"><span className="eyebrow">簡譜視譜練習工具</span><h1>今天想練哪一首？</h1><input className="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜尋歌名、歌手、作詞或作曲" /></div>
      <div className="filters"><Select label="節奏類型" value={rhythm} onChange={setRhythm}><option>全部</option><option>Slow Soul</option><option>Mod. Soul</option></Select><Select label="最低音" value={minPitch} onChange={(v) => setMinPitch(Number(v))}>{Array.from({ length: 29 }, (_, i) => <option value={i - 14} key={i}>{pitchLabels[i]}</option>)}</Select><span className="range">～</span><Select label="最高音" value={maxPitch} onChange={(v) => setMaxPitch(Number(v))}>{Array.from({ length: 29 }, (_, i) => <option value={i - 14} key={i}>{pitchLabels[i]}</option>)}</Select><Select label="拍號" value={time} onChange={setTime}><option>全部</option><option>2/4</option><option>3/4</option><option>4/4</option><option>6/8</option><option>12/8</option></Select><Select label="調性" value={key} onChange={setKey}><option>全部</option>{["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B", "C#"].map((x) => <option key={x}>{x}</option>)}</Select><button className="clear" onClick={() => { setQuery(""); setRhythm("全部"); setTime("全部"); setKey("全部"); setMinPitch(-14); setMaxPitch(14); }}>清除</button></div>
      <div className="section-title"><span>POINT 01</span><h2>我的樂譜</h2></div><div className="library-grid">{filtered.map((score) => <article className="score-card" key={score.id}><div><span className="eyebrow">{score.artist}</span><h3>{score.title}</h3><div className="tags"><i>{score.rhythm}</i><i>{score.time}</i><i>{score.key}</i></div><p>音域：<JianpuPitch value={score.low} /> ～ <JianpuPitch value={score.high} /></p><ScorePreview compact /><Button onClick={() => openScore(score)}>開始練習</Button></div></article>)}<article className="random-card"><span className="dice">⌘</span><h3>隨機四小節</h3><p>從已標記的主旋律抽取練習。</p><Button onClick={randomPractice}>抽一段練習</Button></article></div></section>}
    {page === "detail" && <section className="detail page"><button className="back" onClick={() => setPage("library")}>← 回到譜庫</button><div className="detail-head"><div><span className="eyebrow">{selected.artist}</span><h1>{selected.title}</h1><div className="tags"><i>{selected.rhythm}</i><i>{selected.time}</i><i>{selected.key}</i></div></div><p>簡譜音域：<JianpuPitch value={selected.low} /> ～ <JianpuPitch value={selected.high} /></p></div><div className="score-sheet"><span className="sheet-label">已標記主旋律 · 可選取小節</span><ScorePreview start={1} count={12} /></div><div className="selection"><div><span className="eyebrow">練習範圍</span><h2>選擇要練習的小節</h2><div className="range-inputs"><label>起始小節 <input type="number" min="1" max={selected.measures - length + 1} value={start} onChange={(e) => setStart(Math.max(1, Math.min(selected.measures - length + 1, Number(e.target.value))))} /></label><label>長度 <select value={length} onChange={(e) => setLength(Number(e.target.value))}><option value="2">2 小節</option><option value="4">4 小節</option><option value="8">8 小節</option></select></label></div>{selected.voices.length > 1 && <div className="voice-tabs">{selected.voices.map((v) => <button key={v} className={voice === v ? "picked" : ""} onClick={() => setVoice(v)}>{v}</button>)}</div>}</div><div className="selection-actions"><Button onClick={() => setPage("practice")}>設定練習</Button><Button kind="outline" onClick={randomPractice}>隨機 {length} 小節</Button></div></div></section>}
    {page === "practice" && <section className="practice page"><button className="back" onClick={() => setPage("detail")}>← 回到 {selected.title}</button><div className="practice-title"><span className="eyebrow">{voice}</span><h1>{selected.title}｜第 {start}–{start + length - 1} 小節</h1></div><div className="practice-sheet"><ScorePreview start={start} count={length} /></div><Metronome bpm={bpm} setBpm={setBpm} subdivision={subdivision} setSubdivision={setSubdivision} loop={loop} setLoop={setLoop} /><div className="practice-bottom"><Button kind="outline" onClick={randomPractice}>↻ 重新抽題</Button><Button onClick={() => setPage("detail")}>完成練習</Button></div></section>}
    {page === "import" && <section className="import page"><button className="back" onClick={() => setPage("library")}>← 回到譜庫</button><div className="import-layout"><div><span className="eyebrow">STEP 01</span><h1>匯入並校正樂譜</h1><p>先讓譜面變得端正、好框選；這一步不辨識音符。</p><label className="drop"><input type="file" accept="application/pdf,image/*" hidden />＋ 選擇 PDF 或圖片<br /><small>拖曳檔案到這裡也可以</small></label></div><div className="correction"><div className="tilted-sheet"><ScorePreview start={1} count={8} /></div><div><span className="eyebrow">校正工具</span><h3>讓小節線保持水平</h3><div className="tool-row"><Button kind="outline">自動拉正</Button><Button kind="outline">裁切邊緣</Button></div><label>微調角度 <input type="range" min="-4" max="4" defaultValue="0" /></label><Button onClick={() => setPage("detail")}>下一步：填寫資料</Button></div></div></div></section>}
  </main>;
}
