# Render 오류 빠른 수정

## 문제
```
error: invalid local: resolve : lstat /opt/render/project/src/cloud-deploy: no such file or directory
```

## 해결 (2분)

### Step 1: Render 대시보드에서 설정 변경

1. https://dashboard.render.com 접속
2. 서비스 클릭 → **Settings** 탭
3. **Build & Deploy** 섹션 찾기
4. 다음으로 변경:
   - **Dockerfile Path**: `Dockerfile` (기존: `cloud-deploy/Dockerfile.render`)
   - **Root Directory**: (비워두기)
5. **Save Changes** 클릭

### Step 2: 재배포

1. **Manual Deploy** 드롭다운 클릭
2. **Deploy latest commit** 선택
3. 배포 시작!

## ✅ 완료!

이제 정상적으로 빌드될 것입니다.

## 📋 확인사항

GitHub 저장소에 다음 파일들이 있어야 합니다:
- ✅ `Dockerfile` (루트에 생성됨)
- ✅ `chain-config/genesis-mainnet.json`
- ✅ `cloud-deploy/` 폴더 (선택사항)

