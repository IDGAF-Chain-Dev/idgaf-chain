# Render 배포 오류 수정 가이드

## ❌ 오류 메시지
```
error: invalid local: resolve : lstat /opt/render/project/src/cloud-deploy: no such file or directory
```

## 🔍 원인
Render가 `cloud-deploy/Dockerfile.render` 경로를 찾지 못하고 있습니다.

## ✅ 해결 방법

### 방법 1: 루트에 Dockerfile 사용 (가장 간단)

프로젝트 루트에 `Dockerfile` 파일을 생성했습니다. Render 설정을 변경하세요:

1. **Render 대시보드** → 서비스 → **Settings** 탭
2. **Build & Deploy** 섹션에서:
   - **Dockerfile Path**: `Dockerfile` (또는 비워두기)
   - **Docker Context**: `.` (또는 비워두기)
3. **Save Changes** 클릭
4. **Manual Deploy** → **Deploy latest commit** 클릭

### 방법 2: Root Directory 설정

1. **Render 대시보드** → 서비스 → **Settings** 탭
2. **Build & Deploy** 섹션에서:
   - **Root Directory**: (비워두기 - 루트 사용)
   - **Dockerfile Path**: `cloud-deploy/Dockerfile.render`
3. **Save Changes** 클릭
4. **Manual Deploy** → **Deploy latest commit** 클릭

### 방법 3: GitHub에 파일 푸시 확인

GitHub 저장소에 `cloud-deploy` 폴더가 있는지 확인:

1. https://github.com/IDGAF-Chain-Dev/idgaf-chain 접속
2. `cloud-deploy` 폴더가 있는지 확인
3. 없다면 로컬에서 푸시:
   ```bash
   git add cloud-deploy/
   git commit -m "Add cloud-deploy directory"
   git push
   ```

## 🚀 권장 설정

Render 서비스 설정:

| 항목 | 값 |
|------|-----|
| **Name** | `idgaf-chain-node` |
| **Root Directory** | (비워두기) |
| **Environment** | `Docker` |
| **Dockerfile Path** | `Dockerfile` (또는 비워두기) |
| **Docker Context** | `.` (또는 비워두기) |
| **Environment Variables** | `NETWORK_ID=10144`, `CHAIN_ID=10144` |

## 📝 체크리스트

- [ ] GitHub 저장소에 `Dockerfile` 파일이 있음 (루트)
- [ ] GitHub 저장소에 `chain-config/genesis-mainnet.json` 파일이 있음
- [ ] Render 설정에서 Dockerfile Path가 올바름
- [ ] Root Directory가 비어있거나 올바름
- [ ] 환경 변수가 설정됨

## 🔄 재배포

설정 변경 후:
1. **Manual Deploy** → **Deploy latest commit** 클릭
2. 또는 GitHub에 새 커밋 푸시 (자동 배포)

## 🆘 여전히 문제가 있다면

1. **Logs 탭** 확인 - 더 자세한 에러 메시지
2. **Settings** → **Build Command** 확인
3. GitHub 저장소에 필요한 파일들이 모두 있는지 확인

