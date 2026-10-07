# 다운로드 파일

- `fireplug-project.zip`: 앱 소스, 실제 소화전 좌표, 실행 지침.
- `fireplug-coordinates.xlsx`: 전체 시설 719개, 좌표 확인 소화전 664개, 미확인 시설 55개.

GitHub에서 파일을 연 후 **Download raw file** 버튼으로 다운로드하세요. 저장소 전체는 **Code → Download ZIP**으로 받을 수 있습니다. 브랜치 선택 메뉴에서 이 파일들이 있는 브랜치를 선택하세요.

프로젝트 실행은 ZIP 압축을 풀고 `fireplug` 폴더에서 다음 명령을 실행하세요. Node.js 22 이상이 필요합니다.

```sh
npm ci
npm run dev -- --open
```

등록된 주소는 API 키 없이 검색할 수 있습니다. 새 화재 주소의 실시간 검색에는 서버 환경변수 `KAKAO_REST_API_KEY`가 필요하며 키는 파일에 포함하지 않습니다. 좌표는 주소 기준 추정이고 실제 설치 지점은 미확인입니다. 점검 결과가 없으므로 모든 점검 상태는 미확인입니다.
