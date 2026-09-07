import "./globals.css";

export const metadata = {
  title: "小光老師的譜庫",
  description: "簡譜視譜練習工具原型"
};

export default function RootLayout({ children }) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
