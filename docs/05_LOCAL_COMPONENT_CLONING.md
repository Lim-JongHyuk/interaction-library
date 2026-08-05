# 독립적인 로컬 코드로 컴포넌트 제작하기

Originkit 컴포넌트를 내 프로젝트에 복사한 뒤, registry와 연결되지 않은 로컬 코드로 사용하는 방법입니다.

## 1. 프로젝트에서 Originkit 초기화

프로젝트 루트에서 실행합니다.

```bash
pnpm dlx originkit@latest init -y
```

`components.json`이 생성되며, 이후 컴포넌트를 저장할 위치와 import alias를 관리할 수 있습니다.

## 2. Cosmic Orb 복사하기

```bash
pnpm dlx originkit@latest add cosmic-orb
```

이 명령은 Cosmic Orb의 소스 파일을 현재 프로젝트에 내려받습니다. 필요한 npm 패키지가 있으면 감지해서 함께 설치합니다.

패키지 설치 없이 파일만 복사하려면 다음처럼 실행합니다.

```bash
pnpm dlx originkit@latest add cosmic-orb --no-deps
```

기본적으로 컴포넌트는 `components/originkit/ui/cosmic-orb.tsx`에 생성됩니다. 실제 경로는 `components.json` 설정에 따라 달라질 수 있습니다.

## 3. 내 프로젝트에서 사용하기

```tsx
import { CosmicOrb } from "@/components/originkit/ui/cosmic-orb";

export default function Page() {
  return <CosmicOrb size={420} />;
}
```

## 4. 독립적인 로컬 코드로 유지하기

`add`가 끝난 뒤 생성된 파일은 내 프로젝트의 일반 소스 파일입니다.

- Originkit registry에 파일을 업로드하지 않습니다.
- Originkit registry의 원본을 수정하지 않습니다.
- 복사한 뒤의 변경사항은 내 프로젝트에만 적용됩니다.
- 이후 명령을 다시 실행하지 않으면 코드가 자동으로 갱신되지 않습니다.
- 변경사항은 Git에 커밋해 버전을 고정할 수 있습니다.

따라서 복사 직후부터 해당 컴포넌트는 내 프로젝트가 소유하는 독립적인 코드가 됩니다.

## 5. 같은 컴포넌트를 다시 복사하기

이미 파일이 있을 때 다시 복사하려면 `--overwrite`를 사용합니다.

```bash
pnpm dlx originkit@latest add cosmic-orb --overwrite
```

기존 로컬 수정사항이 덮어써질 수 있으므로, 실행 전 Git 커밋이나 백업을 권장합니다.
