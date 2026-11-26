# 자동 처리 현황 1-6 프로토타입

1-6안 디자인 시안을 React + Vite + TypeScript로 옮긴 클릭 가능한 화면이에요. 서버 없이 돌아가요.

- 보는 링크: https://eonpensee.github.io/automata-prototype/
- GitHub에서 파일을 고쳐 저장(commit)하면 1~2분 뒤 위 링크에 자동으로 반영돼요.

## 내 컴퓨터에서 열어 보기

1. [Node.js](https://nodejs.org) LTS 버전을 설치해요. (한 번만)
2. 이 폴더에서 터미널을 열고 아래 두 줄을 차례로 입력해요.
   ```
   npm install
   npm run dev
   ```
3. 터미널에 나오는 주소(보통 http://localhost:5173)를 브라우저에서 열어요.
   파일을 고치고 저장하면 화면이 바로 바뀌어요.

## 어디를 고치면 되나요

| 고치고 싶은 것 | 파일 |
|---|---|
| 글자, 숫자, 처리 건, 상세 내용 | `src/data/today.ts` |
| 색, 간격, 라운드, 글자 크기 | `src/styles.css` (시안 원본 CSS 그대로) |
| 왼쪽 들어온 자료 카드 | `src/components/SourceLane.tsx` |
| 가운데 3D 지도 | `src/components/map/MiniMap.tsx` |
| 지도 거래 상대(우리 회사, 판매처, 창고, 매입처, 은행, 카드사) | `src/components/map/partners/` 안의 파일 하나씩 |
| 오른쪽 결과 카드 | `src/components/ResultLane.tsx` |
| 상세 패널 | `src/components/DetailPanel.tsx` |
| 상태 카드 5장 | `src/components/StatusTabs.tsx` |
| 처리 이력 표 | `src/components/HistoryTable.tsx` |
| 판매처 숨김, 은행·카드사 자리 이동 | `src/App.tsx`의 `MAP_LAYOUT` |

## 파일 하나짜리로 만들기

`npm run build:single` 을 실행하면 `dist-single/index.html` 하나가 생겨요. 이 파일만 있으면 어디서든 열려요.
