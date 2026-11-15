# K-Video Editing AI Assistant Frontend

React + TypeScript + Vite 기반 영상 편집 어시스턴트입니다.

## 실행

```sh
npm install
npm run dev
```

`.env.example`을 `.env.local`로 복사하고 `VITE_API_BASE_URL`을 설정합니다. 미설정 시 배포된 FastAPI 서버를 사용합니다. 프론트의 로컬/배포 Origin을 백엔드 CORS 허용 목록에 등록해야 합니다.

## 검증

```sh
npm run build
npm run lint
npm run test:api
```

`test:api`는 네트워크 요청을 모의 처리해 multipart 파일, 공통 응답·오류, 폴링 완료/실패/취소, 추천 요청, 편집 순서·시간 정밀도, 파일 다운로드와 상태 초기화를 검증합니다. 실제 서버의 AI·FFmpeg 처리 및 CORS를 검증하는 통합 테스트는 별도로 진행해야 합니다.

## API 흐름

1. `POST /api/videos`: 영상 업로드 → `videoId`, `jobId` 보관.
2. `GET /api/jobs/{jobId}`: 분석 성공 시 요청 화면으로 이동. 서버 중간 진행률은 현재 갱신되지 않습니다.
3. `GET /api/videos/{videoId}/transcript`: 전체 자막 모달.
4. `POST /api/videos/{videoId}/recommendations`: 요청 텍스트·목표 길이로 추천 생성.
5. `GET /api/videos/{videoId}/recommendations/{recommendationId}`: 저장된 결과 다시 조회.
6. `POST /api/videos/{videoId}/renders`: 편집 순서의 구간으로 영상 생성, 작업 상태 조회 후 `resultRef`를 `renderId`로 사용.
7. `GET /api/videos/{videoId}/renders/{renderId}`: 결과 길이·파일 경로·개발용 여부 조회.
8. `GET /api/videos/{videoId}/renders/{renderId}/file`: 영상 재생, `download=true`로 파일 저장.

목표 길이는 정수 초가 필수입니다. 30초/1분은 30/60, 길이 제한 없음은 원본 길이를 올림한 값을 전달합니다. 추천 결과는 목표의 110%까지 가능하며 관련 내용이 없으면 빈 목록일 수 있습니다.

선택 구간 다운로드는 영상 순서대로 합친 파일을 저장합니다. 구간별 다운로드는 한 구간을 생성한 뒤 저장합니다. 편집 화면에서는 순서를 바꾼 후 생성할 수 있습니다. 자막은 원본 자막을 서버가 합성하며 자막 편집 UI는 아직 제공하지 않습니다.

현재 상태는 메모리에 보관되므로 새로고침하면 업로드 화면으로 돌아갑니다. 서버 작업 취소 API가 없어 생성 중에는 완료를 기다립니다. 조회 실패 후 같은 편집 내용으로 다시 시도하면 해당 화면에 남아 있는 작업 ID를 재조회합니다.

## PR 적용 순서

#9 → #11 → #13 → #15 → #17 → #19 → #21 → #23 순서입니다. 각 후속 PR은 앞 PR의 브랜치를 base로 사용합니다. 앞 PR을 main으로 병합한 뒤 다음 PR의 base를 main으로 바꿔 순차 병합할 수 있습니다. main은 자동 병합하지 않았습니다.
